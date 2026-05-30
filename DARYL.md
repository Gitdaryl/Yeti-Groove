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

---

## All Active Projects

### 🚀 Revenue/Live (Tier 1 - Priority)

| Project | Repo | Live URL | Status | Key Notes |
|---------|------|----------|--------|-----------|
| **Manitou Beach** | Gitdaryl/Manitou-Beach | manitou-beach.vercel.app | ACTIVE | Community engine. Domain pending: manitoubeachmichigan.com |
| **Yetickets** | (within Manitou Beach) | - | ACTIVE | Food truck ticketing. A2P LIVE (Apr 2026). Stripe Express (1.25% fee). |
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

### Manitou Beach - Current State
- **Food Truck System:** QA agent (Haiku), check-in flow, Stripe checkout fully built
- **Pricing (LOCKED):** Free / $9/mo Founding (food trucks), $25/mo Business, $49/mo Premium (listings)
- **Stripe:** Express Connect (destination charges, 1.25% Yetickets fee)
- **A2P Status:** APPROVED + LIVE (Apr 2026). Twilio under yetigroove.com. Yetickets needs separate campaign.
- **Email Sender:** `events@yetigroove.com` (until manitoubeachmichigan.com resolves)
- **Known Bug:** Audio race condition on Joe Profit (deferred)

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

## 📋 Pending Work (as of 2026-05-30)

- **MB videos edited + posted** - Leverage the Ladies Club promo (just shot)
- **MB acquisition test** - You contact 5 organizers solo, measure conversion
- **Chelsea conversation** - Brief on Chamber angle, gauge interest in $20/hr role
- **Organizer dashboard** - Theme-aware, build in MB, lift to Yetickets
- **Social media auto-poster** - FB Page + IG Business via Meta Graph API + Haiku
- **Email confirmation system** - Blocked on Resend domain ($20/mo for second domain)
- **Joe Profit domain swap** - yetigroove.com → joeprofitneverbroken.com (awaiting Resend)
- **Roofing client** - Meeting 2026-04-02, media ask + platform upsell opportunity
- **Wine Trail Awards Ceremony** - Nov 2026, Chateau Aeronautique target, sponsor tiers
- **MB per-page color theming** - Spec at `specs/mb-page-theming-spec.md`, 7 themes, CSS tokens
- **Erehmi script recovery** - Large document needs to be recovered into this context

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
