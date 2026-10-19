#!/usr/bin/env python3
"""Cut raw talking-head footage: remove fillers, stutters, abandoned takes and long pauses (step 1b of the kit).

    python3 cut.py analyze <project> --raw assets/raw.mp4 [--words assets/raw-transcript.json]
    python3 cut.py apply   <project>

analyze  reads the raw clip and its word-level transcript (made by transcribe.py if missing), proposes what to
         drop, and writes <project>/cut/edl.json plus <project>/cut/review.html. Open the review page in Chrome:
         every dropped word is struck through with its reason, every long pause shows how short it will become,
         and "Play the cut" previews the result on the raw clip. Click words to keep or drop them, save edl.json.
apply    renders <project>/assets/<raw>-cut.mp4 (keyframe every second, 30 fps, ready for HyperFrames), writes the
         retimed <project>/words.json for plan_page.py, and <project>/cut/report.json (segments, jump-cut times,
         what was removed). Re-run apply after any change to edl.json.

The proposals are rules, not taste. The rules: a filler ("um", "uh") goes; a doubled small word ("and, and")
loses its first copy; a take that restarts after a pause loses the earlier attempt and keeps the last one; a
pause longer than --max-pause shrinks to a natural beat. Which take sounds better is a human (or Claude) call:
review before apply.
"""
import argparse
import json
import re
import subprocess
import sys
from fractions import Fraction
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import audio  # noqa: E402
from common import JOINERS, KIT, WEAK_END, _bare  # noqa: E402

FILLERS = {"um", "umm", "uh", "uhh", "uhm", "er", "erm", "ah", "ahh", "hmm", "hm", "mm", "mhm", "eh"}
SMALL = WEAK_END | JOINERS | {"i'm", "it", "we're", "you're", "there", "this", "like"}
SENT_END = re.compile(r"[.?!]['\")\]]*$")
DEFAULTS = {"pad_in": 0.10, "pad_out": 0.14, "max_pause": 0.45, "retake_window": 25.0}


def norm(t):
    return _bare(t).strip("'")


def fps_of(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate",
                          "-of", "csv=p=0", str(path)], capture_output=True, text=True, check=True).stdout.strip()
    return Fraction(out.split(",")[0])


def duration_of(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True, check=True).stdout
    return float(out.strip())


# ---------------------------------------------------------------- proposals
def propose(words):
    """Mark words to drop. Returns {word id: (reason, group)}."""
    drop = {}
    toks = [norm(w["text"]) for w in words]

    def gap_before(q):
        return words[q]["start"] - words[q - 1]["end"] if q else 99.0

    def phrase_start(i):
        """A take can only start where speech starts: after a pause or a sentence end, looking past any fillers and
        doubled words just before it ("um, and, and you need" starts at the pause before "um")."""
        j = i - 1
        while j >= 0 and words[j]["id"] in drop and drop[words[j]["id"]][0] in ("filler", "repeat"):
            j -= 1
        if j < 0:
            return True
        return words[j + 1]["start"] - words[j]["end"] >= 0.25 or words[i]["start"] - words[j]["end"] >= 0.25 + 0.4 * (i - j - 1) \
            or bool(SENT_END.search(words[j]["text"]))

    for i, t in enumerate(toks):
        if t in FILLERS:
            drop[words[i]["id"]] = ("filler", None)
    for i in range(len(words) - 1):
        a, b = toks[i], toks[i + 1]
        if a and a == b and a in SMALL and gap_before(i + 1) < 0.6:
            drop.setdefault(words[i]["id"], ("repeat", None))

    content = [i for i, t in enumerate(toks) if t and t not in FILLERS and words[i]["id"] not in drop]
    group = 0
    for qi, q in enumerate(content):
        if not phrase_start(q) or q == 0:
            continue
        best = None
        for pi in range(qi - 1, -1, -1):
            p = content[pi]
            if words[q]["start"] - words[p]["start"] > DEFAULTS["retake_window"]:
                break
            if not phrase_start(p) or any(words[k]["id"] in drop for k in range(p, q) if drop.get(words[k]["id"], ("",))[0] == "retake"):
                continue
            k = 0
            while qi + k < len(content) and pi + k < qi and toks[content[pi + k]] == toks[content[qi + k]]:
                k += 1
            attempt = [content[x] for x in range(pi, qi)]
            if k < 2:
                continue
            later = [toks[content[qi + x]] for x in range(min(len(attempt), len(content) - qi))]
            same = sum(1 for x, y in zip([toks[a] for a in attempt], later) if x == y) / len(attempt)
            unfinished = not SENT_END.search(words[attempt[-1]]["text"])
            span = words[attempt[-1]]["end"] - words[attempt[0]]["start"]
            if k < 3 and all(toks[content[pi + x]] in SMALL for x in range(k)):
                continue  # "and the" restarting proves nothing; need a third matching word
            # a repeated sentence may be long; an abandoned one is short. Never drop a long run that merely
            # starts with the same words as a later sentence.
            if same >= 0.7 or (unfinished and span <= 6.0):
                best = (p, q, k, same)  # keep looking further back: the earliest attempt that restarts here wins
        if best:
            p, q, k, same = best
            group += 1
            for x in range(p, q):
                drop[words[x]["id"]] = ("retake", group)
    return drop


