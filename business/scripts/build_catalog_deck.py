#!/usr/bin/env python3
"""Build business/Avatiser_Services_Catalog.pptx from SERVICES_CATALOG.md data.
Dark Avatiser brand deck with real portfolio stills as category illustrations.
Run: python3 business/scripts/build_catalog_deck.py
"""
import os
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
POSTERS = os.path.join(ROOT, 'site/assets/videos')
OUT = os.path.join(ROOT, 'business/Avatiser_Services_Catalog.pptx')

# ── brand palette ──
BLACK   = RGBColor(0x08, 0x08, 0x08)
BLACK2  = RGBColor(0x0F, 0x0F, 0x0F)
BLACK3  = RGBColor(0x16, 0x16, 0x16)
BORDER  = RGBColor(0x24, 0x24, 0x24)
BORDER2 = RGBColor(0x2E, 0x2E, 0x2E)
SILVER  = RGBColor(0xB8, 0xB8, 0xB8)
WHITE   = RGBColor(0xF8, 0xF8, 0xF8)
MUTED   = RGBColor(0x6E, 0x6E, 0x6E)
ACCENT  = RGBColor(0x7F, 0xB8, 0xA4)   # teal — "our price" / positive
WARN    = RGBColor(0xD6, 0x8F, 0x8F)   # dusty red — market price

SW, SH = Inches(13.333), Inches(7.5)   # 16:9

prs = Presentation()
prs.slide_width = SW
prs.slide_height = SH
BLANK = prs.slide_layouts[6]

def slide():
    s = prs.slides.add_slide(BLANK)
    bg = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SW, SH)
    bg.fill.solid(); bg.fill.fore_color.rgb = BLACK
    bg.line.fill.background()
    bg.shadow.inherit = False
    bg._element.spPr.append(_no_outline())
    s.shapes._spTree.remove(bg._element)
    s.shapes._spTree.insert(2, bg._element)
    return s

def _no_outline():
    from pptx.oxml import parse_xml
    return parse_xml('<a:ln xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:noFill/></a:ln>')

def box(s, x, y, w, h, fill=None, line=None, line_w=0.75, radius=None):
    shape_type = MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE
    sh = s.shapes.add_shape(shape_type, x, y, w, h)
    if radius:
        try: sh.adjustments[0] = radius
        except Exception: pass
    if fill is None:
        sh.fill.background()
    else:
        sh.fill.solid(); sh.fill.fore_color.rgb = fill
    if line is None:
        sh.line.fill.background()
    else:
        sh.line.color.rgb = line; sh.line.width = Pt(line_w)
    sh.shadow.inherit = False
    return sh

def text(s, x, y, w, h, txt, size=14, color=WHITE, bold=False, align=PP_ALIGN.LEFT,
         font='Arial', anchor=MSO_ANCHOR.TOP, spacing=None, line_spacing=1.15, wrap=True):
    tb = s.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = wrap
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    lines = txt.split('\n')
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = line_spacing
        r = p.add_run(); r.text = line
        r.font.size = Pt(size); r.font.bold = bold; r.font.name = font
        r.font.color.rgb = color
        if spacing is not None:
            _letter_spacing(r, spacing)
    return tb

def _letter_spacing(run, pts):
    rPr = run._r.get_or_add_rPr()
    rPr.set('spc', str(int(pts * 100)))

def eyebrow(s, txt_, x=Inches(0.6), y=Inches(0.45), color=MUTED):
    text(s, x, y, Inches(8), Inches(0.3), txt_.upper(), size=11, color=color, bold=True, spacing=2.2)

def footer(s, n):
    text(s, Inches(0.6), Inches(7.14), Inches(4), Inches(0.3), 'avatiser. studios — services catalog', size=8.5, color=MUTED, spacing=0.5)
    text(s, Inches(12.3), Inches(7.14), Inches(0.5), Inches(0.3), str(n), size=8.5, color=MUTED, align=PP_ALIGN.RIGHT)

def title_block(s, kicker, title_txt, sub=None, y=Inches(0.85)):
    eyebrow(s, kicker, y=Inches(0.5))
    text(s, Inches(0.6), y, Inches(11.5), Inches(1.0), title_txt, size=34, color=WHITE, bold=True)
    if sub:
        text(s, Inches(0.6), y + Inches(0.72), Inches(11), Inches(0.6), sub, size=13.5, color=SILVER, line_spacing=1.3)

