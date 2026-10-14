"""Build the web images, logo and favicon set for the Heidi Booysen Riding School site.

Sources (kept locally, not committed):
  research/fb/            photos downloaded from the riding school's Facebook page
  research/gen/           photoreal images generated for the site (Figma AI)
  Landing page.jpeg       desktop hero, supplied by the client
  mobile landing page.jpeg  mobile hero, supplied by the client
  Logo.jpg                the client's logo
  Heidi.jpeg              photo of Heidi, supplied by the client

Run from the project root:  python tools/make-assets.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parent.parent
FB = ROOT / "research" / "fb"
GEN = ROOT / "research" / "gen"
OUT = ROOT / "assets" / "img"
OUT.mkdir(parents=True, exist_ok=True)

STABLE = (20, 26, 21)


def save_webp(img, name, quality=80):
    img.convert("RGB").save(OUT / f"{name}.webp", "WEBP", quality=quality, method=6)


def fit(img, width):
    """Scale down to a width, never up."""
    if img.width <= width:
        return img
    return img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)


def ratio_crop(img, ratio, fx=0.5, fy=0.5):
    """Crop to width/height = ratio around a focal point (fractions of the free space)."""
    w, h = img.size
    if w / h > ratio:
        nw = round(h * ratio)
        left = round((w - nw) * fx)
        return img.crop((left, 0, left + nw, h))
    nh = round(w / ratio)
    top = round((h - nh) * fy)
    return img.crop((0, top, w, top + nh))


def fb(n):
    return ImageOps.exif_transpose(Image.open(FB / f"hbfb-g{n:02d}.jpg")).convert("RGB")


def gen(name):
    return Image.open(GEN / f"{name}.png").convert("RGB")




def blank_plaques(img, boxes):
    """The artwork's stall plaques name another estate; soften the lettering to plain plaques."""
    from PIL import ImageFilter
    img = img.convert("RGB")
    for x0, y0, x1, y1 in boxes:
        pad = 8
        region = img.crop((x0 - pad, y0 - pad, x1 + pad, y1 + pad)).filter(ImageFilter.GaussianBlur(7))
        img.paste(region.crop((pad, pad, pad + x1 - x0, pad + y1 - y0)), (x0, y0))
    return img


# Hero: the client's stable artwork, desktop and mobile.
desktop = blank_plaques(Image.open(ROOT / "Landing page.jpeg"), [(1223, 196, 1296, 234), (1028, 661, 1106, 712)])
mobile = blank_plaques(Image.open(ROOT / "mobile landing page.jpeg"), [(632, 919, 684, 959), (757, 541, 768, 571)])
save_webp(desktop, "hero-desktop", 84)
save_webp(mobile, "hero-mobile", 82)

# Real photos from the Facebook page.
heidi = ImageOps.exif_transpose(Image.open(ROOT / "Heidi.jpeg")).convert("RGB")
save_webp(fit(ratio_crop(heidi, 4 / 5, fy=0.2), 900), "heidi", 82)
ben_flicka = fb(0)
save_webp(fit(ratio_crop(ben_flicka.crop((0, 0, 640, 770)), 4 / 5, fx=0.4, fy=0), 640), "ben", 82)
save_webp(fit(ratio_crop(ben_flicka.crop((640, 0, 1536, 770)), 4 / 5, fx=0.15, fy=0), 640), "flicka", 82)
save_webp(fit(fb(3), 1200), "stable", 80)
save_webp(fit(fb(5), 1400), "arena", 78)
save_webp(fit(fb(4), 1200), "fields", 78)
save_webp(fit(fb(15), 1000), "little-hands", 80)
save_webp(fit(fb(8), 900), "ben-rearing", 80)
save_webp(fit(fb(13), 900), "bay", 80)
save_webp(fit(fb(17), 1400), "paddock", 80)
save_webp(fit(fb(21), 900), "pony", 80)
save_webp(fit(fb(22), 900), "stable-night", 80)

# Real lesson photos, cut from the photo strip on the trial-session flyer.
trial = fb(20)
save_webp(trial.crop((632, 502, 963, 746)), "lesson-groundwork", 84)
save_webp(trial.crop((612, 788, 952, 1004)), "lesson-cones", 84)
save_webp(trial.crop((586, 1036, 928, 1238)), "lesson-arena", 84)

# Generated photoreal images.
save_webp(fit(gen("outride"), 1600), "outride", 80)
save_webp(fit(gen("little-rider"), 900), "little-rider", 80)
save_webp(fit(gen("therapy"), 1200), "therapy", 80)
save_webp(fit(gen("canter"), 1400), "canter", 80)
save_webp(fit(gen("treats"), 900), "treats", 82)

# Logo: the artwork sits on black, which the CSS screens out on the dark page.
logo = Image.open(ROOT / "Logo.jpg").convert("RGB")
logo = logo.crop((4, 6, logo.width - 4, logo.height - 8))  # trim the thin white border on the source
# Crush the near-black background to true black so CSS screen blending hides it completely.
logo = logo.point(lambda v: 0 if v < 26 else round((v - 26) * 255 / 229))


def unscreen(img):
    """Turn black into transparency: alpha = brightest channel, colour un-premultiplied.
    Composited normally, this matches a screen blend over any background."""
    import numpy as np
    a = np.asarray(img.convert("RGB"), dtype=np.float32) / 255
    alpha = a.max(axis=2, keepdims=True)
    rgb = np.where(alpha > 0, a / np.maximum(alpha, 1e-6), 0)
    out = np.concatenate([rgb, alpha], axis=2)
    return Image.fromarray((out * 255 + .5).clip(0, 255).astype("uint8"), "RGBA")


clear = unscreen(logo)
clear.save(OUT / "logo.webp", "WEBP", quality=90, method=6)
fit(clear, 360).save(OUT / "logo-sm.webp", "WEBP", quality=90, method=6)
clear.save(ROOT / "tools" / "logo-clear.png", optimize=True)

# Emblem (horse and rider in the sunset ring) for favicons and the app icon.
emblem = logo.crop((314, 2, 574, 262))


def icon(px, pad=0.0):
    s = 1024
    im = Image.new("RGB", (s, s), STABLE)
    inner = round(s * (1 - 2 * pad))
    art = emblem.resize((inner, inner), Image.LANCZOS)
    mask = Image.new("L", (inner * 2, inner * 2), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, inner * 2 - 1, inner * 2 - 1), fill=255)
    mask = mask.resize((inner, inner), Image.LANCZOS)
    off = (s - inner) // 2
    im.paste(art, (off, off), mask)
    return im.resize((px, px), Image.LANCZOS)


for px, name, pad in [(16, "favicon-16.png", 0), (32, "favicon-32.png", 0),
                      (180, "apple-touch-icon.png", 0.06), (192, "icon-192.png", 0.06),
                      (512, "icon-512.png", 0.1)]:
    icon(px, pad).save(ROOT / name, optimize=True)
icon(48).save(ROOT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

print("assets written to", OUT)
