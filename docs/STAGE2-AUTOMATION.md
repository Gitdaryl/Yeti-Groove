# Stage 2 Evaluation: Automating First Drafts

*Written 2026-07-24 after the Stage 1 pipeline rebuild. This is an evaluation, not a build. Nothing here is wired up yet.*

## What Stage 1 gives us to work with

Every order now lands as structured data in Vercel Blob:

- `orders/{id}/order.json`: style, key message, script points, brand links (website, IG, FB), delivery week
- `orders/{id}/media/*`: customer photos and video, already uploaded, no Drive hunting
- Event trail for status, and an admin API to attach drafts and deliver

That structure is exactly what an automation needs as input. Stage 1 was the hard part.

## Feasibility by style

**High: worth automating first**

| Style | First-draft recipe |
|---|---|
| AI Slideshow | Claude picks best customer photos + writes caption, Seedance/Higgsfield image-to-video for motion, music bed |
| Photo styles (needs-media) | Same recipe: top photos + key message, one motion pass |
| AI Story / Company Promo (no media) | Text-to-video from key message + brand colors scraped from their website |

**Medium: automate the script, not the video**

| Style | First-draft recipe |
|---|---|
| AI + Real Voiceover | Claude drafts script from scriptNotes for the existing approval step, voiceover stays manual |
| Virtual UGC | Script draft + HeyGen/Arcads avatar generation, but tone risk is high, QA every frame |
| Promo + Custom Music | Script and structure draft only, music stays manual |

**Low: keep manual**

- Selfie + Subtitles (customer footage editing judgment)
- AI Logo Character (brand identity work, one bad draft burns trust)

## Recommended shape

1. Keep the trigger manual at first: a "Draft it" step Yeti runs from the IDE (or later a button in /admin). Auto-trigger on order arrival only after the drafts prove consistently usable.
2. Draft outputs land in `orders/{id}/delivery/` prefixed `draft-`, so they show in /admin next to the order but are never sent until Yeti hits Deliver.
3. Caption + hashtag copy is nearly free to automate now: ANTHROPIC_API_KEY is already in the project env. That alone saves time on every single order regardless of style.
4. Generation backends already available in this environment: Higgsfield connector (video/image/audio/UGC workflows), Seedance skill (Fal), Arcads skill, HeyGen (used for Holly/Joe scripts). n8n could orchestrate later but its MCP connection needs re-auth.

## Suggested order of attack

1. Auto-caption + hashtags on every order (1 session to build, zero risk, drafts only)
2. AI Slideshow first-draft (highest volume style, clearest recipe)
3. Script auto-draft for voiceover/UGC styles (feeds the approval step that already exists)
4. Revisit auto-trigger once 5 to 10 drafts have shipped with light edits

## Cost note

Each video draft costs generation credits (Seedance/Higgsfield). At $150 per post, one draft per order is fine; avoid loops that regenerate many variants unattended.
