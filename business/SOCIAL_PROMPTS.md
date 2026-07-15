# avatiser. — social automation prompt pack

The three prompts that run the content machine. Paste them into Claude Code
(this repo open, so BRAND_VOICE.md is in context) with the Higgsfield MCP
connected for generation and the Blotato MCP connected for posting.

---

## Prompt 1 — the weekly batch (run every Monday)

> Read BRAND_VOICE.md. Create this week's content batch: 7 Instagram posts
> and 7 LinkedIn posts following the weekly mix in section 8 (3 proof,
> 1 economics, 1 process, 1 spec drop, 1 take), each tailored to its
> platform per section 5.
>
> For each post: write the caption/copy, then use the Higgsfield MCP to
> generate the visuals (carousels: 6 slides, 4:5; follow the visual system
> in section 7). For proof posts, use our real portfolio clips/frames from
> assets/videos/ where possible instead of generating new ones.
>
> Show me the full batch for review as a single summary (copy + image
> links, day by day). Do NOT post anything yet — wait for my approval or
> edits. After I approve, use the Blotato MCP to schedule the week:
> Instagram 6:00 PM and LinkedIn 9:00 AM in my audience's primary timezone
> (US Eastern), one post per day each.

## Prompt 2 — single post, fast (for reactive/trend moments)

> Read BRAND_VOICE.md. Create one [Instagram carousel / LinkedIn post]
> about: [TOPIC — e.g. "we just delivered a haircare campaign in 41 hours"].
> Write the copy, generate the visuals with Higgsfield per the visual
> system, show me for approval, then post it via Blotato.

## Prompt 3 — repurpose a delivery into content (run after every client win)

> Read BRAND_VOICE.md. Here are frames/clips from a delivery we're allowed
> to share: [attach or point to files]. Build one proof post for Instagram
> and one case-study story post for LinkedIn from them. Include the real
> numbers (hours from brief to delivery, shoot-cost equivalent). Show me
> both for approval, then schedule via Blotato for the next open slots.

## Troubleshooting prompt (when anything errors)

> Here's a screenshot/paste of the error from the last run: [paste].
> Diagnose it, fix what you can from this repo, and tell me the one thing
> I need to do manually if the fix needs my account access.

---

## One-time setup checklist

1. **Higgsfield MCP** — already connected in the Claude session. Credits
   visible via its balance tool.
2. **Blotato MCP** (the posting bridge):
   - Create an account at blotato.com and connect the avatiser Instagram
     Business account and LinkedIn page under Social Accounts.
   - Copy the MCP/API URL from Blotato's settings.
   - Claude app → Settings → Connectors → Add custom connector → name it
     "Blotato", paste the URL, Connect, and authorize.
3. **First run** — use Prompt 2 with a proof topic for a single test post
   on one platform before trusting the weekly batch.

## Rules the automation must never break

- Nothing publishes without founder approval of the batch.
- "avatiser" lowercase everywhere; banned-words list in BRAND_VOICE.md §4.
- Spec work always labeled spec. No fabricated client results, ever.
- One CTA per post: the free sample pack → avatiser.com.
