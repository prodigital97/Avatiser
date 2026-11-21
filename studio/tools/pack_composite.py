"""studio/tools/pack_composite.py — label-lock paste-back (beauty-campaign-director §7.4).

Paste the label-locked bottle from a Nano Banana edit back into the Seedream original.

usage: composite.py ORIGINAL LOCKED OUT [x0 y0 x1 y1]
  LOCKED is resized to ORIGINAL's size (or, with a box, into that box of ORIGINAL).
  Only the bottle (yellow label + orange plastic, dilated) is pasted, with a feathered
  edge, after matching the locked patch's per-channel mean/std to the original's.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

orig = Image.open(sys.argv[1]).convert("RGB")
lock = Image.open(sys.argv[2]).convert("RGB")
out = sys.argv[3]
if len(sys.argv) == 8:
    box = tuple(int(v) for v in sys.argv[4:8])
else:
    box = (0, 0, orig.width, orig.height)

region = orig.crop(box)
lock = lock.resize(region.size, Image.LANCZOS)
o = np.asarray(region).astype(np.float32)
l = np.asarray(lock).astype(np.float32)


def bottle_mask(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # yellow label and orange translucent plastic: strongly warm, low blue
    return (r > 170) & (r - b > 110) & (g > 60)


m = bottle_mask(o) | bottle_mask(l)
ys, xs = np.where(m)
# keep the largest dense blob: bounding box of the 1st-99th percentile
y0, y1 = np.percentile(ys, [0.5, 99.5]).astype(int)
x0, x1 = np.percentile(xs, [0.5, 99.5]).astype(int)
mask = np.zeros(m.shape, np.uint8)
mask[y0:y1, x0:x1] = m[y0:y1, x0:x1]
mimg = Image.fromarray(mask * 255).filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.GaussianBlur(6))
alpha = np.asarray(mimg).astype(np.float32)[..., None] / 255.0

# colour-match the locked patch to the original inside the mask
sel = alpha[..., 0] > 0.5
for c in range(3):
    lo, oo = l[..., c][sel], o[..., c][sel]
    l[..., c] = (l[..., c] - lo.mean()) / (lo.std() + 1e-6) * oo.std() + oo.mean()
l = np.clip(l, 0, 255)

blend = o * (1 - alpha) + l * alpha
res = orig.copy()
res.paste(Image.fromarray(blend.astype(np.uint8)), box[:2])
res.save(out)
print(out, "bottle box in region:", (x0, y0, x1, y1))
