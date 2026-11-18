---
name: fashion-campaign-director
description: Turns a basic fashion brief (a location, model descriptions and a vibe) into a cohesive editorial campaign. It produces a one-sentence concept grounded in the brief, wardrobe that carries the story, a locked visual system (palette, light, medium), and one hero image prompt plus 2–3 supporting shot prompts, each self-contained and ready for any image generator (Nano Banana, GPT Image, Midjourney, Flux, Imagen and similar). Use it whenever someone wants a fashion campaign, editorial, lookbook, shoot concept, campaign prompts or "a set of fashion images" built from a place, people and a mood. That includes one-line briefs like "rooftop in Lisbon, two models, 90s minimal" and requests that never use the word "campaign".
---

# Fashion Campaign Director

A study of 2,000 editorial and campaign photographs (Schön!, Numéro, CR Fashion Book, Wonderland, Purple and others) found one thing that separates intentional fashion photography from a pile of attractive elements. In the strong images, every decision serves a single idea you can say in one sentence. That covers garment, location, light, palette, pose and face. "The suit becomes the chair." "Couture worn for a tug-of-war." "She is the flower growing out of the concrete."

The weak images were not badly made. They were competent and had no premise. The location acted as wallpaper, the light came from nowhere, the pose was a stock lean, and the expression was a generic "model stare" or a pleasant half-smile.

This skill builds the idea first and derives everything else from it. The full findings are in `references/visual-language.md`. Read it while developing the concept and styling, especially when the vibe is unfamiliar or the first idea feels generic.

## Inputs

The brief usually gives three things: **location**, **models** and **vibe**. It may also include a brand or product, season, shot count, target image tool, aspect ratio, or reference images.

Work with what you're given. If something is missing (no season, no time of day, no number of models), make a confident choice and state it in one line under the concept. Don't stall the user with questions.

If the user attaches photos of their models, describe each person's identity from the photo (face, hair, skin, build) so every prompt carries the same description.

## Process

Work through these steps in your head. The user sees only the output described in the next section.

### 1. Find the controlling idea

Pull the raw material out of the brief:
- **The place:** its materials, colors, scale, the quality of light at a plausible hour, and what normally happens there.
- **The people:** their physicality, age, presence, and how they would move.
- **The vibe:** translate it into a feeling or a tension, not a list of adjectives.

The idea almost always comes from a *relationship* between these three. Five relationships recur in the references:

| Relationship | What it means | Example |
|---|---|---|
| Rhyme | The garment echoes the place's color, texture or shape until they merge. | Blush shag coat against pastel plaster houses. |
| Contradiction | One elegant thing placed deadpan in a banal setting. | Evening tailoring slumped on a bathtub edge. |
| Scale | A small figure dwarfed by the place, or a monument made of a person. | Three identical figures in a corner of a giant colored wall. |
| Action | The garment proven by a real verb. | Shearling coats in a tug-of-war. |
| Transformation | The pose turns the garment into something else. | A cape that becomes wings when the arms open. |

Write the idea as one sentence. Before using it, check three things:
- **Grounded:** it is built from what is actually in the brief. It adds no invented characters, family history, or plot. If explaining it takes a paragraph of backstory, cut back to what the image itself can show.
- **Generative:** it decides things. If you swapped it out, the clothes, light and poses would change. "Elegance meets melancholy" decides nothing.
- **Visible:** a viewer could get it from the image alone, without a caption.

> **Forced:** "Two estranged sisters return to the abandoned pool where their mother trained for the Olympics, confronting their grief."
> **Vague:** "Timeless elegance meets winter melancholy."
> **Grounded:** "Bodies made for water, standing in a pool with none: swimwear cut as winter tailoring, the empty basin as their stage."

### 2. Lock the visual system

These constants hold the campaign together. Each shot can vary its camera, distance, pose and action, but never these:

