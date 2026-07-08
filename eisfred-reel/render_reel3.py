#!/usr/bin/env python3
"""
Eisfred — 15s Reel v3 "concept cut".
Apple-ad structure: one scene = one word, the tagline builds across the film:
  Handcrafted -> in Berlin. -> Fresh. -> Daily. -> [product, no words] -> brand card.
6 even segments of 2.5s, every photo used exactly once, cuts on the 120 BPM grid.
"""
import math, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1080, 1920
FPS = 30
DUR = 15.0
N = int(DUR * FPS)

UP = "/root/.claude/uploads/292677ef-0b3f-5726-8ed6-1e15356b92b8"
SRC = {
    "scoop":      f"{UP}/4e0fc658-585003E0CD074CCE96E875432BF819B3.png",
    "storefront": f"{UP}/655d833f-3DA0E844ACBB4F5CAD42C362FA12C6E5.png",
    "kiosk":      f"{UP}/48c625e0-2D9F7389255B41F6ADCDE15C1F3A608E.png",
    "interior":   f"{UP}/15d8c59e-444CB963B3DA4373A52F18E1336C7BD9.png",
    "street":     f"{UP}/2c868380-EC3E285FE91C4E92A767E30397231F39.png",
    "logo":       f"{UP}/8248a3e2-B75C0CEFDC114C4B84AEF27B2D84C0BE.png",
}
F_SERIF   = "/usr/share/fonts/opentype/ebgaramond/EBGaramond12-Regular.otf"
F_SERIF_I = "/usr/share/fonts/opentype/ebgaramond/EBGaramond08-Italic.otf"
F_SANS_L  = "/usr/share/fonts/opentype/montserrat/Montserrat-Light.otf"
F_SANS_M  = "/usr/share/fonts/opentype/montserrat/Montserrat-Medium.otf"
F_SANS_R  = "/usr/share/fonts/opentype/montserrat/Montserrat-Regular.otf"
import os
if not os.path.exists(F_SERIF_I):
    F_SERIF_I = F_SERIF

CREAM = (247, 243, 236)
INK   = (43, 38, 32)
GOLD  = (196, 154, 62)
GOLD_D= (150, 132, 96)

imgs = {k: Image.open(v).convert("RGB") for k, v in SRC.items()}

def ease_io_sine(t):  return 0.5 - 0.5*math.cos(math.pi*t)
def ease_out_cubic(t):return 1-(1-t)**3
def ease_in_cubic(t): return t*t*t
def ease_out_back(t):
    c1, c3 = 1.70158, 2.70158
    return 1 + c3*(t-1)**3 + c1*(t-1)**2
def clamp(v,a,b): return max(a,min(b,v))
def lerp(a,b,t):  return a+(b-a)*t

def kb_frame(im, base_w, base_h, cx, cy, z, out_w, out_h, sharpen=0.0):
    cw, ch = base_w/z, base_h/z
    cx = clamp(cx, cw/2, im.width - cw/2)
    cy = clamp(cy, ch/2, im.height - ch/2)
    fr = im.resize((out_w, out_h), Image.LANCZOS,
                   box=(cx-cw/2, cy-ch/2, cx+cw/2, cy+ch/2))
    if sharpen > 0:
        fr = fr.filter(ImageFilter.UnsharpMask(radius=1.6, percent=int(60*sharpen), threshold=2))
    return fr

# ---------- typography (gold period accent) ----------
def word(text, font_path, size, tracking, color, shadow=True, period_gold=True):
    font = ImageFont.truetype(font_path, size)
    widths = [font.getlength(ch) for ch in text]
    total = int(sum(widths) + tracking*(len(text)-1)) + 60
    asc, desc = font.getmetrics()
    img = Image.new("RGBA", (total, asc+desc+60), (0,0,0,0))
    d = ImageDraw.Draw(img)
    x = 30
    for ch, w in zip(text, widths):
        col = GOLD if (period_gold and ch == ".") else color
        if shadow:
            d.text((x+2, 32), ch, font=font, fill=(0,0,0,120))
        d.text((x, 30), ch, font=font, fill=col+(255,))
        x += w + tracking
    return img

