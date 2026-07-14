# avatiser. studios — website

The official site for [avatiser.com](https://avatiser.com): an AI-powered creative
studio producing campaign-grade films, product visuals and social content for
brands worldwide.

One page, one file, zero dependencies. The cinematic brand experience and the
conversion funnel (free sample pack → multi-step lead form) live together in
`index.html` — no build step, no framework, no CDN scripts.

## Structure

```
index.html                      the entire site (markup + styles + vanilla JS)
assets/
  fonts/
    Archivo-Variable.woff2      display font (self-hosted, weights 100–900)
    DMSans-Variable.woff2       body font (self-hosted, weights 100–1000)
  JayaGiriSans.otf              (optional) brand display font — drop it here and
                                every headline upgrades to it automatically
  videos/                       (optional) portfolio clips — see below
```

## Running locally

Any static server works:

```
npx serve .
# or
python3 -m http.server
```

Opening `index.html` directly in a browser also works.

## Deploying

The site is fully static. Point GitHub Pages, Netlify, Vercel or any host at the
repo root. No environment variables, no build command.

## Adding your real production clips

The showcase strip and the hero background are wired to look for these files:

```
assets/videos/clip1.mp4 … clip8.mp4     (clip7 doubles as the hero background)
assets/videos/poster1.jpg … poster8.jpg
```

If a file exists it fades in and autoplays (muted, looped). If it doesn't, a
styled placeholder card is shown instead — the site never looks broken while
assets are missing. Edit the `PRODUCTIONS` array in `index.html` to change
titles, categories or formats.

## Wiring the lead form

The multi-step form works out of the box in demo mode (it completes without
sending anywhere). To capture leads, set the endpoint at the top of the script
in `index.html`:

```js
var FORM_ENDPOINT = 'https://formspree.io/f/XXXXXXXX'; // or your own API
```

The form POSTs JSON: `{ niche, need, name, brand, email, link }`.

## Things to update before launch

- **Social handles** — footer links point at `instagram.com/avatiser` and
  `linkedin.com/company/avatiser`; confirm or change the handles.
- **OG image** — add `assets/og.jpg` (1200×630) for link previews.
- **Form endpoint** — see above.

## Design notes

Merged from two prototypes: the cinematic "Reimagined" brand site and the
"Funnel" landing page. Removed in the merge: React/Babel dev-CDN runtime, the
blocking enter-gate + sound engine, the 560vh scroll-hijack intro, dev-only
tweak panels, and the empty WhatsApp link. All pricing and copy is in USD for
a global audience.
