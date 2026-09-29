#!/usr/bin/env python3
"""Score for one Sprout short, from that short's own cues.

    python3 tools/score-short.py 3      reads out/markers-ep3.json, writes out/score-ep3.wav

Same instruments as tools/score.py. Under the text cards: a sparse pad. Under the app: a
light mallet groove. A lift into the end card and a resolve on it. Every tap, tick, ding
and swell sits on a cue the timeline exported. Synthesized, so it is a temp score.
"""
import json, sys, wave
from pathlib import Path
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt

EP = sys.argv[1] if len(sys.argv) > 1 else "1"
ROOT = Path(__file__).resolve().parent.parent
M = json.loads((ROOT / "out" / f"markers-ep{EP}.json").read_text())
SR = 48000
DUR = M["duration"] + 0.3
N = int(SR * DUR)
music = np.zeros((N, 2)); sfx = np.zeros((N, 2))
rng = np.random.default_rng(sum(map(ord, EP)))
CUES = M["markers"]
T_END = next((c["t"] for c in CUES if c["type"] == "resolve"), DUR - 4)
UIS = [c["t"] for c in CUES if c["type"] == "ui"]

def ts(d): return np.arange(int(d * SR)) / SR
def place(buf, t, mono, pan=0.0, gain=1.0):
    s = int(round(t * SR)); e = s + len(mono)
    if e <= 0 or s >= N: return
    a, b = max(0, s), min(N, e)
    seg = mono[a - s:b - s] * gain
    buf[a:b, 0] += seg * np.sqrt((1 - pan) / 2); buf[a:b, 1] += seg * np.sqrt((1 + pan) / 2)
def env_ar(n, a, r):
    e = np.ones(n); ai, ri = int(a * SR), int(r * SR)
    if ai: e[:ai] = np.linspace(0, 1, ai) ** 1.6
    if ri and ri < n: e[-ri:] *= np.linspace(1, 0, ri) ** 1.4
    return e
def lp(x, hz): return sosfilt(butter(2, hz, "lowpass", fs=SR, output="sos"), x)
def hp(x, hz): return sosfilt(butter(2, hz, "highpass", fs=SR, output="sos"), x)
def midi(n): return 440.0 * 2 ** ((n - 69) / 12)

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



BEAT = 60 / 100.0; BAR = 4 * BEAT
D, Bm, G, A = [62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 69]
PROG = [D, Bm, G, A]
# a soft bed through the whole short, one chord per bar
t, bar = 0.0, 0
while t < T_END - 0.05:
    ch = PROG[bar % 4]; L = min(BAR, T_END - t)
    place(music, t, pad([midi(n) for n in ch], L + 0.9, amp=0.05, a=0.5, r=0.9, cutoff=1800))
    place(music, t, sub(midi(ch[0] - 12), L + 0.3, 0.04))
    t += BAR; bar += 1
# the groove only while the app is on screen: from each "ui" cue until the next card or the end
starts = UIS
ends = []
for u in starts:
    nxt = [c["t"] for c in CUES if c["type"] in ("text", "resolve") and c["t"] > u + 0.5]
    ends.append(min(nxt) if nxt else T_END)
arp = [0, 1, 2, 3, 2, 1, 2, 3]
for s0, s1 in zip(starts, ends):
    t = s0
    while t < s1 - 0.05:
        ch = PROG[int(t / BAR) % 4]
        for i in range(8):
            nt = t + i * BEAT / 2
            if nt >= s1: break
            place(music, nt, mallet(midi(ch[arp[i]] + 12), 1.1, 0.06 if i % 2 == 0 else 0.04, 5.0), pan=-0.25 + 0.5 * (i % 2))
            place(music, nt, shaker(0.018 if i % 2 else 0.01), pan=0.3)
        t += BAR
# the end card: a lift, the chord, two bells
place(music, T_END - 0.9, riser(0.9, 0.05))
for n in [50, 57, 62, 66, 69, 74, 78]:
    place(music, T_END, keys(midi(n), DUR - T_END, 0.07, 0.35))
