#!/usr/bin/env python3
"""Turn a short vertical video into a timed cue sheet an agent can read.

Agents cannot watch or hear video. This script measures what changes on screen
and in the audio, lines it up with word timings, and dumps frames at every
change so the edit can be studied (or compared) as data.

Usage:
    python3 cue_sheet.py <video.mp4> <out_dir> [--label NAME] [--model PATH]

Outputs in <out_dir>:
    cue-sheet.json      metrics + events + words + audio transients
    cue-sheet.md        readable table: time, what changed, words spoken
    events.jpg          contact sheet, one frame right after every visual event
    timeline.jpg        contact sheet, one frame per second
    frames/             the individual event frames

Requires ffmpeg, ffprobe, whisper-cli (whisper.cpp), numpy, Pillow.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

FPS = 15                    # analysis frame rate
GW, GH = 72, 128            # analysis grid (9:16)
CUT_DIFF = 28.0             # mean abs diff (0-255) above this = hard cut / full swap
EVENT_RATIO = 3.0           # local diff this many times the rolling median = visual event
EVENT_FLOOR = 6.0           # ...and at least this large, so camera noise is ignored
GESTURE_MAX = 12.0          # below this a "change" may be a hand gesture (Video 11 calibration)
MIN_EVENT_GAP = 0.20        # seconds between visual events
SR = 22050
HOP = 256
NFFT = 1024
TRANSIENT_HZ = 3000         # SFX (whoosh, click, pop) live above most speech energy
MIN_TRANSIENT_GAP = 0.15
DEFAULT_MODEL = Path.home() / ".cache/whisper/ggml-small.bin"


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, **kw)


def probe(video):
    out = run(["ffprobe", "-v", "error", "-show_entries",
               "format=duration:stream=codec_type,width,height,r_frame_rate",
               "-of", "json", str(video)]).stdout
    info = json.loads(out)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    num, den = v["r_frame_rate"].split("/")
    return {"duration": float(info["format"]["duration"]), "width": v["width"],
            "height": v["height"], "fps": round(int(num) / int(den), 3),
            "has_audio": any(s["codec_type"] == "audio" for s in info["streams"])}


def frame_diffs(video):
    raw = run(["ffmpeg", "-v", "error", "-i", str(video), "-vf",
               f"fps={FPS},scale={GW}:{GH},format=gray", "-f", "rawvideo", "-"]).stdout
    frames = np.frombuffer(raw, np.uint8).reshape(-1, GH, GW).astype(np.float32)
    diff = np.abs(np.diff(frames, axis=0)).mean(axis=(1, 2))
    return np.concatenate([[0.0], diff])


def rolling_median(x, win):
    pad = win // 2
    xp = np.pad(x, pad, mode="edge")
    return np.array([np.median(xp[i:i + win]) for i in range(len(x))])


def pick_peaks(signal, times, threshold, min_gap):
    idx = [i for i in range(1, len(signal) - 1)
           if signal[i] >= threshold[i] and signal[i] >= signal[i - 1] and signal[i] >= signal[i + 1]]
    picked = []
    for i in sorted(idx, key=lambda i: -signal[i]):
        if all(abs(times[i] - times[j]) >= min_gap for j in picked):
            picked.append(i)
    return sorted(picked)


def visual_events(diff):
    t = np.arange(len(diff)) / FPS
    base = rolling_median(diff, FPS * 2 + 1)
    thr = np.maximum(base * EVENT_RATIO, EVENT_FLOOR)
    events = []
    for i in pick_peaks(diff, t, thr, MIN_EVENT_GAP):
        # weak changes on a talking head are often just hand gestures; flag for a look
        kind = "cut" if diff[i] >= CUT_DIFF else "change" if diff[i] >= GESTURE_MAX else "change?"
        events.append({"t": round(float(t[i]), 2), "kind": kind,
                       "strength": round(float(diff[i]), 1)})
    return events, t, diff


def audio_analysis(video):
    raw = run(["ffmpeg", "-v", "error", "-i", str(video), "-vn", "-ac", "1",
               "-ar", str(SR), "-f", "f32le", "-"]).stdout
    y = np.frombuffer(raw, np.float32)
    if len(y) < NFFT:
        return [], {}
    win = np.hanning(NFFT).astype(np.float32)
    n = 1 + (len(y) - NFFT) // HOP
    frames = np.lib.stride_tricks.as_strided(y, (n, NFFT), (y.strides[0] * HOP, y.strides[0]))
    spec = np.abs(np.fft.rfft(frames * win, axis=1))
    freqs = np.fft.rfftfreq(NFFT, 1 / SR)
    hi = np.log1p(spec[:, freqs >= TRANSIENT_HZ])
    flux = np.maximum(np.diff(hi, axis=0), 0).sum(axis=1)
    flux = np.concatenate([[0.0], flux])
    t = np.arange(n) * HOP / SR
    med = np.median(flux)
    mad = np.median(np.abs(flux - med)) + 1e-9
    thr = np.full_like(flux, med + 8 * mad)
    peaks = pick_peaks(flux, t, thr, MIN_TRANSIENT_GAP)
    rms = np.sqrt((frames ** 2).mean(axis=1))
    rms_db = 20 * np.log10(rms + 1e-9)
    transients = [{"t": round(float(t[i]), 2),
                   "strength": round(float((flux[i] - med) / mad), 1)} for i in peaks]
    silent = float((rms_db < -45).mean())
    return transients, {"rms_db_median": round(float(np.median(rms_db)), 1),
                        "share_near_silent": round(silent, 3)}


def transcribe(video, model, workdir):
    wav = workdir / "audio16k.wav"
    run(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-vn", "-ac", "1",
         "-ar", "16000", str(wav)])
    prefix = workdir / "whisper"
    run(["whisper-cli", "-m", str(model), "-f", str(wav), "-ml", "1", "-sow",
         "-oj", "-of", str(prefix), "-l", "auto", "-np"])
    data = json.loads((workdir / "whisper.json").read_text())
    words = []
    for seg in data.get("transcription", []):
        text = seg["text"].strip()
        if not text:
            continue
        words.append({"w": text, "start": seg["offsets"]["from"] / 1000,
                      "end": seg["offsets"]["to"] / 1000})
    return words


def words_near(words, t, before=0.25, after=0.6):
    return " ".join(w["w"] for w in words if t - before <= w["start"] <= t + after)


def grab(video, t, path, width=270):
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", str(video),
         "-frames:v", "1", "-vf", f"scale={width}:-2", str(path)])


def contact_sheet(items, out, cols=6):
    """items: list of (image_path, label)."""
    if not items:
        return
    imgs = [Image.open(p) for p, _ in items]
    w, h = imgs[0].size
    lab = 26
    rows = (len(imgs) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * w, rows * (h + lab)), "white")
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 16)
    except OSError:
        font = ImageFont.load_default()
    for k, (img, (_, label)) in enumerate(zip(imgs, items)):
        x, y = (k % cols) * w, (k // cols) * (h + lab)
        sheet.paste(img.resize((w, h)), (x, y + lab))
        draw.text((x + 6, y + 4), label, fill="black", font=font)
    sheet.save(out, quality=85)


def shot_lengths(events, duration):
    cuts = [0.0] + [e["t"] for e in events if e["kind"] == "cut"] + [duration]
    return [round(b - a, 2) for a, b in zip(cuts, cuts[1:]) if b - a > 0.05]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video", type=Path)
    ap.add_argument("out", type=Path)
    ap.add_argument("--label", default=None)
    ap.add_argument("--model", type=Path, default=DEFAULT_MODEL)
    a = ap.parse_args()
    out = a.out
    (out / "frames").mkdir(parents=True, exist_ok=True)
    work = out / ".work"
    work.mkdir(exist_ok=True)

    meta = probe(a.video)
    dur = meta["duration"]
    events, _, diff = visual_events(frame_diffs(a.video))
    transients, loud = audio_analysis(a.video) if meta["has_audio"] else ([], {})
    words = transcribe(a.video, a.model, work) if meta["has_audio"] else []

    for e in events:
        e["words"] = words_near(words, e["t"])
    for s in transients:
        s["words"] = words_near(words, s["t"], 0.2, 0.3)
        s["on_visual_event"] = any(abs(s["t"] - e["t"]) <= 0.15 for e in events)

    shots = shot_lengths(events, dur)
    speech = sum(w["end"] - w["start"] for w in words)
    per10 = lambda n: round(n / dur * 10, 2)
    metrics = {
        "duration_s": round(dur, 2),
        "hard_cuts": sum(e["kind"] == "cut" for e in events),
        "visual_events": len(events),
        "cuts_per_10s": per10(sum(e["kind"] == "cut" for e in events)),
        "visual_events_per_10s": per10(len(events)),
        "median_shot_s": round(float(np.median(shots)), 2) if shots else None,
        "longest_shot_s": max(shots) if shots else None,
        "longest_static_gap_s": round(max(np.diff([0] + [e["t"] for e in events] + [dur])), 2),
        "motion_energy_median": round(float(np.median(diff)), 2),
        "words": len(words),
        "words_per_s": round(len(words) / dur, 2),
        "speech_share": round(speech / dur, 3),
        "hf_onsets_unreliable": len(transients),
        **loud,
    }

    event_items = []
    for k, e in enumerate(events):
        p = out / "frames" / f"ev{k:03d}_{e['t']:06.2f}.jpg"
        grab(a.video, min(e["t"] + 0.12, dur - 0.05), p)
        e["frame"] = str(p.relative_to(out))
        event_items.append((p, f"{e['t']:.2f}s {e['kind']}"))
    contact_sheet(event_items, out / "events.jpg")

    tl_items = []
    for s in range(int(dur)):
        p = work / f"sec{s:03d}.jpg"
        grab(a.video, s + 0.5, p, 180)
        tl_items.append((p, f"{s}s"))
    contact_sheet(tl_items, out / "timeline.jpg", cols=10)

    label = a.label or a.video.stem
    result = {"label": label, "source": str(a.video), "meta": meta, "metrics": metrics,
              "events": events, "audio_transients": transients, "words": words,
              "settings": {"fps": FPS, "cut_diff": CUT_DIFF, "event_ratio": EVENT_RATIO,
                           "event_floor": EVENT_FLOOR, "transient_hz": TRANSIENT_HZ}}
    (out / "cue-sheet.json").write_text(json.dumps(result, indent=2, ensure_ascii=False))

    lines = [f"# Cue sheet: {label}", "", "Generated by `_Kit/editing-references/cue_sheet.py`. "
             "Numbers are measured; the 'what' column is filled in by a human or agent "
             "looking at `events.jpg`.", "", "## Metrics", "", "| metric | value |", "|---|---|"]
    lines += [f"| {k} | {v} |" for k, v in metrics.items()]
    lines += ["", "## Visual events", "", "| t (s) | kind | strength | words around | what changes |",
              "|---|---|---|---|---|"]
    lines += [f"| {e['t']:.2f} | {e['kind']} | {e['strength']} | {e['words']} | |" for e in events]
    lines += ["", "## High-frequency audio onsets (NOT a SFX list)", "",
              "Tested against Video 11 stems (5 known SFX at -18 to -20 dB): recall 0/5, "
              "the onsets are almost all sibilants. Soft SFX under dialogue cannot be found "
              "from a final mix without source separation (Demucs). Loud pops/whooshes in gaps "
              "do show up here. Treat this table as a hint for where to listen, nothing more.", "",
              "| t (s) | strength | on visual event | words around |", "|---|---|---|---|"]
    lines += [f"| {s['t']:.2f} | {s['strength']} | {'yes' if s['on_visual_event'] else ''} "
              f"| {s['words']} |" for s in transients]
    (out / "cue-sheet.md").write_text("\n".join(lines) + "\n")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    sys.exit(main())
