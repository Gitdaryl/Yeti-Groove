### Phase 2: Session Declaration
- **Quick Decision:** <5 min, no implementation, confirm direction
- **Coding:** Deep work, stay focused, defer non-essentials
- **Planning:** Strategy, architecture, multi-project evaluation
- **Evaluation:** Research tool/approach, pros/cons, recommendation

### Phase 3: Decision Codification (at end of session)
If you make a decision:
### Phase 4: Cross-Session Handoff (when switching environments)
---

## Update Cadence (CRITICAL)

- **Weekly:** Review DARYL.md every Sunday
- **Per Session:** Flag what changed before closing session
- **Per Decision:** Major decisions added immediately
- **Trigger:** If you notice memory conflict, sync immediately
- **Session start:** Check Notion Yeti Command Center for open tasks before diving in. Project decisions live there.

---

## All Active Projects

### 🚀 Revenue/Live (Tier 1 - Priority)

| Project | Repo | Live URL | Status | Key Notes |
|---------|------|----------|--------|-----------|
| **Manitou Beach** | Gitdaryl/Manitou-Beach | manitou-beach.vercel.app | ACTIVE | Community engine. Domain pending: manitoubeachmichigan.com |
| **Yetickets** | Gitdaryl/Yetickets | yetickets.app | ACTIVE | Standalone ticketing platform. A2P LIVE (Apr 2026). Stripe Express Connect (1.25% fee). MVP deployed 2026-04-09. |
| **YetiClone** | Gitdaryl/YetiClone | yeticlone.vercel.app | UNBLOCKED | AI avatar video portal. HeyGen Avatar V. Backend built 2026-06-11. Env wiring needed before live. Sam Q (State Farm) is client zero. |
| **Holly Griewahn** | Gitdaryl/Holly | hollygriewahn.vercel.app | ACTIVE | Irish Hills real estate. 20+ lakes. MLS integration pending. |
| **Joe Profit** | Gitdaryl/joe-profit | joeprofitneverbroken.com | ACTIVE | Legends Commission PoC. Audio bug deferred. |
| **Legends Commission** | Gitdaryl/Yeti-Signature-Films | yeti-signature-films.vercel.app | ACTIVE | $50k+ legacy preservation commissions. Full pipeline. |
| **Devils Lake View Living** | (confirm path) | DLVL on Vercel | ACTIVE | Darlene's site, $49/mo. Customer zero for Yeti Web Services. |

### 🎬 Long-Term Creative (Tier 2 - Strategic, High ROI)

| Project | Type | Status | Notes |
|---------|------|--------|-------|
| **Erehmi** | Limited series script + faceless YouTube | IN PROGRESS | AI emergence themes. Scaffold Protocol Module 0 complete. Daryl = "Vox". **Large script document needs recovery.** |
| **Joe Profit Legend Series** | Documentary + social spinoffs | RESEARCH/PLANNING | Biopic + atomization. Milanote board exists; **next: Resume at Podcast board.** "Never Broken" manuscript is canonical. |
| **Wonder Whys** | Children's educational video brand | CONCEPT | Kids' learning + storytelling. Aligned with education passion. |
| **Roxadoc App** | Medical-travel MVP | DESIGN PHASE | Figma with Dr. Robert Coronado + Dave Werner. Scalable Service Button + Roxa Score badge. |
| **Notitia** | Nonprofit decentralized truth platform | CONCEPT | Micro-subscription funded, AI-curated. Long-horizon vision. |
| **Legacy Media** | Memoir-to-video automation pipeline | RESEARCH | Pilot: Joe Profit's "Never Broken." Full automation arc. |
| **Phobia Concept Album** | Halloween-themed music project | CONCEPT | 20+ phobia titles. Music + storytelling. |
| **Yeti Corp Strategic Plans** | Business model design | FOUNDATIONAL | Self-funded universal healthcare, equitable wages, "Climb the Mountain" compensation (tied to valuation milestones). **Daryl held accountable to this vision.** |
| **Star Shoutout** | Co-founded 2016 | PASSIVE | Crypto investment pivot. 3M preferred shares held. |

### 🔬 Active Explorations (Tier 3 - R&D, High Potential)

