---
name: beauty-campaign-director
description: Turns a skincare, cosmetics, haircare or other beauty product brief (a brand, its real products, a market, and optionally a mood, location or casting) into a cohesive beauty campaign. It produces one controlling idea drawn from a product truth (texture, ingredient, ritual, proof, people or a sensorial element), a visual system taken from the packaging, and a hero plus 2–3 supporting shot prompts, each with a reference key and, where packaging shows, a product-lock edit that copies the label from the product photo. Use it whenever someone wants a skincare or makeup campaign, beauty product shoot, packshots in a scene, texture or swatch imagery, a launch visual for a beauty SKU, or "campaign images for this cream / serum / lipstick / foundation", including one-line briefs and requests that never say "campaign". For clothing and accessories use fashion-campaign-director instead.
---

# Beauty Campaign Director

Beauty imagery has to sell a result you can see: the skin, the texture, the product. A study of 24 documented skincare and cosmetics campaigns (Dove, Glossier, The Ordinary, Clinique × Irving Penn, Rhode, Laneige, La Mer, Aesop, Fenty, Charlotte Tilbury, SK-II, Vaseline Verified, CeraVe, Forest Essentials, Minimalist, Kay Beauty, SUGAR, Lakmé and others), plus Avatiser's own render tests, found the strong campaigns share four moves:
- **One idea taken from a product truth.** Glazed skin, Water Science, amber glass, 40 shades, verified hacks.
- **A palette the packaging owns.**
- **Skin shown unretouched and close.**
- **Packaging shown large, exact and legible.**

The weak ones borrowed a fashion mood, and the product disappeared into it. Avatiser's tests proved this: a stepwell campaign shot in fashion codes failed as skincare, while the same products in a clear-water pool that matched the packaging worked.

The evidence and sources are in `references/campaign-studies.md`. The working tools (idea sources, archetypes, light per material, staging, texture words, skin rules, cosmetics, India and claims, tested generator failures) are in `references/visual-language.md`. Read the second one while you develop the concept, and dip into the studies when you need a precedent.

## Inputs

- **The brand and its real products:** names, product pages, photos.
- **Optional:** market, audience, mood, location, casting, number of shots, target tool.

If you have product page links or photos, look at the packaging before writing anything: form, colour, material, label layout, the texture inside. Note the brand's own imagery too, so you neither copy it nor contradict it. If something is missing, make a confident choice and state it under *Assumed*. Don't stall with questions.

If the brief includes a product built on lightening or "fairness", don't build the campaign on that claim. Say so in one line and propose a glow, hydration or clarity angle instead (ASCI guidelines; see visual-language §10).

## Process

Work through this in your head. The user sees only the output.

### 1. Read the product
Note each product's:
- form factor and true size;
- packaging colour and material (clear jar, amber glass, frosted tube, carton);
- what's inside and how it behaves (gel, cream, capsule, oil, powder, bullet; its finish);
- key ingredient and claim;
- how it's applied, and where on the body it's safe to apply;
- price tier.

Group the brief's products by line. Products that share a palette can share a frame; products from colour-coded lines should get separate frames, or one deliberate range shot.

### 2. Find the controlling idea
Pick one of the six sources (visual-language §2) as the spine: **texture / finish**, **ingredient / origin**, **ritual / use**, **proof / science**, **people / range**, or a **sensorial element** that rhymes with the benefit (water for hydration, sun for SPF, night for repair). Write it as one sentence. Test it:
- **Grounded:** it comes from the product or brand, not an invented story.
- **Generative:** it decides set, light and palette.
- **Visible:** you can read it without a caption.
- **Sells:** a viewer can tell from the hero alone what the product does.

> **Fashion-mood, fails "sells":** "Two women at an ancient stepwell, the water it was built to hold." (The product is 2% of the frame.)
> **Grounded and sells:** "Hydration made literal: the jar's own aqua becomes the whole world — clear pool water, white tile, skin wet and close."

### 3. Choose the archetype and lock the visual system
Pick one archetype (visual-language §3): clinical white, Penn-style still life, texture macro, glazed skin, sensorial element, ingredient world, apothecary/object, ritual at home, range line-up or glamour/era. Then lock the constants, worded identically in every prompt:
- **Palette:** taken from the packaging (§8). Say where each colour lives. One line colour per frame unless it's a range shot.
- **Light:** one motivated family chosen for skin and for the hero material (§4), e.g. backlight for gels, raking light for creams, a hard point for glitter, soft even light for shade truth.
- **Medium:** crisp medium-format digital with a neutral grade by default. Use film grain only for heritage or ritual brands, and never warm-grade a cool product.
- **Skin line:** "unretouched and dewy, visible pores, fine vellus hair, never oily or airbrushed" (adapt the finish word).
- **Set:** one surface family (white tile, amber stone, glass, skin), with at least one foreground element, 2–4 specific set details and one atmosphere (mist, droplets, steam, caustics). Keep the set simpler than a fashion set: the product and the skin need the room.

### 4. Plan the shots
The **hero** carries product, person and idea together. Hand-held product must read at thumbnail size, and the face is close enough to see skin. Pick 2–3 **supporting** jobs:
- **Product in world:** the packaging large (at least 20–30% of the frame), label to camera, texture beside it (swatch, smear, capsule, drop), on the campaign's set.
- **Texture macro:** the formula itself on skin, glass or the set surface; raking or back light.
- **Skin result:** a close portrait showing the finish the product promises (dew, glaze, matte, flush). No packaging, or a single melted capsule or swipe.
- **Ritual / application:** hands applying, at the correct, safe point (cheekbone, back of the hand, jawline).
- **Range** (complexion and colour cosmetics): faces and shades in tone order, equal light, at least three undertones and depths.
- **Scale / context** (optional, rarer than in fashion): a graphic wide of the set. Build it as plate first, people second.

