#!/usr/bin/env python3
"""Score for the Sprout launch film, built from the timeline's own cues.

    python3 tools/score.py            reads out/markers.json, writes out/score.wav

Every sound effect sits on a cue the timeline exported (tap, ding, swell...), so a
retimed timeline re-scores itself on the next run. The music is a warm I-vi-IV-V in
D major at 100 BPM: sparse and restless under the notifications, a bloom on the logo,
a light mallet groove through the app, a held swell when the photo opens, and a
final resolve on the end card. Everything is synthesized, so there is nothing to
license. It is a temp score: good enough to judge timing and mood, replaceable by a
composed track without touching the picture.
"""
import json
import wave
from pathlib import Path

import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt

ROOT = Path(__file__).resolve().parent.parent
M = json.loads((ROOT / "out" / "markers.json").read_text())
SR = 48000
DUR = M["duration"] + 0.5
N = int(SR * DUR)
music = np.zeros((N, 2))
sfx = np.zeros((N, 2))
rng = np.random.default_rng(7)
CUES = M["markers"]
first = lambda kind: next(c["t"] for c in CUES if c["type"] == kind)

T_BLOOM, T_MORPH, T_OPEN, T_FOLD, T_RESOLVE = first("bloom"), first("whoosh"), first("open"), first("fold"), first("resolve")
T_SUCK = first("suck")
WORDS = [c["t"] for c in CUES if c["type"] == "word"]
BPM = 100.0
BEAT = 60.0 / BPM
GROOVE0 = 10.0  # bar 1 of the groove, when the Daily Brief lands


def ts(d):
    return np.arange(int(d * SR)) / SR


def place(buf, t, mono, pan=0.0, gain=1.0):
    s = int(round(t * SR))
    e = s + len(mono)
    if e <= 0 or s >= N:
        return
    a, b = max(0, s), min(N, e)
    seg = mono[a - s:b - s] * gain
    buf[a:b, 0] += seg * np.sqrt((1 - pan) / 2)
    buf[a:b, 1] += seg * np.sqrt((1 + pan) / 2)


def env_ar(n, a, r):
    e = np.ones(n)
    ai, ri = int(a * SR), int(r * SR)
    if ai:
        e[:ai] = np.linspace(0, 1, ai) ** 1.6
    if ri and ri < n:
        e[-ri:] *= np.linspace(1, 0, ri) ** 1.4
    return e


def lp(x, hz):
    return sosfilt(butter(2, hz, "lowpass", fs=SR, output="sos"), x)


def hp(x, hz):
    return sosfilt(butter(2, hz, "highpass", fs=SR, output="sos"), x)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# ── instruments ───────────────────────────────────────────────────────────