def picture_cover(s, path, x, y, w, h):
    """Place image cropped to fill w×h (cover behavior), rounded corners via frame."""
    im = Image.open(path)
    iw, ih = im.size
    target_ratio = w / h
    src_ratio = iw / ih
    if src_ratio > target_ratio:
        crop_w = int(ih * target_ratio); ox = (iw - crop_w) // 2
        box_ = (ox, 0, ox + crop_w, ih)
    else:
        crop_h = int(iw / target_ratio); oy = (ih - crop_h) // 2
        box_ = (0, oy, iw, oy + crop_h)
    cropped = im.crop(box_)
    tmp = '/tmp/_deck_crop.jpg'
    cropped.convert('RGB').save(tmp, quality=90)
    pic = s.shapes.add_picture(tmp, x, y, w, h)
    frame = box(s, x, y, w, h, fill=None, line=BORDER2, line_w=1)
    return pic

def chip(s, x, y, txt_, color=SILVER, fill=BLACK3, line=BORDER2, size=10, w=None):
    w = w or Inches(0.2 + 0.082 * len(txt_))
    h = Inches(0.32)
    c = box(s, x, y, w, h, fill=fill, line=line, radius=0.5)
    text(s, x, y + Inches(0.045), w, Inches(0.24), txt_, size=size, color=color, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    return w

# ═══════════════════════════════════════════════════════════════════
# SLIDE 1 — Title
# ═══════════════════════════════════════════════════════════════════
s = slide()
text(s, Inches(0.6), Inches(2.7), Inches(9), Inches(1.2), 'avatiser.', size=64, color=WHITE, bold=True)
box(s, Inches(3.05), Inches(3.32), Inches(0.16), Inches(0.16), fill=SILVER, radius=1)
text(s, Inches(0.6), Inches(3.75), Inches(10.5), Inches(0.6), 'SERVICES CATALOG', size=20, color=SILVER, bold=True, spacing=3)
text(s, Inches(0.6), Inches(4.35), Inches(10.5), Inches(0.5), 'every asset we can produce — branding, e-commerce, social, video, web', size=14, color=MUTED)
box(s, Inches(0.6), Inches(5.1), Inches(2.4), Inches(0.02), fill=BORDER2)
text(s, Inches(0.6), Inches(5.35), Inches(6), Inches(0.4), 'produced with AI · directed by humans · July 2026', size=11, color=MUTED)
footer(s, 1)

# ═══════════════════════════════════════════════════════════════════
# SLIDE 2 — Market context (stat cards)
# ═══════════════════════════════════════════════════════════════════
s = slide()
title_block(s, 'the 2026 market', 'Why this catalog wins on price and speed')
stats = [
    ('$42,280', 'average agency cost\nper video project'),
    ('$25–75', 'per white-bg product image\n(Amazon/PDP listing)'),
    ('$198', 'average cost per human\nUGC video deliverable'),
    ('29% CAGR', 'growth of the UGC content\nmarket through 2034'),
]
cw, ch, gap = Inches(2.78), Inches(2.0), Inches(0.28)
x0 = Inches(0.6)
for i, (big, small) in enumerate(stats):
    x = x0 + i * (cw + gap)
    y = Inches(2.15)
    box(s, x, y, cw, ch, fill=BLACK2, line=BORDER, radius=0.06)
    text(s, x + Inches(0.22), y + Inches(0.3), cw - Inches(0.44), Inches(0.7), big, size=30, color=ACCENT, bold=True)
    text(s, x + Inches(0.22), y + Inches(1.15), cw - Inches(0.44), Inches(0.75), small, size=12, color=SILVER, line_spacing=1.3)
text(s, Inches(0.6), Inches(4.6), Inches(11.8), Inches(1.6),
     "Traditional production has priced itself out of reach for most brands. AI-first studios deliver comparable "
     "output at 5–20% of that cost — and buyers already know it. The question a brand asks in 2026 isn't "
     "“AI or not AI” anymore, it's “can I tell?” and “how fast can you turn it around?”\n\n"
     "Avatiser's wedge: agency-grade realism, at creator-economy prices, in 48 hours.",
     size=14.5, color=WHITE, line_spacing=1.4)
footer(s, 2)

# ═══════════════════════════════════════════════════════════════════
# SLIDE 3 — How to read this catalog (legend)
# ═══════════════════════════════════════════════════════════════════
s = slide()
title_block(s, 'legend', 'How to read every entry')
items = [
    ('Market rate', 'what traditional agencies / freelancers charge today', WARN),
    ('Our zone', 'the price band Avatiser sells this asset for', ACCENT),
    ('Route', 'which part of the Avatiser production stack builds it — FLOW canvas, the studio engine, or a manual pass', SILVER),
]
y = Inches(2.2)
for label, desc, color in items:
    box(s, Inches(0.6), y, Inches(0.14), Inches(0.14), fill=color, radius=1)
    text(s, Inches(0.95), y - Inches(0.08), Inches(3), Inches(0.4), label, size=16, color=WHITE, bold=True)
    text(s, Inches(4.2), y - Inches(0.08), Inches(8), Inches(0.5), desc, size=13, color=SILVER, line_spacing=1.3)
    y += Inches(0.75)
box(s, Inches(0.6), Inches(4.65), Inches(11.9), Inches(1.75), fill=BLACK2, line=BORDER, radius=0.06)
text(s, Inches(0.95), Inches(4.9), Inches(11.2), Inches(0.4), 'ELEVEN CATEGORIES', size=11, color=MUTED, bold=True, spacing=2)
text(s, Inches(0.95), Inches(5.3), Inches(11.2), Inches(1.0),
     'E-commerce & Product  ·  UGC & Creator Content  ·  Performance/Paid Social  ·  Organic Social  ·  Video & Film\n'
     'Branding & Identity  ·  Website & Digital  ·  Email & Lifecycle  ·  Retail/Print/OOH  ·  B2B & Corporate  ·  Emerging/Premium',
     size=13, color=WHITE, line_spacing=1.6)
footer(s, 3)

# ═══════════════════════════════════════════════════════════════════
# CATEGORY SLIDES — with real portfolio stills
# ═══════════════════════════════════════════════════════════════════
def category_slide(letter, kicker, title_txt, sub, rows, poster, caption, portrait=True, n=0):
    s = slide()
    title_block(s, kicker, title_txt, sub, y=Inches(0.85))
    # left: table of items
    tx, ty, tw = Inches(0.6), Inches(2.35), Inches(7.0)
    # header row
    box(s, tx, ty, tw, Inches(0.42), fill=BLACK3, line=BORDER)
    text(s, tx + Inches(0.15), ty + Inches(0.08), Inches(3.3), Inches(0.3), 'ASSET', size=10.5, color=MUTED, bold=True, spacing=1)
    text(s, tx + Inches(3.55), ty + Inches(0.08), Inches(1.8), Inches(0.3), 'MARKET RATE', size=10.5, color=MUTED, bold=True, spacing=1)
    text(s, tx + Inches(5.4), ty + Inches(0.08), Inches(1.5), Inches(0.3), 'OUR ZONE', size=10.5, color=MUTED, bold=True, spacing=1)
    ry = ty + Inches(0.42)
    rh = Inches(0.62)
    for i, (name, market, ours) in enumerate(rows):
        fill = BLACK2 if i % 2 == 0 else None
        box(s, tx, ry, tw, rh, fill=fill, line=BORDER, line_w=0.5)
        text(s, tx + Inches(0.15), ry + Inches(0.09), Inches(3.3), Inches(0.45), name, size=12.5, color=WHITE, bold=True, line_spacing=1.1)
        text(s, tx + Inches(3.55), ry + Inches(0.09), Inches(1.8), Inches(0.45), market, size=11.5, color=WARN, line_spacing=1.1)
        text(s, tx + Inches(5.4), ry + Inches(0.09), Inches(1.5), Inches(0.45), ours, size=12.5, color=ACCENT, bold=True, line_spacing=1.1)
        ry += rh
    # right: portfolio still
    px, py = Inches(8.0), Inches(2.35)
    pw, ph = (Inches(2.55), Inches(4.35)) if portrait else (Inches(4.75), Inches(2.67))
    if not portrait:
        px = Inches(7.85)
    picture_cover(s, poster, px, py, pw, ph)
    text(s, px, py + ph + Inches(0.12), pw + Inches(0.4), Inches(0.6), caption, size=10.5, color=MUTED, line_spacing=1.3)
    footer(s, n)
    return s

category_slide(
    'A', 'category a — e-commerce & product visuals', 'Product photography that never books a studio',
    'PDP heroes, lifestyle sets, macro detail, full listing packs — the highest-demand, fastest-to-sell segment.',
    [
        ('Full PDP pack (7–9 images)', '$500–2,000', '$249–449 /SKU'),
        ('Catalog-scale (50–500 SKUs)', '$125–250k/yr', '$3k–15k /project'),
        ('Lifestyle & context shots', '$100–500 /img', '$40–90 /img'),
        ('360° / multi-angle sets', '$150–400 /SKU', '$60–120 /SKU'),
    ],
    os.path.join(POSTERS, 'poster11.jpg'), 'Example: Olivia — suncare product film', portrait=False, n=4)

category_slide(
    'B', 'category b — ugc & creator-style content', "2026's hottest content format",
    'AI creators deliver the same authentic, phone-shot energy as human UGC — without usage fees or creator churn.',
    [
        ('UGC-style video ad', '$198 /video', '$99–199'),
        ('UGC variations pack (×5)', '$500–1,500', '$299–499'),
        ('AI brand ambassador (recurring)', '$2k–10k/mo', '$500–1,500/mo'),
        ('Unboxing / first-impression clips', '$150–350', '$79–149'),
    ],
    os.path.join(POSTERS, 'poster7.jpg'), 'Example: Flextail — UGC review', portrait=True, n=5)

category_slide(
    'C', 'category c — performance & paid-social creative', 'The volume game — where retainers live',
    'Static and video ad creative built for Meta/TikTok/YouTube, tested at scale across hooks and audiences.',
    [
        ('Video ads (6s/15s/30s cuts)', '$100–500 /video', '$79–199'),
        ('Creative-testing matrix (10–20 var.)', '$1k–3k /batch', '$499–999'),
        ('Monthly creative retainer', '€4k–21.5k/mo', '$1.5k–5k/mo'),
        ('Ad localization (per market)', '$200–500', '$99–199'),
    ],
    os.path.join(POSTERS, 'poster9.jpg'), 'Example: Ikonic Professional — hero reel', portrait=False, n=6)

category_slide(
    'D', 'category d — organic social media content', 'The always-on content engine',
    'Calendars, reels, carousels and profile kits that keep a brand feed alive between campaigns.',
    [
        ('Monthly content calendar', '$1k–5k/mo', '$499–1,999/mo'),
        ('Reels / Shorts (entertainment-led)', '$150–500', '$99–199'),
        ('Carousel posts (3–8 slides)', '$100–300', '$59–129'),
        ('Founder / personal-brand visuals*', '$500–2k/shoot', '$199–399/set'),
    ],
    os.path.join(POSTERS, 'poster6.jpg'), 'Example: Signature — fragrance macro film', portrait=True, n=7)

category_slide(
    'E', 'category e — video & film', 'The flagship — shots no camera could take',
    'From cinematic product films to CGI-impossible spectacle ads. This is the portfolio’s lead category.',
    [
        ('Cinematic product film', '$5k–20k', '$499–1,999'),
        ('Brand anthem film (60–90s)', '$10k–50k', '$1,499–4,999'),
        ('Product hero loops (web/retail)', '$1k–3k', '$199–499'),
        ('"Impossible-shot" spectacle ads', '$10k+ (CGI)', '$799–1,999'),
    ],
    os.path.join(POSTERS, 'poster4.jpg'), 'Example: Hair Dryer — x-ray hero reel (impossible shot)', portrait=True, n=8)

category_slide(
    'F', 'category f — branding & identity', 'A proprietary visual world, not a logo PDF',
    'Skip commoditized logo work — sell full brand imagery systems nobody else can price this low.',
    [
        ('Brand imagery system (15–30 img)', '$2k–8k shoot', '$399–999'),
        ('Visual identity starter', '$2k–15k', '$499–1,499'),
        ('Brand mascot / character design', '$2k–10k', '$499–1,299'),
        ('Packaging concept visualization', '$1k–5k', '$299–799'),
    ],
    os.path.join(POSTERS, 'poster2.jpg'), 'Example: Eyeliner — macro product film', portrait=False, n=9)

category_slide(
    'G', 'category g — website & digital assets', 'Every pixel a site actually needs',
    'Hero loops, imagery kits and landing visuals — the same system that built avatiser.com itself.',
    [
        ('Full site imagery kit (10–25 img)', '$2k–6k shoot', '$499–1,299'),
        ('Website hero visuals / loops', '$500–2k', '$149–399'),
        ('Landing-page visual pack', '$800–2,500', '$299–699'),
        ('Icon & illustration sets', '$500–3k', '$199–599'),
    ],
    os.path.join(POSTERS, 'poster1.jpg'), 'Example: Haircare — UGC campaign reel', portrait=True, n=10)

# ═══════════════════════════════════════════════════════════════════
# SLIDE 11 — supporting categories (H, I, J, K) condensed
# ═══════════════════════════════════════════════════════════════════
s = slide()
title_block(s, 'categories h–k', 'Supporting categories', 'Smaller standalone deal sizes — sell as add-ons to the categories above, not as lead offers.')
cols = [
    ('H · Email & Lifecycle', ['Email hero images', 'Flow visual kits (welcome/abandon)', 'Animated email GIFs', 'Newsletter template visuals']),
    ('I · Retail, Print & OOH', ['Billboard / OOH key visuals', 'POS / shelf material', 'Print-ad adaptations', 'Retail screen loops']),
    ('J · B2B & Corporate', ['Pitch-deck visual systems', 'LinkedIn content packs', '"Team-in-action" imagery', 'Explainer / demo videos']),
    ('K · Emerging / Premium', ['AI spokesperson program', 'Shoppable video kits', 'Product-drop world-building', '3D spins / AR previews']),
]
cw, gap = Inches(2.9), Inches(0.13)
x0 = Inches(0.6)
for i, (head, its) in enumerate(cols):
    x = x0 + i * (cw + gap)
    y = Inches(2.3)
    h = Inches(3.9)
    box(s, x, y, cw, h, fill=BLACK2, line=BORDER, radius=0.05)
    box(s, x, y, cw, Inches(0.55), fill=BLACK3, line=BORDER, radius=0.05)
    text(s, x + Inches(0.18), y + Inches(0.13), cw - Inches(0.36), Inches(0.4), head, size=13, color=ACCENT, bold=True)
    iy = y + Inches(0.75)
    for it in its:
        text(s, x + Inches(0.18), iy, cw - Inches(0.36), Inches(0.65), '·  ' + it, size=11.5, color=SILVER, line_spacing=1.25)
        iy += Inches(0.78)
footer(s, 11)

# ═══════════════════════════════════════════════════════════════════
# SLIDE 12 — Productized packages
# ═══════════════════════════════════════════════════════════════════
s = slide()
title_block(s, 'go to market', 'Productized packages — fixed price, fixed scope, 48h')
packs = [
    ('PDP Power Pack', '$349', '/ SKU', '8-image full listing pack (hero, lifestyle, macro, infographics)'),
    ('Launch Pack', '$999', 'one-time', 'PDP pack + hero film + 3 UGC ads + 10 social posts'),
    ('UGC Engine', '$499', '/ month', '5 UGC videos + 5 creator stills, every month'),
    ('The Full World', '$2,499', 'one-time', 'Complete brand campaign — all 10 deliverables + film'),
    ('Creative Retainer', '$1,999', '/ month', '15 videos + 30 statics, 2 revision rounds, 72h SLA'),
]
y = Inches(2.15)
for i, (name, price, unit, desc) in enumerate(packs):
    row_h = Inches(0.85)
    fill = BLACK2 if i % 2 == 0 else None
    box(s, Inches(0.6), y, Inches(12.1), row_h, fill=fill, line=BORDER, line_w=0.5)
    text(s, Inches(0.85), y + Inches(0.18), Inches(2.9), Inches(0.5), name, size=15, color=WHITE, bold=True)
    text(s, Inches(3.9), y + Inches(0.15), Inches(1.7), Inches(0.55), price, size=20, color=ACCENT, bold=True)
    text(s, Inches(3.9), y + Inches(0.58), Inches(1.7), Inches(0.25), unit, size=9.5, color=MUTED)
    text(s, Inches(5.75), y + Inches(0.2), Inches(6.7), Inches(0.5), desc, size=12, color=SILVER, line_spacing=1.25)
    y += row_h + Inches(0.08)
footer(s, 12)

# ═══════════════════════════════════════════════════════════════════
# SLIDE 13 — Pricing rules + priority roadmap
# ═══════════════════════════════════════════════════════════════════
s = slide()
title_block(s, 'strategy', 'Pricing rules & priority roadmap')
text(s, Inches(0.6), Inches(2.15), Inches(5.6), Inches(0.35), 'PRICING RULES', size=12, color=MUTED, bold=True, spacing=1.5)
rules = [
    'Anchor every proposal against the market rate — always show the agency number first.',
    'Never price per-hour. Price per-asset or per-outcome — falling production cost is our margin, not the client’s discount.',
    'First deal = free 3-visual sample → PDP pack → retainer. Land, prove, expand.',
    '2 revision rounds included, then $49/asset — protects against infinite-tweak clients.',
]
ry = Inches(2.6)
for r in rules:
    box(s, Inches(0.6), ry + Inches(0.06), Inches(0.09), Inches(0.09), fill=ACCENT)
    text(s, Inches(0.85), ry - Inches(0.02), Inches(5.5), Inches(0.7), r, size=11.5, color=SILVER, line_spacing=1.3)
    ry += Inches(0.92)

text(s, Inches(6.85), Inches(2.15), Inches(5.6), Inches(0.35), 'PRIORITY ORDER', size=12, color=MUTED, bold=True, spacing=1.5)
roadmap = [
    ('1', 'PDP packs', 'clearest ROI story — start outbound tomorrow'),
    ('2', 'UGC ads', 'hottest segment, 29% CAGR market'),
    ('3', 'Creative retainers', 'pursue after 3–5 project clients'),
    ('4', 'Impossible-shot films', 'portfolio flagship + PR magnet'),
    ('5', 'Brand imagery systems', 'differentiated, low competition'),
]
ry = Inches(2.6)
for num, name, why in roadmap:
    box(s, Inches(6.85), ry, Inches(0.42), Inches(0.42), fill=BLACK3, line=BORDER2, radius=0.5)
    text(s, Inches(6.85), ry + Inches(0.07), Inches(0.42), Inches(0.3), num, size=15, color=ACCENT, bold=True, align=PP_ALIGN.CENTER)
    text(s, Inches(7.42), ry - Inches(0.02), Inches(2.2), Inches(0.35), name, size=13, color=WHITE, bold=True)
    text(s, Inches(7.42), ry + Inches(0.32), Inches(4.9), Inches(0.4), why, size=10.5, color=MUTED, line_spacing=1.2)
    ry += Inches(0.75)
footer(s, 13)

# ═══════════════════════════════════════════════════════════════════
# SLIDE 14 — What we don't sell
# ═══════════════════════════════════════════════════════════════════
s = slide()
title_block(s, 'boundaries', "What we don't sell (yet)")
donts = [
    ('Media buying / running ads', 'different skill, different liability — partner instead, keep the creative line'),
    ('SEO / blog-content writing', 'off-brand, commoditized'),
    ('Real-person deepfakes or celebrity likenesses', 'never — consented client-founder content only, in writing'),
    ('Standalone logo design', 'crowded market — sell only inside identity packs'),
    ('Live-action shoots', 'the moment we rent a camera, we’re competing in the market we’re disrupting'),
]
y = Inches(2.2)
for name, why in donts:
    box(s, Inches(0.6), y, Inches(11.9), Inches(0.82), fill=BLACK2, line=BORDER, line_w=0.5)
    text(s, Inches(0.6) + Inches(0.28), y + Inches(0.14), Inches(0.4), Inches(0.5), '✕', size=16, color=WARN, bold=True)
    text(s, Inches(1.15), y + Inches(0.12), Inches(4.3), Inches(0.6), name, size=13, color=WHITE, bold=True, line_spacing=1.15)
    text(s, Inches(5.6), y + Inches(0.16), Inches(6.7), Inches(0.55), why, size=11.5, color=SILVER, line_spacing=1.25)
    y += Inches(0.94)
footer(s, 14)

# ═══════════════════════════════════════════════════════════════════
# SLIDE 15 — closing
# ═══════════════════════════════════════════════════════════════════
s = slide()
text(s, Inches(0.6), Inches(2.9), Inches(11), Inches(1.0), 'avatiser.', size=48, color=WHITE, bold=True)
text(s, Inches(0.6), Inches(3.75), Inches(11), Inches(0.5), 'produced with AI — directed by humans', size=15, color=SILVER)
box(s, Inches(0.6), Inches(4.35), Inches(2.0), Inches(0.02), fill=BORDER2)
text(s, Inches(0.6), Inches(4.55), Inches(10), Inches(0.4), 'full detail + editable data: business/SERVICES_CATALOG.md', size=11, color=MUTED)
footer(s, 15)

prs.save(OUT)
print('saved:', OUT, '—', len(prs.slides.__iter__.__self__._sldIdLst), 'slides')
