#!/usr/bin/env node
/* ============================================================================
   build-work.js — generate brand case-study pages from site/work/manifest.json
   ----------------------------------------------------------------------------
   Each entry in the manifest becomes site/work/<slug>/index.html — a branded
   page showing every content type produced for that brand (films, stills,
   UGC, macro, packaging…), plus site/work/index.html listing all cases.

   Adding a new brand = drop assets in site/assets/work/<slug>/, add one
   manifest entry, run:  node dashboard/build-work.js
   ============================================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/work/manifest.json'), 'utf8'));

const FAVICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23080808'/%3E%3Ctext x='32' y='46' font-family='Arial,sans-serif' font-size='40' font-weight='900' fill='%23F8F8F8' text-anchor='middle'%3Ea%3C/text%3E%3Ccircle cx='51' cy='44' r='4' fill='%23B8B8B8'/%3E%3C/svg%3E`;

const CSS = `
@font-face { font-family:'JA Jayagiri Sans'; src:url('/assets/fonts/JayaGiriSans.woff2') format('woff2'), url('/assets/JayaGiriSans.otf') format('opentype'); font-weight:100 900; font-display:swap; }
@font-face { font-family:'DM Sans'; src:url('/assets/fonts/DMSans-Variable.woff2') format('woff2'); font-weight:100 1000; font-display:swap; }
:root { --black:#080808; --black2:#0F0F0F; --black3:#161616; --border:#242424; --border2:#2E2E2E;
  --silver:#B8B8B8; --silver2:#D0D0D0; --white:#EFEFEF; --white2:#F8F8F8; --muted:#6E6E6E; --muted2:#484848;
  --display:'JA Jayagiri Sans','DM Sans',sans-serif; --body:'DM Sans',sans-serif; --ease:cubic-bezier(.16,1,.3,1); --pad:clamp(20px,4vw,48px); }
* { margin:0; box-sizing:border-box; }
html { background:var(--black); scroll-behavior:smooth; }
body { background:var(--black); color:var(--silver); font-family:var(--body); font-size:15.5px; line-height:1.65; -webkit-font-smoothing:antialiased; }
::selection { background:var(--white2); color:var(--black); }
a { color:inherit; }
.nav { position:sticky; top:0; z-index:50; display:flex; align-items:center; justify-content:space-between; gap:14px; padding:0 var(--pad); height:68px; background:rgba(8,8,8,.9); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border-bottom:1px solid var(--border); }
.nav img { height:32px; display:block; }
.nav-right { display:flex; align-items:center; gap:18px; }
.nav-back { font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); text-decoration:none; }
.nav-back:hover { color:var(--white); }
.nav-cta { font-family:var(--display); font-size:12px; font-weight:800; color:var(--black); background:var(--white2); padding:10px 20px; border-radius:100px; text-decoration:none; white-space:nowrap; }
.nav-cta:hover { background:var(--silver2); }
.wrap { max-width:1160px; margin:0 auto; padding:0 var(--pad); }
header.case { padding:70px 0 44px; }
.eyebrow { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
.eyebrow i { width:32px; height:1px; background:var(--muted2); }
.eyebrow span { font-size:11px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:var(--muted); }
h1 { font-family:var(--display); font-size:clamp(36px,6vw,72px); font-weight:900; color:var(--white2); letter-spacing:-.025em; line-height:1.05; margin-bottom:18px; max-width:900px; }
.blurb { font-size:clamp(15px,1.5vw,18px); font-weight:300; color:#909090; max-width:620px; line-height:1.75; margin-bottom:26px; }
.chips { display:flex; flex-wrap:wrap; gap:8px; }
.chip { font-size:11px; font-weight:600; letter-spacing:.06em; color:var(--silver); border:1px solid var(--border2); padding:7px 15px; border-radius:100px; }
.chip.hl { color:var(--black); background:var(--white2); border-color:var(--white2); font-family:var(--display); font-weight:800; }
.meta-row { display:flex; gap:clamp(24px,4vw,56px); flex-wrap:wrap; padding:26px 0; border-top:1px solid var(--border); border-bottom:1px solid var(--border); margin:34px 0 40px; }
.meta b { display:block; font-family:var(--display); font-size:20px; font-weight:800; color:var(--white2); }
.meta span { font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--muted); }
.gallery { columns:2 380px; column-gap:14px; padding-bottom:20px; }
.g-item { break-inside:avoid; margin-bottom:14px; position:relative; border:1px solid var(--border); background:var(--black3); border-radius:8px; overflow:hidden; }
.g-item video, .g-item img { display:block; width:100%; height:auto; }
.g-item video { background:var(--black3); }
.g-tag { position:absolute; top:10px; left:10px; background:rgba(8,8,8,.82); border:1px solid var(--border2); padding:4px 10px; font-size:9.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--silver); border-radius:4px; }
.note { font-size:12px; color:var(--muted2); letter-spacing:.04em; padding:8px 0 46px; }
.cta-band { border-top:1px solid var(--border); background:var(--black2); text-align:center; padding:clamp(56px,8vw,90px) var(--pad); }
.cta-band h2 { font-family:var(--display); font-size:clamp(26px,4vw,46px); font-weight:900; color:var(--white2); letter-spacing:-.02em; line-height:1.1; margin-bottom:14px; }
.cta-band p { color:var(--muted); max-width:460px; margin:0 auto 30px; font-size:14.5px; }
.btn { display:inline-block; font-family:var(--display); font-size:14px; font-weight:800; letter-spacing:.04em; color:var(--black); background:var(--white2); padding:18px 40px; border-radius:100px; text-decoration:none; }
.btn:hover { background:var(--silver2); }
footer { display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; padding:30px var(--pad); font-size:11.5px; color:var(--muted2); }
footer a { color:var(--muted); text-decoration:none; }
/* index grid */
.case-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:14px; padding-bottom:70px; }
.case-card { position:relative; display:block; border:1px solid var(--border); border-radius:10px; overflow:hidden; background:var(--black3); text-decoration:none; aspect-ratio:4/5; }
.case-card video, .case-card img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .8s var(--ease); }
.case-card:hover video, .case-card:hover img { transform:scale(1.045); }
.case-card .shade { position:absolute; inset:0; background:linear-gradient(to top, rgba(8,8,8,.88) 0%, transparent 45%); }
.case-card .cc-meta { position:absolute; bottom:16px; left:16px; right:16px; }
.cc-cat { font-size:10px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--silver); }
.cc-name { font-family:var(--display); font-size:19px; font-weight:800; color:var(--white2); line-height:1.2; margin-top:2px; }
.cc-count { font-size:11px; color:var(--muted); margin-top:4px; }
`;

const page = (title, desc, canonicalPath, body) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="https://avatiser.com${canonicalPath}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="https://avatiser.com/assets/og.jpg">
<meta name="theme-color" content="#080808">
<link rel="icon" href="${FAVICON}">
<style>${CSS}</style>
</head>
<body>
<nav class="nav">
  <a href="/"><img src="/assets/logo.png" alt="avatiser. studios"></a>
  <div class="nav-right">
    <a class="nav-back" href="/work/">all work</a>
    <a class="nav-cta" href="/#start">get 3 free visuals</a>
  </div>
</nav>
${body}
<footer>
  <span>© <span id="y">2026</span> avatiser. studios — produced with AI, directed by humans</span>
  <a href="/">back to the studio →</a>
</footer>
<script>
document.getElementById('y').textContent = new Date().getFullYear();
document.querySelectorAll('video[data-src]').forEach(function (v) {
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { if (!v.src) v.src = v.getAttribute('data-src'); var p = v.play(); if (p) p.catch(function(){}); }
      else v.pause();
    });
  }, { threshold: .2 });
  io.observe(v);
});
</script>
</body>
</html>`;

