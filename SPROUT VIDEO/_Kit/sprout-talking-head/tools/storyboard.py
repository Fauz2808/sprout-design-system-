#!/usr/bin/env python3
"""Figma storyboard for a talking-head edit: the planning step, done in Figma instead of planning.html.

    python3 storyboard.py spec  <project> [--title T]     # storyboard/spec.json + storyboard/thumbs/<id>.jpg
    python3 storyboard.py code  <project> components      # JS for use_figma: the SB components (once per file)
    python3 storyboard.py code  <project> generate        # JS for use_figma: the storyboard section for this video
    python3 storyboard.py code  <project> read            # JS for use_figma: read the section back
    python3 storyboard.py upload <project> <uploads.json> # POST thumbnails to the upload_assets URLs
    python3 storyboard.py apply <project> <export.json>   # merge what was read from Figma into plan.json

Figma is where the human edits; plan.json stays the file the scaffold reads. `spec` starts from plan.json when
there is one, otherwise from the transcript split into lines (every line Captions). `apply` writes plan.json
(the previous one is kept as plan.json.bak) and prints what changed. See docs/storyboard-figma.md.
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import KIT, SCENE_TYPES, load_words, segment_lines, word_index, make_line  # noqa: E402

FIGMA = json.loads((KIT / "tools/figma/figma.json").read_text())
SCENE_LABEL = {"captions": "Captions", "captions-ui": "Captions + UI", "half": "Half", "full": "Full"}
LABEL_SCENE = {v: k for k, v in SCENE_LABEL.items()}
PLATES = {"sage", "cream", "ink"}
CUTAWAYS = {"paper", "ink"}


def tc(t):
    m, s = divmod(max(t, 0), 60)
    return f"{int(m)}:{s:04.1f}"


def bare(t):
    return re.sub(r"[^a-z0-9']", "", t.lower())


def runs(ids, order):
    """Contiguous runs of word ids, in line order."""
    pos = sorted(order.index(i) for i in ids if i in order)
    out, cur = [], []
    for p in pos:
        if cur and p != cur[-1] + 1:
            out.append(cur)
            cur = []
        cur.append(p)
    if cur:
        out.append(cur)
    return [[order[p] for p in r] for r in out]


def find_project_paths(project):
    words_path = project / "words.json"
    if not words_path.exists():
        sys.exit(f"{words_path} missing: run plan_page.py (or write words.json) first")
    return words_path, project / "plan.json"


def footage_of(project, plan):
    if plan and plan.get("source", {}).get("footage"):
        return plan["source"]["footage"]
    clips = sorted((project / "assets").glob("*.mp4"), key=lambda c: (not c.stem.endswith("-edit"), c.name))
    if not clips:
        sys.exit("No footage in <project>/assets/")
    return str(clips[0].relative_to(project))


def duration_of(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True, check=True).stdout
    return round(float(out.strip()), 3)


def cmd_spec(project, title=None):
    words_path, plan_path = find_project_paths(project)
    words = load_words(words_path)
    idx = word_index(words)
    plan = json.loads(plan_path.read_text()) if plan_path.exists() else None
    footage = footage_of(project, plan)
    duration = (plan or {}).get("source", {}).get("duration") or duration_of(project / footage)
    if plan:
        lines = plan["lines"]
        style = plan.get("style", {})
        notes = plan.get("notes", "")
    else:
        lines = [dict(ln, scene="captions", emphasis=[], bg=None, pip=False, plan="") for ln in segment_lines(words)]
        style = {"speaker_label": "", "opening_zoom": True, "emphasis_plate": "sage", "cutaway_bg": "paper"}
        notes = ""

    out = project / "storyboard"
    thumbs = out / "thumbs"
    thumbs.mkdir(parents=True, exist_ok=True)
    spec_lines = []
    for ln in lines:
        order = ln["word_ids"]
        styled = " / ".join(" ".join(idx[i]["text"] for i in r) for r in runs(ln.get("emphasis", []), order))
        t = ln["start"] + (ln["end"] - ln["start"]) * 0.4
        jpg = thumbs / f"{ln['id']}.jpg"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", str(project / footage), "-frames:v", "1",
                        "-vf", "scale=432:768:force_original_aspect_ratio=increase,crop=432:768", "-q:v", "4", str(jpg)],
                       check=True)
        spec_lines.append({"id": ln["id"], "time": f"{tc(ln['start'])}–{tc(ln['end'])}", "seconds": round(ln["end"] - ln["start"], 2),
                           "text": ln["text"], "scene": SCENE_LABEL[ln["scene"]], "styled": styled or "—",
                           "plan": ln.get("plan") or "—", "ink": ln.get("bg") == "ink", "pip": bool(ln.get("pip")),
                           "thumb": str(jpg.relative_to(project))})
    spec = {"project": project.name, "title": title or project.name,
            "subtitle": f"{project.name} · {duration:.1f} s · {len(lines)} lines · {len(words)} words",
            "duration": duration,
            "header": {"speaker": style.get("speaker_label") or "—", "zoom": bool(style.get("opening_zoom", True)),
                       "plate": style.get("emphasis_plate", "sage"), "cutaway": style.get("cutaway_bg", "paper"),
                       "notes": notes or "—"},
            "lines": spec_lines}
    (out / "spec.json").write_text(json.dumps(spec, indent=1, ensure_ascii=False) + "\n")
    print(json.dumps({"spec": str(out / "spec.json"), "lines": len(spec_lines), "thumbs": len(spec_lines)}))


def cmd_code(project, which):
    tpl = (KIT / f"tools/figma/{which}.js").read_text()
    tpl = tpl.replace("__PAGE_ID__", FIGMA["page_id"])
    if which == "generate":
        spec = json.loads((project / "storyboard/spec.json").read_text())
        slim = dict(spec, lines=[{k: v for k, v in ln.items() if k != "thumb"} for ln in spec["lines"]])
        tpl = tpl.replace("__SPEC__", json.dumps(slim, ensure_ascii=False))
    if which == "read":
        state = project / "storyboard/figma.json"
        if not state.exists():
            sys.exit("storyboard/figma.json missing: save the section id from the generate step first")
        tpl = tpl.replace("__SECTION_ID__", json.loads(state.read_text())["section_id"])
    sys.stdout.write(tpl)


def cmd_upload(project, uploads_path):
    """POST each thumbnail to the upload URL whose targetNodeId is that line's footage rect (upload_assets output)."""
    state = json.loads((project / "storyboard/figma.json").read_text())
    by_node = {v: k for k, v in state["footage"].items()}
    ups = json.loads(Path(uploads_path).read_text())
    ups = ups.get("uploads", ups)
    done = []
    for u in ups:
        lid = by_node.get(u["targetNodeId"])
        if not lid:
            sys.exit(f"{u['targetNodeId']}: not a footage rect of this storyboard")
        jpg = project / "storyboard/thumbs" / f"{lid}.jpg"
        r = subprocess.run(["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-X", "POST", "-F",
                            f"file=@{jpg};type=image/jpeg;filename=Footage {lid}.jpg", u["submitUrl"]],
                           capture_output=True, text=True)
        done.append(f"{lid}:{r.stdout}")
    print(" ".join(done))


