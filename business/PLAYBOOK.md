# avatiser. — the solo operating playbook

*How one founder runs a global AI creative studio with a payroll of software.*

---

## 0. The operating thesis

avatiser is not "a freelancer with AI tools." It is a **production company where
the machines hold every job except two**:

1. **Taste** — deciding what looks premium. This is the product. It cannot be
   delegated and it compounds: every curation decision trains your eye and your
   prompt library.
2. **Trust** — sales calls, pricing, relationships, the moment a client feels
   looked after. People buy from the founder; they stay for the system.

Everything else — finding leads, answering inquiries, writing treatments,
generating drafts, chasing feedback, invoicing, reporting — is a **digital
employee**: an automation with a name, a job description, a schedule, and a
monthly cost that rounds to a dinner.

The math this unlocks:

| Mode | Hours/client/week | Max Studio clients | MRR at $2,900 |
|---|---|---|---|
| Manual freelancer mode | 10–12 h | 3–4 | ~$10k, at burnout |
| Systemized (this playbook) | 2–3 h | 10–12 | ~$30k, at ~40 h/wk total |
| Productized (month 6+) | ~1 h | 20+ | $60k+, hire first human editor |

Tool costs run $600–1,000/month at full build-out. Margins stay above 90%.

---

## 1. The org chart (you + 8 digital employees)

Build them **in this order** — each one pays for the next. Names make them real:
you will genuinely think "that's Piper's job, not mine," and that discipline is
what keeps the calendar empty.

### Hire #1 — KAI · Client Concierge (build in week 1)
The highest-ROI automation in any service business is **speed to lead**. A
sample-pack request answered in 3 minutes converts several times better than
one answered in a day.

- **Job**: reply to every form submission and email instantly, 24/7. Confirm
  the brief, set the 48-hour expectation, ask the two questions that are
  always missing (product photos? brand guidelines?), offer a call link.
- **Inputs → outputs**: form webhook / inbox → warm personalized reply +
  CRM record + Telegram ping to you.
- **Recipe**: wire the site form (`FORM_ENDPOINT` in index.html) to a webhook →
  n8n or Make scenario → Claude API drafts the reply in avatiser's voice
  (lowercase, warm, specific) → sends from hello@avatiser.com → logs to
  Airtable → notifies your phone.
- **Guardrail**: Kai never quotes custom prices and never promises dates you
  haven't approved. Escalation = silence + ping you.
- **Cost**: ~$20/mo (n8n cloud) + API pennies.

### Hire #2 — MIRA · Sample Pack Producer (weeks 1–2)
The free sample pack is your entire acquisition engine, so its unit cost must
crash from hours to minutes.

- **Job**: turn a brief into 3 near-final visuals for your curation.
- **Pipeline**: brief lands in Airtable → Claude writes the creative treatment
  (scene, light, styling, camera language — from your prompt library) → batch
  generation via your gen stack (Higgsfield, Midjourney, Flux, Kling/Veo for
  motion) → outputs land in a review board → **you spend 15–20 minutes
  choosing and polishing** → Mira assembles the branded delivery page and
  Kai sends it.
- **The moat**: your prompt library. Every winning generation gets its prompt,
  settings, and reference saved to a "recipes" base, tagged by industry.
  After 50 sample packs you can produce a beauty-brand pack in 10 minutes at
  a quality competitors can't copy — they don't have your library.
- **Target**: sample pack unit cost < $5 credits + 20 founder-minutes.

### Hire #3 — RHEA · Content Marketer (weeks 2–3)
Your product is literally content — **the factory should feed the storefront.**

- **Job**: one piece of proof content per day on Instagram/TikTok + LinkedIn,
  drafted for your 10-minute morning approval. Never auto-post without review.
