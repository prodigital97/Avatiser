---
description: Turn a fashion brief (location, models, vibe) into an editorial campaign and compile it into a studio render plan
argument-hint: <location, models, vibe>
---

Use the `fashion-campaign-director` skill to build a full fashion campaign from the brief below, following its "Avatiser studio integration" section.

If the brief is empty, ask once in one line for location, models and vibe, then run. Otherwise don't ask clarifying questions: make confident choices and list them under *Assumed*.

Brief: $ARGUMENTS

When the campaign is written:

1. Take the slug from the campaign title in kebab-case. If `studio/projects/<slug>` already exists, add `-2`, `-3`… until it's free.
2. Run `node studio/studio.js new <slug> fashion` from the repo root.
3. Fill `studio/projects/<slug>/brief.json`: put the user's brief verbatim in `brief`, and fill `location`, `models` and `vibe` from it. Fill `client`, `target_tool` and `deadline` only if the brief names them.
4. Save the campaign output, unchanged, to `studio/projects/<slug>/campaign.md`.
5. Run `node studio/studio.js compile <slug>` and fix any parse error it reports in `campaign.md`.
6. Show the campaign in chat. Then give the project path and the compiled render plan (one line per shot: model and aspect ratio).