- **Palette:** 2–3 hue families plus at most one accent. Say where each color lives (garment, set, light). Take the palette from the location, then decide whether the clothes *match* it (tonal immersion) or *answer* it (one complementary accent). Colors that appear by accident are what make an image look random.
- **Light:** one motivated light family, meaning a source that exists in the world: sun at a specific hour and angle, overcast sky, a window, practical fixtures, on-camera flash, a single spot. Give its direction and quality, know why it fits the idea, and pick it for how it renders the key fabric (overcast keeps pleats and lace legible, hard sun makes sequins and patent flash, backlight makes organza glow). Hard sun suits graphic wit, flash suits candor and nightlife, chiaroscuro suits painterly drama, and a spot pool suits icons. Avoid colored gels unless the world motivates them (neon, a club). In the references they mostly marked the weaker images.
- **Medium and grade:** for example medium-format color film with fine grain, 35mm Portra 400, Tri-X black and white with deep blacks, or clean digital with a cool grade. Use one for the whole campaign.
- **Hair and makeup:** one look per model, held across every shot. Bare skin plus one statement (a red lip, a graphic liner, slicked hair) is the dominant editorial register.
- **Wardrobe range:** the garment's *job* is constant, but the outfits don't have to be identical. Two or three looks inside the palette give the campaign range without diluting the idea. In testing, one outfit repeated in every frame made sets feel samey.
- **A full world, not a backdrop:** every frame needs layers. Give it a foreground element (something between the lens and the subject: a doorframe, steam, a blurred object, a hand), the subject, and a background with 3–5 specific set details: objects, furniture, weather, other people going about their business, light sources. Add atmosphere: haze, steam, rain, dust, wind, smoke. This density was the clearest difference between the campaigns users loved and the ones they called empty. Prompts that said only "in a white gallery" or "on a beach" rendered clean but lifeless.
- **One incongruity (optional):** at most one deliberate disruption, such as a single object, color or scale shift. Random-looking images pile up several incongruities or have none.

### 3. Style the story

Before choosing any garment, decide what the clothes **do** in the idea:
- rhyme with the place
- contrast with it
- act as armor or a uniform
- camouflage the wearer into the set
- transform when the pose opens them
- signal an era

Fashion that is merely worn is decoration. Fashion that does one of these is the story.

For each model, specify:
- **Silhouette first:** column, cocoon, inverted triangle, A-line, oversized/strong-shoulder, second-skin. Shape is what reads at a distance and in thumbnails.
- **Named garments with specific cuts and lengths:** "ivory boiled-wool funnel-neck coat to mid-calf," not "an elegant coat." Describe what the camera sees (shape, colour, material, how it sits on the body) rather than tailoring jargon a generator may misread. In testing, "band-collar shirt open at the throat" rendered as a strange white neck strap, where "collarless bone-white shirt unbuttoned to the sternum" would not.
- **Fabrics, chosen for how they behave in the chosen light:** satin and patent catch hard light, matte wool and suede absorb it, organza and tulle glow when backlit, shearling and fur read as texture in raking light, and pleats fan into graphics when the body moves.
- **Colors from the locked palette.**
- **Figure–ground separation:** make sure each figure stands out from its background by value or hue (dark on pale, pale on dark, or the one complementary colour), so the silhouette reads even at thumbnail size.
- **1–3 accessories with a reason:** a prop the pose needs, a scale shift, or an echo of the set. Opera gloves, an oversized hat that erases the face, and outsized jewelry all recur in the references.
- **Hair and makeup.**

With several models, relate them. Give them the same palette at different weights, mirrored or identical silhouettes (repetition reads as intention), or one anchor and one accent. Don't style each person as a separate idea.

Name props and set pieces specifically ("carnations in a milk-glass jug", "a hemp tug-of-war rope"), not generically ("flowers", "a rope"). Specific nouns are what separate editorial from stock imagery.

Avoid printed logos, slogans and readable text on clothes and sets unless the brief asks for them. Generators garble text, and it pulls focus from the silhouette.

### 4. Plan the shots

The **hero** carries the whole thesis in one frame: the key garment at its most legible, the place's defining feature, the light, and the expression that sets the tone. Someone who sees only the hero should understand the campaign.

Each **supporting shot** has a distinct job. Pick 2–3 of these:
- **Scale/context:** wide, with the figure small in the place. Establishes the world.
- **Gesture/interaction:** models with each other or with a prop, with the pose as a verb. Adds narrative.
- **Portrait:** a close crop where the expression and the hair and makeup carry the mood.
- **Detail/texture:** fabric, hands, accessory, or skin against material, cropped tight. Shows craft.
- **Alternate vantage:** overhead, a low monument angle, a back view, or a frame within a frame (doorway, window, reflection).