def mallet(f, d=1.4, amp=0.2, decay=4.0, bright=0.35):
    t = ts(d)
    w = np.sin(2 * np.pi * f * t) + bright * 0.5 * np.sin(2 * np.pi * f * 4.0 * t) * np.exp(-9 * t) + bright * 0.25 * np.sin(2 * np.pi * f * 10.0 * t) * np.exp(-20 * t)
    e = np.exp(-decay * t)
    e[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
    return w * e * amp


def keys(f, d=3.0, amp=0.16, decay=1.2):
    """a soft felt-piano-ish tone: a few decaying harmonics, slightly detuned"""
    t = ts(d)
    w = np.zeros_like(t)
    for h, g in [(1, 1.0), (2, 0.42), (3, 0.18), (4, 0.08), (5, 0.04)]:
        w += g * np.sin(2 * np.pi * f * h * 1.0007 ** h * t) * np.exp(-decay * h ** 0.7 * t)
    a = int(0.012 * SR)
    w[:a] *= np.linspace(0, 1, a)
    return lp(w * amp, 3800)


def pad(freqs, d, amp=0.07, a=1.2, r=1.6, cutoff=2200):
    t = ts(d)
    w = np.zeros_like(t)
    for f in freqs:
        for det in (-0.0021, 0.0, 0.0023):
            ph = rng.uniform(0, 2 * np.pi)
            w += np.sin(2 * np.pi * f * (1 + det) * t + ph) + 0.3 * np.sin(2 * np.pi * 2 * f * (1 + det) * t + ph)
    w /= len(freqs) * 3
    return lp(w * env_ar(len(t), a, r) * amp, cutoff)


def bell(f, d=3.5, amp=0.18):
    t = ts(d)
    w = np.zeros_like(t)
    for ratio, g, dec in [(1, 1, 1.4), (2.76, 0.45, 2.6), (5.4, 0.25, 4.5), (8.93, 0.12, 7)]:
        w += g * np.sin(2 * np.pi * f * ratio * t) * np.exp(-dec * t)
    w[: int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    return w * amp


def noise(d):
    return rng.standard_normal(int(d * SR))


def whoosh(d=0.8, amp=0.12, lo=300, hi=5000, rise=0.6):
    n = noise(d)
    t = ts(d)
    # sweep a band by crossfading a low and a high filtered copy
    k = np.clip(t / (d * rise), 0, 1)
    w = lp(n, lo * 4) * (1 - k) + hp(lp(n, hi), lo) * k
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return w * e * amp


def riser(d, amp=0.1):
    t = ts(d)
    n = hp(noise(d), 600)
    tone = np.sin(2 * np.pi * np.cumsum(np.linspace(220, 880, len(t))) / SR) * 0.25
    e = (t / d) ** 2.2
    return (lp(n, 7000) * 0.7 + tone) * e * amp


def click(amp=0.09, f=2200):
    t = ts(0.05)
    w = np.sin(2 * np.pi * f * t) * np.exp(-140 * t) + 0.5 * hp(noise(0.05), 3000) * np.exp(-260 * t)
    return w * amp


def kick(amp=0.28):
    t = ts(0.45)
    f = 58 + 80 * np.exp(-30 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-7 * t) * amp


def shaker(amp=0.028):
    t = ts(0.09)
    return hp(noise(0.09), 6000) * np.exp(-45 * t) * amp


def sub(f, d, amp=0.12):
    t = ts(d)
    return np.sin(2 * np.pi * f * t) * env_ar(len(t), 0.05, 0.6) * amp


# ── harmony: D major, I-vi-IV-V, one chord per bar ───────────────────────
D, Bm, G, A = [62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 69]
PROG = [D, Bm, G, A]
BAR = 4 * BEAT

# 1 · noise (0 → suck): a low restless drone, pings from every notification
place(music, 0.0, pad([midi(50), midi(57)], T_SUCK + 0.6, amp=0.05, a=2.0, r=0.8, cutoff=900))
for c in CUES:
    if c["type"] == "ping":
        f = midi(rng.choice([74, 76, 78, 81, 83, 86]))
        place(sfx, c["t"], bell(f, 1.2, 0.05 * (1 - 0.28 * c["depth"])), pan=float(rng.uniform(-0.7, 0.7)))
        place(sfx, c["t"], click(0.035, 1500), pan=float(rng.uniform(-0.5, 0.5)))
place(sfx, T_SUCK - 0.25, riser(T_BLOOM - T_SUCK + 0.25, 0.09))

# 2 · the bloom: a full chord, a sub, a bell
for n in [50, 57, 62, 66, 69, 76]:
    place(music, T_BLOOM, keys(midi(n), 4.5, 0.075, 0.6))
place(music, T_BLOOM, pad([midi(n) for n in [50, 57, 62, 66, 69]], T_MORPH - T_BLOOM + 1.2, amp=0.075, a=0.3, r=1.2))
place(music, T_BLOOM, sub(midi(50), 2.4, 0.07))
place(sfx, T_BLOOM, bell(midi(86), 3.0, 0.06))

# 3 · the groove through the app (GROOVE0 → just before the photo opens)
g_end = T_OPEN - 0.2
bar = 0
t = GROOVE0
arp = [0, 1, 2, 3, 2, 1, 2, 3]
while t < g_end - 0.01:
    ch = PROG[bar % 4]
    bar_len = min(BAR, g_end - t)
    place(music, t, pad([midi(n) for n in ch], bar_len + 0.9, amp=0.055, a=0.5, r=0.9, cutoff=1800))
    place(music, t, sub(midi(ch[0] - 12), bar_len + 0.3, 0.045))
    for i in range(8):
        nt = t + i * BEAT / 2
        if nt >= g_end:
            break
        note = ch[arp[i]] + 12
        place(music, nt, mallet(midi(note), 1.2, 0.07 if i % 2 == 0 else 0.05, 5.0), pan=-0.25 + 0.5 * (i % 2))
    # light percussion from the Daily Brief on, a soft kick from Sprout Assist on
    for i in range(8):
        nt = t + i * BEAT / 2
        if nt < g_end:
            place(music, nt, shaker(0.02 if i % 2 else 0.012), pan=0.3)
    if t >= 18.0:
        for i in (0, 2):
            nt = t + i * BEAT
            if nt < g_end:
                place(music, nt, kick(0.2))
    t += BAR
    bar += 1

# 4 · the photo opens: drums out, a held swell, a slow melody over the pad
open_len = T_FOLD - T_OPEN + 0.8
place(music, T_OPEN - 0.9, riser(0.9, 0.06))
place(music, T_OPEN, pad([midi(n) for n in [50, 57, 62, 66, 69, 74]], open_len, amp=0.09, a=0.9, r=1.4, cutoff=2600))
place(music, T_OPEN, sub(midi(50), open_len, 0.06))
for i, (dt, n) in enumerate([(0.3, 74), (1.5, 76), (2.1, 78), (3.0, 81), (3.9, 78), (4.5, 76)]):
    place(music, T_OPEN + dt, keys(midi(n), 3.2, 0.09, 0.9))
place(music, T_OPEN + 3.0, pad([midi(n) for n in [55, 59, 62, 66, 71]], open_len - 3.0, amp=0.05, a=1.0, r=1.0))

# 5 · the fold and the end card: a lift, then the resolve
place(sfx, T_FOLD - 0.1, whoosh(1.2, 0.08, 200, 3000))
end_len = DUR - T_RESOLVE
for n in [50, 57, 62, 66, 69, 74, 78]:
    place(music, T_RESOLVE - 0.05, keys(midi(n), end_len, 0.07, 0.35))
place(music, T_RESOLVE - 0.05, pad([midi(n) for n in [50, 57, 62, 66, 69, 76]], end_len, amp=0.075, a=0.4, r=2.8))
place(music, T_RESOLVE - 0.05, sub(midi(50), end_len, 0.065))
place(sfx, T_RESOLVE, bell(midi(86), 4.0, 0.07))
place(sfx, T_RESOLVE + 0.18, bell(midi(93), 3.5, 0.045))

# ── sound effects on every cue ─────────────────────────────────────────────
for c in CUES:
    k, t = c["type"], c["t"]
    if k == "tap":
        place(sfx, t, click(0.1, 2400))
    elif k == "swipe":
        place(sfx, t, whoosh(0.35, 0.045, 800, 6000))
    elif k == "whoosh":
        place(sfx, t - 0.1, whoosh(0.9 if not c.get("soft") else 0.7, 0.05 if c.get("soft") else 0.085))
    elif k == "tick":
        place(sfx, t, mallet(midi(86), 0.4, 0.03, 12))
    elif k == "check":
        place(sfx, t, mallet(midi(81), 0.6, 0.07, 7))
        place(sfx, t + 0.08, mallet(midi(86), 0.8, 0.07, 6))
    elif k == "word":
        place(sfx, t, mallet(midi(62 + [0, 2, 4, 7, 9][c["i"] % 5] + 12), 0.35, 0.022, 14), pan=-0.4)
    elif k == "heard":
        place(sfx, t, mallet(midi(78), 0.8, 0.05, 5))
        place(sfx, t + 0.09, mallet(midi(83), 0.9, 0.05, 5))
    elif k == "land":
        place(sfx, t, mallet(midi([81, 83, 85, 86][c["i"] % 4]), 0.9, 0.06, 6), pan=0.35)
    elif k == "success":
        for i, n in enumerate([74, 78, 81, 86]):
            place(sfx, t + i * 0.07, mallet(midi(n), 1.2, 0.06, 4.5))
    elif k == "fly":
        place(sfx, t, whoosh(1.2, 0.07, 400, 7000, 0.5), pan=0.0)
    elif k == "ding":
        place(sfx, t, bell(midi(88), 2.6, 0.1), pan=0.4)
        place(sfx, t + 0.12, bell(midi(93), 2.2, 0.06), pan=0.4)
    elif k == "land2":
        place(sfx, t, mallet(midi(86), 1.0, 0.06, 5), pan=0.4)
    elif k == "rise":
        place(sfx, t - 0.3, riser(1.0, 0.05))
    elif k == "gather":
        place(sfx, t - 0.05, whoosh(0.8, 0.05, 500, 6000, 0.4))
        for i, n in enumerate([74, 78, 81, 86, 90]):
            place(sfx, t + 0.35 + i * 0.06, bell(midi(n), 0.9, 0.028), pan=-0.5 + i * 0.25)
    elif k == "typing":
        for i in range(6):
            place(sfx, t + i * 0.16, click(0.018, 3000), pan=0.3)
    elif k == "pop":
        place(sfx, t, mallet(midi(88), 0.7, 0.05, 7), pan=-0.3)
    elif k == "tab":
        place(sfx, t, click(0.07, 2600))
        place(sfx, t + 0.02, mallet(midi(81), 0.4, 0.025, 10))
    elif k == "photo":
        place(sfx, t, whoosh(0.6, 0.045, 300, 5000, 0.5))
    elif k == "open":
        place(sfx, t - 0.1, whoosh(1.5, 0.08, 150, 4000, 0.7))

# duck the music under the spoken line so the word ticks read
duck = np.ones(N)
if WORDS:
    a, b = int((WORDS[0] - 0.4) * SR), int((WORDS[-1] + 0.6) * SR)
    ramp = int(0.3 * SR)
    duck[a:b] = 0.6
    duck[a - ramp:a] = np.linspace(1, 0.6, ramp)
    duck[b:b + ramp] = np.linspace(0.6, 1, ramp)
music *= duck[:, None]

# ── mix: a shared room, gentle bus compression, fades ───────────────────────
mix = music + sfx
ir_t = ts(2.2)
ir = np.stack([rng.standard_normal(len(ir_t)) * np.exp(-3.1 * ir_t) for _ in range(2)], 1)
ir[:, 0] = lp(ir[:, 0], 5000)
ir[:, 1] = lp(ir[:, 1], 5000)
ir /= np.abs(ir).sum(0) ** 0.5 * 12
wet = np.stack([fftconvolve(mix[:, i], ir[:, i])[:N] for i in range(2)], 1)
out = mix * 0.85 + wet * 0.35
out = hp(out.T, 30).T
# soft knee: tanh saturation after normalising to a -1 dBFS peak target
out /= np.max(np.abs(out)) + 1e-9
out = np.tanh(out * 1.4) / np.tanh(1.4)
fade_in, fade_out = int(0.15 * SR), int(1.6 * SR)
out[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
out[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None] ** 1.5
out *= 0.89
pcm = (np.clip(out, -1, 1) * 32767).astype(np.int16)
dest = ROOT / "out" / "score.wav"
with wave.open(str(dest), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"wrote {dest}  {DUR:.1f}s")
