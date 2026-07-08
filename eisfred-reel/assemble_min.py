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
kiosk    = Image.open(f"{UP}/48c625e0-2D9F7389255B41F6ADCDE15C1F3A608E.png").convert("RGB")  # 1086x1448

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
    if 145 <= i <= 169:    # real kiosk replaces macarons
        t = ease_io_sine((i-145)/24)
        fr = kb(kiosk, 814, 1448, 543, lerp(700, 668, t), lerp(1.06, 1.16, t), sharpen=0.6)
        return grade(fr, grain=2.0)
    fr = Image.open(f"orig_clean/f_{i:03d}.png").convert("RGB")
    return soften_patch(fr)

proc = subprocess.Popen([
    "ffmpeg","-y","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}",
    "-r",str(FPS),"-i","-","-c:v","libx264","-preset","slow","-crf","16",
    "-pix_fmt","yuv420p","-movflags","+faststart","edit_noaudio.mp4"
], stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
for i in range(1, N+1):
    proc.stdin.write(frame(i).tobytes())
proc.stdin.close(); proc.wait()
print("done")
