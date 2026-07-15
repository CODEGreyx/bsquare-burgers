#!/usr/bin/env python3
"""
Eisfred Friedrichshainer Eismanufaktur — 15s Instagram Reel
1080x1920 @ 30fps, cuts locked to a 120 BPM grid (beat = 0.5s).
All visuals come from the 5 real photos/screenshots + the real logo. No generated scenes.
"""
import math, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1080, 1920
FPS = 30
DUR = 15.0
N = int(DUR * FPS)  # 450

UP = "/root/.claude/uploads/292677ef-0b3f-5726-8ed6-1e15356b92b8"
SRC = {
    "scoop":      f"{UP}/4e0fc658-585003E0CD074CCE96E875432BF819B3.png",  # 710x1536 website screenshot
    "storefront": f"{UP}/655d833f-3DA0E844ACBB4F5CAD42C362FA12C6E5.png",  # 1536x1152
    "kiosk":      f"{UP}/48c625e0-2D9F7389255B41F6ADCDE15C1F3A608E.png",  # 1086x1448
    "interior":   f"{UP}/15d8c59e-444CB963B3DA4373A52F18E1336C7BD9.png",  # 1536x1152
    "street":     f"{UP}/2c868380-EC3E285FE91C4E92A767E30397231F39.png",  # 1086x1448
    "logo":       f"{UP}/8248a3e2-B75C0CEFDC114C4B84AEF27B2D84C0BE.png",  # 1254x1254
}

F_SERIF = "/usr/share/fonts/opentype/ebgaramond/EBGaramond12-Regular.otf"
F_SANS_L = "/usr/share/fonts/opentype/montserrat/Montserrat-Light.otf"
F_SANS_M = "/usr/share/fonts/opentype/montserrat/Montserrat-Medium.otf"
F_SANS_R = "/usr/share/fonts/opentype/montserrat/Montserrat-Regular.otf"

CREAM = (247, 243, 236)
INK = (43, 38, 32)
GOLD = (196, 154, 62)

imgs = {k: Image.open(v).convert("RGB") for k, v in SRC.items()}

# ---------- easing ----------
def ease_io_sine(t):  return 0.5 - 0.5 * math.cos(math.pi * t)
def ease_io_cubic(t): return 4*t*t*t if t < .5 else 1 - ((-2*t+2)**3)/2
def ease_out_quint(t):return 1 - (1-t)**5
def ease_in_cubic(t): return t*t*t
def ease_out_cubic(t):return 1 - (1-t)**3
def clamp(v, a, b):   return max(a, min(b, v))

# ---------- Ken Burns crop ----------
def kb_frame(im, base_w, base_h, cx, cy, z, out_w, out_h, sharpen=0.0):
    """Crop a base_w/z x base_h/z window centered (cx,cy), resize to out."""
    cw, ch = base_w / z, base_h / z
    cx = clamp(cx, cw/2, im.width - cw/2)
    cy = clamp(cy, ch/2, im.height - ch/2)
    box = (cx - cw/2, cy - ch/2, cx + cw/2, cy + ch/2)
    fr = im.resize((out_w, out_h), Image.LANCZOS, box=box)
    if sharpen > 0:
        fr = fr.filter(ImageFilter.UnsharpMask(radius=1.6, percent=int(60*sharpen), threshold=2))
    return fr

def lerp(a, b, t): return a + (b - a) * t

# ---------- typography ----------
def caption(text, font_path, size, tracking, color, shadow=True):
    font = ImageFont.truetype(font_path, size)
    widths = []
    for ch in text:
        b = font.getbbox(ch)
        widths.append(font.getlength(ch))
    total = int(sum(widths) + tracking * (len(text)-1)) + 40
    asc, desc = font.getmetrics()
    h = asc + desc + 40
    img = Image.new("RGBA", (total, h), (0,0,0,0))
    d = ImageDraw.Draw(img)
    x = 20
    for ch, w in zip(text, widths):
        if shadow:
            d.text((x+2, 22), ch, font=font, fill=(0,0,0,110))
        d.text((x, 20), ch, font=font, fill=color + (255,))
        x += w + tracking
    return img

def paste_center(base, layer, cx, cy, alpha=1.0, scale=1.0):
    if alpha <= 0: return
    l = layer
    if scale != 1.0:
        l = l.resize((max(1,int(l.width*scale)), max(1,int(l.height*scale))), Image.LANCZOS)
    if alpha < 1.0:
        a = l.getchannel("A").point(lambda p: int(p * alpha))
        l = l.copy(); l.putalpha(a)
    base.alpha_composite(l, (int(cx - l.width/2), int(cy - l.height/2)))

