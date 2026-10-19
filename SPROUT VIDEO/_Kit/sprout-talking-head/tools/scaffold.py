#!/usr/bin/env python3
"""Turn plan.json into a HyperFrames composition (step 3 of the kit workflow).

    python3 scaffold.py <project> [--plan plan.json]

Writes, inside <project>:
  index.html        GENERATED. Footage, opening zoom, scene layouts and transitions, captions, styled phrases.
                    Never edit it: change plan.json or a scene fragment and run this again.
  scenes/<id>.html  One fragment per half / full / captions-ui line. Created as a labelled placeholder when
                    missing and never overwritten, so the scenes Claude builds survive every re-run. A
                    fragment may also be added by hand for a captions line (an overlay on the face).
  captions.srt      The caption phrases.
  cues.json         Every on-screen event with a suggested sound (see references/sound-guide.md).
  scaffold-report.json  Counts, unbuilt placeholders, fragments whose line no longer exists.
  package.json, hyperframes.json, meta.json (only when missing), assets/ (GSAP and fonts).

Scene fragment format (scenes/L021.html):
  <style> #L021 .title{...} </style>            styles, scoped by the scene id
  <div class="title">...</div>                  markup, placed in the scene's slot
  <script type="text/scene"> ... </script>      runs with: tl (root GSAP timeline), T0 (scene start, s),
                                                DUR (s), root (the scene element), q(sel), qa(sel),
                                                word(id) -> {text,start,end}
  <!-- cue +0.40 tap Card lands -->             sound cue at T0 + 0.40 s (or "cue w31 pop ..." at a word)
"""
import argparse
import html
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import KIT, SCENE_TYPES, WEAK_END, _bare, chunk_phrases, load_words, word_index  # noqa: E402

W, H = 1080, 1920
HF_VERSION = "0.8.163"
CAPTION_Y = {"captions": 1395, "captions-ui": 920, "half": 960, "full": 1600}
SLOT = {  # left, top, width, height on the 1080 x 1920 canvas
    "captions-ui": (72, 1000, 936, 560),
    "half": (72, 162, 936, 738),
    "full": (72, 162, 936, 1338),
    "full-pip": (72, 430, 936, 1070),
    "captions": (0, 0, 1080, 1920),
}
PLATES = {"sage": ("#e2e9e3", "#1e3e2b"), "cream": ("#f4f1ea", "#1e3e2b"), "ink": ("#1e3e2b", "#f4f1ea")}
SFX_ENTER = {"captions-ui": ("tap", "UI enters"), "half": ("whoosh-short", "panel slides down"),
             "full": ("whoosh-long", "full screen enters")}


def r3(x):
    return round(x, 3)


def esc(t):
    return html.escape(t, quote=True)