Keep each frame to **one clear action**. In testing, a hero that asked three people to piggyback, skid and thrust a basket all at once came back garbled. A single legible interaction per frame renders far more reliably, and the other beats can become supporting shots. One clear action is not an empty frame, though: surround that action with a rich, specific, lived-in world (see "A full world" above). Background people doing their own ordinary things add life without competing with the main action.

Make each supporting shot differ from the hero in at least two variables: distance, camera height or angle, number of figures, or pose verb. Repeat the constants from step 2 exactly. That pairing of fixed set, light, palette and look with varied crop and pose is how every real series in the references holds together.

### 5. Direct bodies and faces

- **Pose as a verb:** say what the body is *doing*, such as leaning into wind, waiting, pulling, kneeling toward something, carrying, sleeping on folded arms, or turning away. "Posing" and the influencer lean are what the weak images shared.
- **Relationship to the place:** give contact points (back flat against tile, a hand on a warm railing, bare feet on salt crust), position in the frame, and scale against the architecture.
- **Expression, for every model in every shot:** describe the mechanics. Specify eyes, lids, brows, mouth, chin and where the gaze lands, and match it to the idea. The references overwhelmingly favor held-back emotion: deadpan, closed eyes, gaze directed at something inside the frame. Open laughter is rare, which is why it hits hard when the concept earns it. Never write a bare "smiling," "sultry" or "fierce"; describe the face instead. An expression can deliberately play against the styling (a pin-up slip worn with a feral glare, court dress with greedy abandon) when that tension serves the idea. The full vocabulary is in `references/visual-language.md`.

### 6. Write the prompts

Every prompt must work on its own, because image generators don't remember the previous prompt. Restate the models' appearance, the wardrobe, the location, the light, the palette and the medium in each one, even though that repeats across prompts. The repetition is what keeps the campaign consistent.

Order the content so the most important information comes first:
1. Shot type and framing: distance, camera height, and lens if it matters (e.g. "full-length, low angle, 35mm").
2. Each subject: identity, garments (silhouette, fabric, color), hair and makeup.
3. Pose (as a verb) and facial expression, for each model.
4. Location and set: the specific details, and how the bodies relate to them.
5. Light: source, direction, quality, time of day.
6. Palette and medium/grade.
7. A closing line: `No text, logos or watermarks.`

Image models default to a centred figure at medium distance. When scale or vantage is the point, make the environment the subject of the opening sentence and the person an object inside it ("A vast empty highway fills the frame; far down it, a tiny figure in a clay coat walks toward camera"), rather than tacking "figure small in the lower third" onto a sentence about the person. Do the same for unusual angles: state the vantage physically ("seen from directly overhead", "shot from the floor looking up").

Where it fits, include one sign of life: wind moving fabric or hair, visible skin texture, grain, a motion blur. Frozen, over-retouched frames read as renders.

Style rules for prompts:
- Write about 130–180 words of compact descriptive sentences, up to about 200 when two or more models each need a full description. The campaigns users rated best ran 140–190 words; sparse 100-word prompts came back feeling empty. Spend the extra words on the world (set details, props, atmosphere, background life), not on stacking adjectives. With three or more people, describe each one by their 3–4 most visible identifiers (build, hair, key garment and its colour) instead of the full styling list, and keep the full detail for the setting. Overloaded *action* in group prompts was what broke the generator in testing, not a detailed setting.
- Use precise nouns and concrete physical descriptions instead of adjectives ("low sun from camera left raking across the tile grout," not "dramatic lighting").
- Use one term per idea. Don't stack synonyms ("cinematic, moody, atmospheric, dramatic").
- Don't use filler: stunning, beautiful, gorgeous, masterpiece, 8k, ultra-detailed, hyperrealistic, best quality, award-winning, trending. These add nothing a generator can act on.
- Name the photographic register where it's useful (e.g. "editorial fashion photograph, medium-format film"). Don't name living photographers.
- Put the aspect ratio on its own line under the prompt (`Aspect ratio: 4:5`). If the user named a tool with its own syntax, such as Midjourney's `--ar 4:5`, use that instead.

## Output format

Keep the text before the prompts short, about 120–220 words. The prompts are the product.

````
# [Campaign title, 2–4 words]

**Concept:** [2–3 sentences: the controlling idea and how it comes out of the brief.]

**Styling:** [What the clothes do in the idea, then the key pieces per model and why. 2–4 short bullets or one short paragraph.]