| Project | Type | Status | Next Step | Notes |
|---------|------|--------|-----------|-------|
| **iMessage-to-CRM SaaS** | SaaS Product | EXPLORATION | Validate funnel first | Mac Mini as always-on gateway. Targets SMB (real estate, hospitality, local services). **Decision: Build custom vs. Airtable + n8n backbone.** |
| **MB User Acquisition** | Go-to-Market | ACTIVE | Test outreach this week | **Zero paid users currently** (except Ladies Club $1k/year). Videos just shot, not yet edited. Erin/Amy/Chelsea can help acquisition. **REAL blocker: product-market fit validation, not infrastructure.** |
| **Rapid Demo Site Workflow** | Dev Workflow | EXPLORATION | Test with next client | Claude Code + Vercel + Unsplash/Pexels API. Polished PoC in <1 hour. Potential Yeti Groove brand product. |
| **n8n Emergency Deploy Agent** | Automation | PLANNING | Build after primary work | Natural language → Haiku fix → GitHub commit → Vercel redeploy. Closes mobile workflow gap. |

---

## 🛠️ Development Environment

### Antigravity IDE (Primary)
- **Access:** Direct terminal, no copy/paste friction
- **Claude Integration:** Claude Code via `claude` terminal command
- **MCPs:** GitHub MCP, Vercel MCP, Notion MCP configured
- **Workflow:** Edit → git commit → auto-deploy to Vercel

### Browser Claude (claude.ai)
- **Access:** Better UI, Higgsfield MCP, CLI tools
- **MCPs:** All of the above + Higgsfield connector
- **Use Case:** Design work, video generation, quick decisions

### Model Delegation
- **Opus:** Strategy, architecture, multi-file planning, rebuild scenarios
- **Sonnet:** Mechanical fixes, UI builds, single-file changes
- **Haiku:** QA agent, SMS, automated tasks on cron

---

## Critical Rules & Standards

### Copy/Writing Rules
1. **No em dash (--)** - Dead giveaway of AI. Use `-`, `...`, comma, or rewrite.
2. **Yeti brand voice** - Warm, upbeat, conversational, light humor. "70-year-old neighbor smile test." Never corporate/clinical.
3. **No sycophancy** - Honest evaluations, active pushback on bad ideas.
4. **10px hard floor** on all text - No tiny print.
5. **Images always large** - You always find AI images too small; go bigger by default.

### UI/Component Rules
1. **Manitou Beach:** `src/App.jsx` intentionally monolithic. **DO NOT refactor into multiple files.**
2. **Pages in `src/pages/`:** FoodTrucksPage, HappeningPage, VendorPortalPage, etc.
3. **API endpoints in `/api/`:** 13+ Vercel serverless functions.
4. **Scroll/Keyboard SOP (CRITICAL):**
   - Background/video/overlay = `position: fixed`
   - Page content = NEVER fixed or custom-scroll-trapped
   - Body must scroll naturally
5. **Holly Colors:** Navy `#1a2332`, Pink `#e84393`, BG `#faf9f7`. Fonts: Playfair Display + DM Sans.

### Architecture Rules
**3-Layer System:**
- Layer 1 Directives (`directives/`) - SOPs in Markdown
- Layer 2 Orchestration - AI's job, intelligent routing
- Layer 3 Execution (`execution/`) - Deterministic Python scripts

---

## 🎥 Video, Campaign & Content Rules

### Kallaway's Hook Formula Framework (STANDING RULE)
Apply to **ALL video, campaign, reel projects:**

**Fix 4 Common Mistakes:**
1. Delay - Hook within first 1 sec
2. Confusion - Crystal clear what's happening
3. Irrelevance - Why should *they* care?
4. Disinterest - Emotional resonance from frame 1

**Use 6 Hook Archetypes:**
- Fortune Teller (predict outcome)
- Experimenter (test/try something)
- Teacher (learn something)
- Magician (reveal/transform)
- Investigator (uncover mystery)
- Contrarian (subvert expectation)

**Align 4 Elements:**
- Visual (what they see)
- Text (what they read)
- Spoken (what they hear)
- Audio (music/SFX/silence)

---

## Project-Specific Details

### Yetickets - Current State

**Folder:** `/Users/darylyoung/Documents/Claude Code/Yetickets` | **Stack:** React + Vite + Tailwind + Vercel serverless + Notion + Stripe Express Connect

Standalone ticketing + sponsorship platform. NOT part of Manitou Beach repo. Embedded infrastructure layer - every Yeti Groove community deployment gets it. NOT competing with Eventbrite (1.25% only works at volume; value is as a bundled feature).