# pre-render captions
cap_brand  = caption("EISFRED", F_SANS_M, 30, 14, (255,255,255))
cap_hand   = caption("HANDCRAFTED IN BERLIN", F_SANS_L, 40, 11, INK, shadow=False)
cap_fresh  = caption("Fresh. Daily.", F_SERIF, 110, 2, (255,255,255))
cap_fresh2 = caption("TÄGLICH FRISCH AUS DER MANUFAKTUR", F_SANS_L, 26, 8, (255,255,255))
ec_word    = caption("Eisfred", F_SERIF, 170, 2, INK, shadow=False)
ec_sub     = caption("FRIEDRICHSHAINER EISMANUFAKTUR", F_SANS_L, 34, 12, INK, shadow=False)
ec_url     = caption("www.eisfredeismanufaktur.de", F_SANS_R, 36, 3, (122,112,98), shadow=False)
cap_brand_dark = caption("EISFRED", F_SANS_M, 30, 14, (150,132,96), shadow=False)

# end-card logo: multiply blend gold-on-white onto cream
logo = imgs["logo"].resize((430, 430), Image.LANCZOS)
logo_np = np.asarray(logo).astype(np.float32) / 255.0
cream_np = np.asarray(Image.new("RGB", logo.size, CREAM)).astype(np.float32) / 255.0
logo_mult = Image.fromarray((logo_np * cream_np * 255).astype(np.uint8))
logo_rgba = logo_mult.convert("RGBA")

# ---------- grade: warm premium, subtle ----------
lut_r = np.clip(np.arange(256) * 1.030 + 3.0, 0, 255)
lut_g = np.clip(np.arange(256) * 1.005 + 1.0, 0, 255)
lut_b = np.clip(np.arange(256) * 0.972, 0, 255)
xs = np.arange(256) / 255.0
scurve = np.clip((xs + 0.055 * np.sin((xs - 0.5) * math.pi)) * 255, 0, 255)
LUT_R = scurve[lut_r.astype(np.uint8)].astype(np.uint8)
LUT_G = scurve[lut_g.astype(np.uint8)].astype(np.uint8)
LUT_B = scurve[lut_b.astype(np.uint8)].astype(np.uint8)

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
r = np.sqrt(((xx - W/2)/(W/2))**2 + ((yy - H/2)/(H/2))**2)
VIGNETTE = (1.0 - 0.10 * np.clip(r - 0.55, 0, 1)**1.8).astype(np.float32)[..., None]

rng = np.random.default_rng(7)

def grade(fr, vignette=True, grain=2.2, sat=1.05):
    a = np.asarray(fr, dtype=np.uint8)
    a = np.stack([LUT_R[a[...,0]], LUT_G[a[...,1]], LUT_B[a[...,2]]], axis=-1).astype(np.float32)
    if sat != 1.0:
        luma = (0.299*a[...,0] + 0.587*a[...,1] + 0.114*a[...,2])[..., None]
        a = luma + (a - luma) * sat
    if vignette:
        a *= VIGNETTE
    if grain > 0:
        a += rng.normal(0, grain, (H, W, 1)).astype(np.float32)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

