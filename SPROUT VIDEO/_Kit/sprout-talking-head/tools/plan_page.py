#!/usr/bin/env python3
"""Build the planning page for a talking-head edit (step 2 of the kit workflow).

    python3 plan_page.py <project> [--words transcript.json] [--footage assets/clip.mp4] [--title "Name"]

Reads a word-level transcript (canonical words.json, ElevenLabs Scribe JSON, or Whisper JSON), writes the
canonical <project>/words.json, splits it into script lines, and writes <project>/planning.html. Open that page
in Chrome, choose a scene type per line, mark the words for styled phrases, write the plan, then
"Save plan.json" into the project folder. An existing <project>/plan.json is loaded into the page, so the page
can be rebuilt at any time without losing the plan.
"""
import argparse
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import KIT, load_words, segment_lines  # noqa: E402


def duration_of(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True, check=True).stdout
    return round(float(out.strip()), 3)


def max_keyframe_gap(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-skip_frame", "nokey", "-show_entries",
                          "frame=pts_time", "-of", "csv=p=0", str(path)], capture_output=True, text=True, check=True).stdout
    ts = sorted(float(x.strip(",")) for x in out.split() if x.strip(","))
    return max((b - a for a, b in zip(ts, ts[1:])), default=0.0)


def edit_ready(project, footage):
    """HyperFrames seeks every frame; a clip with keyframes seconds apart freezes in the speaker circle and the
    half-screen window. Re-encode once to a keyframe every frame-second (GOP 30) and plan against that file."""
    src = project / footage
    if src.stem.endswith("-edit"):
        return footage
    gap = max_keyframe_gap(src)
    if gap <= 1.05:
        return footage
    dst = src.with_name(src.stem + "-edit.mp4")
    if not dst.exists():
        print(f"footage keyframes are {gap:.1f} s apart: writing {dst.name} (GOP 30)", file=sys.stderr)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-c:v", "libx264", "-preset", "slow", "-crf", "14",
                        "-r", "30", "-g", "30", "-keyint_min", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                        "-c:a", "aac", "-b:a", "256k", str(dst)], check=True)
    return str(dst.relative_to(project))


def copy_fonts(project):
    dst = project / "assets/fonts"
    dst.mkdir(parents=True, exist_ok=True)
    for f in (KIT / "assets/fonts").glob("*.woff2"):
        if not (dst / f.name).exists():
            shutil.copy2(f, dst / f.name)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project", type=Path)
    ap.add_argument("--words", type=Path, help="transcript file (default <project>/words.json)")
    ap.add_argument("--footage", help="footage path relative to the project (default: first .mp4 in assets/)")
    ap.add_argument("--title", help="shown in the page header (default: project folder name)")
    a = ap.parse_args()
    project = a.project.resolve()

    src = a.words or project / "words.json"
    words = load_words(src)
    (project / "words.json").write_text(json.dumps(words, indent=1) + "\n")

    footage = a.footage
    if not footage:
        # a cut.py result first (raw-cut.mp4), then a keyframe-dense copy (-edit), then anything else
        clips = sorted((project / "assets").glob("*.mp4"),
                       key=lambda c: (not c.stem.endswith("-cut"), not c.stem.endswith("-edit"), c.name))
        if not clips:
            sys.exit("No footage: pass --footage or put the clip in <project>/assets/")
        footage = str(clips[0].relative_to(project))
    footage = edit_ready(project, footage)
    duration = duration_of(project / footage)

    plan = None
    if (project / "plan.json").exists():
        plan = json.loads((project / "plan.json").read_text())

    key = hashlib.sha1(json.dumps([(w["id"], w["start"]) for w in words]).encode()).hexdigest()[:12]
    data = {"title": a.title or project.name, "footage": footage, "wordsFile": "words.json", "duration": duration,
            "key": key, "words": words, "lines": segment_lines(words), "plan": plan}
    html = (KIT / "templates/planning.html").read_text()
    html = html.replace("__TITLE__", data["title"].replace("<", "&lt;"))
    html = html.replace("__FOOTAGE__", footage.replace('"', "&quot;"))
    html = html.replace("__DATA__", json.dumps(data).replace("</", "<\\/"))
    copy_fonts(project)
    (project / "planning.html").write_text(html)
    print(json.dumps({"page": str(project / "planning.html"), "lines": len(data["lines"]), "words": len(words),
                      "duration": duration, "existing_plan": plan is not None}))


if __name__ == "__main__":
    main()