def fmt_srt(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


# ---------------------------------------------------------------- plan
def load_plan(project, plan_path, words):
    plan = json.loads(plan_path.read_text())
    if plan.get("schema") != "sprout-talking-head/plan@1":
        sys.exit(f"{plan_path}: not a sprout-talking-head plan")
    ids = [i for ln in plan["lines"] for i in ln["word_ids"]]
    if ids != [w["id"] for w in words]:
        sys.exit("plan.json does not cover words.json word for word, in order. Rebuild the planning page.")
    for ln in plan["lines"]:
        if ln["scene"] not in SCENE_TYPES:
            sys.exit(f"{ln['id']}: unknown scene type {ln['scene']}")
    return plan


def scene_spans(lines, duration):
    """A line's scene holds from its first word (0 for the first line) until the next line starts."""
    out = []
    for i, ln in enumerate(lines):
        a = 0.0 if i == 0 else max(0.0, ln["start"] - 0.08)
        b = duration if i == len(lines) - 1 else max(a + 0.3, lines[i + 1]["start"] - 0.08)
        out.append((r3(a), r3(b)))
    return out


# ---------------------------------------------------------------- fragments
FRAG_STYLE = re.compile(r"<style[^>]*>(.*?)</style>", re.S)
FRAG_SCRIPT = re.compile(r"<script\s+type=[\"']text/scene[\"'][^>]*>(.*?)</script>", re.S)
FRAG_CUE = re.compile(r"<!--\s*cue\s+(\+?[\d.]+|w\w+)\s+([\w-]+)\s*(.*?)-->", re.S)
COMMENT = re.compile(r"<!--.*?-->", re.S)


def placeholder(ln, a, b, kind):
    plan = ln["plan"] or "No plan written yet."
    sketch = f"\n     Sketch: {ln['sketch']} (Ahmad's layout from the Figma storyboard: follow it)" if ln.get("sketch") else ""
    return f"""<!-- {ln['id']} · {kind} · {a:.2f}–{b:.2f} s
     Line: {ln['text']}
     Plan: {plan}{sketch}
     PLACEHOLDER: build this scene from the plan and references/visual-guide.md, then delete this comment.
     Keep the three parts: <style> scoped to #{ln['id']}, markup for the slot, <script type="text/scene">. -->
<div class="placeholder" data-placeholder>
  <div class="ph-tag">{ln['id']} · {kind.upper()}</div>
  <div class="ph-plan">{esc(plan)}</div>
  <div class="ph-line">“{esc(ln['text'])}”</div>
</div>
<script type="text/scene">
tl.fromTo(q('.placeholder'), {{opacity: 0, y: 12}}, {{opacity: 1, y: 0, duration: .3, ease: 'power2.out'}}, T0 + .1);
</script>
"""


def parse_fragment(text):
    cues = FRAG_CUE.findall(text)
    text = COMMENT.sub("", text)  # comments first: they may mention <style> or <script> in prose
    styles = "\n".join(FRAG_STYLE.findall(text))
    scripts = "\n".join(FRAG_SCRIPT.findall(text))
    body = FRAG_SCRIPT.sub("", FRAG_STYLE.sub("", text)).strip()
    return {"styles": styles, "script": scripts, "body": body, "cues": cues, "placeholder": "data-placeholder" in text}


# ---------------------------------------------------------------- captions
def fit_size(chars, width, em_per_char, lo, hi):
    return max(lo, min(hi, int(width / max(chars, 1) / em_per_char)))


def build_captions(plan, words, spans):
    wix = word_index(words)
    groups, styled = [], []
    for ln, (a, b) in zip(plan["lines"], spans):
        em = set(ln["emphasis"])
        ws = [wix[i] for i in ln["word_ids"]]
        on_ink = ln["scene"] in ("half", "full") and ln.get("bg") == "ink"
        if ln["scene"] == "captions" and em:
            runs, cur = [], []
            for w in ws:
                if w["id"] in em:
                    cur.append(w)
                elif cur:
                    runs.append(cur)
                    cur = []
            if cur:
                runs.append(cur)
            for run in runs:
                styled.append({"id": f"styled-{run[0]['id']}", "line": ln["id"], "words": run})
            plain, cur = [], []
            for w in ws:
                if w["id"] in em:
                    if cur:
                        plain.append(cur)
                        cur = []
                else:
                    cur.append(w)
            if cur:
                plain.append(cur)
        else:
            plain = [ws]
        for run in plain:
            for ph in chunk_phrases(run):
                groups.append({"id": f"cap-{ph[0]['id']}", "line": ln["id"], "scene": ln["scene"], "on_ink": on_ink,
                               "y": CAPTION_Y[ln["scene"]], "words": ph,
                               "em": [w["id"] for w in ph if w["id"] in em and ln["scene"] != "captions"]})
    # timing: on 50 ms before the first word, off when the next caption (plain or styled) comes on
    timed = sorted([("g", g) for g in groups] + [("s", s) for s in styled], key=lambda x: x[1]["words"][0]["start"])
    for k, (kind, g) in enumerate(timed):
        g["start"] = r3(max(0.0, g["words"][0]["start"] - 0.05))
        last = g["words"][-1]["end"]
        nxt = timed[k + 1][1]["words"][0]["start"] - 0.05 if k + 1 < len(timed) else last + 0.6
        hold = 0.45 if kind == "s" else 0.25
        g["end"] = r3(min(nxt, last + hold) if nxt - last > 0.6 else nxt)
    for s in styled:
        n = len(s["words"])
        s["connector"] = False
        if n == 1:
            s["lead"], s["serif"] = [], s["words"]
        else:
            s["lead"], s["serif"] = s["words"][:-1], s["words"][-1:]
            # "to / REHAB.": when the lead is only small function words, it becomes a quiet serif connector and
            # the last word carries the weight
            s["connector"] = all(_bare(w["text"]) in WEAK_END for w in s["lead"])
    return groups, styled


def styled_markup(s, plate):
    bg, fg = PLATES[plate]
    span = lambda w, t=None: f'<span class="read-word" id="read-{w["id"]}">{esc(t or w["text"])}</span>'
    parts = []
    if s["connector"]:
        lead = " ".join(span(w) for w in s["lead"])
        text = " ".join(w["text"].upper() for w in s["serif"])
        size = fit_size(len(text), 836, 0.70, 72, 160)
        inner = " ".join(span(w, w["text"].upper()) for w in s["serif"])
        parts.append(f'<span class="type-plate serif connector" style="font-size:94px">{lead}</span>')
        parts.append(f'<span class="type-plate lead" style="font-size:{size}px;margin-left:42px;background:{bg};'
                     f'color:{fg}">{inner}</span>')
        return f'<div id="{s["id"]}" class="styled-group"><div class="styled-content">{"".join(parts)}</div></div>'
    if s["lead"]:
        text = " ".join(w["text"].upper() for w in s["lead"])
        size = fit_size(len(text), 836, 0.70, 56, 150)
        inner = " ".join(span(w, w["text"].upper()) for w in s["lead"])
        parts.append(f'<span class="type-plate lead" style="font-size:{size}px">{inner}</span>')
    text = " ".join(w["text"] for w in s["serif"])
    size = fit_size(len(text), 760, 0.50, 72, 150 if not s["lead"] else 132)
    inner = " ".join(span(w) for w in s["serif"])
    rot = "-1.2deg" if len(s["id"]) % 2 else "1deg"
    parts.append(f'<span class="type-plate serif" style="font-size:{size}px;background:{bg};color:{fg};'
                 f'transform:rotate({rot})">{inner}</span>')
    return f'<div id="{s["id"]}" class="styled-group"><div class="styled-content">{"".join(parts)}</div></div>'


# ---------------------------------------------------------------- face tracking
def face_track(project, footage, times, fallback):
    """Face centre (x, y, height as frame fractions) at each time, from Apple Vision (tools/face.swift).
    Cached in .face-track.json per footage file, so re-runs only measure new times. Missing faces fall back to
    the plan's face point."""
    src = project / footage
    cache_path = project / ".face-track.json"
    key = f"{footage}:{src.stat().st_size}"
    cache = json.loads(cache_path.read_text()) if cache_path.exists() else {}
    known = cache.setdefault(key, {})
    todo = sorted({f"{t:.2f}" for t in times} - set(known))
    if todo:
        with tempfile.TemporaryDirectory() as tmp:
            files = []
            for t in todo:
                f = Path(tmp) / f"{t}.jpg"
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", t, "-i", str(src), "-frames:v", "1",
                                "-vf", "scale=360:-1", str(f)], check=True)
                files.append(str(f))
            try:
                out = subprocess.run(["swift", str(KIT / "tools/face.swift"), *files], capture_output=True, text=True,
                                     check=True).stdout
                for line in out.splitlines():
                    r = json.loads(line)
                    known[Path(r["file"]).stem] = [r["x"], r.get("y"), r.get("h")] if r["x"] is not None else None
            except (subprocess.CalledProcessError, FileNotFoundError) as e:
                print(f"face tracking unavailable ({e}); using the plan's face point", file=sys.stderr)
        cache_path.write_text(json.dumps(cache, indent=1) + "\n")
    pts = [known.get(f"{t:.2f}") or [fallback[0], fallback[1], None] for t in times]
    # smooth over three samples so the crop glides instead of chasing every nod
    sm = []
    for i in range(len(pts)):
        win = pts[max(0, i - 1): i + 2]
        sm.append((sum(p[0] for p in win) / len(win), sum(p[1] for p in win) / len(win),
                   next((p[2] for p in win if p[2]), None)))
    return sm