place(music, T_END, pad([midi(n) for n in [50, 57, 62, 66, 69, 76]], DUR - T_END, amp=0.07, a=0.4, r=2.4))
place(sfx, T_END + 0.05, bell(midi(86), 3.5, 0.07)); place(sfx, T_END + 0.23, bell(midi(93), 3.0, 0.045))

for c in CUES:
    k, t = c["type"], c["t"]
    if k == "ping":
        place(sfx, t, bell(midi(rng.choice([74, 76, 78, 81, 83, 86])), 1.2, 0.05 * (1 - 0.28 * c["depth"])), pan=float(rng.uniform(-0.7, 0.7)))
        place(sfx, t, click(0.035, 1500), pan=float(rng.uniform(-0.5, 0.5)))
    elif k == "text": place(sfx, t, whoosh(0.5, 0.025, 600, 5000, 0.4))
    elif k == "ui": place(sfx, t - 0.1, whoosh(0.8, 0.05, 300, 4000, 0.6))
    elif k == "tap": place(sfx, t, click(0.1, 2400))
    elif k == "swipe": place(sfx, t, whoosh(0.35, 0.04, 800, 6000))
    elif k == "whoosh": place(sfx, t - 0.1, whoosh(0.7, 0.045))
    elif k == "check":
        place(sfx, t, mallet(midi(81), 0.6, 0.07, 7)); place(sfx, t + 0.08, mallet(midi(86), 0.8, 0.07, 6))
    elif k == "word": place(sfx, t, mallet(midi(74 + [0, 2, 4, 7, 9][c["i"] % 5]), 0.35, 0.022, 14), pan=-0.3)
    elif k == "heard":
        place(sfx, t, mallet(midi(78), 0.8, 0.05, 5)); place(sfx, t + 0.09, mallet(midi(83), 0.9, 0.05, 5))
    elif k == "land": place(sfx, t, mallet(midi([81, 83, 85, 86][c["i"] % 4]), 0.9, 0.06, 6), pan=0.35)
    elif k == "success":
        for i, n in enumerate([74, 78, 81, 86]): place(sfx, t + i * 0.07, mallet(midi(n), 1.2, 0.06, 4.5))
    elif k == "ding":
        place(sfx, t, bell(midi(88), 2.6, 0.1), pan=0.3); place(sfx, t + 0.12, bell(midi(93), 2.2, 0.06), pan=0.3)
    elif k == "land2": place(sfx, t, mallet(midi(86), 1.0, 0.06, 5), pan=0.3)
    elif k == "gather":
        for i, n in enumerate([74, 78, 81, 86, 90]): place(sfx, t + 0.1 + i * 0.07, bell(midi(n), 0.9, 0.03), pan=-0.5 + i * 0.25)
    elif k == "suck": place(sfx, t - 0.1, riser(0.8, 0.07))
    elif k == "typing":
        for i in range(6): place(sfx, t + i * 0.16, click(0.018, 3000), pan=0.3)
    elif k == "pop": place(sfx, t, mallet(midi(88), 0.7, 0.05, 7), pan=-0.3)
    elif k == "tab":
        place(sfx, t, click(0.07, 2600)); place(sfx, t + 0.02, mallet(midi(81), 0.4, 0.025, 10))
    elif k == "photo": place(sfx, t, whoosh(0.6, 0.045, 300, 5000, 0.5))

mix = music + sfx
ir_t = ts(2.0)
ir = np.stack([lp(rng.standard_normal(len(ir_t)) * np.exp(-3.1 * ir_t), 5000) for _ in range(2)], 1)
ir /= np.abs(ir).sum(0) ** 0.5 * 12
wet = np.stack([fftconvolve(mix[:, i], ir[:, i])[:N] for i in range(2)], 1)
out = hp((mix * 0.85 + wet * 0.35).T, 30).T
out /= np.max(np.abs(out)) + 1e-9
out = np.tanh(out * 1.4) / np.tanh(1.4)
fi, fo = int(0.1 * SR), int(1.2 * SR)
out[:fi] *= np.linspace(0, 1, fi)[:, None]; out[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
out *= 0.89
dest = ROOT / "out" / f"score-ep{EP}.wav"
with wave.open(str(dest), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
print(f"wrote {dest}  {DUR:.1f}s")
