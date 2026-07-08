#!/usr/bin/env python3
"""Livelier 120 BPM bed v2: kick, soft clap on 2&4, hats, two-chord warm pad, riser, shimmer."""
import numpy as np, wave, sys

SR = 48000
DUR = 15.0
n = int(SR*DUR)
t = np.arange(n)/SR
mix = np.zeros(n)
rng = np.random.default_rng(3)

def add(sig, at, gain=1.0):
    i = int(at*SR); j = min(n, i+len(sig))
    if j > i: mix[i:j] += sig[:j-i]*gain

def kick(f0=95, f1=48, L=0.35, dec=0.10):
    tt = np.arange(int(L*SR))/SR
    fr = (f0-f1)*np.exp(-tt/0.05)+f1
    return np.sin(2*np.pi*np.cumsum(fr)/SR)*np.exp(-tt/dec)

def clap(L=0.18):
    tt = np.arange(int(L*SR))/SR
    noi = rng.normal(0, 1, len(tt))
    # band-ish: smooth then diff twice for mid emphasis
    noi = np.convolve(noi, np.ones(24)/24, mode="same")
    noi = np.diff(noi, prepend=0)
    env = np.exp(-tt/0.045)*(1+0.5*np.sin(2*np.pi*60*tt)*np.exp(-tt/0.01))
    return noi*env*9

def hat(L=0.05, dec=0.011):
    e = np.exp(-np.arange(int(L*SR))/SR/dec)
    noi = np.diff(rng.normal(0, 1, len(e)+1))
    return noi*e

# ---- pad: F (0-4s, 8-12s) / Bb (4-8s), sustained F from 12s
chords = {
    "F":  [(87.31,.15),(130.81,.11),(174.61,.085),(220.0,.06),(349.23,.03)],
    "Bb": [(116.54,.14),(146.83,.10),(174.61,.085),(233.08,.055),(293.66,.03)],
}
def chord_gain(name):
    g = np.zeros(n)
    for a, b in {"F": [(0,4),(8,15.1)], "Bb": [(4,8)]}[name]:
        i0, i1 = int(a*SR), min(n, int(b*SR))
        g[i0:i1] = 1.0
    # smooth 300ms crossfades
    k = int(0.3*SR)
    return np.convolve(g, np.ones(k)/k, mode="same")

for name, notes in chords.items():
    g = chord_gain(name)
    for f0, amp in notes:
        det = 1.0 + 0.0013*np.sin(2*np.pi*0.13*t + f0)
        mix += np.sin(2*np.pi*f0*det*t)*amp*g*(0.85+0.15*np.sin(2*np.pi*0.09*t))
mix *= (1-np.exp(-t/1.2))

# ---- drums
beats = np.arange(0, DUR, 0.5)
for b in beats:
    if 2.0 <= b < 12.5:
        on_bar = (b % 1.0) < 0.01           # beats 1&3
        drive = 5.5 <= b < 10.5             # montage: every beat
        if on_bar or drive:
            add(kick(), b, 0.30 if on_bar else 0.20)
# claps on 2 & 4 from 4s
for b in np.arange(4.5, 12.0, 1.0):
    add(clap(), b, 0.16)
# hats: 8ths, brighter during montage
for b in np.arange(2.0, 12.5, 0.25):
    g = 0.030 if (b*2) % 1 else 0.018
    if 5.5 <= b < 10.5: g *= 1.5
    add(hat(), b, g)

# ---- cut accents (deep warm thump on every cut)
for at in [0.0, 2.0, 3.0, 4.0, 5.0, 5.5, 6.5, 7.0, 7.5, 8.5, 9.5, 10.5, 11.0, 12.5]:
    add(kick(80, 42, 0.5, 0.13), at, 0.34)

# ---- riser into end card
L = 1.2
tt = np.arange(int(L*SR))/SR
noi = np.convolve(rng.normal(0, 1, len(tt)), np.ones(48)/48, mode="same")
add(noi*(tt/L)**2.0, 11.3, 0.07)

# ---- end shimmer: soft high F major arps
for i, (f0, at) in enumerate([(698.46, 12.6), (880.0, 12.85), (1046.5, 13.1)]):
    L = 1.6
    tt = np.arange(int(L*SR))/SR
    add(np.sin(2*np.pi*f0*tt)*np.exp(-tt/0.5), at, 0.035)

# fades + master
mix *= np.clip(t/0.12, 0, 1)*np.clip((DUR-t)/1.6, 0, 1)**1.4
mix = np.tanh(mix*1.5)
mix *= 0.74/np.max(np.abs(mix))
pcm = (np.stack([mix, mix], -1)*32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("audio done")