**Notion DBs (parent: 33d8c729-eb59-81cf-a475-cc21bceb05e6):**
- Organizations: 33d8c729eb5981c2925ec4471ca838b6 | Events: 33d8c729eb5981af8b0bc926bef1ebfe
- Tickets: 33d8c729eb5981cb9717fbc510ebfd4b | Sponsorships: 33d8c729eb598137aacac6e3648fb062

**Target customers:** Community nonprofits, festivals, sporting events, youth sports, church fundraisers, individual athletes raising sponsorships. Any person or group collecting money from people/businesses for an event/cause.

**Built (MVP 2026-04-09):** Org onboarding via Stripe Express, event listings, ticket purchase, sponsor wall, athlete fundraiser profiles, organizer dashboard (token-gated), QR check-in (manual ID entry), platform admin.

**NOT built yet:** Stripe webhook secret + BLOB_READ_WRITE_TOKEN (env wiring), PDF ticket generation, sponsor receipt PDFs, email notifications (Resend), SMS notifications (separate A2P campaign - Yetickets brand), QR camera scanning, event creation UI in dashboard, Yetickets A2P 10DLC (Daryl still needs to apply).

**Brand notes:** Yetickets SMS/A2P is its own separate Twilio campaign - not under MB. PDF tickets currently say "MANITOU BEACH" - needs white-labeling. Future: yetickets.com domain + standalone marketing site.

---

### YetiClone - Current State

**Folder:** `/Users/darylyoung/Documents/Claude Code/YetiClone` | **Stack:** React + Vite + Tailwind + Vercel serverless + HeyGen API + Vercel Blob + Stripe + Resend

Self-service AI video portal. Clients submit scripts, HeyGen generates avatar video from their Digital Twin, Daryl QAs (or trusted clients self-serve), client gets finished video. White-label - clients never see HeyGen.

**UNBLOCKED 2026-06-11:** Was shelved April 2026 (HeyGen Avatar V API had face-glitch bug). Bug fixed. Re-tested live: 10/10 generations clean. Backend built + committed same day.

**Pricing (locked):** Starter $249/mo (1 avatar, 8 videos), Growth $449/mo (1 avatar, 20 videos), Agency $749/mo (3 avatars, 40 videos). Annual commit = 2 months free. Shoot day $500-750 one-time.

**Client zero:** Sam Quisenberry (State Farm). 10 videos delivered across 2 months. URGENT: $640 outstanding (invoices YC-1001/YC-1002 not yet sent). Fix with manual Novo invoice. Office account: owner + 3 agents; month 3 = team expansion now. Portal needs org -> users layer. Target upgrade: Growth annual ($4,490) + shoot day ($500).

**Built (2026-06-11):** Portal scaffold (look picker, script submit, video status, QA queue, video library), `api/generate.js` v3 Avatar V, shared Vercel Blob JSON DB (replaces localStorage), hybrid QA model (gate new clients N videos then auto-trust), delivery email, admin QA ping, regen loop.

**INERT until Vercel env set:** `HEYGEN_API_KEY`, `HEYGEN_DEFAULT_VOICE_ID`, `HEYGEN_DEFAULT_AVATAR_ID`, `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN` (create new Blob store). Optional: `HEYGEN_CALLBACK_URL`, `YETICLONE_DEFAULT_GATES`.

**NOT built yet:** Vercel env wiring (code-complete, not live), UI wizard consolidation (merge /script + /create), org -> users layer, per-account billable-items ledger, Stripe tiers wired.

