#!/usr/bin/env python3
"""Minimal warm 120 BPM bed: soft sub pulse, airy texture, accents on every cut."""
import numpy as np, wave, sys

SR = 48000
DUR = 15.0
n = int(SR * DUR)
t = np.arange(n) / SR
mix = np.zeros(n)

def env_exp(length, decay):
    tt = np.arange(int(length * SR)) / SR
    return np.exp(-tt / decay)

def add(sig, at):
    i = int(at * SR)
    j = min(n, i + len(sig))
    mix[i:j] += sig[: j - i]

# warm pad: Fmaj9-ish, slow swell
for f0, amp in [(87.31, .16), (130.81, .12), (174.61, .09), (220.0, .07), (329.63, .035)]:
    det = 1.0 + 0.0012 * np.sin(2 * np.pi * 0.11 * t + f0)
    pad = np.sin(2 * np.pi * f0 * det * t) * amp
    pad *= (1 - np.exp(-t / 1.8))                      # swell in
    pad *= 0.85 + 0.15 * np.sin(2 * np.pi * 0.07 * t)  # slow breathing
    mix += pad

# sub pulse on quarter notes (120 BPM -> every 0.5 s), very soft
for k in range(int(DUR / 0.5)):
    at = k * 0.5
    e = env_exp(0.30, 0.07)
    tt = np.arange(len(e)) / SR
    add(np.sin(2 * np.pi * 52 * tt) * e * 0.10, at)

# soft airy tick on offbeats (filtered-ish noise via diff)
rng = np.random.default_rng(3)
for k in range(int(DUR / 0.5)):
    at = k * 0.5 + 0.25
    if at > 13.0: break
    e = env_exp(0.05, 0.012)
    noi = np.diff(rng.normal(0, 1, len(e) + 1))
    add(noi * e * 0.012, at)

# accents on every cut: deeper warm thump (80->45 Hz sweep)
for at in [0.0, 2.5, 4.5, 6.5, 8.5, 10.5, 12.5]:
    L = 0.45
    tt = np.arange(int(L * SR)) / SR
    fr = 80 * np.exp(-tt / 0.09) + 45
    ph = 2 * np.pi * np.cumsum(fr) / SR
    add(np.sin(ph) * np.exp(-tt / 0.13) * 0.34, at)

# gentle riser into the end card (11.5 -> 12.5)
L = 1.0
tt = np.arange(int(L * SR)) / SR
noi = rng.normal(0, 1, len(tt))
noi = np.convolve(noi, np.ones(64) / 64, mode="same")   # darken
add(noi * (tt / L) ** 2.2 * 0.05, 11.5)

# global fades
fade_in = np.clip(t / 0.15, 0, 1)
fade_out = np.clip((DUR - t) / 1.8, 0, 1) ** 1.5
mix *= fade_in * fade_out

# soft-clip + normalize
mix = np.tanh(mix * 1.4)
mix *= 0.70 / np.max(np.abs(mix))

stereo = np.stack([mix, mix], axis=-1)
pcm = (stereo * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("audio done")
