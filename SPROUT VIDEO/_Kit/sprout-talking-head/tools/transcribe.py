#!/usr/bin/env python3
"""Word-level transcript of a clip (step 1 of the kit workflow).

    python3 transcribe.py <media> [--out transcript.json] [--engine whisper|scribe] [--model small]

whisper (default, free, local): whisper.cpp `whisper-cli` with DTW token timing and a verbatim prompt so fillers
("um", "uh") and restarts are kept, which cut.py needs to find bad takes. Models live in ~/.cache/whisper/
(ggml-small.bin, ggml-base.bin). Word ends are refined from the audio: DTW marks where a word starts, the
envelope shows where it actually stops, so pauses are not swallowed into the previous word.
scribe: ElevenLabs Scribe (verbatim, best timing; spends API credits; needs ELEVENLABS_API_KEY in a .env.local
next to the project or in the environment).

Writes a plain word list [{id, text, start, end, p}] that every kit tool reads.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.request
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import audio  # noqa: E402

MODELS = Path.home() / ".cache/whisper"
VERBATIM = "Umm, so, uh, I was like, I mean, I mean the, the thing is... hmm. Okay, so here's what I, like, think."


def whisper_words(media, model):
    bin_path = MODELS / f"ggml-{model}.bin"
    if not bin_path.exists():
        sys.exit(f"missing {bin_path}: download a ggml model from huggingface.co/ggerganov/whisper.cpp")
    with tempfile.TemporaryDirectory() as tmp:
        wav, out = Path(tmp) / "a.wav", Path(tmp) / "t"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(media), "-vn", "-ac", "1", "-ar", "16000", str(wav)],
                       check=True)
        # -nfa: DTW token timing is silently skipped while flash attention is on
        subprocess.run(["whisper-cli", "-m", str(bin_path), "-f", str(wav), "-l", "en", "-ojf", "-dtw", model, "-nfa",
                        "-np", "-sow", "--prompt", VERBATIM, "-of", str(out)], check=True, capture_output=True)
        data = json.loads((Path(tmp) / "t.json").read_text())
    words = []
    for seg in data["transcription"]:
        for tok in seg["tokens"]:
            text = tok["text"]
            if text.startswith("[_") or text.startswith("<|") or not text.strip():
                continue
            t = tok["t_dtw"] / 100 if tok.get("t_dtw", -1) >= 0 else tok["offsets"]["from"] / 1000
            if text.startswith(" ") or not words:
                words.append({"text": text.strip(), "start": t, "seg_end": seg["offsets"]["to"] / 1000, "p": [tok["p"]]})
            else:
                words[-1]["text"] += text
                words[-1]["p"].append(tok["p"])
    words = [w for w in words if re.search(r"[A-Za-z0-9]", w["text"])]
    for w in words:
        w["p"] = round(min(w["p"]), 3)
    return words


def refine_ends(words, env):
    """End of each word = where its sound stops: the first quiet 10 ms frame after it starts, but never past the
    next word's start or the segment end."""
    _, _, thresh = audio.levels(env)
    quiet = env < thresh
    for i, w in enumerate(words):
        limit = words[i + 1]["start"] if i + 1 < len(words) else w.get("seg_end", w["start"] + 1.5)
        limit = max(limit, w["start"] + 0.06)
        k = int((w["start"] + 0.06) / audio.HOP)
        end = limit
        while k * audio.HOP < limit and k < len(quiet):
            if quiet[k:k + 8].all():  # 80 ms of quiet, not a stop consonant inside the word
                end = k * audio.HOP
                break
            k += 1
        w["end"] = round(max(end, w["start"] + 0.06), 3)
        w.pop("seg_end", None)
    # DTW places a word that follows a pause late (0.1–0.6 s on Arthur). Its real onset is where the sound comes
    # back after the last quiet run before the DTW time.
    for i, w in enumerate(words):
        lo = words[i - 1]["end"] if i else 0.0
        a, b = int(lo / audio.HOP), min(len(quiet) - 1, int((w["start"] + 0.05) / audio.HOP))
        onset = None
        for k in range(b, a, -1):
            if quiet[k - 1] and not quiet[k] and quiet[max(a, k - 8):k].all():
                onset = k * audio.HOP
                break
        if onset is not None and onset < w["start"]:
            w["start"] = onset
        w["start"] = round(min(w["start"], w["end"] - 0.06), 3)
    return words


def scribe_words(media):
    key = os.environ.get("ELEVENLABS_API_KEY")
    for env_file in [Path(media).resolve().parent / ".env.local", Path(media).resolve().parent.parent / ".env.local"]:
        if not key and env_file.exists():
            for line in env_file.read_text().splitlines():
                if line.startswith("ELEVENLABS_API_KEY="):
                    key = line.split("=", 1)[1].strip().strip("\"'")
    if not key:
        sys.exit("ELEVENLABS_API_KEY not found (environment or .env.local)")
    b = uuid.uuid4().hex
    fields = {"model_id": "scribe_v1", "timestamps_granularity": "word", "language_code": "eng", "tag_audio_events": "false"}
    body = b"".join(f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode() for k, v in fields.items())
    body += (f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="{Path(media).name}"\r\n'
             f'Content-Type: application/octet-stream\r\n\r\n').encode() + Path(media).read_bytes() + f"\r\n--{b}--\r\n".encode()
    req = urllib.request.Request("https://api.elevenlabs.io/v1/speech-to-text", data=body, method="POST",
                                 headers={"xi-api-key": key, "Content-Type": f"multipart/form-data; boundary={b}"})
    with urllib.request.urlopen(req, timeout=600) as r:
        data = json.loads(r.read())
    return [{"text": w["text"].strip(), "start": round(w["start"], 3), "end": round(w["end"], 3), "p": 1.0}
            for w in data["words"] if w.get("type") == "word" and w["text"].strip()]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("media", type=Path)
    ap.add_argument("--out", type=Path)
    ap.add_argument("--engine", choices=["whisper", "scribe"], default="whisper")
    ap.add_argument("--model", default="small")
    a = ap.parse_args()
    if a.engine == "whisper":
        words = refine_ends(whisper_words(a.media, a.model), audio.envelope(a.media))
    else:
        words = scribe_words(a.media)
    for i, w in enumerate(words):
        w["id"] = f"w{i}"
    out = a.out or a.media.with_name(a.media.stem + "-transcript.json")
    out.write_text(json.dumps([{k: w[k] for k in ["id", "text", "start", "end", "p"]} for w in words], indent=1) + "\n")
    print(json.dumps({"out": str(out), "engine": a.engine, "words": len(words),
                      "text": " ".join(w["text"] for w in words)[:300]}))


if __name__ == "__main__":
    main()
