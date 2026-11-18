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
- `fashion-editorial` — no product needed: a place, the people and a vibe
  become one controlling idea, shot as a hero frame plus 2–3 supporting
  frames (see below)

## Fashion editorial (`/campaign`)

The product pipeline starts from a product. Fashion and editorial work starts
from a **place, people and a mood**. That front end is the
`fashion-campaign-director` skill at `.claude/skills/` in the repo root. It
works the brief into a one-sentence concept, wardrobe, a locked visual system
(palette, light, medium, hair & makeup) and one standalone, copy-paste-ready
prompt per shot.

In Claude Code, from the repo root:

```
/campaign rooftop in Lisbon, two models, 90s minimal
```

That one command:
1. writes the campaign,
2. scaffolds `projects/<slug>/` from `_template-fashion` (`studio.js new <slug> fashion`),
3. fills `brief.json` and saves the campaign to `campaign.md`, unchanged,
4. compiles it.

`compile` parses `campaign.md` (the skill's output format is a contract: keep
the `## Hero:` / `## Supporting N:` headings, fenced prompts and
`Aspect ratio:` lines) into one render-plan entry per shot. Each shot keeps
its own aspect ratio. Faces are locked first: generate the casting headshots in
`refs/models/CASTING.md` (Soul 2.0) and approve one per model. Shots route to
`fashion.editorial`: Seedream 5.5, with Nano Banana as fallback, because Soul
takes only one face reference and editorial frames often hold two models.
Render the hero first (×4) and approve one; supporting frames pass it as the
wardrobe/light reference. Attach only the faces and SKUs of the people in each
shot, or accessories leak between models.
`Supporting 3` is optional. If you hand-edit `campaign.md`, recompile.

`projects/salt-court/` is the worked demo: the example brief that ships with
the skill, compiled.

## CLI

```bash
node studio/studio.js new <slug>          # start a project from the template
node studio/studio.js new <slug> fashion  # …or a fashion-editorial project
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
    ├── _template-fashion/    ← copy per editorial (studio.js new <slug> fashion)
    ├── salt-court/           ← worked fashion-editorial demo
    └── olivia-suncare/       ← worked demo using a real past client product
```