def paste_center(base, layer, cx, cy, alpha=1.0, scale=1.0, rot=0.0):
    if alpha <= 0: return
    l = layer
    if abs(rot) > 0.05:
        l = l.rotate(rot, resample=Image.BICUBIC, expand=True)
    if scale != 1.0:
        l = l.resize((max(1,int(l.width*scale)), max(1,int(l.height*scale))), Image.LANCZOS)
    if alpha < 1.0:
        a = l.getchannel("A").point(lambda p: int(p*alpha))
        l = l.copy(); l.putalpha(a)
    base.alpha_composite(l, (int(cx-l.width/2), int(cy-l.height/2)))

def reveal(base, layer, cx, cy, t_on, tsec, hold_to=None):
    """Calm word entrance: rise + fade + tiny settle. Stays once on."""
    if tsec < t_on: return
    k = clamp((tsec-t_on)/0.45, 0, 1)
    a = ease_out_cubic(k)
    if hold_to is not None:
        a *= clamp((hold_to - tsec)/0.25, 0, 1)
    s = 0.965 + 0.035*ease_out_back(k)
    rise = 22*(1-ease_out_cubic(k))
    paste_center(base, layer, cx, cy+rise, alpha=a, scale=s)

# words (serif, big, gold periods)
w_hand   = word("Handcrafted", F_SERIF, 112, 1, INK, shadow=False)
w_berlin = word("in Berlin.", F_SERIF_I, 128, 1, (255,255,255))
w_fresh  = word("Fresh.", F_SERIF, 150, 1, INK, shadow=False, period_gold=False)
w_daily  = word("Daily.", F_SERIF, 150, 1, (255,255,255))
chrome   = word("EISFRED", F_SANS_M, 28, 13, (255,255,255), shadow=True, period_gold=False)
chrome_d = word("EISFRED", F_SANS_M, 28, 13, GOLD_D, shadow=False, period_gold=False)
ec_word  = word("Eisfred", F_SERIF, 175, 2, INK, shadow=False, period_gold=False)
ec_sub   = word("FRIEDRICHSHAINER EISMANUFAKTUR", F_SANS_L, 34, 12, INK, shadow=False, period_gold=False)
ec_url   = word("www.eisfredeismanufaktur.de", F_SANS_R, 38, 3, GOLD_D, shadow=False, period_gold=False)

# end-card logo on cream (multiply)
logo_big = imgs["logo"].resize((440, 440), Image.LANCZOS)
_lb = np.asarray(logo_big).astype(np.float32)/255.0
_cb = np.asarray(Image.new("RGB", logo_big.size, CREAM)).astype(np.float32)/255.0
logo_card = Image.fromarray((_lb*_cb*255).astype(np.uint8)).convert("RGBA")

# ---------- grade ----------
lut_r = np.clip(np.arange(256)*1.030 + 3.0, 0, 255)
lut_g = np.clip(np.arange(256)*1.005 + 1.0, 0, 255)
lut_b = np.clip(np.arange(256)*0.972, 0, 255)
xs = np.arange(256)/255.0
scurve = np.clip((xs + 0.055*np.sin((xs-0.5)*math.pi))*255, 0, 255)
LUT_R = scurve[lut_r.astype(np.uint8)].astype(np.uint8)
LUT_G = scurve[lut_g.astype(np.uint8)].astype(np.uint8)
LUT_B = scurve[lut_b.astype(np.uint8)].astype(np.uint8)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
r = np.sqrt(((xx-W/2)/(W/2))**2 + ((yy-H/2)/(H/2))**2)
VIGNETTE = (1.0 - 0.10*np.clip(r-0.55, 0, 1)**1.8).astype(np.float32)[..., None]
rng = np.random.default_rng(7)

def grade(fr, vignette=True, grain=1.9, sat=1.06):
    a = np.asarray(fr, dtype=np.uint8)
    a = np.stack([LUT_R[a[...,0]], LUT_G[a[...,1]], LUT_B[a[...,2]]], axis=-1).astype(np.float32)
    if sat != 1.0:
        luma = (0.299*a[...,0]+0.587*a[...,1]+0.114*a[...,2])[...,None]
        a = luma + (a-luma)*sat
    if vignette: a *= VIGNETTE
    if grain > 0: a += rng.normal(0, grain, (H, W, 1)).astype(np.float32)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

