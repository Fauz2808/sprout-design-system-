#!/usr/bin/env python3
"""Build a fake "raw" recording from the clean Arthur Brooks clip, to test cut.py against a known answer.

    python3 make_fixture.py

The clean clip is sliced at its own pauses and reassembled the way a creator records: an abandoned first take,
silence while they collect themselves, the full take, a long pause, a second abandoned start, the full take again,
and dead air at the end. Silences are a held frame over quiet room tone. The answer key (expected.json) is the
clean text and roughly how long the cut should be.
"""
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE.parent / "kit-test/assets/arthur-brooks.mp4"
OUT = HERE / "assets/raw.mp4"

# (kind, a, b) pieces of the source in seconds, or ("gap", seconds)
PLAN = [
    ("clip", 0.00, 1.50),    # "There are three macronutrients" ... abandoned
    ("gap", 1.20),
    ("clip", 0.00, 2.40),    # "There are three macronutrients to the happiest life."
    ("gap", 0.90),
    ("clip", 2.40, 7.06),    # "The happiest people have enjoyment, satisfaction, and meaning."
    ("gap", 1.60),
    ("clip", 7.06, 12.46),   # "Those are the three macronutrients. Now, that's important ... enjoy your life,"
    ("clip", 12.46, 14.05),  # "and, and you need to know the" ... abandoned
    ("gap", 0.80),
    ("clip", 12.46, 17.23),  # "and, and you need to know the difference between enjoyment and pleasure, which many people don't."
    ("gap", 1.00),
]


def run(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *map(str, args)], check=True)


def main():
    tmp = HERE / "fixture-parts"
    tmp.mkdir(exist_ok=True)
    parts, last_end = [], 0.0
    for n, step in enumerate(PLAN):
        p = tmp / f"{n:02d}.mp4"
        if step[0] == "clip":
            _, a, b = step
            run("-ss", a, "-i", SRC, "-t", round(b - a, 3), "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "14",
                "-g", "30", "-c:a", "aac", "-ar", "48000", "-ac", "2", p)
            last_end = b
        else:
            d = step[1]
            frame = tmp / f"{n:02d}.png"
            run("-ss", max(0, last_end - 0.05), "-i", SRC, "-frames:v", "1", frame)
            run("-loop", 1, "-t", d, "-i", frame, "-f", "lavfi", "-t", d, "-i", "anoisesrc=color=pink:amplitude=0.002:r=48000",
                "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "14", "-g", "30", "-c:a", "aac", "-ar", "48000",
                "-ac", "2", "-shortest", p)
        parts.append(p)
    lst = tmp / "list.txt"
    lst.write_text("".join(f"file '{p.name}'\n" for p in parts))
    OUT.parent.mkdir(exist_ok=True)
    # re-encode on join so the raw has the long-GOP look of a phone file
    run("-f", "concat", "-safe", 0, "-i", lst, "-c:v", "libx264", "-crf", "16", "-g", "240", "-c:a", "aac", "-ar", "48000", OUT)
    clean = [s for s in PLAN if s[0] == "clip"]
    expected = {"text": "There are three macronutrients to the happiest life. The happiest people have enjoyment, satisfaction, "
                        "and meaning. Those are the three macronutrients. Now, that's important because it means you need to "
                        "enjoy your life, and you need to know the difference between enjoyment and pleasure, which many people don't.",
                "kept_source_s": round(2.40 + 4.66 + 5.40 + 4.77, 2),
                "raw_s": round(sum((s[2] - s[1]) if s[0] == "clip" else s[1] for s in PLAN), 2)}
    (HERE / "expected.json").write_text(json.dumps(expected, indent=1) + "\n")
    for p in tmp.iterdir():
        p.unlink()
    tmp.rmdir()
    print(json.dumps({"raw": str(OUT), **expected}))


if __name__ == "__main__":
    main()
