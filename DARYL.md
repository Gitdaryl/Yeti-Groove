# Daryl Young - Context Cheat Sheet

This file exists so Claude has full context when working remotely (mobile / new session / no local memory).
Load this at the start of any session: "Read DARYL.md before we start."

---

## Who You Are

**Daryl Young** (GitHub: Gitdaryl) - Manitou Beach / Devils Lake, Michigan area.
Runs **Yeti Groove Media LLC**. Relative newcomer to coding but actively building and deploying real projects with Claude as primary collaborator.

**Financial context (critical):** Near senior age, no retirement savings. Every decision carries real financial weight. Revenue potential and time-to-money are always relevant filters. Don't build things that don't convert.

**Claude's role:** Senior operator across engineering, UI/UX, marketing, copywriting, business strategy. Daryl is the decision-maker and visionary.

---

## All Active Projects

| Project | Repo | Live URL | Stack | Notes |
|---------|------|----------|-------|-------|
| **Manitou Beach** | Gitdaryl/Manitou-Beach | manitou-beach.vercel.app | React+Vite, Notion CMS, Vercel | Most active. Future domain: manitoubeachmichigan.com (not live yet) |
| **Yetickets** | (within Manitou Beach) | - | Same stack | Ticketing/sponsorship brand, Stripe Express Connect, 1.25% fee |
| **Holly Griewahn** | Gitdaryl/Holly | hollygriewahn.vercel.app | React+Vite, CSS-in-JS | Irish Hills real estate authority site |
| **Joe Profit** | Gitdaryl/joe-profit (confirm) | joeprofitneverbroken.com | React | Legends Commission proof of concept. Audio race condition bug deferred. |
| **Legends Commission** | Gitdaryl/Yeti-Signature-Films (confirm) | yeti-signature-films.vercel.app | React | $50k+ legacy preservation commissions |
| **Devils Lake View Living** | (confirm) | DLVL on Vercel | React+Vite+Tailwind | Darlene's boutique site, $49/mo, customer zero for Yeti Web Services |
| **yetigroove.com** | (confirm) | yetigroove.com | - | Hub/placeholder. Current A2P campaign sender domain. |

---

## Critical URL Rules

- Manitou Beach live URL = `https://manitou-beach.vercel.app` (until domain swap)
- `manitoubeach.com` = DOES NOT EXIST, never use as a site URL (email `hello@manitoubeach.com` is fine)
- `manitoubeachmichigan.com` = future domain, not live yet
- Never hardcode domain names - use `SITE_URL` env var

---

## Writing & Copy Rules

1. **No em dash** (--) - dead giveaway of AI writing. Use `-`, `...`, comma, or rewrite instead.
2. **Yeti brand voice** - warm, upbeat, conversational, light humor. "Would my 70-year-old neighbor smile?" test. Never corporate/clinical/robotic.
3. **No sycophancy** - honest evaluations, active pushback on bad ideas, compliments only when earned.
4. **10px hard floor** on all text - no tiny print anywhere.
5. **Images always large** - Daryl always finds AI-placed images too small, go bigger by default.

---

## Architecture Rules

**3-Layer System** (defined in AGENTS.md/CLAUDE.md):
- Layer 1 Directives (`directives/`) - SOPs in Markdown, living documents
- Layer 2 Orchestration - AI's job, intelligent routing
- Layer 3 Execution (`execution/`) - deterministic Python scripts, reliable + testable

**Scroll/Keyboard SOP (CRITICAL):**
- Background/video/overlay = `position: fixed`
- Page content = NEVER fixed or trapped in custom scroll container
- Body must scroll naturally. Never trap native scroll.

---

## Tooling Available (MCP + Direct Access)

- **Notion MCP** - full read/write access to all Notion databases. Use proactively, never ask Daryl to do Notion setup steps.
- **Vercel MCP** - deploy, manage env vars, check builds. Use proactively.
- **GitHub MCP** - read/write files in any Gitdaryl repo. This is how remote edits work.

---

## Manitou Beach - Key Details

- `src/App.jsx` is intentionally monolithic. **DO NOT refactor into multiple files.**
- Pages in `src/pages/` - FoodTrucksPage, HappeningPage, VendorPortalPage, etc.
- API endpoints in `/api/` - 13+ Vercel serverless functions
- Notion is the CMS - content lives there, not in code
- Food truck system fully built: QA agent (Haiku), check-in flow, Stripe checkout
- Pricing: Free / $9/mo Founding (food trucks), $25/mo Business, $49/mo Premium (listings)
- Pricing is LOCKED - flat rates, no dynamic escalator
- Email sender: `events@yetigroove.com` until manitoubeachmichigan.com domain resolves

## Manitou Beach - Stripe / Payments

- Stripe Express Connect architecture: destination charges, 1.25% Yetickets fee
- Org onboarding via `/partner-intake`
- Vendor registration built (2026-03-19) - organizer-branded, PDF receipt, blast comms

## Manitou Beach - SMS / A2P

- A2P APPROVED + LIVE (as of early April 2026) - no longer a blocker
- Twilio under yetigroove.com campaign
- Yetickets will need its own separate A2P campaign (different brand registration)

---

## Holly Griewahn - Key Details

- `src/App.jsx` full SPA (~750 lines). All views in one file.
- `src/data/regions.js` - 9 geographic regions
- `src/data/lakes.js` - 20+ lakes with DNR stats
- Colors: navy `#1a2332`, pink `#e84393`, bg `#faf9f7`
- Fonts: Playfair Display + DM Sans
- Next: MLS integration (Holly to provide direction), AI receptionist 5-phase plan

---

## Pending / Active Work (as of 2026-04-08)

- **Organizer dashboard** - theme-aware component, build in MB, lift into Yetickets later
- **Social media auto-poster** - FB Page + IG Business via Meta Graph API + Haiku, design session needed
- **Food truck/event connection** - needs Opus planning (multi-entity schema design)
- **Email confirmation system** - blocked on Resend domain decision ($20/mo for second domain)
- **Joe Profit email domain** - swap from yetigroove.com to joeprofitneverbroken.com when Resend verifies
- **Roofing client** - meeting was 2026-04-02, media ask + platform upsell opportunity
- **Wine Trail Awards Ceremony** - Nov 2026, Chateau Aeronautique target venue, sponsor tiers
- **MB per-page color theming** - spec at specs/mb-page-theming-spec.md, 7 themes, CSS token architecture

---

## Business Strategy Notes

- All projects connect under Yeti Groove Media LLC. Not isolated - one ecosystem.
- Manitou Beach = community engine + proving ground for all tech
- yetigroove.com = future service/AI tools layer
- Legends Commission = premium tier ($50k+ commissions)
- Holly = first external client, prototype for SaaS template
- **Automation is survival** - Daryl is one person. Automate everything possible.
- **Expansion strategy** - Yeti-direct tourist destinations (South Haven, Traverse City, etc.) vs partner territories. Never share the reserve territory list publicly.

---

## Model Delegation

- **Opus** - strategy, architecture, multi-file planning, wrong decisions = rebuild scenarios
- **Sonnet** - mechanical fixes, UI builds, single-file changes, routine tasks
- **Haiku** - QA agent, SMS, automated tasks running on cron

---

## Session Startup Checklist (Remote/Mobile)

1. Read this file
2. Check which project you're working on above
3. Use GitHub MCP to browse current files before editing
4. Edits via GitHub MCP auto-deploy to Vercel
5. Notion MCP available for CMS changes