def zoom_blur(fr, amount):
    """Fake radial/zoom motion blur by stacking scaled copies."""
    if amount <= 0: return fr
    out = fr.copy()
    steps = 4
    for i in range(1, steps+1):
        s = 1.0 + amount * i / steps
        z = fr.resize((int(W*s), int(H*s)), Image.BILINEAR)
        z = z.crop(((z.width-W)//2, (z.height-H)//2, (z.width-W)//2+W, (z.height-H)//2+H))
        out = Image.blend(out, z, 0.35)
    return out

def post_scale(fr, s):
    if abs(s - 1.0) < 1e-4: return fr
    z = fr.resize((int(W*s), int(H*s)), Image.BILINEAR)
    return z.crop(((z.width-W)//2, (z.height-H)//2, (z.width-W)//2+W, (z.height-H)//2+H))

# ---------- shots ----------
# scoop photo region inside the website screenshot (crop out phone/browser UI)
SCOOP_BOX = (10, 230, 600, 890)  # excludes carousel arrow + slider dots
scoop_im = imgs["scoop"].crop(SCOOP_BOX)

def framed_scoop(t01, z0, z1, c0, c1, ease, disp_w=920):
    """Editorial framing: cream matte, photo centered, Ken Burns inside."""
    e = ease(t01)
    z = lerp(z0, z1, e)
    cx, cy = lerp(c0[0], c1[0], e), lerp(c0[1], c1[1], e)
    aspect = scoop_im.height / scoop_im.width
    dw, dh = disp_w, int(disp_w * aspect)
    photo = kb_frame(scoop_im, scoop_im.width, scoop_im.height, cx, cy, z, dw, dh,
                     sharpen=0.8)
    canvas = Image.new("RGB", (W, H), CREAM)
    # soft drop shadow
    sh = Image.new("RGBA", (W, H), (0,0,0,0))
    d = ImageDraw.Draw(sh)
    px, py = (W-dw)//2, (H-dh)//2
    d.rectangle((px+10, py+16, px+dw+10, py+dh+16), fill=(60, 48, 30, 60))
    sh = sh.filter(ImageFilter.GaussianBlur(18))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), sh)
    canvas.paste(photo, (px, py))
    return canvas, py, dh

def shot(idx, t01):
    """Render shot idx at local progress t01 -> graded RGBA frame."""
    if idx == 1:  # 0.0–2.5  scoop hero, framed, slow push
        canvas, py, dh = framed_scoop(t01, 1.0, 1.09, (295, 340), (300, 325), ease_io_sine)
        fr = grade(canvas.convert("RGB"), vignette=False, grain=1.6)
        fr = fr.convert("RGBA")
        # brand mark above, caption below (slight counter-drift = parallax feel)
        drift = 8 * ease_io_sine(t01)
        a1 = clamp((t01*2.5 - 0.55) / 0.45, 0, 1) * clamp((2.5 - t01*2.5 - 0.15) / 0.35, 0, 1)
        paste_center(fr, cap_brand_dark, W/2, py - 78 + drift*0.4, alpha=a1)
        a2 = clamp((t01*2.5 - 0.80) / 0.50, 0, 1) * clamp((2.5 - t01*2.5 - 0.12) / 0.35, 0, 1)
        paste_center(fr, cap_hand, W/2, py + dh + 92 - drift, alpha=ease_out_cubic(a2))
        return fr

    if idx == 2:  # 2.5–4.5 striped awning storefront, pan right, ends on awning for match cut
        im = imgs["storefront"]
        e = ease_io_cubic(t01)
        z = lerp(1.02, 1.10, ease_in_cubic(t01))          # gentle accel = speed-ramp into cut
        cx = lerp(390, 1080, e)
        cy = lerp(576, 500, e)                             # rise toward the awning
        fr = kb_frame(im, 648, 1152, cx, cy, z, W, H, sharpen=0.7)
        return grade(fr).convert("RGBA")

    if idx == 3:  # 4.5–6.5 yellow kiosk — match cut: starts tight on awning, settles wide
        im = imgs["kiosk"]
        e = ease_out_quint(t01)                            # fast settle out of the cut
        z = lerp(1.42, 1.02, e)
        cx = lerp(543, 543, e)
        cy = lerp(430, 720, e)
        fr = kb_frame(im, 814, 1448, cx, cy, z, W, H, sharpen=0.5)
        return grade(fr).convert("RGBA")

    if idx == 4:  # 6.5–8.5 interior, push toward menu board;  "Fresh. Daily."
        im = imgs["interior"]
        e = ease_io_sine(t01)
        z = lerp(1.0, 1.30, e)
        cx = lerp(700, 980, e)
        cy = lerp(576, 545, e)
        fr = kb_frame(im, 648, 1152, cx, cy, z, W, H, sharpen=0.7)
        fr = grade(fr).convert("RGBA")
        tsec = t01 * 2.0
        a = clamp((tsec - 0.40) / 0.45, 0, 1) * clamp((2.0 - tsec - 0.10) / 0.30, 0, 1)
        rise = 14 * (1 - ease_out_cubic(clamp((tsec - 0.40) / 0.6, 0, 1)))
        paste_center(fr, cap_fresh, W/2, H*0.665 + rise, alpha=ease_out_cubic(a))
        paste_center(fr, cap_fresh2, W/2, H*0.665 + 152 + rise*1.5, alpha=ease_out_cubic(a)*0.95)
        return fr

    if idx == 5:  # 8.5–10.5 street scene, slow push toward kiosk
        im = imgs["street"]
        e = ease_io_sine(t01)
        z = lerp(1.0, 1.16, e)
        cx = 543
        cy = lerp(760, 620, e)
        fr = kb_frame(im, 814, 1448, cx, cy, z, W, H, sharpen=0.5)
        return grade(fr).convert("RGBA")

    if idx == 6:  # 10.5–12.5 scoop detail, framed, accelerating zoom into end card
        canvas, py, dh = framed_scoop(t01, 1.22, 1.52, (320, 350), (325, 368), ease_in_cubic)
        fr = grade(canvas.convert("RGB"), vignette=False, grain=1.8)
        return fr.convert("RGBA")

    # idx == 7: end card
    t = t01
    fr = Image.new("RGBA", (W, H), CREAM + (255,))
    s = lerp(1.02, 1.0, ease_out_cubic(clamp(t*2.2, 0, 1)))
    a_logo = ease_out_cubic(clamp((t*2.5 - 0.00) / 0.55, 0, 1))
    a_word = ease_out_cubic(clamp((t*2.5 - 0.28) / 0.55, 0, 1))
    a_sub  = ease_out_cubic(clamp((t*2.5 - 0.50) / 0.55, 0, 1))
    a_url  = ease_out_cubic(clamp((t*2.5 - 0.75) / 0.55, 0, 1))
    rise = 18 * (1 - a_word)
    paste_center(fr, logo_rgba, W/2, 690, alpha=a_logo, scale=s)
    paste_center(fr, ec_word, W/2, 1010 + rise, alpha=a_word)
    paste_center(fr, ec_sub, W/2, 1128 + rise, alpha=a_sub)
    # thin gold rule
    if a_sub > 0:
        d = ImageDraw.Draw(fr)
        lw = int(150 * a_sub)
        d.line((W/2 - lw, 1208, W/2 + lw, 1208), fill=GOLD + (int(200*a_sub),), width=3)
    paste_center(fr, ec_url, W/2, 1280 + rise, alpha=a_url)
    fr2 = grade(fr.convert("RGB"), vignette=False, grain=1.2, sat=1.0)
    return fr2.convert("RGBA")

# shot boundaries in frames (cuts on the 120 BPM half-second grid)
BOUNDS = [(1, 0, 75), (2, 75, 135), (3, 135, 195), (4, 195, 255),
          (5, 255, 315), (6, 315, 375), (7, 375, 450)]

def shot_at(f):
    for idx, a, b in BOUNDS:
        if a <= f < b:
            return idx, (f - a) / (b - a - 1)
    return 7, 1.0

def render_frame(f):
    idx, t01 = shot_at(f)
    fr = shot(idx, t01)

    # T1: S1->S2 cross-zoom with motion blur (frames 70..80)
    if 70 <= f < 75:
        k = (f - 70) / 10.0
        fr = post_scale(fr.convert("RGB"), 1.0 + 0.10*ease_in_cubic(k*2)).convert("RGBA")
        fr = zoom_blur(fr.convert("RGB"), 0.02 * k*2).convert("RGBA")
    if 75 <= f < 80:
        k = (f - 70) / 10.0
        prev = shot(1, 1.0).convert("RGB")
        prev = post_scale(prev, 1.0 + 0.10*ease_in_cubic(k*2 if k*2<1 else 1.0))
        cur = post_scale(fr.convert("RGB"), lerp(1.10, 1.0, ease_out_cubic((k-0.5)*2)))
        cur = zoom_blur(cur, 0.02 * (1 - (k-0.5)*2))
        fr = Image.blend(prev, cur, clamp((k-0.5)*2*1.6, 0, 1)).convert("RGBA")

    # T3: S3->S4 quick dissolve w/ slight scale (frames 191..199)
    if 191 <= f < 199:
        k = (f - 191) / 8.0
        if f < 195:
            fr = fr  # outgoing plain
        else:
            prev = shot(3, 1.0).convert("RGB")
            cur = post_scale(fr.convert("RGB"), lerp(1.04, 1.0, ease_out_cubic(k)))
            fr = Image.blend(prev, cur, ease_io_sine(k)).convert("RGBA")

    # T5: flash-frame into S6 (frames 313..318)
    if 313 <= f < 318:
        base = fr.convert("RGB")
        if f < 315:
            w = 0.55 * (f - 312)/2.0
        else:
            w = max(0.0, 0.85 - 0.30*(f - 315))
        flash = Image.new("RGB", (W, H), (255, 248, 236))
        fr = Image.blend(base, flash, clamp(w, 0, 1)).convert("RGBA")
        fr = zoom_blur(fr.convert("RGB"), 0.015 if f >= 315 else 0.0).convert("RGBA")

    # T6: S6->S7 soft dissolve (frames 371..381)
    if 371 <= f < 381:
        k = (f - 371) / 10.0
        if f < 375:
            fr = zoom_blur(fr.convert("RGB"), 0.018*k).convert("RGBA")
        else:
            prev = shot(6, 1.0).convert("RGB")
            prev = zoom_blur(prev, 0.02)
            fr = Image.blend(prev, fr.convert("RGB"), ease_io_sine(clamp((k-0.4)/0.6, 0, 1))).convert("RGBA")

    return fr.convert("RGB")

def main():
    out = sys.argv[1]
    proc = subprocess.Popen([
        "ffmpeg", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
        "-c:v", "libx264", "-preset", "slow", "-crf", "17",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", out
    ], stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    for f in range(N):
        proc.stdin.write(render_frame(f).tobytes())
        if f % 45 == 0:
            print(f"frame {f}/{N}", flush=True)
    proc.stdin.close()
    proc.wait()
    print("video done:", out)

if __name__ == "__main__":
    main()
