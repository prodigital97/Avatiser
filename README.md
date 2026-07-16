# avatiser. studios — repo overview

This repo holds things that are deliberately kept apart:

```
site/          the public website — this is what deploys to avatiser.com
business/      internal strategy docs — never deployed, never public
studio/        the content-production engine (prompts, pipelines, model
               routing) — never deployed, see studio/README.md
```

**Why the split matters:** the deploy workflow publishes the contents of
`site/` only. Nothing in `business/` or `studio/` is ever uploaded to GitHub
Pages or served on the live domain — it stays private to this repo.

---

## `site/` — the website

The official site for [avatiser.com](https://avatiser.com): an AI-powered
creative studio producing campaign-grade films, product visuals and social
content for brands worldwide.

One page, one file, zero dependencies. The cinematic brand experience and the
conversion funnel (free sample pack → multi-step lead form) live together in
`site/index.html` — no build step, no framework, no CDN scripts.

### Structure

```
site/
  index.html                    the entire site (markup + styles + vanilla JS)
  404.html                      branded not-found page
  CNAME                         custom domain (avatiser.com) for GitHub Pages
  robots.txt / sitemap.xml      SEO plumbing
  .nojekyll                     tells GitHub Pages not to run Jekyll
  assets/
    JayaGiriSans.otf             brand display font (fallback format)
    logo.png                     the real avatiser wordmark (transparent PNG)
    og.jpg                       1200x630 share card for link previews
    fonts/
      JayaGiriSans.woff2        brand display font (primary — loads first)
      Archivo-Variable.woff2    fallback display font (self-hosted, 100–900)
      DMSans-Variable.woff2     body font (self-hosted, weights 100–1000)
    videos/                     portfolio clips — see below
```

### Running locally

Any static server works, pointed at `site/`:

```
npx serve site
# or
python3 -m http.server --directory site
```

Opening `site/index.html` directly in a browser also works.

### Deploying

Fully static. The included GitHub Actions workflow
(`.github/workflows/deploy-pages.yml`) publishes `site/` to GitHub Pages on
every push — see the repo's Settings → Pages to confirm the source is set to
"GitHub Actions" and the custom domain is verified. Any other static host
(Netlify, Vercel, Cloudflare Pages) can also be pointed at `site/` directly.

### Adding your real production clips

The showcase strip and the hero motion background are wired to look for these
files inside `site/assets/videos/`:

```
clip1.mp4 … clip8.mp4
poster1.jpg … poster8.jpg
```

If a file exists it fades in and autoplays (muted, looped). If it doesn't, a
styled placeholder card is shown instead — the site never looks broken while
assets are missing. Edit the `PRODUCTIONS` array in `index.html` to change
titles, categories or formats.

#### Hero motion background

The hero cycles through production clips (see the `HERO_CLIPS` array in the
`heroMotion()` function) as a dark, desaturated, slow-panning backdrop,
crossfading every 7 seconds — one clip visible at a time, next one preloading
just ahead of its turn. Clips that fail to load are skipped automatically, so
the list can safely reference files that haven't been uploaded yet. It pauses
once the hero scrolls out of view, and is disabled entirely under
`prefers-reduced-motion: reduce`.

#### Keeping new clips small

Re-encode anything big before committing (GitHub's web upload cap is 25 MB,
and visitors shouldn't download more than a few MB of video anyway):

```
ffmpeg -i input.mp4 -vf "scale=720:-2" -c:v libx264 -crf 26 -preset slow \
       -pix_fmt yuv420p -movflags +faststart -an output.mp4
```

Use `scale=1280:-2` for 16:9 landscape clips. This typically lands 8–15s
clips at 1–2 MB with no visible quality loss at site display sizes.

### Wiring the lead form

The multi-step form works out of the box in demo mode (it completes without
sending anywhere). To capture leads, set the endpoint at the top of the script
in `site/index.html`:

```js
var FORM_ENDPOINT = 'https://formspree.io/f/XXXXXXXX'; // or your own API
```

The form POSTs JSON: `{ niche, need, name, brand, email, link }`.

### Things to keep current

- **Social handles** — footer links point at `instagram.com/avatiser` and
  `linkedin.com/company/avatiser`; confirm or change the handles.
- **Testimonials** — currently placeholders; swap for real quotes before
  sending paid traffic.
- **Form endpoint** — see above.

### Design notes

Merged from two prototypes: the cinematic "Reimagined" brand site and the
"Funnel" landing page. Removed in the merge: React/Babel dev-CDN runtime, the
blocking enter-gate + sound engine, the 560vh scroll-hijack intro, dev-only
tweak panels, and the empty WhatsApp link. All pricing and copy is in USD for
a global audience.

---

## `business/` — internal only (never deployed)

- **`PLAYBOOK.md`** — the solo operating playbook: the digital-employee
  roster, funnel design, tool stack, and 90-day roadmap.
- **`BRAND_VOICE.md`** — the identity file every generated social post is
  written against.
- **`SOCIAL_PROMPTS.md`** — the operating prompts for the social automation
  pipeline (Higgsfield for generation, Blotato for scheduling/posting).

These contain pricing internals, targeting strategy, and operational details
that should stay private. If you ever change the deploy workflow, double
check its artifact `path:` still points at `site/` and not the repo root —
that's the only thing standing between these docs and being publicly
readable at avatiser.com.
