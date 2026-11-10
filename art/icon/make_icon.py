import os, math, random, numpy as np
from PIL import Image, ImageDraw, ImageFilter
R = os.path.expanduser("~/mnt/letsraffle-web/art/renders/icon_santa_12.png")
OUT = os.path.expanduser("~/mnt/letsraffle-web/art/icon")
S = 1024
yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
# cranberry radial background, lighter top-center
d = np.sqrt(((xx - S * 0.5) / S) ** 2 + ((yy - S * 0.36) / S) ** 2) / 0.72
d = np.clip(d, 0, 1)[..., None]
c0, c1, c2 = np.array([0xD0, 0x2B, 0x31]), np.array([0xA3, 0x17, 0x1C]), np.array([0x5E, 0x0A, 0x0F])
col = np.where(d < 0.5, c0 + (c1 - c0) * (d / 0.5), c1 + (c2 - c1) * ((d - 0.5) / 0.5))
bg = Image.fromarray(col.astype(np.uint8), "RGB").convert("RGBA")
# soft gold glow behind the head
glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
g = ImageDraw.Draw(glow)
g.ellipse((S * 0.16, S * 0.12, S * 0.84, S * 0.8), fill=(246, 217, 138, 110))
glow = glow.filter(ImageFilter.GaussianBlur(110))
bg.alpha_composite(glow)
# snow
rnd = random.Random(7)
snow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
sd = ImageDraw.Draw(snow)
for _ in range(26):
    x, y, r = rnd.uniform(40, S - 40), rnd.uniform(30, S * 0.62), rnd.uniform(5, 11)
    sd.ellipse((x - r, y - r, x + r, y + r), fill=(255, 251, 245, rnd.randint(120, 210)))
bg.alpha_composite(snow.filter(ImageFilter.GaussianBlur(1.2)))
# Santa bust, bottom aligned
santa = Image.open(R).convert("RGBA")
santa = santa.crop(santa.getbbox())
scale = S * 0.9 / santa.height
santa = santa.resize((round(santa.width * scale), round(santa.height * scale)), Image.LANCZOS)
x = (S - santa.width) // 2 + 12
y = S - santa.height + 20
shadow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
shadow.paste((60, 0, 5, 120), (x, y + 18), santa.getchannel("A"))
bg.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(18)))
bg.alpha_composite(santa, (x, max(y, 0)) if y >= 0 else (x, 0))
icon = bg.convert("RGB")
icon.save(f"{OUT}/AppIcon-1024.png")
icon.resize((256, 256), Image.LANCZOS).save(f"{OUT}/_preview.png")
print(santa.size, x, y)