def reframe_samples(s0, s1, step=0.5):
    n = max(1, int((s1 - s0) / step))
    return [r3(s0 + min(k * step, s1 - s0 - 0.05)) for k in range(n + 1)]


def reframe_js(vid, times, boxes):
    """GSAP moves for a reframed video, as transforms only (x, y, scale from a top-left origin) so the capture
    engine never snaps them to whole pixels. The element keeps the first box's size; scale carries the zoom."""
    base = boxes[0][3]
    v = lambda b: f"x:{b[0]},y:{b[1]},scale:{r3(b[3] / base)}"
    out = [f"tl.set('#{vid}',{{{v(boxes[0])}}},{times[0]});"]
    for (t0, t1), b in zip(zip(times, times[1:]), boxes[1:]):
        out.append(f"tl.to('#{vid}',{{{v(b)},duration:{r3(t1 - t0)},ease:'sine.inOut'}},{t0});")
    return out


def pip_box(x, y, h):
    """Speaker circle (330 px): face height about 46% of the circle, face centred, video always covering it."""
    vh = min(1900.0, max(600.0, 152 / h)) if h else 1351.0
    vw = vh * 9 / 16
    return (r3(min(0, max(330 - vw, 165 - x * vw))), r3(min(0, max(330 - vh, 165 - y * vh))), r3(vw), r3(vh))