# ---------------------------------------------------------------- segments
def segments(words, keep, env, fps, settings, total):
    """Spans of the raw clip to keep: runs of kept words, padded into the surrounding quiet, edges on the quietest
    10 ms near the boundary, then snapped to the frame grid so picture and sound cut at the same instant."""
    runs, cur = [], []
    for i, w in enumerate(words):
        if not keep[w["id"]]:
            if cur:
                runs.append(cur)
                cur = []
            continue
        if cur and w["start"] - cur[-1][1]["end"] > settings["max_pause"]:
            runs.append(cur)
            cur = []
        cur.append((i, w))
    if cur:
        runs.append(cur)
    frame = 1 / float(fps)
    snap = lambda t: round(round(t / frame) * frame, 6)
    spans = []
    for run in runs:
        i0, w0 = run[0]
        i1, w1 = run[-1]
        prev_end = words[i0 - 1]["end"] if i0 else 0.0
        next_start = words[i1 + 1]["start"] if i1 + 1 < len(words) else total
        a_lo = max(prev_end, w0["start"] - settings["pad_in"])
        b_hi = min(next_start, w1["end"] + settings["pad_out"])
        a = audio.quietest(env, (a_lo + w0["start"]) / 2, (w0["start"] - a_lo) / 2) if w0["start"] > a_lo else a_lo
        b = audio.quietest(env, (w1["end"] + b_hi) / 2, (b_hi - w1["end"]) / 2) if b_hi > w1["end"] else b_hi
        # never cut into the word itself, whatever the envelope says
        a, b = min(a, w0["start"] - 0.02), max(b, w1["end"] + 0.03)
        a, b = max(0.0, snap(a)), min(snap(total), snap(b))
        if spans and a <= spans[-1][1] + frame:
            spans[-1] = (spans[-1][0], b, spans[-1][2] + [i for i, _ in run])
        else:
            spans.append((a, b, [i for i, _ in run]))
    return spans


# ---------------------------------------------------------------- analyze
def analyze(project, raw, words_path):
    if not words_path.exists():
        print(f"no transcript at {words_path}: transcribing with whisper", file=sys.stderr)
        subprocess.run([sys.executable, str(KIT / "tools/transcribe.py"), str(raw), "--out", str(words_path)], check=True)
    words = json.loads(words_path.read_text())
    env = audio.envelope(raw)
    floor, speech, thresh = audio.levels(env)
    drop = propose(words)
    out = project / "cut"
    out.mkdir(exist_ok=True)
    fonts = project / "assets/fonts"
    fonts.mkdir(parents=True, exist_ok=True)
    for f in (KIT / "assets/fonts").glob("*.woff2"):
        if not (fonts / f.name).exists():
            (fonts / f.name).write_bytes(f.read_bytes())
    edl = {"schema": "sprout-talking-head/edl@1", "raw": str(raw.relative_to(project)), "transcript": str(words_path.relative_to(project)),
           "duration": round(duration_of(raw), 3), "fps": str(fps_of(raw)), "settings": DEFAULTS,
           "levels": {"floor": round(floor, 1), "speech": round(speech, 1), "silence": round(thresh, 1)},
           "words": [dict(w, keep=w["id"] not in drop, reason=drop.get(w["id"], (None, None))[0],
                          group=drop.get(w["id"], (None, None))[1]) for w in words]}
    (out / "edl.json").write_text(json.dumps(edl, indent=1) + "\n")
    write_review(project, edl)
    keep = {w["id"]: w["keep"] for w in edl["words"]}
    spans = segments(words, keep, env, edl["fps"], DEFAULTS, edl["duration"])
    reasons = {}
    for w in edl["words"]:
        if w["reason"]:
            reasons[w["reason"]] = reasons.get(w["reason"], 0) + 1
    print(json.dumps({"edl": str(out / "edl.json"), "review": str(out / "review.html"), "words": len(words),
                      "dropped": reasons, "raw_s": edl["duration"], "estimated_cut_s": round(sum(b - a for a, b, _ in spans), 2)}))


def write_review(project, edl):
    html = (KIT / "templates/cut-review.html").read_text()
    html = html.replace("__RAW__", ("../" + edl["raw"]).replace('"', "&quot;"))
    html = html.replace("__TITLE__", project.name.replace("<", "&lt;"))
    html = html.replace("__DATA__", json.dumps(edl).replace("</", "<\\/"))
    (project / "cut/review.html").write_text(html)


