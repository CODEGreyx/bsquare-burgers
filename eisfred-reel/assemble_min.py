#!/usr/bin/env python3
"""
Minimal edit of the uploaded 8s commercial (720x1280 @ 24fps):
- seg2 (frames 36-72, fake interior)  -> real interior photo IMG_4106, Ken Burns
- seg5 (frames 145-169, fake macarons) -> real kiosk photo, Ken Burns
- everything else kept frame-for-frame (watermark already removed via delogo;
  the patch is softened here with a feathered blur + matched grain)
- original audio track is kept untouched
"""
import math, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H, FPS, N = 720, 1280, 24, 192
UP = "/root/.claude/uploads/292677ef-0b3f-5726-8ed6-1e15356b92b8"
interior = Image.open(f"{UP}/fb09299c-IMG_4106.jpeg").convert("RGB")   # 1169x775
macarons = Image.open(f"{UP}/3cf7e3a2-97e1b5391e4c0b45f290383b300e4c0d684d2454.png").convert("RGB")  # 1170x1744

# authentic script name lockup, extracted from the Gutschein card (white on gold)
_v = Image.open(f"{UP}/7010b281-76A1E47E625A4FF1A3DF14613F0B6F75.png").convert("RGB")
_block = _v.crop((356, 641, 723, 880))
_bn = np.asarray(_block).astype(np.float32)
_gold_bg = np.asarray(_v.crop((300, 950, 380, 1020))).reshape(-1, 3).mean(axis=0)  # brand gold
_alpha = np.clip((_bn[..., 2] - _gold_bg[2] - 40) / (255 - _gold_bg[2] - 40), 0, 1)
_lock = np.zeros(_bn.shape[:2] + (4,), np.float32)
_lock[..., 0], _lock[..., 1], _lock[..., 2] = _gold_bg
_lock[..., 3] = _alpha * 255
name_lockup = Image.fromarray(_lock.astype(np.uint8))
name_lockup = name_lockup.resize((int(name_lockup.width*1.05), int(name_lockup.height*1.05)), Image.LANCZOS)

def ease_io_sine(t): return 0.5 - 0.5*math.cos(math.pi*t)
def clamp(v,a,b): return max(a,min(b,v))
def lerp(a,b,t): return a+(b-a)*t

def kb(im, base_w, base_h, cx, cy, z, sharpen=0.6):
    cw, ch = base_w/z, base_h/z
    cx = clamp(cx, cw/2, im.width-cw/2); cy = clamp(cy, ch/2, im.height-ch/2)
    fr = im.resize((W, H), Image.LANCZOS, box=(cx-cw/2, cy-ch/2, cx+cw/2, cy+ch/2))
    if sharpen > 0:
        fr = fr.filter(ImageFilter.UnsharpMask(radius=1.4, percent=int(60*sharpen), threshold=2))
    return fr

# light warm grade to match the original clips
lut_r = np.clip(np.arange(256)*1.024 + 2.0, 0, 255).astype(np.uint8)
lut_g = np.clip(np.arange(256)*1.004 + 1.0, 0, 255).astype(np.uint8)
lut_b = np.clip(np.arange(256)*0.980, 0, 255).astype(np.uint8)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
rr = np.sqrt(((xx-W/2)/(W/2))**2 + ((yy-H/2)/(H/2))**2)
VIG = (1.0 - 0.08*np.clip(rr-0.6, 0, 1)**1.8).astype(np.float32)[..., None]
rng = np.random.default_rng(11)

def grade(fr, grain=1.8):
    a = np.asarray(fr, np.uint8)
    a = np.stack([lut_r[a[...,0]], lut_g[a[...,1]], lut_b[a[...,2]]], -1).astype(np.float32)
    a *= VIG
    a += rng.normal(0, grain, (H, W, 1)).astype(np.float32)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

# feathered mask over the delogo patch (556,1116)-(646,1206)
pm = Image.new("L", (W, H), 0)
ImageDraw.Draw(pm).rectangle((548, 1108, 654, 1214), fill=255)
pm = pm.filter(ImageFilter.GaussianBlur(10))
PMASK = np.asarray(pm).astype(np.float32)[..., None] / 255.0

def soften_patch(fr):
    a = np.asarray(fr).astype(np.float32)
    b = np.asarray(fr.filter(ImageFilter.GaussianBlur(5))).astype(np.float32)
    b += rng.normal(0, 2.5, b.shape[:2] + (1,)).astype(np.float32)
    out = a*(1-PMASK) + b*PMASK
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))

def frame(i):  # 1-indexed
    if 36 <= i <= 72:      # real interior replaces fake interior
        t = ease_io_sine((i-36)/36)
        fr = kb(interior, 436, 775, lerp(370, 398, t), 387, lerp(1.0, 1.10, t), sharpen=0.7)
        return grade(fr, grain=2.0)
    if 145 <= i <= 169:    # real macarons photo replaces the AI macarons
        t = ease_io_sine((i-145)/24)
        fr = kb(macarons, 981, 1744, lerp(600, 585, t), lerp(920, 890, t),
                lerp(1.04, 1.15, t), sharpen=0.6)
        return grade(fr, grain=2.0)
    fr = Image.open(f"orig_clean/f_{i:03d}.png").convert("RGB")
    fr = soften_patch(fr)
    if i >= 170:           # white ending: add the full name under the logo
        a = clamp((i-175)/8, 0, 1)
        if a > 0:
            fr = fr.convert("RGBA")
            l = name_lockup
            if a < 1:
                ch = l.getchannel("A").point(lambda p: int(p*a))
                l = l.copy(); l.putalpha(ch)
            fr.alpha_composite(l, (int(360 - l.width/2), int(790 - 8*(1-a))))
            fr = fr.convert("RGB")
    return fr

proc = subprocess.Popen([
    "ffmpeg","-y","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}",
    "-r",str(FPS),"-i","-","-c:v","libx264","-preset","slow","-crf","16",
    "-pix_fmt","yuv420p","-movflags","+faststart","edit_noaudio.mp4"
], stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
for i in range(1, N+1):
    proc.stdin.write(frame(i).tobytes())
proc.stdin.close(); proc.wait()
print("done")
