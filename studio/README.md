# avatiser. studio engine

> **avatiser FLOW** — the node-canvas studio (`flow/flow.html`, deployed
> encrypted at avatiser.com/flow) is the visual way to drive this engine:
> a Weavy/n8n-style graph where Moodboard → Visual DNA → Model & Stylist →
> face/product consistency grids → Creative Director (10 deliverable-mapped
> concepts) → AOC Architect (Anchor/Optics/Chemistry prompts) → Splitter →
> Batch Generate (per-shot aspect ratios) → Gallery + Realism Auditor QC.
> API keys are entered in the app and stored only in the browser.
> Rebuild the deployed copy with: `STUDIO_PASSPHRASE=... node studio/studio.js flow`

The internal content-production system behind avatiser. studios — the machine
that turns **one product** into **a full campaign** of photoreal images and
films. Think Higgsfield Cinema Studio / Marketing Studio, but built around one
non-negotiable brand promise: **output that doesn't read as AI. Ever.**

This folder is never deployed (the Pages workflow ships `site/` only). Every
prompt, preset and pipeline in here is Avatiser trade craft — treat it like
`business/`.

---

## The pipeline (7 stages)

```
1. INTAKE      product image + link/description  →  projects/<slug>/brief.json
2. STRATEGY    pick campaign(s) from config/campaigns.json → deliverable matrix
3. PRE-PRO     lock the three consistency sheets:
                 product-sheet.json    (what the product IS — label, materials, scale)
                 character-sheet.json  (who appears — identity locked via Soul 2.0)
                 scene-sheet.json      (where — set, light, lens, palette)
4. COMPILE     node studio/studio.js compile <slug>
                 merges brief + sheets + deliverable templates + realism core
                 → projects/<slug>/output/prompts/*.txt + render-plan.json
5. GENERATE    node studio/studio.js render <slug>
                 routes each asset to the right model (config/models.json)
6. QC          score every render against prompts/realism-core.md checklist —
                 anything that trips one AI-tell gets regenerated, not shipped
7. DELIVER     projects/<slug>/renders/ organized per deliverable, versioned
```

The three sheets are the heart of the system. They are what keep a 14-asset
campaign looking like **one shoot** instead of 14 unrelated generations — same
product label pixel-for-pixel, same face, same light.

## Model routing (config/models.json)

| Job | Primary | Fallback |
|---|---|---|
| Character identity & portraits | Higgsfield Soul 2.0 | — |
| Product images, backgrounds, composites | Nano Banana 2 Pro | GPT Image 2 |
| Text-heavy statics (infographics, banners) | GPT Image 2 | Nano Banana 2 Pro |
| Cinematic video (16:9 film) | Kling | Seedance |
| Social video (9:16 reels, UGC) | Seedance | Kling |

Rule of thumb baked into routing: **Kling for cinema physics, Seedance for
speed + social realism, Soul for faces, Banana for product fidelity, GPT Image
when the frame contains words.**

## Campaign types (config/campaigns.json)

- `full-campaign` — everything below for one product, one visual world
- `cinematic-ad-film` — 16:9 hero film + cutdowns
- `ugc-reels` — 2–3 creator-style 9:16 reels with a Soul character
- `amazon-listing-pack` — hero on white, 3 lifestyle, 2 detail, 2 infographic
- `social-static-pack` — feed statics + story statics
- `product-hero-loop` — one seamless 5–8s hero loop for web/retail screens

## CLI

```bash
node studio/studio.js new <slug>          # start a project from the template
node studio/studio.js compile <slug>      # sheets + templates → prompts + render plan
node studio/studio.js render <slug>       # execute plan via API adapters (needs keys)
node studio/studio.js status <slug>       # what's compiled / rendered / pending
```

API keys live in `studio/.env` (gitignored — never commit keys):

```
HIGGSFIELD_API_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=
ARK_API_KEY=            # Seedance via BytePlus/Volcano Ark
KLING_ACCESS_KEY=
KLING_SECRET_KEY=
```

Adapters in `lib/adapters/` are scaffolds with the request shapes stubbed —
verify each endpoint against the provider's current docs when wiring a key,
these APIs move fast.

## The realism doctrine

`prompts/realism-core.md` is injected into **every** compiled prompt and doubles
as the QC checklist. Short version: real lenses, motivated light, deliberate
imperfection, phone-camera artifacts for UGC, and the product label is NEVER
text-prompted — always image-referenced. Read it before writing any new
template.

## Folder map

```
studio/
├── README.md                 ← you are here
├── studio.js                 ← CLI orchestrator
├── lib/
│   ├── pipeline.js           ← compile/plan logic
│   └── adapters/             ← one file per provider (stubs until keys added)
├── config/
│   ├── models.json           ← model registry + job routing
│   └── campaigns.json        ← campaign → deliverables matrix
├── prompts/
│   ├── realism-core.md       ← the realism bible (injected everywhere)
│   ├── sheets/               ← LLM prompts that build the 3 sheets from a brief
│   ├── image/                ← per-deliverable image prompt templates
│   └── video/                ← per-deliverable video prompt templates
└── projects/
    ├── _template/            ← copy per product (studio.js new does this)
    └── olivia-suncare/       ← worked demo using a real past client product
```
