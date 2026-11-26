# studio/qa: cost and quality gates

Every paid generation passes three gates:

1. **Preflight**, before spending.
2. **Machine checks** on what comes back.
3. **A human look**, at a sheet the tool builds.

Retries are the biggest avoidable cost. The gates stop the known causes before any credits are spent.

```bash
python3 studio/qa/qa.py balance                                   # Kie credits left
python3 studio/qa/qa.py preflight jobs.json --brand skinbell-ultrasmart --cap 300
python3 studio/qa/qa.py scan clip.mp4 --brand skinbell-ultrasmart  # where does the label scramble?
python3 studio/qa/qa.py sheet review.jpg a.png b.png               # label crops for the human gate
python3 studio/qa/qa.py ledger <project> "<label>" <taskId> ...    # real credits from Kie into projects/<project>/ledger.csv
```

- **Dependencies:** `apt-get install tesseract-ocr` and `pip install pytesseract rapidfuzz pillow numpy`, plus ffmpeg.
- **Kie key:** calls go through the session proxy, which adds the key. For local use, set `KIE_API_KEY`.

## What preflight blocks or warns about (each rule comes from money already lost)

| Rule | Why it exists (Skinbell, Nov 2026) |
|---|---|
| **WARN** when a video shows the product changing state (blend, absorb, melt, spread, sink in…) with no `last_frame_url` | The reapply shot cost **288 credits in rejected takes** (three 1080p Wan clips with a white patch). The fix that worked first time: make the "after" still (18 credits) and pass it as the last frame. |
| **WARN** on a Wan 1080p final with no approved 480P draft | A 3 s draft costs 24 credits; a final costs 96. Prove the motion and prompt at 480P first, then render once at 1080p. |
| **WARN** when the pack turns, tilts or rotates in a video | Video models scramble labels while a pack rotates. That was the dispense clip at 1.5–2.4 s. Keep the pack still, or plan to trim. |
| **WARN** when the same shot runs on several models | Comparisons double or triple image cost. Run them once per new model, then route by shot type. |
| **ERROR** when label fine print is typed into a generation prompt | Typed copy makes models invent lettering. Reference the product photo. Typed copy belongs only in the label-lock pass (`stage: "lock"`). |
| **ERROR** when an image prompt has no `STRICT PRODUCT SCALE LOCK` | Without it, scale drift forces a retake. |
| **ERROR** on fairness or lightening language | ASCI. `no lightening` is allowed. |
| **ERROR** when a duration is below the model's minimum, or the estimate exceeds `--cap` | The job would fail or be billed at the minimum; the cap stops runaway batches. |

## Machine checks after generation

- **`scan`** samples a clip every 0.2 s, reads the label with OCR and flags frames where it degrades against the clip's own median. It then proposes the longest clean range: **trim instead of regenerating** (free).
  - **Tested on** the Skinbell dispense clip: it flagged 1.6–1.8 s and 2.2–2.4 s and proposed 0–1.6 s, which matches the manual call.
  - **Limitation:** OCR is a *relative* signal only. Its absolute score can't pass or fail a single still; a garbled label once scored higher than a clean one. So stills go to the human gate.

## Human gate (about 30 s per asset, before the next paid step)

Check each item against the review sheet:

- **Identity:** the model still looks like the cast face (e.g. G4).
- **Hands:** five fingers, nothing fused.
- **Product scale:** matches the scale lock.
- **Label:** every line matches the pack.
- **Look:** skin texture is real, not waxy, and the colour is true.
- **Copy:** on-screen claims come only from the brand's approved list (`brands/<brand>.json`).

**Never lock, animate or upscale an alternate.** Pick first, then spend.

## Model routing and price (Kie, Nov 2026; `pricing.json`)

| Shot type | Model | Cost |
|---|---|---|
| Lifestyle / story stills, identity matters most | Seedream 5.5 (2K) | 6.3 + 1.44 per reference ≈ 9.2 credits |
| Product close-ups, realism and label matter most | Kling 4.0 Image (2K; 4K only for hero or print) | 12.3 credits at 2K / 18 at 4K |
| Label lock, only on picks where the label is readable at delivery size | Nano Banana Pro; bulk via Google Batch API | 18 credits on Kie (Google Batch ≈ $0.067) |
| Clips where the pack is held to camera | Kling 4.0 | 127.5 credits per 3 s at 1080p |
| Other clips, and 480P drafts | Wan 3.0 | 24 (480P draft) / 96 (1080p) per 3 s |
| Longer clips (≥ 4 s), once it passes a side-by-side | MAGI-2 | 70.4 credits per 4 s at 1080p (only 1080p) |

Kie's high-tier top-ups add about 10% bonus credits.