const mediaHtml = (m) => m.type === 'video'
  ? `<figure class="g-item"><span class="g-tag">${m.tag}</span><video data-src="${m.src}" ${m.poster ? `poster="${m.poster}"` : ''} muted loop playsinline preload="none"></video></figure>`
  : `<figure class="g-item"><span class="g-tag">${m.tag}</span><img src="${m.src}" alt="${m.tag}" loading="lazy"></figure>`;

/* ── per-brand case pages ── */
for (const b of manifest.brands) {
  const dir = path.join(ROOT, 'site/work', b.slug);
  fs.mkdirSync(dir, { recursive: true });
  const nVideos = b.media.filter(m => m.type === 'video').length;
  const nStills = b.media.length - nVideos;
  const body = `
<div class="wrap">
  <header class="case">
    <div class="eyebrow"><i></i><span>${b.industry} · case study</span></div>
    <h1>${b.name}</h1>
    <p class="blurb">${b.blurb}</p>
    <div class="chips">${b.deliverables.map(d => `<span class="chip">${d}</span>`).join('')}</div>
    <div class="meta-row">
      <div class="meta"><b>${b.turnaround}</b><span>brief → delivery</span></div>
      <div class="meta"><b>${nVideos}</b><span>film${nVideos === 1 ? '' : 's'} & reels</span></div>
      <div class="meta"><b>${nStills}</b><span>still${nStills === 1 ? '' : 's'} & frames</span></div>
      <div class="meta"><b>$0</b><span>studio · crew · travel</span></div>
    </div>
  </header>
  <div class="gallery">${b.media.map(mediaHtml).join('\n')}</div>
  <p class="note">every frame above was produced in-studio with AI — no cameras, no sets, no crews.</p>
</div>
<div class="cta-band">
  <h2>want this for your brand?</h2>
  <p>we'll produce 3 custom visuals for your actual product — free, in 48 hours, yours to keep.</p>
  <a class="btn" href="/#start">get my free sample pack →</a>
</div>`;
  fs.writeFileSync(path.join(dir, 'index.html'),
    page(`${b.name} — avatiser. studios`, b.blurb, `/work/${b.slug}/`, body));
  console.log(`built site/work/${b.slug}/index.html (${b.media.length} media items)`);
}