def window_box(x, y, h):
    """Half-screen window (1080 x 960): footage at 115% so the face can be centred horizontally too."""
    vw, vh = 1242.0, 2208.0
    return (r3(min(0, max(1080 - vw, 540 - x * vw))), r3(min(0, max(960 - vh, 480 - y * vh))), vw, vh)


# ---------------------------------------------------------------- composition
CSS = r"""
@font-face{font-family:Inter;src:url('assets/fonts/inter-latin-wght-normal.woff2') format('woff2');font-weight:100 900;font-display:block}
@font-face{font-family:Playfair;src:url('assets/fonts/playfair-display-latin-wght-normal.woff2') format('woff2');font-weight:400 900;font-display:block}
@font-face{font-family:Playfair;src:url('assets/fonts/playfair-display-latin-wght-italic.woff2') format('woff2');font-weight:400 900;font-style:italic;font-display:block}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;overflow:hidden;background:#101311}
#main{position:relative;width:1080px;height:1920px;overflow:hidden;font-family:Inter,sans-serif;color:#f4f1ea;background:#101311;isolation:isolate}
.clip{position:absolute;inset:0;width:1080px;height:1920px}
#camera{position:absolute;inset:0;width:1080px;height:1920px;z-index:0}
#speaker{position:absolute;inset:0;width:1080px;height:1920px;object-fit:cover}
.frame-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.15),rgba(0,0,0,0) 27%,rgba(0,0,0,0) 50%,rgba(0,0,0,.6) 100%);z-index:1}
.name{position:absolute;left:72px;top:61px;font-size:22px;font-weight:500;letter-spacing:.06em;z-index:3;color:#f4f1ea}
.display{font-family:Playfair,serif;font-weight:500;letter-spacing:-.035em;line-height:1.05}
.scene{z-index:4}
.scene .slot{position:absolute;overflow:visible}
.scene-full .panel{position:absolute;inset:0;background:#f4f1ea}
.scene-half .panel{position:absolute;left:0;top:0;width:1080px;height:960px;background:#f4f1ea;overflow:hidden}
.bg-ink .panel{background:#1e3e2b}
.bg-paper{color:#1e3e2b}
.bg-ink{color:#f4f1ea}
.window{position:absolute;left:0;top:960px;width:1080px;height:960px;overflow:hidden;z-index:5;opacity:0;background:#101311}
.window video{position:absolute;width:1080px;height:1920px;object-fit:cover}
.pip{position:absolute;right:78px;top:67.5px;width:330px;height:330px;border-radius:50%;overflow:hidden;background:#101311;z-index:20;opacity:0}
.pip video{position:absolute;width:760px;height:1351px;object-fit:cover}
.chapter{font-size:24px;font-weight:600;letter-spacing:.09em;color:#186338}
.bg-ink .chapter{color:#f4f1ea}
.placeholder{position:absolute;inset:0;border:2px dashed rgba(30,62,43,.35);border-radius:24px;display:flex;flex-direction:column;justify-content:center;gap:22px;padding:48px;color:#1e3e2b}
.bg-ink .placeholder,.scene-captions-ui .placeholder{border-color:rgba(244,241,234,.45);color:#f4f1ea}
.ph-tag{font-size:24px;font-weight:600;letter-spacing:.09em}
.ph-plan{font-family:Playfair,serif;font-size:46px;line-height:1.15;letter-spacing:-.02em}
.ph-line{font-size:26px;line-height:1.4;opacity:.7}
#captions{position:absolute;inset:0;z-index:30;pointer-events:none}
.reading-group{position:absolute;left:0;right:0;height:104px;margin-top:-52px;display:flex;align-items:center;justify-content:center;opacity:0;font-size:48px;font-weight:500;line-height:1.25;color:#f4f1ea}
.reading-line{display:inline-flex;align-items:baseline;justify-content:center;gap:12px;background:#1e3e2b;padding:14px 24px;border-radius:6px;max-width:936px;white-space:nowrap}
.on-ink .reading-line{background:#f4f1ea;color:#1e3e2b}
.read-word{display:inline-block;opacity:.5;white-space:nowrap}
.read-word.em{font-family:Playfair,serif;font-style:italic;font-weight:500}
.styled-group{position:absolute;inset:0;width:1080px;height:1920px;z-index:31;opacity:0;pointer-events:none}
.styled-content{width:100%;height:100%;display:flex;flex-direction:column;align-items:flex-start;gap:28px;padding:1170px 108px 0 72px}
.type-plate{display:inline-flex;align-items:baseline;gap:.23em;white-space:nowrap;background:#1e3e2b;color:#f4f1ea;padding:.13em .24em;border-radius:2px;line-height:1.1}
.type-plate.lead{font-family:Inter,sans-serif;font-weight:800;line-height:1.08}
.type-plate.serif{font-family:Playfair,serif;font-style:italic;font-weight:400;margin-left:64px}
.type-plate.serif:first-child{margin-left:0}
.type-plate.connector{background:#1e3e2b;color:#f4f1ea}
"""