**Visual system:** Palette: … · Light: … · Medium: … · Hair & makeup: …

[Only if you made assumptions: *Assumed:* …]

## Hero: [shot name]
*Purpose:* [one line: what this frame establishes]
*References:*
- @image_1 — style frame: copy only its light, colour grade, film grain, lens feel and mood. Do not copy its people, faces, clothes or buildings.
- @image_2 — face of [model].
- [@image_N — look board: everything [model] wears, when the brief has real products]
- When references conflict: garments win, then faces, then style.
```
[prompt]
```
Aspect ratio: …

## Supporting 1: [shot name]
*Purpose:* …
*References:*
- @image_1 — style frame … (as above, then only the people in this frame)
```
[prompt]
```
Aspect ratio: …

[Supporting 2, and optionally 3]
````

A complete worked example is in `references/example-campaign.md`.

## Before you deliver

Re-read the campaign once against these checks, and fix anything that fails:
- Can the concept be stated in one sentence, and does each shot make it visible?
- Does every garment, fabric and accessory have a reason tied to the concept?
- Are palette, light family, medium and hair/makeup worded the same way in every prompt?
- Does each supporting shot have its own job and differ from the hero in at least two variables?
- Does every frame have a full world: a foreground element, 3–5 specific set details and some atmosphere?
- Does every model in every prompt have a specific, mechanically described expression?
- Is each prompt standalone, about 130–180 words (up to about 200 with several models), free of filler words, and does it end with the no-text line?

## Avatiser studio integration

In the Avatiser repo this skill is the front end of the studio engine's `fashion-editorial` campaign type. The engine parses the saved campaign and routes each shot to a generation model, so two things matter beyond the rules above.

**Realism doctrine.** Every prompt must also satisfy `studio/prompts/realism-core.md`, the house rule that output must never read as AI. Read it once per session. In practice:
- *Claim a real camera.* Put the body and lens in the framing line, not just a focal length ("shot on a Hasselblad 500C/M, 80mm", "Leica M6, 35mm Summicron"). One focal length per frame.
- *Imperfection pass.* Every prompt carries 2–3 concrete traces of reality matched to the medium (visible pores and flyaway hairs, a crease in the linen, dust in the light beam, slight halation, grain) instead of a single sign of life.
- *Casting.* Name each model's nationality or region in every prompt ("a South Indian woman", "a Darjeeling-born Indian woman"), matched to the market the campaign runs in. Skin tone and hair alone are not enough: without a nationality the generator falls back to its own default and may cast someone the audience won't recognise as one of them. If the brief gives no nationality, cast for the brand's market and say so under *Assumed*.
- *Length.* The 130–200 word guide above is a target, not a cap. When the brief carries real SKUs or specific casting, go to about 250–300 words rather than cut brand styling, casting cues or set details, but keep the most important information first, since generators lose detail toward the end. Never cut a casting cue to save words.
- *Casting cues beyond the label.* If the generator is likely to misread a model (for example deep skin plus curls defaulting to an African casting for an Indian brief), open the prompt with the nationality ("Editorial fashion photograph of two Indian women…"), name a city or community, describe hair texture precisely, and add a small culturally specific detail the person would really wear (a gold nose stud). Then lock the face with a casting headshot (below).
- *Faces.* Words still describe each model in every prompt (generators need it), but the engine locks identity from the approved hero render. Keep each model's description worded identically across prompts so it agrees with that reference. For people-led campaigns, also write one chest-up casting headshot prompt per model (neutral expression, window light, same film stock) and save them to `studio/projects/<slug>/refs/models/CASTING.md`; the user generates and approves those faces first and attaches them to every shot.
- Never type brand names, logos or label text into a prompt. If the brief includes a product, say it is supplied as a reference image.

**Output format is a contract.** The engine parses the saved file, so keep these exactly: the `# Title` line, `**Concept:**` and `**Visual system:**` paragraphs, the shot headings `## Hero: …` and `## Supporting 1: …` / `2` / `3`, the `*Purpose:*` line, each prompt in its own fenced block, and `Aspect ratio: W:H` on the line after it.

