#!/usr/bin/env python3
"""Calm, confident 120 BPM bed for the concept cut: warm pad, bar-kicks, soft hats,
accents on the five cuts, riser into the product flash, shimmer under the brand card."""
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

def kick(f0=90, f1=46, L=0.4, dec=0.11):
    tt = np.arange(int(L*SR))/SR
    fr = (f0-f1)*np.exp(-tt/0.05)+f1
    return np.sin(2*np.pi*np.cumsum(fr)/SR)*np.exp(-tt/dec)

def hat(L=0.05, dec=0.011):
    e = np.exp(-np.arange(int(L*SR))/SR/dec)
    return np.diff(rng.normal(0, 1, len(e)+1))*e

# pad: F (0-5s), Bb (5-10s), F (10-15s), slow swell
chords = {"F": [(87.31,.16),(130.81,.12),(174.61,.09),(220.0,.065),(349.23,.03)],
          "Bb":[(116.54,.15),(146.83,.11),(174.61,.09),(233.08,.06),(293.66,.03)]}
def gain_for(name):
    g = np.zeros(n)
    for a,b in {"F":[(0,5),(10,15.1)], "Bb":[(5,10)]}[name]:
        g[int(a*SR):min(n,int(b*SR))] = 1.0
    k = int(0.35*SR)
    return np.convolve(g, np.ones(k)/k, mode="same")
for name, notes in chords.items():
    g = gain_for(name)
    for f0, amp in notes:
        det = 1.0 + 0.0012*np.sin(2*np.pi*0.12*t + f0)
        mix += np.sin(2*np.pi*f0*det*t)*amp*g*(0.86+0.14*np.sin(2*np.pi*0.08*t))
mix *= (1-np.exp(-t/1.5))

# heartbeat kicks on bars (every 2s) + soft off-bar pulse
for b in np.arange(0.0, 12.5, 1.0):
    add(kick(), b, 0.22 if b % 2 < 0.01 else 0.10)
# gentle hats on 8ths from the mid-point
for b in np.arange(5.0, 12.5, 0.25):
    add(hat(), b, 0.022 if (b*2) % 1 else 0.014)

# accents on the five cuts + open
for at in [0.0, 2.5, 5.0, 7.5, 10.0, 12.5]:
    add(kick(82, 42, 0.5, 0.14), at, 0.36)

# riser into the product flash at 10.0
L = 1.1
tt = np.arange(int(L*SR))/SR
noi = np.convolve(rng.normal(0, 1, len(tt)), np.ones(48)/48, mode="same")
add(noi*(tt/L)**2.1, 8.9, 0.06)

# shimmer under the brand card
for f0, at in [(698.46, 12.6), (880.0, 12.85), (1046.5, 13.1)]:
    tt = np.arange(int(1.7*SR))/SR
    add(np.sin(2*np.pi*f0*tt)*np.exp(-tt/0.55), at, 0.032)

mix *= np.clip(t/0.12, 0, 1)*np.clip((DUR-t)/1.7, 0, 1)**1.4
mix = np.tanh(mix*1.45)
mix *= 0.72/np.max(np.abs(mix))
pcm = (np.stack([mix, mix], -1)*32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("audio done")
