# CRAB — Creative Resources and Bridge 🦀
### *AI Content Creator Marketplace · HackXLerate 2026 Prototype*

![CRAB Logo](/public/crab-logo.png)

**CRAB (Creative Resources and Bridge)** connects forward-thinking brands and creative agencies with top-tier AI filmmakers, animators, and generative visual artists. It solves the core bottlenecks in generative production: talent discovery, transparent AI workflow verification, commercial IP rights clarity, and structured campaign milestones.

---

## 🌟 Key Features

### 1. Discover Talent & Public Creators Directory
- **Public Network Showcase (`/creator/profile`)**: Creators can explore other vetted creators and their verified commercial works across the platform (while their own profile is excluded for a clean competitive overview).
- **Dual View Modes**: Switch between **Creators Directory** (cards with scores, rates, and tools) and **Works & Portfolios** (visual feed of actual commercial films, animations, and generative assets with workflow disclosures).
- **Interactive Lightbox**: Inspect prompt pipelines, toolchains (Sora, Runway Gen-3, Midjourney v6, ComfyUI), and commercial rights.
- **Multidimensional Search**: Instant search across creator names, bios, specific tools (Sora, Runway Gen-3, Midjourney, Kling, Flux, ComfyUI, etc.), specializations, and portfolio project titles.
- **Explainable Ranking**:
  - **Hard Constraints First**: Strict enforcement of mandatory content type, format/aspect ratio, explicit commercial-usage rights, and availability. Creators failing hard constraints never override them with a high profile score.
  - **Weighted Formula**: `final_rank = 0.60 * brief_match_score + 0.30 * profile_score + 0.10 * freshness_availability_score`
  - **Fairness Guarantee**: New creators receive a neutral default for missing response history rather than being penalized. Protected traits or vanity follower metrics are excluded.

### 2. AI Profile & Portfolio Score (Deterministic 100-Point Model)
A dynamic, explainable score calculated by deterministic TypeScript code (not black-box hallucinated AI):
- **Profile Completeness (15 pts)**: Bio depth, verified links, rate clarity, aspect ratios.
- **Portfolio Strength (25 pts)**: Item count, variety, featured pieces, view history.
- **AI Workflow Transparency (20 pts)**: Step-by-step pipeline disclosure, prompt seeds, tool citations.
- **Skill & Model Evidence (15 pts)**: Cross-referenced proof of claimed models & custom LoRA fine-tuning.
- **Commercial Readiness (10 pts)**: Explicit commercial clearance, territory, licensing terms.
- **Trust & Evidence (10 pts)**: Submitted proof status (self-reported vs. reviewed), client project records.
- **Freshness & Responsiveness (5 pts)**: Active turnaround times and platform activity.
- **Actionable Recommendations**: Creator dashboard highlights immediate tasks with estimated point gains.

### 3. Brief Form & AI Brief Builder
- **Natural Language to Structured Brief**: Brands can input rough campaign ideas or napkin sketches. The builder decomposes ideas into structured creative objectives, audience personas, deliverables, aspect ratios, durations, and commercial constraints.
- **Clarification Questions**: Unspecified requirements automatically prompt interactive clarification questions rather than making risky legal assumptions.
- **Strict Commercial-Use Fields**: Captures territorial rights, perpetual vs. term licensing, paid media permissions, source file requirements, and third-party IP restrictions.
- **Never Auto-Published**: Brands always review and approve generated briefs before publishing.

### 4. Campaign Milestone & Escrow Workflow
- **Milestone Delivery**: Step-by-step progress from Concept & Storyboard to Rough Cut and Master Deliverables.
- **Escrow Approval**: Brands review deliverables, request specific revisions, or approve milestones to release funds.
- **Integrated Communications**: Direct contextual messaging between brand manager and creator with status timelines.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **State & Local Persistence**: Zustand with `persist` middleware (operates seamlessly out of the box in offline/local demo mode)
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) policies
- **Testing**: Vitest with jsdom
- **Styling**: Tailored design tokens (`#F8FAFC` surface, `#172554` navy, `#2563EB` electric blue, `#7C3AED` violet, `#0F766E` teal)

---

## 🗄️ Database Architecture (Supabase)

A production-ready PostgreSQL migration is available at `supabase/migrations/20261013000000_init_crab_schema.sql` covering:
1. `profiles`: User accounts and roles (`brand`, `creator`).
2. `creator_profiles`: Bio, tools, skills, daily rates, availability.
3. `portfolio_items`: Generative case studies, workflow steps, aspect ratios, commercial clearance.
4. `tool_evidence`: Submitted prompt breakdowns, LoRA weights, and pipeline verification.
5. `creator_scores`: 7-component breakdown scores and calculation timestamps.
6. `score_recommendations`: Actionable improvements and potential point increases.
7. `briefs`: Structured creative and commercial specifications.
8. `proposals`: Talent pitches, timelines, and custom workflows.
9. `campaigns`: Active engagements and escrow budgets.
10. `campaign_milestones`: Phased deliverables, approval gates, and revision logs.
11. `campaign_messages`: Real-time chat history.
12. `saved_creators`: Brand shortlists with custom internal notes.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ and npm

### 2. Installation
```bash
git clone <repo-url>
cd Crab
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Note: If Supabase credentials are left empty, the application automatically runs in rich Local Demo Mode with 8 pre-seeded creators, briefs, and campaigns.)*

### 4. Running the Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Running Tests & Type Checks
```bash
# Run unit tests (scoring & ranking engines)
npm run test

# Run TypeScript typecheck
npm run typecheck

# Build for production
npm run build
```

---

## 🎯 Judging Criteria Alignment (HackXLerate 2026)

| Judging Criteria | Weight | Implementation in CRAB |
| :--- | :--- | :--- |
| **Creator Profiles & AI Portfolios** | **30%** | Deep portfolio case studies showing exact tools, prompt steps, LoRA disclosures, aspect ratios, and commercial clearance status. |
| **Discovery & Filtering** | **25%** | Full search over tools, categories, and formats. Explainable ranking with hard constraints and 60/30/10 formula. |
| **Brief Definition** | **20%** | Comprehensive commercial terms (paid media, exclusivity, IP indemnity) + AI Brief Builder with clarification questions. |
| **UX & Design** | **15%** | High-contrast creative-tech aesthetic, responsive layouts, score rings, empty/loading/error states. |
| **Presentation / Demo** | **10%** | Zero-friction local demo mode, seeded fictional creators, and switchable Brand/Creator personas. |

---

## ⚠️ Known Limitations & Disclosures

1. **Heuristic Profile Score**: The prototype profile score is a transparent quality-readiness heuristic; it is not a legal guarantee of artistic outcome.
2. **Commercial Rights**: Commercial-use fields record explicit creator declarations and brand contracts; they do not replace formal copyright legal registration.
3. **Demo Integrations**: When running without Supabase or OpenAI API keys, the application operates in local deterministic demo mode with seeded data. All seed creators and campaigns are fictional.