**Two passes per shot, and a reference key.** Each shot renders twice: first a Soul 2.0 *style frame* (the most photographic look, but it takes only one face), then a final render on a multi-reference model (Seedream) that keeps the style frame's look and locks faces and garments to references. Under each shot's `*Purpose:*` line, add a `*References:*` line followed by one `- @image_N — …` bullet per attached image, in attach order:
- `@image_1` is always the style frame, limited to light, colour grade, film grain, lens feel and mood, with an explicit "do not copy its people, faces, clothes or buildings".
- Then the casting headshot of each person in the frame. Supporting shots may cite the approved hero instead.
- Then one **look board** per person when the brief has real products: a single image holding all of that person's SKUs. Never mix two people's products on one board. Keep every board's width-to-height ratio between 0.4 and 2.5 (Seedream rejects anything outside that range); about 2:1 for three products works well. Crop each product photo to the garment so faces from the brand's own photos don't leak in.
- A last bullet giving priority when references conflict: garments, then faces, then style.
- In single-person shots, name what she is *not* wearing from the other looks ("Nothing else: no scarf").

**Scale shots: plate first, people second.** For a wide frame with small figures, give the shot its own `*Style frame:*` block after the main prompt: the same landscape rendered empty on Soul 2.0. The main prompt is then a Seedream insert: "add two tiny … into @image_1, change nothing else", sized against something in the frame, and lit to match the plate's sun direction, shadows, mist and grain. Attach only the look boards. Never attach the hero or the casting photos to a scale shot: they pull the figures to hero size, and the result looks pasted in.

**Name what isn't there.** When a generator keeps adding a motif the product doesn't have (stems and red flowers on a scarf, a second charm), say so in the garment line ("periwinkle only, no stems, leaves or red"). For vehicles, objects and buildings with a modern substitute, describe the old one physically and rule out the substitute ("a tiny blue saddle-tank steam locomotive with a tall black chimney, a steam engine and not a diesel"). Steam coming out of a diesel is a physics hard fail.

**Beauty and skincare briefs.** The same method works for skincare, with three changes:
- *Skin is the garment.* Style clothes to stay out of the way (plain cotton that separates from the set) and leave face, shoulders and hands bare. Every prompt carries an unretouched-skin line: visible pores, fine vellus hair, dewy, never oily or airbrushed.
- *A third pass locks the label.* Use campaign type `beauty-editorial` (`studio.js new <slug> beauty`). Any shot that shows packaging gets a `*Product lock:*` block after its prompt: a Nano Banana edit that swaps the generated product for the exact product photo (same size, angle, relit to the scene) and changes nothing else. The final prompt references the product photo only for shape and colour, and its closing line reads "No text, logos or watermarks other than the product's own label." Shots without packaging have no lock block and skip that pass.
- *Skincare codes, not fashion codes.* A heritage location, a warm film grade and full-length framing read as fashion editorial, and the product disappears (tested: a stepwell campaign failed for exactly this). For skincare: close crops of face, hands and product; packaging at least 20–30% of the frame in product shots, with its texture (gel, capsules, droplets) big; the palette taken from the packaging; water crystal-clear, never murky; bright, clean, directional light; crisp medium-format digital rather than heavy grain. Keep one controlling idea, but find it in a set the packaging's colours can own.
- *Style frames are opt-in.* Seedream's clean commercial look suits skincare, so most beauty shots go straight to the Seedream final with no Soul pass. Add `*Style frame:*` only where Soul's realism earns it: a bare `*Style frame:*` line (Soul renders the shot's own prompt) for skin-close portraits, or a `*Style frame:*` block with its own prompt for an empty wide plate. Without a style frame, number the References key from the faces.
- *Claims and casting.* Build hydration, texture or ritual stories, never fairness, lightening or before/after framing (ASCI's guidelines on skin-lightening ads). Cast deep and mature skin with pride, and never show darker skin as a problem to fix.

**Locations the model might reinvent.** Soul in particular fills gaps with its own defaults: "toy train" became a miniature model and "station" a European building. Describe real places physically ("a small Indian hill-station halt with grey stone walls and a corrugated tin canopy"; "a real narrow-gauge steam locomotive no taller than a man"), and keep name boards out of frame.

**Where it goes.** Save the campaign to `studio/projects/<slug>/campaign.md`, where `<slug>` is the campaign title in kebab-case. Create the project with `node studio/studio.js new <slug> fashion` first, then compile with `node studio/studio.js compile <slug>`. The `/campaign` command does all of this.