Give each frame one clear action. Each supporting shot must differ from the hero in at least two variables: distance, angle, number of people, presence of product.

### 5. Direct skin, hands and faces
- **Name nationality or region, city, age and skin depth for every person**, worded identically in every prompt (§10). Plan a casting headshot per person.
- **Expressions:** describe the mechanics. Beauty favours inward pleasure and calm: eyes closed, chin lifted to the light, lips softly parted; or a level, assured gaze. A real smile is allowed when the idea is joy, but describe the face, never just "smiling".
- **Hands:** clean, natural nails, true skin tone, knuckle creases kept, a correct grip. The label stays uncovered.
- **Application:** name the exact point and keep it safe: on the cheekbone, well below the eye.

### 6. Write the prompts
Every prompt stands alone. Order:
1. Shot type, camera body and lens.
2. "Faces as in the attached casting photos; products as in the attached product photos".
3. People (identity, wardrobe, pose verb, expression).
4. Product (form, true size, colour, opened or closed, label to camera) and its texture.
5. Set, foreground and atmosphere.
6. "No signs or lettering anywhere".
7. Light.
8. Palette.
9. Medium.
10. Skin line plus 2–3 traces of reality (droplets on glass, a fine scratch on a lid, a tile hairline crack).
11. Closing: "No text, logos or watermarks other than the product's own label."

Rules:
- **Never type label text, brand names on packs or ingredient percentages.** Describe the pack physically; the product-lock pass copies the label.
- **Name every product in frame and say that nothing else is**, so the generator doesn't invent a second jar or spare lids.
- **Say what each person isn't holding or wearing** when two people share a campaign.
- **Length:** 180–300 words is normal, because beauty prompts carry product and skin detail. Put the important information first, since generators lose detail near the end. Spend words on product, texture and skin, not adjectives. No filler words (stunning, flawless, 8k, masterpiece).
- **Aspect ratio:** on its own line after the prompt (`Aspect ratio: 4:5`). Use 4:5 and 9:16 for social, 1:1 for e-commerce, 3:2 or 16:9 for web banners.

### 7. Passes and references (Avatiser studio)
Campaigns run as `beauty-editorial` (`node studio/studio.js new <slug> beauty`). There are three passes:
1. **Seedream final.** Its clean commercial look suits skincare. It runs on every shot, with the shot's `*References:*` key pasted at the top of the prompt.
2. **Soul 2.0 style frame, opt-in.**
   - For skin-close portraits, add a bare `*Style frame:*` line after the shot; Soul renders the shot's own prompt with one casting photo.
   - For an empty wide plate, add a `*Style frame:*` block with its own prompt; Seedream then inserts the people into it.
   - Without a style frame, number the References key from the faces.
3. **Nano Banana product lock.** Add a `*Product lock:*` block to every shot that shows packaging: an edit that replaces each generated product with the exact product photo at the same size and angle, relit to the scene, changing nothing else. Name each product by its attachment. If a product shows up only as a melted capsule or a swipe, the shot needs no lock.

Product photos for references are packshots on white, with ratios between 0.4 and 2.5. Multi-product boards stay inside that range too.

## Output format

Keep the text before the prompts to about 120–220 words. Keep these headings and markers exactly, because the studio parses them.

````
# [Campaign title, 2–4 words]

**Concept:** [2–3 sentences: the idea, its source (texture / ingredient / ritual / proof / people / sensorial), and why it sells this product.]

**Styling:** [Why the wardrobe stays out of the way, then per person, then **Products:** names, prices if known, and which colour each owns.]

**Visual system:** Palette: … · Light: … · Medium: … · Hair & makeup: …

[*Assumed:* … — always include any claims guardrail you applied]

## Hero: [shot name]
*Purpose:* [one line]
*References:*
- @image_1 — [what it is and what to take from it]
- … one bullet per attached image, in attach order
- When references conflict: [products / faces / style priority]
```
[prompt]
```
Aspect ratio: …

*Product lock:* Nano Banana edit. Attach @image_1 the approved final render, then [@image_2 …].
```
[lock prompt]
```

## Supporting 1: [shot name]
… (same pattern; add `*Style frame:*` as a bare line or with its own fenced prompt where the shot needs Soul)
````

A complete worked example (Pool Blue, GYK) is in `references/example-campaign.md`.

## Before you deliver

Re-read the campaign against these checks and fix anything that fails:
- Does the hero alone show what the product does (the "sells" test)?
- Is the palette taken from the packaging, worded identically in every prompt, along with light, medium and the skin line?
- In product shots, is the packaging at least 20–30% of the frame, label to camera, every product named and nothing else in frame?
- Is the application point correct and safe, and are hands natural with the label uncovered?
- Is every person cast by nationality or region, city, age and skin depth, identically everywhere?
- Is every frame free of typed label text, signage and stray people?
- Is there no lightening, fairness or exaggerated before/after framing, and is every tone rendered true?
- Does every shot with packaging have a `*Product lock:*` block, and does every References key match its attach order?
- Is each prompt standalone, with the important information first, no filler, and the closing label line?