# ---------------------------------------------------------------- render
def render(raw, spans, dst, graph):
    """Concatenate the spans of raw into dst. Picture and sound are trimmed at the same timestamps (frame-aligned
    by segments()), each sound piece gets an 8 ms fade at both ends so joins never click, and the result has a
    keyframe every 30 frames at 30 fps, ready for HyperFrames."""
    fade = 0.008
    parts, labels = [], []
    for n, (a, b, *_) in enumerate(spans):
        d = b - a
        parts.append(f"[0:v]trim=start={a:.6f}:end={b:.6f},setpts=PTS-STARTPTS[v{n}]")
        parts.append(f"[0:a]atrim=start={a:.6f}:end={b:.6f},asetpts=PTS-STARTPTS,"
                     f"afade=t=in:st=0:d={fade},afade=t=out:st={max(0, d - fade):.6f}:d={fade}[a{n}]")
        labels.append(f"[v{n}][a{n}]")
    parts.append(f"{''.join(labels)}concat=n={len(spans)}:v=1:a=1[cv][ca]")
    parts.append("[cv]fps=30,format=yuv420p[ov]")
    graph.write_text(";\n".join(parts))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-/filter_complex", str(graph), "-map", "[ov]",
                    "-map", "[ca]", "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-g", "30", "-keyint_min", "30",
                    "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart", str(dst)], check=True)


# ---------------------------------------------------------------- apply
def apply(project):
    edl = json.loads((project / "cut/edl.json").read_text())
    raw = project / edl["raw"]
    words = edl["words"]
    keep = {w["id"]: w["keep"] for w in words}
    if not any(keep.values()):
        sys.exit("every word is dropped")
    env = audio.envelope(raw)
    fps = Fraction(edl["fps"])
    spans = segments(words, keep, env, fps, edl["settings"], edl["duration"])

    dst = raw.with_name(raw.stem + "-cut.mp4")
    render(raw, spans, dst, project / "cut/filter.txt")

    # retime the kept words onto the cut timeline
    out_words, segs, t = [], [], 0.0
    for a, b, idx in spans:
        segs.append({"raw_start": round(a, 3), "raw_end": round(b, 3), "cut_start": round(t, 3), "cut_end": round(t + b - a, 3)})
        for i in idx:
            w = words[i]
            if not keep[w["id"]]:
                continue
            out_words.append({"id": f"w{len(out_words)}", "text": w["text"],
                              "start": round(t + max(0.0, w["start"] - a), 3), "end": round(t + min(b - a, w["end"] - a), 3),
                              "raw_id": w["id"]})
        t += b - a
    # a kept take often starts mid-sentence in the transcript ("to, there are three"): open each sentence with a
    # capital again so captions read cleanly
    for n, w in enumerate(out_words):
        if (n == 0 or SENT_END.search(out_words[n - 1]["text"])) and w["text"][:1].islower():
            w["text"] = w["text"][0].upper() + w["text"][1:]
    (project / "words.json").write_text(json.dumps(out_words, indent=1) + "\n")
    dur = duration_of(dst)
    removed = {}
    for w in words:
        if not w["keep"]:
            removed[w["reason"] or "by hand"] = removed.get(w["reason"] or "by hand", 0) + 1
    report = {"raw": edl["raw"], "cut": str(dst.relative_to(project)), "raw_s": edl["duration"], "cut_s": round(dur, 3),
              "expected_s": round(t, 3), "segments": segs, "joins": [s["cut_start"] for s in segs[1:]],
              "words_kept": len(out_words), "words_removed": removed, "settings": edl["settings"]}
    (project / "cut/report.json").write_text(json.dumps(report, indent=1) + "\n")
    print(json.dumps({k: report[k] for k in ["cut", "raw_s", "cut_s", "expected_s", "words_kept", "words_removed"]}
                     | {"segments": len(segs)}))
    if abs(dur - t) > 0.1:
        sys.exit(f"cut duration {dur:.3f} s differs from the planned {t:.3f} s")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("mode", choices=["analyze", "apply"])
    ap.add_argument("project", type=Path)
    ap.add_argument("--raw", help="raw clip, relative to the project (analyze)")
    ap.add_argument("--words", help="word transcript, relative to the project (default <raw>-transcript.json)")
    a = ap.parse_args()
    project = a.project.resolve()
    if a.mode == "analyze":
        if not a.raw:
            sys.exit("analyze needs --raw")
        raw = project / a.raw
        words = project / a.words if a.words else raw.with_name(raw.stem + "-transcript.json")
        analyze(project, raw, words)
    else:
        apply(project)


if __name__ == "__main__":
    main()