def zoom_blur(fr, amount):
    if amount <= 0: return fr
    out = fr.copy()
    for i in range(1, 5):
        s = 1.0 + amount*i/4
        z = fr.resize((int(W*s), int(H*s)), Image.BILINEAR)
        z = z.crop(((z.width-W)//2, (z.height-H)//2, (z.width-W)//2+W, (z.height-H)//2+H))
        out = Image.blend(out, z, 0.35)
    return out

def scrim(fr, cx, cy, rad=430, dark=0.30):
    """Soft local darkening behind white text."""
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    d.ellipse((cx-rad, cy-rad*0.62, cx+rad, cy+rad*0.62), fill=int(255*dark))
    m = m.filter(ImageFilter.GaussianBlur(90))
    black = Image.new("RGBA", (W, H), (10, 8, 6, 255))
    black.putalpha(m)
    out = fr.convert("RGBA")
    out.alpha_composite(black)
    return out

# ---------- scoop framing (editorial cream matte) ----------
SCOOP_BOX = (10, 230, 600, 890)
scoop_im = imgs["scoop"].crop(SCOOP_BOX)

def framed_scoop(t01, z0, z1, c0, c1, ease, disp_w=930):
    e = ease(t01)
    z = lerp(z0, z1, e)
    cx, cy = lerp(c0[0], c1[0], e), lerp(c0[1], c1[1], e)
    aspect = scoop_im.height/scoop_im.width
    dw, dh = disp_w, int(disp_w*aspect)
    photo = kb_frame(scoop_im, scoop_im.width, scoop_im.height, cx, cy, z, dw, dh, sharpen=0.9)
    canvas = Image.new("RGBA", (W, H), CREAM+(255,))
    sh = Image.new("RGBA", (W, H), (0,0,0,0))
    d = ImageDraw.Draw(sh)
    px, py = (W-dw)//2, (H-dh)//2
    d.rectangle((px+10, py+16, px+dw+10, py+dh+16), fill=(60,48,30,60))
    sh = sh.filter(ImageFilter.GaussianBlur(18))
    canvas = Image.alpha_composite(canvas, sh)
    canvas.paste(photo, (px, py))
    return canvas, py, dh

FS = {"storefront": (648, 1152), "interior": (648, 1152), "kiosk": (814, 1448), "street": (814, 1448)}

def fullshot(src, t01, z0, z1, c0, c1, ease=ease_io_sine, sharpen=0.7):
    im = imgs[src]; bw, bh = FS[src]
    e = ease(t01)
    return kb_frame(im, bw, bh, lerp(c0[0],c1[0],e), lerp(c0[1],c1[1],e), lerp(z0,z1,e), W, H, sharpen=sharpen)

# ---------- the six scenes (2.5s each; every photo once) ----------
def shot(idx, t01):
    tsec = (idx-1)*2.5 + t01*2.5

    if idx == 1:  # interior — "Handcrafted" (ink on the cream wall)
        fr = fullshot("interior", t01, 1.06, 1.17, (640, 510), (665, 520))
        fr = grade(fr).convert("RGBA")
        paste_center(fr, chrome_d, W/2, 130, alpha=clamp(tsec/0.4, 0, 1))
        reveal(fr, w_hand, W/2, H*0.30, 0.55, tsec)
        return fr

    if idx == 2:  # street — "in Berlin." (white over the pavement)
        fr = fullshot("street", t01, 1.02, 1.14, (543, 730), (543, 650))
        fr = grade(fr).convert("RGBA")
        fr = scrim(fr, W/2, H*0.78, rad=430, dark=0.34)
        paste_center(fr, chrome, W/2, 130)
        reveal(fr, w_berlin, W/2, H*0.78, 2.75, tsec)
        return fr

    if idx == 3:  # kiosk — "Fresh." (ink on the yellow awning)
        fr = fullshot("kiosk", t01, 1.04, 1.16, (543, 700), (543, 660))
        fr = grade(fr).convert("RGBA")
        paste_center(fr, chrome, W/2, H-110)
        reveal(fr, w_fresh, W/2, H*0.155, 5.25, tsec)
        return fr

    if idx == 4:  # storefront — "Daily." (white by the entrance)
        fr = fullshot("storefront", t01, 1.22, 1.34, (1000, 590), (1040, 610))
        fr = grade(fr).convert("RGBA")
        fr = scrim(fr, W/2, H*0.62, rad=400, dark=0.32)
        paste_center(fr, chrome, W/2, 130)
        reveal(fr, w_daily, W/2, H*0.62, 7.75, tsec)
        return fr

    if idx == 5:  # scoop — the product, no words
        canvas, py, dh = framed_scoop(t01, 1.02, 1.13, (296, 340), (300, 326), ease_io_sine)
        fr = grade(canvas.convert("RGB"), vignette=False, grain=1.5).convert("RGBA")
        paste_center(fr, chrome_d, W/2, py-80, alpha=clamp((tsec-10.2)/0.4, 0, 1))
        return fr

    # idx 6: brand card
    t = t01
    fr = Image.new("RGBA", (W, H), CREAM+(255,))
    kL = clamp(t*2.5/0.5, 0, 1)
    sL = 0.7 + 0.3*ease_out_back(kL)
    rL = 6*(1-ease_out_cubic(kL))
    a_word = ease_out_cubic(clamp((t*2.5-0.30)/0.5, 0, 1))
    a_sub  = ease_out_cubic(clamp((t*2.5-0.52)/0.5, 0, 1))
    a_url  = ease_out_cubic(clamp((t*2.5-0.78)/0.5, 0, 1))
    rise = 16*(1-a_word)
    paste_center(fr, logo_card, W/2, 680, alpha=ease_out_cubic(kL), scale=sL, rot=rL)
    paste_center(fr, ec_word, W/2, 1010+rise, alpha=a_word)
    paste_center(fr, ec_sub, W/2, 1130+rise, alpha=a_sub)
    if a_sub > 0:
        d = ImageDraw.Draw(fr)
        lw = int(150*a_sub)
        d.line((W/2-lw, 1212, W/2+lw, 1212), fill=GOLD+(int(200*a_sub),), width=3)
    paste_center(fr, ec_url, W/2, 1288+rise, alpha=a_url)
    return grade(fr.convert("RGB"), vignette=False, grain=1.1, sat=1.0).convert("RGBA")

BOUNDS = [(i, (i-1)*75, i*75) for i in range(1, 7)]

def shot_at(f):
    for idx, a, b in BOUNDS:
        if a <= f < b:
            return idx, (f-a)/(b-a-1)
    return 6, 1.0

def render_frame(f):
    idx, t01 = shot_at(f)
    fr = shot(idx, t01)

    # flash-frame into the product reveal (frames 298..304)
    if 298 <= f < 304:
        base = fr.convert("RGB")
        w = 0.45*(f-297)/2.0 if f < 300 else max(0.0, 0.80-0.28*(f-300))
        flash = Image.new("RGB", (W, H), (255, 248, 236))
        fr = Image.blend(base, flash, clamp(w, 0, 1)).convert("RGBA")
        if f >= 300:
            fr = zoom_blur(fr.convert("RGB"), 0.012).convert("RGBA")

    # gentle dissolve into brand card (frames 371..381)
    if 371 <= f < 381:
        k = (f-371)/10.0
        if f < 375:
            fr = zoom_blur(fr.convert("RGB"), 0.012*k).convert("RGBA")
        else:
            prev = zoom_blur(shot(5, 1.0).convert("RGB"), 0.018)
            fr = Image.blend(prev, fr.convert("RGB"),
                             ease_io_sine(clamp((k-0.4)/0.6, 0, 1))).convert("RGBA")
    return fr.convert("RGB")

def main():
    out = sys.argv[1]
    proc = subprocess.Popen([
        "ffmpeg","-y","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}",
        "-r",str(FPS),"-i","-","-c:v","libx264","-preset","slow","-crf","17",
        "-pix_fmt","yuv420p","-movflags","+faststart",out
    ], stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    for f in range(N):
        proc.stdin.write(render_frame(f).tobytes())
        if f % 45 == 0: print(f"frame {f}/{N}", flush=True)
    proc.stdin.close(); proc.wait()
    print("video done:", out)

if __name__ == "__main__":
    main()