def write_if_missing(path, text):
    if not path.exists():
        path.write_text(text)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project", type=Path)
    ap.add_argument("--plan", type=Path)
    a = ap.parse_args()
    project = a.project.resolve()
    words = load_words(project / "words.json")
    plan = load_plan(project, a.plan or project / "plan.json", words)
    style, lines = plan["style"], plan["lines"]
    duration = float(plan["source"]["duration"])
    footage = plan["source"]["footage"]
    edit = Path(footage).with_name(Path(footage).stem + "-edit.mp4")
    if not footage.endswith("-edit.mp4") and (project / edit).exists():
        footage = str(edit)  # the keyframe-dense copy plan_page.py made; the original freezes when seeked
    if not (project / footage).exists():
        sys.exit(f"footage not found: {footage}")
    fx, fy = style.get("face", {}).get("x", .5), style.get("face", {}).get("y", .35)
    spans = scene_spans(lines, duration)
    wix = word_index(words)
    label = (style.get("speaker_label") or "").strip()

    # assets and project files
    (project / "assets/fonts").mkdir(parents=True, exist_ok=True)
    for f in (KIT / "assets/fonts").glob("*.woff2"):
        if not (project / "assets/fonts" / f.name).exists():
            shutil.copy2(f, project / "assets/fonts" / f.name)
    if not (project / "assets/gsap.min.js").exists():
        shutil.copy2(KIT / "assets/gsap.min.js", project / "assets/gsap.min.js")
    slug = re.sub(r"[^a-z0-9]+", "-", project.name.lower()).strip("-")
    write_if_missing(project / "package.json", json.dumps({"name": slug, "private": True, "type": "module", "scripts": {
        k: f"npx --yes hyperframes@{HF_VERSION} {k if k != 'dev' else 'preview'}" for k in ["dev", "check", "render"]}},
        indent=2) + "\n")
    write_if_missing(project / "hyperframes.json", json.dumps({
        "$schema": "https://hyperframes.heygen.com/schema/hyperframes.json",
        "paths": {"blocks": "compositions", "components": "compositions/components", "assets": "assets"},
        "media": {"autoProxy": True}}, indent=2) + "\n")
    write_if_missing(project / "meta.json", json.dumps({"name": project.name, "id": slug}, indent=2) + "\n")
    (project / "scenes").mkdir(exist_ok=True)

    groups, styled = build_captions(plan, words, spans)

    # scenes
    head_css, body, js, cues, report = [CSS], [], [], [], {"scenes": [], "placeholders": [], "orphans": []}
    kind_name = {"captions": "captions", "captions-ui": "captions + UI", "half": "half screen", "full": "full screen"}
    track = 3
    if style.get("opening_zoom", True):
        js.append("tl.to('#camera',{scale:1.18,duration:.22,ease:'power2.out'},.10);\n"
                  "tl.to('#camera',{scale:1.12,duration:1.03,ease:'sine.inOut'},.32);")
        cues.append({"t": 0.08, "sound": "whoosh-short", "level": "low", "event": "opening zoom"})
    # jump cuts made by cut.py: alternate a 7% punch-in at each join that lands on the face, so the cut reads
    # as a second camera instead of a skip. Off with style.punch_in_cuts = false.
    report["jump_cuts"] = 0
    cut_report = project / "cut/report.json"
    if cut_report.exists() and style.get("punch_in_cuts", True):
        rep = json.loads(cut_report.read_text())
        if Path(rep["cut"]).name == Path(footage).name:
            punched = False
            for t in rep["joins"]:
                k = next((n for n, (a, b) in enumerate(spans) if a <= t < b), None)
                if k is None or t < 1.4 or lines[k]["scene"] not in ("captions", "captions-ui"):
                    continue  # the opening zoom owns the first beat; panels hide the face anyway
                punched = not punched
                js.append(f"tl.set('#punch',{{scale:{1.07 if punched else 1}}},{r3(t)});")
                report["jump_cuts"] += 1
    live_ids = {ln["id"] for ln in lines}
    for f in sorted((project / "scenes").glob("*.html")):
        if f.stem not in live_ids:
            report["orphans"].append(f.name)

    for i, (ln, (s0, s1)) in enumerate(zip(lines, spans)):
        sid, scene = ln["id"], ln["scene"]
        frag_path = project / "scenes" / f"{sid}.html"
        if scene != "captions":
            write_if_missing(frag_path, placeholder(ln, s0, s1, kind_name[scene]))
        if not frag_path.exists():
            continue
        frag = parse_fragment(frag_path.read_text())
        dur = r3(s1 - s0)
        bg = ln.get("bg") or style.get("cutaway_bg", "paper")
        pip = scene == "full" and ln.get("pip")
        slot = SLOT["full-pip" if pip else scene]
        slot_css = f"left:{slot[0]}px;top:{slot[1]}px;width:{slot[2]}px;height:{slot[3]}px"
        classes = f"clip scene scene-{scene}" + (f" bg-{bg}" if scene in ("half", "full") else "")
        panel = '<div class="panel">' if scene == "half" else ('<div class="panel"></div>' if scene == "full" else "")
        close_panel = "</div>" if scene == "half" else ""
        body.append(f'<section id="{sid}" class="{classes}" data-start="{s0}" data-duration="{dur}" '
                    f'data-track-index="{track}">{panel}<div class="slot" style="{slot_css}">{frag["body"]}</div>'
                    f'{close_panel}</section>')
        track += 1
        if frag["styles"]:
            head_css.append(f"/* {sid} */\n{frag['styles']}")
        report["scenes"].append({"id": sid, "scene": scene, "start": s0, "end": s1, "built": not frag["placeholder"]})
        if frag["placeholder"]:
            report["placeholders"].append(sid)

        # layout transitions owned by the scaffold
        if scene == "full":
            js.append(f"tl.fromTo('#{sid}',{{opacity:0,scale:1.02}},{{opacity:1,scale:1,duration:.25,ease:'power2.out'}},{s0});")
            if i + 1 < len(lines):
                js.append(f"tl.to('#{sid}',{{opacity:0,duration:.15,ease:'sine.in'}},{r3(s1 - .15)});")
        elif scene == "half":
            js.append(f"tl.fromTo('#{sid} .panel',{{yPercent:-100}},{{yPercent:0,duration:.35,ease:'power3.out'}},{s0});")
            times = reframe_samples(s0, s1)
            boxes = [window_box(*f) for f in face_track(project, footage, times, (fx, fy))]
            body.append(f'<div id="{sid}-window" class="window"><video id="{sid}-window-video" class="clip" data-start="{s0}" data-duration="{dur}" '
                        f'data-media-start="{s0}" data-track-index="{track}" src="{esc(footage)}" muted playsinline data-layout-allow-overflow '
                        f'style="left:0;top:0;width:{boxes[0][2]}px;height:{boxes[0][3]}px;transform-origin:0 0"></video></div>')
            js.extend(reframe_js(f"{sid}-window-video", times, boxes))
            track += 1
            js.append(f"tl.fromTo('#{sid}-window',{{opacity:1,yPercent:100}},{{yPercent:0,duration:.35,ease:'power3.out'}},{s0});")
            js.append(f"tl.set('#{sid}-window',{{opacity:0}},{s1});")
        elif scene == "captions-ui":
            js.append(f"tl.to('#camera',{{filter:'brightness(0.6) blur(8px)',duration:.3,ease:'sine.inOut'}},{s0});")
            js.append(f"tl.to('#camera',{{filter:'brightness(1) blur(0px)',duration:.3,ease:'sine.inOut'}},{r3(max(s0 + .3, s1 - .3))});")
        if pip:
            times = reframe_samples(s0, s1)
            boxes = [pip_box(*f) for f in face_track(project, footage, times, (fx, fy))]
            body.append(f'<div id="{sid}-pip" class="pip"><video id="{sid}-pip-video" class="clip" data-start="{s0}" data-duration="{dur}" '
                        f'data-media-start="{s0}" data-track-index="{track}" src="{esc(footage)}" muted playsinline data-layout-allow-overflow '
                        f'style="left:0;top:0;width:{boxes[0][2]}px;height:{boxes[0][3]}px;transform-origin:0 0"></video></div>')
            js.extend(reframe_js(f"{sid}-pip-video", times, boxes))
            track += 1
            js.append(f"tl.fromTo('#{sid}-pip',{{opacity:0,scale:.9}},{{opacity:1,scale:1,duration:.4,ease:'power3.out'}},{r3(s0 + .2)});")
            js.append(f"tl.to('#{sid}-pip',{{opacity:0,duration:.15,ease:'sine.in'}},{r3(s1 - .15)});")
        if scene in ("half", "full") and label:
            # the label sits on the footage; it leaves while a panel covers the top of the frame
            prev_cut = i > 0 and lines[i - 1]["scene"] in ("half", "full")
            next_cut = i + 1 < len(lines) and lines[i + 1]["scene"] in ("half", "full")
            if not prev_cut:
                js.append(f"tl.to('#speaker-label',{{opacity:0,duration:.12,ease:'sine.in'}},{s0});")
            if not next_cut and i + 1 < len(lines):
                js.append(f"tl.to('#speaker-label',{{opacity:1,duration:.2,ease:'sine.out'}},{s1});")
        if frag["script"].strip():
            js.append(f"(function(tl,T0,DUR,root){{const q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)];\n"
                      f"{frag['script'].strip()}\n}})(tl,{s0},{dur},document.getElementById('{sid}'));")
        if scene in SFX_ENTER:
            snd, ev = SFX_ENTER[scene]
            cues.append({"t": r3(max(0, s0 - .06)), "sound": snd, "level": "normal", "event": f"{sid} {ev}"})
            if scene in ("half", "full") and i + 1 < len(lines) and lines[i + 1]["scene"] == "captions":
                cues.append({"t": r3(s1 - .1), "sound": "whoosh-short", "level": "low", "event": f"{sid} back to the face"})
        for when, snd, note in frag["cues"]:
            t = wix[when]["start"] if when.startswith("w") and when in wix else s0 + float(when.lstrip("+"))
            cues.append({"t": r3(t), "sound": snd, "level": "normal", "event": f"{sid} {note.strip()}".strip()})

    # captions and styled phrases
    cap_html, sty_html = [], []
    for g in groups:
        em = set(g["em"])
        inner = "".join(f'<span class="read-word{" em" if w["id"] in em else ""}" id="read-{w["id"]}">{esc(w["text"])}</span>'
                        for w in g["words"])
        cap_html.append(f'<div id="{g["id"]}" class="reading-group{" on-ink" if g["on_ink"] else ""}" '
                        f'style="top:{g["y"]}px"><div class="reading-line">{inner}</div></div>')
    plate = style.get("emphasis_plate", "sage")
    for k, s in enumerate(styled):
        sty_html.append(styled_markup(s, plate))
        if k % 2 == 0:
            cues.append({"t": r3(s["start"]), "sound": "pop", "level": "low", "event": f"styled phrase {s['id']}"})
    cap_data = [{"id": g["id"], "start": g["start"], "end": g["end"],
                 "words": [[w["id"], r3(w["start"])] for w in g["words"]]} for g in groups]
    sty_data = [{"id": s["id"], "start": s["start"], "end": s["end"],
                 "words": [[w["id"], r3(w["start"])] for w in s["words"]]} for s in styled]

    words_js = json.dumps({w["id"]: {"text": w["text"], "start": w["start"], "end": w["end"]} for w in words})
    doc = f"""<!doctype html>
<!-- GENERATED by sprout-talking-head/tools/scaffold.py from plan.json. Do not edit: change plan.json or scenes/*.html and re-run. -->
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width={W}, height={H}">
<script src="assets/gsap.min.js"></script>
<style>
{chr(10).join(head_css)}
#camera{{transform-origin:{fx * 100:.1f}% {fy * 100:.1f}%;filter:brightness(1) blur(0px)}}
#punch{{position:absolute;inset:0;transform-origin:{fx * 100:.1f}% {fy * 100:.1f}%}}
</style></head>
<body>
<div id="main" data-composition-id="main" data-start="0" data-duration="{duration}" data-width="{W}" data-height="{H}" data-fps="30">
 <div id="camera"><div id="punch"><video id="speaker" class="clip" data-start="0" data-duration="{duration}" data-track-index="0" data-has-audio="true" src="{esc(footage)}" playsinline></video></div></div>
 <div class="frame-shade"></div>{f'<div id="speaker-label" class="name" data-layout-allow-occlusion>{esc(label)}</div>' if label else ''}
 {chr(10).join(body)}
 <div id="captions">{''.join(cap_html)}{''.join(sty_html)}</div>
</div>
<script>
const WORDS={words_js};
const word=id=>WORDS[id];
const CAPTIONS={json.dumps(cap_data)};
const STYLED={json.dumps(sty_data)};
const tl=gsap.timeline({{paused:true}});
tl.set('#camera',{{scale:1,filter:'brightness(1) blur(0px)'}},0);
{chr(10).join(js)}
CAPTIONS.forEach(g=>{{
 tl.fromTo('#'+g.id,{{opacity:0}},{{opacity:1,duration:.035,ease:'sine.out'}},g.start);
 tl.set('#'+g.id,{{opacity:0}},g.end);
 g.words.forEach(([id,t])=>tl.to('#read-'+id,{{opacity:1,duration:.07,ease:'sine.out'}},Math.max(g.start,t-.03)));
}});
STYLED.forEach(s=>{{
 tl.fromTo('#'+s.id,{{opacity:0,y:8}},{{opacity:1,y:0,duration:.09,ease:'power2.out'}},s.start);
 tl.set('#'+s.id,{{opacity:0}},s.end);
 s.words.forEach(([id,t])=>tl.to('#read-'+id,{{opacity:1,duration:.07,ease:'sine.out'}},Math.max(s.start,t-.03)));
}});
window.__timelines=window.__timelines||{{}};
window.__timelines['main']=tl;
</script>
</body></html>
"""
    (project / "index.html").write_text(doc)

    srt = []
    for n, g in enumerate(sorted(groups + styled, key=lambda g: g["start"]), 1):
        srt.append(f"{n}\n{fmt_srt(g['start'])} --> {fmt_srt(g['end'])}\n{' '.join(w['text'] for w in g['words'])}\n")
    (project / "captions.srt").write_text("\n".join(srt))
    cues.sort(key=lambda c: c["t"])
    (project / "cues.json").write_text(json.dumps({"duration": duration, "cues": cues}, indent=1) + "\n")
    report.update({"lines": len(lines), "caption_groups": len(groups), "styled_phrases": len(styled), "cues": len(cues),
                   "words_captioned": sum(len(g["words"]) for g in groups) + sum(len(s["words"]) for s in styled),
                   "words_total": len(words)})
    assert report["words_captioned"] == len(words), "every spoken word must be captioned exactly once"
    (project / "scaffold-report.json").write_text(json.dumps(report, indent=1) + "\n")
    print(json.dumps({k: report[k] for k in ["lines", "caption_groups", "styled_phrases", "cues", "words_captioned"]}
                     | {"scenes": len(report["scenes"]), "placeholders": report["placeholders"], "orphans": report["orphans"]}))


if __name__ == "__main__":
    main()
