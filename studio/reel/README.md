# studio/reel: shoot reel editor (Remotion)

Turns approved 9:16 campaign clips into a finished Reel. Each clip gets editorial captions, film grain, cross-dissolves, a brand bar with an optional countdown pill, and a product end card.

## Use

```bash
cd studio/reel && npm install
# put clips and the end-card still in public/<campaign>/ (git-ignored)
npx remotion studio src/index.ts        # preview and adjust
npx remotion render src/index.ts ShootReel out/<name>.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell \
  --codec=h264 --crf=16
```

`--browser-executable` is only needed in cloud sessions that ship Playwright's headless shell. Locally, Remotion downloads its own.

## Make a new reel

Edit or copy the props in `src/reel.ts`. Each scene sets:

- `clip`: the clip file.
- `lines`: the headline, one entry per line; `italic` sets the second voice.
- `kicker` and `note`: optional small lines above and below the headline.
- `place`: where the caption sits, chosen so the type stays off the face and the pack:
  - `top`
  - `top-right`
  - `bottom`
  - `bottom-right`

The end card takes:

- a **label-locked** product still;
- the product title and subtitle;
- claims;
- the brand URL.

Timing:

- Clips run 3 s each (`SCENE_FRAMES`) and cross-dissolve over `XFADE` frames.
- The end card runs for `END_FRAMES`.

Caption safe zones follow the Instagram Reels UI: no type in the bottom ~420 px, the right ~150 px or the top ~220 px.

## Rules (from the beauty-campaign-director skill)

- **Copy:** on-screen claims come only from the brand's own product page or claims sheet.
- **Clips:** they must carry the corrected label. Never animate a frame whose label lock failed.
- **Retakes:** if a model misrenders the product's texture or finish (for example a "no white cast" sunscreen turning into a white patch), regenerate the clip with an explicit **last frame** showing the correct result (`first_frame_url` + `last_frame_url`) rather than prompting harder.
