#!/usr/bin/env python3
"""
Eisfred Friedrichshainer Eismanufaktur — 15s Instagram Reel, v2 "fun cut"
1080x1920 @ 30fps, 120 BPM grid. 14 shots from the 5 real photos + real logo.
Punch-ins, whip-pans, match cut, flash frame, kinetic type, sticker badge.
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
F_SERIF  = "/usr/share/fonts/opentype/ebgaramond/EBGaramond12-Regular.otf"
F_SANS_L = "/usr/share/fonts/opentype/montserrat/Montserrat-Light.otf"
F_SANS_M = "/usr/share/fonts/opentype/montserrat/Montserrat-Medium.otf"
F_SANS_R = "/usr/share/fonts/opentype/montserrat/Montserrat-Regular.otf"
F_SANS_SB= "/usr/share/fonts/opentype/montserrat/Montserrat-SemiBold.otf"

CREAM = (247, 243, 236)
INK   = (43, 38, 32)
GOLD  = (196, 154, 62)
GOLD_D= (150, 132, 96)

imgs = {k: Image.open(v).convert("RGB") for k, v in SRC.items()}

# ---------------- easing ----------------
def ease_io_sine(t):  return 0.5 - 0.5*math.cos(math.pi*t)
def ease_io_cubic(t): return 4*t*t*t if t < .5 else 1-((-2*t+2)**3)/2
def ease_out_quint(t):return 1-(1-t)**5
def ease_in_cubic(t): return t*t*t
def ease_out_cubic(t):return 1-(1-t)**3
def ease_out_back(t):
    c1, c3 = 1.70158, 2.70158
    return 1 + c3*(t-1)**3 + c1*(t-1)**2
def clamp(v,a,b): return max(a,min(b,v))
def lerp(a,b,t):  return a+(b-a)*t

# ---------------- camera ----------------
def kb_frame(im, base_w, base_h, cx, cy, z, out_w, out_h, sharpen=0.0, rot=0.0):
    cw, ch = base_w/z, base_h/z
    if abs(rot) > 0.05:
        ov = min(1.06, im.width/cw, im.height/ch)  # overscan for rotation, clamped to source
        cw2, ch2 = cw*ov, ch*ov
    else:
        cw2, ch2 = cw, ch
    cx = clamp(cx, cw2/2, im.width - cw2/2)
    cy = clamp(cy, ch2/2, im.height - ch2/2)
    box = (cx-cw2/2, cy-ch2/2, cx+cw2/2, cy+ch2/2)
    ow2 = int(out_w*1.06) if abs(rot) > 0.05 else out_w
    oh2 = int(out_h*1.06) if abs(rot) > 0.05 else out_h
    fr = im.resize((ow2, oh2), Image.LANCZOS, box=box)
    if abs(rot) > 0.05:
        fr = fr.rotate(rot, resample=Image.BILINEAR, center=(ow2/2, oh2/2))
        fr = fr.crop(((ow2-out_w)//2, (oh2-out_h)//2,
                      (ow2-out_w)//2+out_w, (oh2-out_h)//2+out_h))
    if sharpen > 0:
        fr = fr.filter(ImageFilter.UnsharpMask(radius=1.6, percent=int(60*sharpen), threshold=2))
    return fr

# ---------------- typography ----------------
def caption(text, font_path, size, tracking, color, shadow=True):
    font = ImageFont.truetype(font_path, size)
    widths = [font.getlength(ch) for ch in text]
    total = int(sum(widths) + tracking*(len(text)-1)) + 60
    asc, desc = font.getmetrics()
    h = asc + desc + 60
    img = Image.new("RGBA", (total, h), (0,0,0,0))
    d = ImageDraw.Draw(img)
    x = 30
    for ch, w in zip(text, widths):
        if shadow:
            d.text((x+2, 32), ch, font=font, fill=(0,0,0,120))
        d.text((x, 30), ch, font=font, fill=color+(255,))
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

def pop(base, layer, cx, cy, t_on, t_off, tsec, rot=0.0):
    """Pop-in with overshoot, quick fade out near t_off."""
    if tsec < t_on or tsec > t_off: return
    k = clamp((tsec - t_on)/0.30, 0, 1)
    s = 0.75 + 0.25*ease_out_back(k)
    a = ease_out_cubic(clamp(k*1.6, 0, 1)) * clamp((t_off - tsec)/0.22, 0, 1)
    paste_center(base, layer, cx, cy, alpha=a, scale=s, rot=rot)

cap_brand   = caption("EISFRED", F_SANS_M, 30, 14, GOLD_D, shadow=False)
cap_welcome = caption("HERZLICH WILLKOMMEN", F_SANS_L, 36, 12, INK, shadow=False)
cap_fresh1  = caption("Fresh.", F_SERIF, 150, 2, (255,255,255))
cap_fresh2  = caption("Daily.", F_SERIF, 150, 2, (255,255,255))
cap_hand    = caption("Handcrafted in Berlin", F_SERIF, 78, 1, INK, shadow=False)
cap_hand2   = caption("TÄGLICH FRISCH AUS UNSERER BERLINER MANUFAKTUR", F_SANS_L, 24, 7, GOLD_D, shadow=False)
ec_word     = caption("Eisfred", F_SERIF, 175, 2, INK, shadow=False)
ec_sub      = caption("FRIEDRICHSHAINER EISMANUFAKTUR", F_SANS_L, 34, 12, INK, shadow=False)
ec_url      = caption("www.eisfredeismanufaktur.de", F_SANS_R, 38, 3, GOLD_D, shadow=False)

# ---------------- logo assets ----------------
logo_big = imgs["logo"].resize((440, 440), Image.LANCZOS)
_lb = np.asarray(logo_big).astype(np.float32)/255.0
_cb = np.asarray(Image.new("RGB", logo_big.size, CREAM)).astype(np.float32)/255.0
logo_card = Image.fromarray((_lb*_cb*255).astype(np.uint8)).convert("RGBA")

# sticker badge: logo on a small cream disc with soft shadow
def make_badge(sz=170):
    inner = imgs["logo"].resize((sz-24, sz-24), Image.LANCZOS)
    ib = np.asarray(inner).astype(np.float32)/255.0
    cb = np.asarray(Image.new("RGB", inner.size, CREAM)).astype(np.float32)/255.0
    inner = Image.fromarray((ib*cb*255).astype(np.uint8))
    badge = Image.new("RGBA", (sz+30, sz+30), (0,0,0,0))
    d = ImageDraw.Draw(badge)
    d.ellipse((18, 22, sz+14, sz+18), fill=(50,40,25,70))
    badge = badge.filter(ImageFilter.GaussianBlur(6))
    d = ImageDraw.Draw(badge)
    d.ellipse((15, 15, sz+15, sz+15), fill=CREAM+(255,))
    mask = Image.new("L", inner.size, 0)
    ImageDraw.Draw(mask).ellipse((0,0,inner.width,inner.height), fill=255)
    badge.paste(inner, (27, 27), mask)
    return badge
badge = make_badge()

# ---------------- grade ----------------
lut_r = np.clip(np.arange(256)*1.032 + 3.0, 0, 255)
lut_g = np.clip(np.arange(256)*1.006 + 1.0, 0, 255)
lut_b = np.clip(np.arange(256)*0.970, 0, 255)
xs = np.arange(256)/255.0
scurve = np.clip((xs + 0.06*np.sin((xs-0.5)*math.pi))*255, 0, 255)
LUT_R = scurve[lut_r.astype(np.uint8)].astype(np.uint8)
LUT_G = scurve[lut_g.astype(np.uint8)].astype(np.uint8)
LUT_B = scurve[lut_b.astype(np.uint8)].astype(np.uint8)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
r = np.sqrt(((xx-W/2)/(W/2))**2 + ((yy-H/2)/(H/2))**2)
VIGNETTE = (1.0 - 0.10*np.clip(r-0.55, 0, 1)**1.8).astype(np.float32)[..., None]
rng = np.random.default_rng(7)

def grade(fr, vignette=True, grain=2.0, sat=1.07):
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

def whip(fr, dx):
    """Horizontal smear for whip-pan feel."""
    if abs(dx) < 1: return fr
    a = fr.filter(ImageFilter.GaussianBlur(0))
    steps, out = 5, fr.copy()
    for i in range(1, steps+1):
        sh = Image.new("RGB", (W, H))
        off = int(dx*i/steps)
        sh.paste(fr, (off, 0)); sh.paste(fr, (off - int(math.copysign(W, dx)), 0))
        out = Image.blend(out, sh, 0.30)
    return out.filter(ImageFilter.BoxBlur(abs(dx)//14))

def post_scale(fr, s):
    if abs(s-1.0) < 1e-4: return fr
    z = fr.resize((int(W*s), int(H*s)), Image.BILINEAR)
    return z.crop(((z.width-W)//2, (z.height-H)//2, (z.width-W)//2+W, (z.height-H)//2+H))

# ---------------- scoop framing ----------------
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

# ---------------- shot table ----------------
# (frames on the 120 BPM grid) 0,60,90,120,150,165,195,210,225,255,285,315,330,375,450
FS = {"storefront": (648, 1152), "interior": (648, 1152), "kiosk": (814, 1448), "street": (814, 1448)}

def fullshot(src, t01, z0, z1, c0, c1, ease=ease_io_sine, sharpen=0.7, rot0=0.0, rot1=0.0):
    im = imgs[src]; bw, bh = FS[src]
    e = ease(t01)
    return kb_frame(im, bw, bh, lerp(c0[0],c1[0],e), lerp(c0[1],c1[1],e),
                    lerp(z0,z1,e), W, H, sharpen=sharpen, rot=lerp(rot0,rot1,e))

def shot(idx, t01):
    tsec_map = {1:(0.0,2.0),2:(2.0,3.0),3:(3.0,4.0),4:(4.0,5.0),5:(5.0,5.5),
                6:(5.5,6.5),7:(6.5,7.0),8:(7.0,7.5),9:(7.5,8.5),10:(8.5,9.5),
                11:(9.5,10.5),12:(10.5,11.0),13:(11.0,12.5),14:(12.5,15.0)}
    a, b = tsec_map[idx]; tsec = a + t01*(b-a)

    if idx == 1:   # scoop hero, framed, slow push + welcome line
        canvas, py, dh = framed_scoop(t01, 1.0, 1.10, (295, 342), (300, 326), ease_io_sine)
        fr = grade(canvas.convert("RGB"), vignette=False, grain=1.6).convert("RGBA")
        a1 = clamp((tsec-0.25)/0.4, 0, 1)
        paste_center(fr, cap_brand, W/2, py-80, alpha=a1)
        pop(fr, cap_welcome, W/2, py+dh+92, 0.55, 1.95, tsec)
        return fr

    if idx == 2:   # storefront awning stripes, energetic pan
        fr = fullshot("storefront", t01, 1.42, 1.50, (430, 400), (980, 380),
                      ease=ease_io_cubic, rot0=-1.0, rot1=0.5)
        return grade(fr).convert("RGBA")

    if idx == 3:   # MATCH CUT -> yellow kiosk awning settles wide
        fr = fullshot("kiosk", t01, 1.45, 1.06, (543, 440), (543, 715), ease=ease_out_quint)
        return grade(fr).convert("RGBA")

    if idx == 4:   # kiosk counter punch-in
        fr = fullshot("kiosk", t01, 1.55, 1.72, (520, 800), (540, 810),
                      ease=ease_io_sine, sharpen=0.9, rot0=0.8, rot1=-0.4)
        return grade(fr).convert("RGBA")

    if idx == 5:   # storefront entrance, quick beat
        fr = fullshot("storefront", t01, 1.22, 1.30, (1010, 620), (1035, 640),
                      ease=ease_out_cubic, sharpen=0.8)
        return grade(fr).convert("RGBA")

    if idx == 6:   # interior wide push w/ drift
        fr = fullshot("interior", t01, 1.07, 1.20, (660, 605), (905, 585),
                      rot0=-0.8, rot1=0.4)
        fr = grade(fr).convert("RGBA")
        k = clamp((tsec-5.7)/0.3, 0, 1)
        paste_center(fr, badge, W-150, H-190, alpha=ease_out_cubic(k),
                     scale=0.8+0.2*ease_out_back(k), rot=3*math.sin(tsec*1.8))
        return fr

    if idx == 7:   # cones detail
        fr = fullshot("interior", t01, 1.48, 1.60, (350, 630), (335, 615),
                      ease=ease_out_cubic, sharpen=1.0)
        fr = grade(fr).convert("RGBA")
        paste_center(fr, badge, W-150, H-190, alpha=1.0, rot=3*math.sin(tsec*1.8))
        return fr

    if idx == 8:   # espresso machine detail
        fr = fullshot("interior", t01, 1.55, 1.66, (1000, 690), (1015, 700),
                      ease=ease_out_cubic, sharpen=1.0, rot0=-0.6, rot1=0.4)
        fr = grade(fr).convert("RGBA")
        paste_center(fr, badge, W-150, H-190, alpha=1.0, rot=3*math.sin(tsec*1.8))
        return fr

    if idx == 9:   # menu board + kinetic "Fresh." "Daily."
        fr = fullshot("interior", t01, 1.28, 1.40, (1060, 500), (1080, 480),
                      ease=ease_io_sine, sharpen=0.8)
        fr = grade(fr).convert("RGBA")
        pop(fr, cap_fresh1, W/2 - 130, H*0.70, 7.55, 8.55, tsec, rot=-2)
        pop(fr, cap_fresh2, W/2 + 150, H*0.70 + 150, 7.95, 8.55, tsec, rot=1.5)
        paste_center(fr, badge, W-150, H-190, alpha=1.0, rot=3*math.sin(tsec*1.8))
        return fr

    if idx == 10:  # street wide push
        fr = fullshot("street", t01, 1.0, 1.12, (543, 730), (543, 640))
        fr = grade(fr).convert("RGBA")
        paste_center(fr, badge, W-150, H-190, alpha=1.0, rot=3*math.sin(tsec*1.8))
        return fr

    if idx == 11:  # table & mint chair punch-in w/ rotation settle
        fr = fullshot("street", t01, 1.5, 1.62, (420, 990), (430, 1010),
                      ease=ease_out_cubic, sharpen=0.9, rot0=2.0, rot1=0.0)
        fr = grade(fr).convert("RGBA")
        k = 1.0 - clamp((tsec-10.2)/0.3, 0, 1)
        paste_center(fr, badge, W-150, H-190, alpha=k, rot=3*math.sin(tsec*1.8))
        return fr

    if idx == 12:  # flash -> scoop tight
        canvas, py, dh = framed_scoop(t01, 1.30, 1.42, (322, 352), (326, 362), ease_out_cubic)
        return grade(canvas.convert("RGB"), vignette=False, grain=1.8).convert("RGBA")

    if idx == 13:  # scoop hero return + Handcrafted in Berlin
        canvas, py, dh = framed_scoop(t01, 1.06, 1.14, (298, 336), (300, 328), ease_io_sine)
        fr = grade(canvas.convert("RGB"), vignette=False, grain=1.6).convert("RGBA")
        pop(fr, cap_hand, W/2, py+dh+86, 11.25, 12.55, tsec)
        pop(fr, cap_hand2, W/2, py+dh+156, 11.45, 12.55, tsec)
        return fr

    # idx 14: end card
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

BOUNDS = [(1,0,60),(2,60,90),(3,90,120),(4,120,150),(5,150,165),(6,165,195),
          (7,195,210),(8,210,225),(9,225,255),(10,255,285),(11,285,315),
          (12,315,330),(13,330,375),(14,375,450)]

def shot_at(f):
    for idx,a,b in BOUNDS:
        if a <= f < b:
            return idx, (f-a)/(b-a-1) if b-a > 1 else 0.0
    return 14, 1.0

def render_frame(f):
    idx, t01 = shot_at(f)
    fr = shot(idx, t01)

    # T1 S1->S2 cross-zoom (55..65)
    if 55 <= f < 60:
        k = (f-55)/10.0
        fr = post_scale(fr.convert("RGB"), 1.0+0.10*ease_in_cubic(k*2)).convert("RGBA")
        fr = zoom_blur(fr.convert("RGB"), 0.02*k*2).convert("RGBA")
    if 60 <= f < 65:
        k = (f-55)/10.0
        prev = post_scale(shot(1, 1.0).convert("RGB"), 1.10)
        cur = post_scale(fr.convert("RGB"), lerp(1.10, 1.0, ease_out_cubic((k-0.5)*2)))
        cur = zoom_blur(cur, 0.02*(1-(k-0.5)*2))
        fr = Image.blend(prev, cur, clamp((k-0.5)*2*1.7, 0, 1)).convert("RGBA")

    # whip S4->S5 (147..153) rightward
    if 147 <= f < 150:
        fr = whip(fr.convert("RGB"), -34*(f-146)).convert("RGBA")
    if 150 <= f < 153:
        fr = whip(fr.convert("RGB"), 34*(153-f)).convert("RGBA")
    # whip S5->S6 (162..168) leftward
    if 162 <= f < 165:
        fr = whip(fr.convert("RGB"), 30*(f-161)).convert("RGBA")
    if 165 <= f < 168:
        fr = whip(fr.convert("RGB"), -30*(168-f)).convert("RGBA")

    # flash into S12 (313..318)
    if 313 <= f < 318:
        base = fr.convert("RGB")
        w = 0.5*(f-312)/2.0 if f < 315 else max(0.0, 0.85-0.30*(f-315))
        flash = Image.new("RGB", (W, H), (255, 248, 236))
        fr = Image.blend(base, flash, clamp(w, 0, 1)).convert("RGBA")
        if f >= 315:
            fr = zoom_blur(fr.convert("RGB"), 0.015).convert("RGBA")

    # dissolve S13->S14 (371..381)
    if 371 <= f < 381:
        k = (f-371)/10.0
        if f < 375:
            fr = zoom_blur(fr.convert("RGB"), 0.015*k).convert("RGBA")
        else:
            prev = zoom_blur(shot(13, 1.0).convert("RGB"), 0.02)
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
