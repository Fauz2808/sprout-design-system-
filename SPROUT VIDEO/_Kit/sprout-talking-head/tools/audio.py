"""Audio measurements shared by transcribe.py and cut.py: a 10 ms loudness envelope, the speech and silence
levels of a clip, and helpers to find quiet regions and quiet points. numpy + ffmpeg only."""
import subprocess

import numpy as np

HOP = 0.01  # seconds per envelope frame
SR = 16000


def pcm(path, sr=SR):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-vn", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


def envelope(path):
    """RMS level in dBFS for every 10 ms frame (20 ms window)."""
    x = pcm(path)
    hop, win = int(SR * HOP), int(SR * HOP * 2)
    n = max(1, (len(x) - win) // hop + 1)
    frames = np.lib.stride_tricks.sliding_window_view(x, win)[::hop][:n]
    rms = np.sqrt(np.mean(frames.astype(np.float64) ** 2, axis=1)) + 1e-9
    return 20 * np.log10(rms)


def levels(env):
    """(noise floor, speech level, silence threshold) in dBFS. The threshold sits a third of the way from the
    floor to the speech level, so it adapts to room tone and to quiet or loud talkers."""
    floor = float(np.percentile(env, 10))
    speech = float(np.percentile(env, 90))
    return floor, speech, floor + (speech - floor) / 3


def silences(env, thresh, min_len=0.18):
    """Quiet regions [(start, end)] in seconds, at least min_len long."""
    quiet = env < thresh
    out, i, n = [], 0, len(quiet)
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            if (j - i) * HOP >= min_len:
                out.append((round(i * HOP, 3), round(j * HOP, 3)))
            i = j
        else:
            i += 1
    return out


def quietest(env, t, radius):
    """The quietest 10 ms point within ±radius s of t (ties go to the point nearest t)."""
    a, b = max(0, int((t - radius) / HOP)), min(len(env), int((t + radius) / HOP) + 1)
    if b <= a:
        return t
    seg = env[a:b]
    lo = seg.min()
    cands = [a + k for k, v in enumerate(seg) if v <= lo + 1.0]
    best = min(cands, key=lambda k: abs(k * HOP - t))
    return round(best * HOP, 3)


def level_at(env, a, b):
    i, j = int(a / HOP), max(int(a / HOP) + 1, int(b / HOP))
    return float(np.max(env[i:j])) if j <= len(env) and i < j else -120.0
