---
description: Turn a skincare or cosmetics brief (brand, real products, market) into a beauty campaign and compile it into a studio render plan with label-lock passes
argument-hint: <brand, products or product links, market, optional mood/casting>
---

Use the `beauty-campaign-director` skill to build a beauty campaign from the brief below, following its "Passes and references" section.

If the brief is empty, ask once in one line for the brand and products (links are best), then run. Otherwise don't ask clarifying questions: make confident choices and list them under *Assumed*.

Brief: $ARGUMENTS

Before writing:
- If product page links or a brand site are given, read the products: names, prices, sizes, what's inside, and the packshot image URLs. Look at the packaging photos before describing any pack. If the site's host is blocked, ask for it to be allowed rather than guessing.

When the campaign is written:

1. Take the slug from the campaign title in kebab-case. If `studio/projects/<slug>` already exists, add `-2`, `-3`… until it's free.
2. Run `node studio/studio.js new <slug> beauty` from the repo root.
3. Fill `studio/projects/<slug>/brief.json`: the user's brief verbatim in `brief`, plus `client`, `location`, `models`, `vibe`, `products` and `banned` (include any claims guardrail, e.g. no fairness framing).
4. Write `refs/product/SKUS.md`: each product with its price, product page and packshot links, plus a per-shot attach table (final pass and product lock). Don't commit brand photos.
5. Write `refs/models/CASTING.md`: one chest-up casting headshot prompt per person, unretouched.
6. Save the campaign output, unchanged, to `studio/projects/<slug>/campaign.md`.
7. Run `node studio/studio.js compile <slug>` and fix any parse error it reports.
8. Show the campaign in chat. Then give the project path, the compiled render plan (one line per pass: model and aspect ratio), and which shots skip the lock and why.