**QA model (Daryl's decision):** HYBRID. Gate new clients (Daryl QAs first N videos), then flip to self-serve with request-changes/regen. HeyGen account: API key `yeti-clone-api`, 5994 credits, 3 custom avatars + cloned voice built. Fish voice engine wins every test - always default Fish. All outputs: vertical 9:16 social only.

---

### Manitou Beach - Current State
- **Food Truck System:** QA agent (Haiku), check-in flow, Stripe checkout fully built
- **Pricing (LOCKED):** Free / $9/mo Founding (food trucks), $25/mo Business, $49/mo Premium (listings)
- **Stripe:** Express Connect (destination charges, 1.25% Yetickets fee)
- **A2P Status:** APPROVED + LIVE (Apr 2026). Twilio under yetigroove.com. Yetickets needs separate campaign.
- **Email Sender:** `events@yetigroove.com` (until manitoubeachmichigan.com resolves)
- **Known Bug:** Audio race condition on Joe Profit (deferred)
- **Referral/affiliate attribution system:** LIVE in production
- **Social media auto-poster:** LIVE in Yeti Admin (Meta Graph API, FB + IG, 2026-05-06)
- **Visitor Wall (`/visitor-wall`):** LIVE with Instagram gallery integration
- **Raffle wheel:** LIVE for LLLC Summerfest carnival event

**Stays Marketplace (beta):** Full feature set built - verification, iCal sync, guest calendar, inquiry flow. **Critical architecture decision: NO money flows through the platform** (accommodation tax liability + fair housing risk). Discovery + request-to-book only. This is permanent, not a phase 1 compromise.

**Event Lifecycle:** cancel/postpone/pause with attendee ribbons built. Awaiting 3 Notion schema fields: Lifecycle, Outdoors, Change Note. Pending: add PLATFORM_ADMIN_PHONE to Vercel for iCal failure alerts.

**Competitive moat:** Hyperlocal network density + merchant relationships. Not software cloning - the moat is the relationships.

### MB Acquisition Strategy (THIS WEEK)
- **Paid User Status:** 1 (Ladies Club, $1k/year). Video content shot yesterday, not yet edited/posted.
- **Team for Acquisition:**
  - **Erin:** Reach out to event organizers (free listings angle)
  - **Amy:** Contact food truck vendors (free listings angle)
  - **Chelsea:** Irish Hills Chamber of Commerce (highest leverage, has relationships)
- **Success Metric:** Get 5+ organizers to try free listing, measure conversion to paid
- **Do NOT hire yet.** Test the funnel yourself first. Track: Who says yes? Why? Convert to paid?
- **Playbook:** Test week 1 solo. If >30% conversion, brief Chelsea. If successful, add Erin + Amy.
- **Tracking:** Google Sheet: Name | Type | Date Contacted | Response | Status | Email
- **Pricing validation needed:** What should organizers pay? Vendors? (Currently $1k/yr for Ladies Club, but that's high-touch.)

### Holly Griewahn
- **SPA Stack:** React+Vite, ~750 lines in `src/App.jsx`
- **Data:** 9 regions, 20+ lakes with DNR stats
- **Next:** MLS integration (Holly to provide direction), AI receptionist 5-phase plan
- **Note:** No paid work yet. First external client, prototype for SaaS template. Don't over-invest until commitment.

### Joe Profit
- **Manuscript:** "Never Broken" is canonical for all quotes/reference
- **Bug:** Audio race condition (deferred, known issue)

---

### Sunny Skies Dispatcher

Content rotation system for Sunny Skies Roofing (Isaac reports to Daryl). Runs on VPS (DigitalOcean 143.198.171.9) via Node.js cron at 9am/12pm/6pm ET. **NOT Claude routines** - migrated to VPS for reliability.

- **Admin UI:** dispatcher-admin-six.vercel.app - drag-and-drop, global pause/resume, per-content-type toggles
- **Remote config server:** VPS port 3847
- **7 content types:** Quotes, Midday, Evening, CTA, Dev Education, Fuel Gauge, + more
- **Reviews batch:** 80+ Google reviews scraped, Hyperframes batch-render ready (skip Joshua Wirick)
- **Clip library:** 46 video bg clips locally, clip-index.json, mood/category mapped, needs Google Drive upload

---

### Weekly Tech Radar Agent

Frontier AI + dev tooling monitoring, runs Mondays 8am ET via GitHub Actions. Haiku ranks new releases/tools against portfolio relevance, emails digest, creates Notion Command Center tasks automatically. Pending: `NOTION_COMMAND_CENTER_TOKEN` secret needed to fully activate auto-task creation.

---

### Lake Access Partnership (social.yetigroove.com/lakeaccess)

Co-branded partner page with Dennis Babjack (Lake Access Magazine). Discounted video pricing for Dennis's audience. Dennis offered 25% equity + 64-video client production deal. Page is live at social.yetigroove.com/lakeaccess.

---

## 📋 Pending Work (as of 2026-06-11)

**YetiClone (urgent):**
- Create Vercel Blob store + set env vars (HEYGEN_API_KEY, RESEND_API_KEY, BLOB_READ_WRITE_TOKEN, etc.) to go live
- Send $640 catch-up invoices to Sam Q (YC-1001/YC-1002, May/June, use Novo manual invoice)
- Build org -> users layer for Sam's office (owner + 3 agents, consolidated invoice to owner)

**Yetickets:**
- Yetickets A2P 10DLC campaign — Daryl still needs to apply (separate from MB campaign)
- Create Stripe webhook endpoint + BLOB_READ_WRITE_TOKEN

**Manitou Beach:**
- Add 3 Notion schema fields: Lifecycle, Outdoors, Change Note (Event Lifecycle feature waiting on this)
- Add PLATFORM_ADMIN_PHONE to Vercel (iCal failure alerts)
- Organizer dashboard - Theme-aware, build in MB, lift to Yetickets
- MB per-page color theming - Spec at `specs/mb-page-theming-spec.md`, 7 themes, CSS tokens

**Tech Radar:**
- Add NOTION_COMMAND_CENTER_TOKEN secret to activate auto-task creation

**Sunny Skies:**
- Upload 46 video bg clips to Google Drive (local only currently)

**Other:**
- Wine Trail Awards Ceremony - Nov 2026, Chateau Aeronautique target, sponsor tiers
- Erehmi script recovery - Large document needs to be recovered into this context

**DONE (remove next review):**
- ~~Joe Profit domain swap~~ - COMPLETE 2026-04-25 (joeprofitneverbroken.com live)
- ~~Social media auto-poster~~ - LIVE 2026-05-06 (Meta Graph API, FB + IG)

---

## 🚀 Business Strategy & Vision

### Core Ecosystem
- **Yeti Groove Media LLC** - All projects connect here. Not silos.
- **Manitou Beach** - Community engine + proving ground for tech/features
- **yetigroove.com** - Future service/AI tools layer (Yeti Loop Automation, etc.)
- **Legends Commission** - Premium tier ($50k+ commissions)
- **Holly** - First external client, prototype for SaaS template
- **Automation is Survival** - You're one person. Automate everything possible.

### Financial Accountability
- Proactively flag grant/funding opportunities (tourism, small business, community development, innovation, sustainability)
- Always measure time-to-money and conversion potential
- Revenue projects take priority over passion projects, unless strategic

### Expansion Strategy
- Yeti-direct tourist destinations (South Haven, Traverse City, etc.) vs. partner territories
- **Never share reserve territory list publicly**

---

## 🎯 URLs & Domain Rules

### Live Domains
- `manitou-beach.vercel.app` - Current MB live URL
- `hollygriewahn.vercel.app` - Holly site
- `joeprofitneverbroken.com` - Joe Profit (domain pending swap from yetigroove.com)
- `yetigroove.com` - Hub/placeholder, A2P sender domain

### Pending Domains
- `manitoubeachmichigan.com` - Future MB domain, not live yet
- **NEVER** use `manitoubeach.com` - Does not exist. Email `hello@manitoubeach.com` is fine.

### Best Practices
- Never hardcode domain names - use `SITE_URL` env var
- Always use `https://` in full URLs

---

## 📝 How to Update DARYL.md

1. **Edit locally in Antigravity:**
```bash
   cd ~/Yeti-Groove
   nano DARYL.md  # or your editor
   git add DARYL.md
   git commit -m "docs: update DARYL.md - [what changed]"
   git push origin main
```

2. **Or from Browser Claude**
   - You can request changes, I'll write them

3. **Weekly review:** Every Sunday, scan for stale sections

4. **Trigger updates:** If memory and MD conflict, resolve immediately

---

## 💡 Decision Log (This Session - 2026-05-30)

**Airtable Evaluation:**
- Researched Airtable + n8n integration
- Real gaps identified: iMessage-to-CRM backbone, rapid client PoCs, content ops
- Cost: $20-45/mo
- **Decision: SKIP for now. Focus on MB user acquisition and validating funnel first.**
- Why: Infrastructure doesn't matter if you don't have users. Fix product-market fit first, then optimize backend.
- Real bottleneck: Users, not tools.

**MB Acquisition Strategy:**
- **Action:** Validate funnel yourself this week (contact 5 organizers, track conversion)
- **Team ready:** Erin, Amy, Chelsea waiting for playbook
- **Timeline:** Test week 1, brief Chelsea if >30% conversion, add Erin + Amy if successful
- **Tracking:** Simple Google Sheet (no Airtable needed yet)
- **Critical:** Get analytics on video performance first (did Ladies Club videos drive traffic?)

**Session Routine & Sync:**
- Established unified SESSION STARTUP ROUTINE (Phase 1-4)
- Single source of truth: DARYL.md in GitHub
- All Claude instances (Antigravity, Browser, Mobile) read from same file
- Decisions logged in memory_user_edits for persistence
- Update cadence: Weekly MD review + per-session flagging