def match_run(phrase, order, idx):
    toks = [bare(t) for t in phrase.split() if bare(t)]
    seq = [bare(idx[i]["text"]) for i in order]
    for s in range(len(seq) - len(toks) + 1):
        if seq[s:s + len(toks)] == toks:
            return order[s:s + len(toks)]
    return None


def cmd_apply(project, export_path):
    words_path, plan_path = find_project_paths(project)
    words = load_words(words_path)
    idx = word_index(words)
    exp = json.loads(Path(export_path).read_text())
    old = json.loads(plan_path.read_text()) if plan_path.exists() else None
    base = {ln["id"]: ln for ln in (old["lines"] if old else segment_lines(words))}
    errors, changes, lines = [], [], []

    for card in exp["cards"]:
        lid = card["id"]
        if lid not in base:
            errors.append(f"{lid}: no such line in the plan (renamed in Figma?)")
            continue
        src = base[lid]
        order = src["word_ids"]
        scene = LABEL_SCENE.get(card["scene"])
        if scene not in SCENE_TYPES:
            errors.append(f"{lid}: unknown scene {card['scene']!r}")
            continue
        emphasis = []
        styled = card.get("styled", "").strip()
        if styled and styled not in ("—", "-"):
            for part in styled.split("/"):
                if not part.strip():
                    continue
                hit = match_run(part, order, idx)
                if hit is None:
                    errors.append(f"{lid}: styled words {part.strip()!r} are not in the line {src['text']!r}")
                else:
                    emphasis += hit
        plan_text = card.get("plan", "").strip()
        ln = {"id": lid, "start": src["start"], "end": src["end"], "text": src["text"], "word_ids": order,
              "scene": scene, "emphasis": emphasis,
              "bg": ("ink" if card.get("ink") else "paper") if scene in ("half", "full") else None,
              "pip": bool(card.get("pip")) and scene == "full",
              "plan": "" if plan_text in ("—", "-") else plan_text}
        if card.get("sketch"):
            ln["sketch"] = card["sketch"]
        ln["_merge"] = bool(card.get("merge"))
        lines.append(ln)

    covered = [i for ln in lines for i in ln["word_ids"]]
    if not errors and covered != [w["id"] for w in words]:
        errors.append("the cards do not cover the transcript word for word, in order (a card deleted or moved?)")
    if errors:
        sys.exit("Nothing written:\n  " + "\n  ".join(errors))

    merged = []
    for ln in lines:
        if merged and merged[-1]["_merge"]:
            prev = merged[-1]
            m = make_line(prev["word_ids"] + ln["word_ids"], idx)
            prev.update(end=m["end"], text=m["text"], word_ids=m["word_ids"], emphasis=prev["emphasis"] + ln["emphasis"],
                        plan=" / ".join(p for p in (prev["plan"], ln["plan"]) if p), _merge=ln["_merge"])
            changes.append(f"{prev['id']}: merged with {ln['id']}")
            continue
        merged.append(ln)
    for ln in merged:
        ln.pop("_merge", None)

    h = exp["header"]
    plate = h.get("plate", "sage").strip().lower()
    cutaway = h.get("cutaway", "paper").strip().lower()
    if plate not in PLATES or cutaway not in CUTAWAYS:
        sys.exit(f"Nothing written: header plate must be one of {sorted(PLATES)}, cutaway one of {sorted(CUTAWAYS)}")
    style = dict((old or {}).get("style", {}))
    style.update(speaker_label="" if h.get("speaker", "").strip() in ("—", "-") else h["speaker"].strip(),
                 opening_zoom=bool(h.get("zoom")), emphasis_plate=plate, cutaway_bg=cutaway)
    notes = h.get("notes", "").strip()
    plan = {"schema": "sprout-talking-head/plan@1",
            "source": (old or {}).get("source") or {"footage": footage_of(project, None), "words": "words.json"},
            "style": style, "notes": "" if notes in ("—", "-") else notes, "lines": merged,
            "saved": datetime.now().isoformat(timespec="seconds"), "from": "figma storyboard"}

    if old:
        oldl = {ln["id"]: ln for ln in old["lines"]}
        for ln in merged:
            o = oldl.get(ln["id"])
            if not o:
                continue
            for k in ("scene", "emphasis", "bg", "pip", "plan", "sketch"):
                if o.get(k) != ln.get(k):
                    changes.append(f"{ln['id']}: {k} {o.get(k)!r} -> {ln.get(k)!r}")
        for k in ("speaker_label", "opening_zoom", "emphasis_plate", "cutaway_bg"):
            if old.get("style", {}).get(k) != style.get(k):
                changes.append(f"style.{k}: {old['style'].get(k)!r} -> {style.get(k)!r}")
        if old.get("notes", "") != plan["notes"]:
            changes.append("notes changed")
        shutil.copy2(plan_path, plan_path.with_suffix(".json.bak"))
    plan_path.write_text(json.dumps(plan, indent=1, ensure_ascii=False) + "\n")
    print(json.dumps({"plan": str(plan_path), "lines": len(merged), "changes": changes or ["no changes"]}, indent=1,
                     ensure_ascii=False))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("spec"); s.add_argument("project", type=Path); s.add_argument("--title")
    c = sub.add_parser("code"); c.add_argument("project", type=Path); c.add_argument("which", choices=["components", "generate", "read"])
    a = sub.add_parser("apply"); a.add_argument("project", type=Path); a.add_argument("export", type=Path)
    u = sub.add_parser("upload"); u.add_argument("project", type=Path); u.add_argument("uploads", type=Path)
    args = ap.parse_args()
    project = args.project.resolve()
    if args.cmd == "spec":
        cmd_spec(project, args.title)
    elif args.cmd == "code":
        cmd_code(project, args.which)
    elif args.cmd == "upload":
        cmd_upload(project, args.uploads)
    else:
        cmd_apply(project, args.export)


if __name__ == "__main__":
    main()
