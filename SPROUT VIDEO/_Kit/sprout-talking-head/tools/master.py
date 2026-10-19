#!/usr/bin/env python3
"""Master a rendered video's audio to the Sprout social spec without touching the picture.

    python3 master.py <video.mp4> [--out mastered.mp4] [--lufs -14] [--tp -1.5]

60 Hz high-pass, then two-pass ffmpeg loudnorm (measure, then apply in linear mode), then a small trim if the
true peak still lands above the ceiling. The video stream is copied, never re-encoded. Prints the measured
result. Use it for dialogue-only deliveries; a full mix with music and SFX goes through the mix.py pattern.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path


def measure(path, extra=""):
    chain = (extra + "," if extra else "") + "loudnorm=print_format=json"
    err = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", chain, "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    return json.loads(err[err.rindex("{"): err.rindex("}") + 1])


def remux(src, dst, chain):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-c:v", "copy", "-af", chain, "-c:a", "aac",
                    "-b:a", "256k", "-movflags", "+faststart", str(dst)], check=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video", type=Path)
    ap.add_argument("--out", type=Path)
    ap.add_argument("--lufs", type=float, default=-14.0)
    ap.add_argument("--tp", type=float, default=-1.5)
    a = ap.parse_args()
    out = a.out or a.video
    tmp = out.with_name(out.stem + ".mastering.mp4")

    # 1. two-pass loudnorm towards the target with 0.5 dB of extra peak headroom. Quiet dialogue that needs
    #    a big lift makes loudnorm fall back to its dynamic mode, which lands a little off target, so
    # 2. correct the gain to the exact target and catch any peak with a limiter set under the ceiling.
    m = measure(a.video, "highpass=f=60")
    norm = (f"highpass=f=60,loudnorm=I={a.lufs}:TP={a.tp - .5}:LRA=11:measured_I={m['input_i']}:"
            f"measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:"
            f"offset={m['target_offset']}:linear=true,aresample=48000")
    remux(a.video, tmp, norm)
    for _ in range(3):
        r = measure(tmp)
        gain = a.lufs - float(r["input_i"])
        if abs(gain) < 0.15 and float(r["input_tp"]) <= a.tp:
            break
        limit = 10 ** ((a.tp - .6) / 20)  # sample-peak limit; true peak sits a little above it
        fixed = tmp.with_name(tmp.stem + ".fix.mp4")
        remux(tmp, fixed, f"volume={gain:.2f}dB,alimiter=limit={limit:.4f}:attack=2:release=60:level=false:latency=true")
        fixed.replace(tmp)
    r = measure(tmp)
    tmp.replace(out)
    errors = subprocess.run(["ffmpeg", "-v", "error", "-i", str(out), "-f", "null", "-"], capture_output=True,
                            text=True).stderr.strip()
    print(json.dumps({"out": str(out), "before_lufs": float(m["input_i"]), "lufs": float(r["input_i"]),
                      "true_peak": float(r["input_tp"]), "decode_errors": len(errors.splitlines()) if errors else 0}))
    if float(r["input_tp"]) > a.tp:
        sys.exit("true peak still above the ceiling")


if __name__ == "__main__":
    main()