/* ── the work index ── */
const cards = manifest.brands.map(b => {
  const cover = b.media.find(m => m.src === b.cover) || b.media[0];
  const coverEl = cover.type === 'video'
    ? `<video data-src="${cover.src}" ${cover.poster ? `poster="${cover.poster}"` : ''} muted loop playsinline preload="none"></video>`
    : `<img src="${cover.src}" alt="${b.name}" loading="lazy">`;
  return `<a class="case-card" href="/work/${b.slug}/">${coverEl}<div class="shade"></div>
    <div class="cc-meta"><div class="cc-cat">${b.industry}</div><div class="cc-name">${b.name}</div>
    <div class="cc-count">${b.media.length} assets · ${b.turnaround} turnaround</div></div></a>`;
}).join('\n');

const indexBody = `
<div class="wrap">
  <header class="case">
    <div class="eyebrow"><i></i><span>selected productions</span></div>
    <h1>the work.</h1>
    <p class="blurb">every campaign below was produced entirely with AI — directed by humans, delivered in days. click any brand to see the full content system we built for it.</p>
  </header>
  <div class="case-grid">${cards}</div>
</div>
<div class="cta-band">
  <h2>your brand could be next.</h2>
  <p>3 custom visuals for your actual product — free, in 48 hours, no card required.</p>
  <a class="btn" href="/#start">get my free sample pack →</a>
</div>`;

fs.writeFileSync(path.join(ROOT, 'site/work/index.html'),
  page('the work — avatiser. studios', 'Case studies from avatiser: campaign-grade films, product visuals and social content produced with AI for brands worldwide.', '/work/', indexBody));
console.log(`built site/work/index.html (${manifest.brands.length} case studies)`);