- **Formats that sell this business**: photoshoot-vs-avatiser cost breakdowns;
  30-second "brief → finished film" process reels; niche spec work ("we made
  this for a fragrance brand that doesn't exist"); before/after product shots.
- **Recipe**: a content calendar in Airtable → Claude drafts hooks/captions
  weekly in one batch → clips assembled from delivery archive (with client
  permission) or spec work → Metricool/Buffer schedules → you approve on your
  phone with coffee.
- **Rule**: spec work for dream brands doubles as outbound ammunition (see
  Piper). Every post is also a portfolio piece. Nothing is single-use.

### Hire #4 — SCOUT · Lead Prospector (weeks 3–4)
- **Job**: wake up to 30 qualified brands every morning: D2C stores doing
  visible ad spend with mediocre creative — beauty, F&B, fashion, home.
- **Recipe**: Apify/PhantomBuster scrapes (Shopify store lists, IG business
  accounts by niche + follower band, Meta Ads Library for "currently running
  ads") → Clay or a Claude-scripted enrichment pass scores each brand
  (products photogenic? running ads? size sweet spot 10k–500k followers?) →
  top 30 land in the CRM with product page screenshots attached.

### Hire #5 — PIPER · Outbound SDR (weeks 3–4, after Scout)
- **Job**: 30–50 personalized first-touches a day, every day.
- **The avatiser move — show, don't pitch**: for the top 5 prospects daily,
  Mira generates **one hero visual of their actual product** before you ever
  say hello. The email is three sentences: "we made this for you — it's
  yours either way. want two more?" That email gets replies no template can.
  The other 25–45 get sharp personalized text referencing their current
  creative.
- **Recipe**: Instantly or Smartlead (warmed domains — buy 2–3 lookalike
  domains, e.g. avatiser.co, never your main domain) → Claude personalizes
  from Scout's enrichment → replies land in your inbox where Kai triages.
- **Compliance guardrails, non-negotiable**: real opt-outs honored instantly,
  accurate sender identity (CAN-SPAM), B2B-relevant targeting only (GDPR
  legitimate interest), volume ramped slowly (start 10/day/domain), no
  automated Instagram DMs at scale — that gets accounts banned; DMs stay
  manual and few.

### Hire #6 — ODIN · Producer / Project Manager (month 2)
- **Job**: every active project has a stage, an owner, and a next action —
  visible to the client without them asking.
- **Recipe**: Airtable pipeline (brief → treatment → generating → review →
  revisions → delivered) → client-facing status portal (Airtable interface or
  Notion page per client) → automated nudges: brief reminders to clients,
  "delivery due tomorrow" pings to you, feedback request 24h after delivery,
  testimonial + referral ask 7 days after a happy delivery.
- **Rule**: revision requests arrive through a form with a checkbox taxonomy
  (lighting / styling / model / copy), not free-form email — that's what makes
  "unlimited revisions" survivable.

### Hire #7 — LEDGER · Finance (month 2)
- **Job**: money moves without you touching it. Stripe payment links on
  every tier; Studio = subscription with auto-charge; Campaign = 50% deposit
  before work starts, 50% on delivery; dunning emails automatic; a Friday
  P&L digest (MRR, cash collected, tool spend, credits burned) in your inbox.
- **Rule**: no work starts before the deposit clears. Ledger enforces this so
  you never have the awkward conversation.

### Hire #8 — ECHO · Analyst (month 2–3)
- **Job**: one Monday-morning scorecard: leads by source, sample packs
  shipped, pack→paid conversion, MRR & churn, content views→leads, cost per
  client. Plus one sentence you'll act on: "packs from outbound convert 3×
  organic — feed Piper."
- **Recipe**: a scheduled Claude Code routine reading Airtable + Stripe +
  Metricool exports, writing the digest to email/Telegram. (This one can
  literally run from this repo on a cron.)

---

## 2. Your week (the founder's actual job)

| | Morning (60–90 min) | Afternoon |
|---|---|---|
| **Mon** | Echo's scorecard → pick the week's one growth bet. Approve Rhea's content batch. | Production block: curation + treatments |
| **Tue** | Curation block (sample packs + client work) | **Sales calls** (all calls live Tue/Thu 2–5pm — protect everything else) |
| **Wed** | Curation block | Deep work: prompt library, spec campaigns, new formats |
| **Thu** | Curation block | **Sales calls** |
| **Fri** | Deliveries + Ledger's money digest | Loose ends, next week's outbound targets with Scout |

Daily floor: ~10 min approving content, ~20 min triaging Kai's escalations,
2–3 curation hours. Everything else is optional. **If a task appears twice
that isn't taste or trust, it becomes a digital employee's job within a week.**

---

## 3. The funnel, end to end

```
Scout finds brand → Piper sends gift visual → reply
                                              ↓
IG/TikTok proof content (Rhea) → site → free sample pack form
                                              ↓
                             Kai responds in minutes, sets expectations
                                              ↓
                        Mira + you produce pack in 48h (the wow moment)
                                              ↓
              15-min call (you) → Campaign $1,450+ or Studio $2,900/mo
                                              ↓
        Odin runs delivery → testimonial + referral ask → Rhea posts the win
```

Every stage is measured (Echo), every handoff is automatic, and the only
human moments are the two that close deals: **the pack quality and the call.**

Conversion targets to tune against: outbound reply ≥ 5% (gift-visual emails
should hit 15%+), form→pack delivered 100% in 48h, pack→call ≥ 30%,
call→paid ≥ 40%, Studio churn < 10%/mo.

---

## 4. The stack (what to actually subscribe to)

| Function | Tool | ~$/mo |
|---|---|---|
| Generation — image | Higgsfield, Midjourney, Flux | 60–150 |
| Generation — video | Kling / Runway / Veo (via Higgsfield or direct) | 100–300 |
| Voice / audio | ElevenLabs (when clients need VO) | 0–22 |
| Finishing | Topaz (upscale), CapCut or Premiere (edit) | 20–50 |
| Brain / drafting | Claude API + Claude Code (treatments, Kai, Piper, Echo) | 20–100 |
| Automation bus | n8n cloud or Make | 20–50 |
| CRM + pipeline + portals | Airtable | 20–45 |
| Outbound | Instantly/Smartlead + Clay + Apify | 100–250 |
| Scheduling / social | Metricool or Buffer | 0–30 |
| Payments | Stripe | % only |
| Site + email | GitHub Pages/Netlify (site is static) + Google Workspace | 6–20 |
| **Total** | | **~$400–1,000** |

Subscribe in build order, not all at once. Month 1 needs only generation +
Claude + n8n + Airtable + Stripe (~$250).

---

## 5. 90-day roadmap

### Days 1–14 — Open the doors
- [ ] Deploy the site; wire `FORM_ENDPOINT` → Kai (this repo is ready for it)
- [ ] Stripe links for all tiers; deposit rule live
- [ ] Airtable CRM + pipeline; Kai v1 answering within minutes
- [ ] Build prompt library from the 3 existing clips' recipes
- [ ] Produce **5 spec sample packs for dream brands** (they're your first
      outbound gifts *and* Rhea's first two weeks of content)
- [ ] Rhea posting daily; personal LinkedIn build-in-public thread #1
- [ ] **Replace the site's placeholder testimonials as real ones arrive —
      before public launch, swap or clearly attribute them. Never launch paid
      ads pointing at fictional quotes.**

### Days 15–45 — Prove the machine
- [ ] Scout + Piper live: 30 touches/day ramping to 50, 5 gift visuals/day
- [ ] Goal: **25 sample packs shipped, 3 paying clients** (mix of Campaign
      and Studio)
- [ ] Odin's delivery portal live; revision taxonomy form live
- [ ] Collect 3 real testimonials + before/after case study #1
- [ ] Kill or fix whatever Echo shows isn't converting

### Days 46–90 — Scale what worked
- [ ] Ledger + Echo fully automated; Friday money digest, Monday scorecard
- [ ] Goal: **8–10 active clients, $15–20k MRR**
- [ ] Raise Campaign floor to $1,950 for new clients (grandfather the early ones)
- [ ] Publish 3 niche landing pages (beauty / F&B / fashion) reusing site
      sections — programmatic SEO seed
- [ ] Open the Partner (white-label agency) conversation with 5 agencies
- [ ] Decision gate at day 90: raise prices again vs. first human hire
      (part-time editor) vs. productize (self-serve tier)

---

## 6. Guardrails (the boring things that protect the business)

- **Contracts**: even one page — scope, revision definition, usage rights
  transfer on final payment, AI-production disclosure, model-likeness
  indemnity (only platform-licensed AI talent; never a real person's face
  without written consent).
- **Disclosure**: "produced with AI, directed by humans" stays in the brand
  language — it's a selling point and keeps you ahead of platform and EU AI
  Act transparency rules.
- **Client data**: product shots and briefs live in your drive, not scattered
  in chat threads; delete on request.
- **Platform risk**: never build the whole funnel on one channel; email list
  + site are the assets you own.
- **Capacity honesty**: "limited slots each week" on the site must be true —
  cap sample packs (e.g. 10/week) and let scarcity be real.
- **The founder is the single point of failure**: document every digital
  employee in this file as you build it (webhook URLs, prompts, logins in a
  password manager). Future-you, sick for a week, will thank present-you.

---

## 7. North-star metrics

1. **Sample packs shipped per week** — the whole machine's pulse
2. **Pack → paid conversion** — quality of both targeting and taste
3. **MRR + churn** — the business
4. **Founder hours per client per week** — the automation score. If it
   creeps above 3, stop selling and build the missing employee.

---

*File lives in the repo on purpose: treat the business like the codebase —
version it, iterate weekly, and let Echo report against it.*
