#!/usr/bin/env python3
"""
Minimal edit of the uploaded 8s commercial, mastered at 1080x1920 @ 24fps:
- seg2 (frames 36-72):   real interior IMG_4106 — slow lateral pan, no zoom
- seg4 (frames 109-144): real Eiskaffee drizzle footage
- seg5 (frames 145-169): real macarons — handheld orbit (rotate + drift)
- ending (170-192):      kept white logo ending + script name lockup from the Gutschein
- everything else kept frame-for-frame (watermark removed, patch softened)
- original audio kept untouched
"""
import math, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H, FPS, N = 1080, 1920, 24, 192
SW, SH = 720, 1280   # source size of kept footage
UP = "/root/.claude/uploads/292677ef-0b3f-5726-8ed6-1e15356b92b8"
interior = Image.open(f"{UP}/fb09299c-IMG_4106.jpeg").convert("RGB")   # 1169x775
macarons = Image.open(f"{UP}/3cf7e3a2-97e1b5391e4c0b45f290383b300e4c0d684d2454.png").convert("RGB")  # 1170x1744

# authentic script name lockup, extracted from the Gutschein card (white on gold)
_v = Image.open(f"{UP}/7010b281-76A1E47E625A4FF1A3DF14613F0B6F75.png").convert("RGB")
_block = _v.crop((356, 641, 723, 880))
_bn = np.asarray(_block).astype(np.float32)
_gold_bg = np.asarray(_v.crop((300, 950, 380, 1020))).reshape(-1, 3).mean(axis=0)
_alpha = np.clip((_bn[..., 2] - _gold_bg[2] - 40) / (255 - _gold_bg[2] - 40), 0, 1)
_lock = np.zeros(_bn.shape[:2] + (4,), np.float32)
_lock[..., 0], _lock[..., 1], _lock[..., 2] = _gold_bg
_lock[..., 3] = _alpha * 255
name_lockup = Image.fromarray(_lock.astype(np.uint8))
name_lockup = name_lockup.resize((int(name_lockup.width*1.58), int(name_lockup.height*1.58)), Image.LANCZOS)
logo_img = Image.open(f"{UP}/8248a3e2-B75C0CEFDC114C4B84AEF27B2D84C0BE.png").convert("RGB")  # gold on white

def ease_io_sine(t): return 0.5 - 0.5*math.cos(math.pi*t)
def clamp(v,a,b): return max(a,min(b,v))
def lerp(a,b,t): return a+(b-a)*t

def kb(im, base_w, base_h, cx, cy, z, sharpen=0.6, rot=0.0):
    cw, ch = base_w/z, base_h/z
    if abs(rot) > 0.05:
        ov = min(1.06, im.width/cw, im.height/ch)
        cw2, ch2 = cw*ov, ch*ov
    else:
        ov, cw2, ch2 = 1.0, cw, ch
    cx = clamp(cx, cw2/2, im.width-cw2/2); cy = clamp(cy, ch2/2, im.height-ch2/2)
    ow, oh = (int(W*ov), int(H*ov)) if ov > 1.0 else (W, H)
    fr = im.resize((ow, oh), Image.LANCZOS, box=(cx-cw2/2, cy-ch2/2, cx+cw2/2, cy+ch2/2))
    if abs(rot) > 0.05:
        fr = fr.rotate(rot, resample=Image.BILINEAR, center=(ow/2, oh/2))
        fr = fr.crop(((ow-W)//2, (oh-H)//2, (ow-W)//2+W, (oh-H)//2+H))
    if sharpen > 0:
        fr = fr.filter(ImageFilter.UnsharpMask(radius=1.5, percent=int(60*sharpen), threshold=2))
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

# feathered mask over the delogo patch (720-space (548,1108)-(654,1214) -> 1080-space)
pm = Image.new("L", (W, H), 0)
ImageDraw.Draw(pm).rectangle((822, 1662, 981, 1821), fill=255)
pm = pm.filter(ImageFilter.GaussianBlur(15))
PMASK = np.asarray(pm).astype(np.float32)[..., None] / 255.0

def upscale(fr):
    fr = fr.resize((W, H), Image.LANCZOS)
    return fr.filter(ImageFilter.UnsharpMask(radius=1.6, percent=42, threshold=2))

def soften_patch(fr):
    a = np.asarray(fr).astype(np.float32)
    b = np.asarray(fr.filter(ImageFilter.GaussianBlur(7))).astype(np.float32)
    b += rng.normal(0, 2.5, b.shape[:2] + (1,)).astype(np.float32)
    out = a*(1-PMASK) + b*PMASK
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))

def frame(i):  # 1-indexed
    if 36 <= i <= 72:      # real interior: slow lateral pan, fixed scale
        t = ease_io_sine((i-36)/36)
        fr = kb(interior, 436, 775, lerp(350, 470, t), 387, 1.0, sharpen=0.95)
        return grade(fr, grain=2.2)
    if 109 <= i <= 144:    # real Eiskaffee/shake drizzle footage
        fr = Image.open(f"newseg/f_{i-109+13:03d}.png").convert("RGB")
        fr = upscale(fr)
        return grade(fr, grain=1.4)
    if 145 <= i <= 169:    # real macarons: handheld orbit — rotate + drift + breathe
        t = ease_io_sine((i-145)/24)
        fr = kb(macarons, 981, 1744, lerp(612, 578, t), lerp(925, 885, t),
                lerp(1.12, 1.18, t), sharpen=0.6, rot=lerp(-3.2, 3.2, t))
        return grade(fr, grain=1.8)
    if i >= 170:           # own white end card: logo + script name, no overlap
        t = (i-170)/22
        fr = Image.new("RGBA", (W, H), (255, 255, 255, 255))
        kL = clamp(t*22/6, 0, 1)                      # logo settles over ~6 frames
        eL = 1 - (1-kL)**3
        sL = 0.82 + 0.18*eL
        lw = int(520*sL)
        lg = logo_img.resize((lw, lw), Image.LANCZOS)
        if kL < 1:
            lg = lg.filter(ImageFilter.GaussianBlur(6*(1-kL)))
        fr.paste(lg, (int(540-lw/2), int(830-lw/2)))
        a = clamp((i-176)/8, 0, 1)
        if a > 0:
            l = name_lockup
            if a < 1:
                ch = l.getchannel("A").point(lambda p: int(p*a))
                l = l.copy(); l.putalpha(ch)
            fr.alpha_composite(l, (int(540 - l.width/2), int(1220 - 14*(1-a))))
        return fr.convert("RGB")
    fr = Image.open(f"orig_clean/f_{i:03d}.png").convert("RGB")
    fr = upscale(fr)
    return soften_patch(fr)

if __name__ == "__main__":
    proc = subprocess.Popen([
        "ffmpeg","-y","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}",
        "-r",str(FPS),"-i","-","-c:v","libx264","-preset","slow","-crf","17",
        "-pix_fmt","yuv420p","-movflags","+faststart","edit_noaudio.mp4"
    ], stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    for i in range(1, N+1):
        proc.stdin.write(frame(i).tobytes())
    proc.stdin.close(); proc.wait()
    print("done")
