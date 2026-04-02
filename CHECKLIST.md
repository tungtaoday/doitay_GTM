# CHECKLIST — Marketplace Factory System Configuration

> Đánh giá từng mục: ✅ Done | ⚠️ Partial | ❌ Missing
> Last evaluated: 2026-03-18

---

## 1. DATABASE & ORM

| # | Item | Status | Chi tiết |
|---|------|--------|----------|
| 1.1 | Prisma schema defined | ✅ Done | 6 models: SystemState, Marketplace, Hypothesis, Pattern, Experiment, ChatMessage |
| 1.2 | SQLite database created | ✅ Done | `prisma/dev.db` exists |
| 1.3 | Prisma client singleton | ✅ Done | `src/lib/prisma.ts` with global caching |
| 1.4 | Migrations applied | ✅ Done | All 6 tables created |
| 1.5 | Seed data | ❌ Missing | Không có seed script — database trống |

---

## 2. API ROUTES

| # | Item | Status | Chi tiết |
|---|------|--------|----------|
| 2.1 | `/api/system-state` GET/PUT | ✅ Done | Read & update phase |
| 2.2 | `/api/marketplaces` GET/POST/PUT/DELETE | ✅ Done | Full CRUD with partial update |
| 2.3 | `/api/hypotheses` GET/POST/PUT/DELETE | ✅ Done | Full CRUD with tier sorting |
| 2.4 | `/api/patterns` GET/POST/DELETE | ✅ Done | Create, list, delete |
| 2.5 | `/api/chat` POST | ✅ Done | Role detection + Claude API + save history |
| 2.6 | `/api/scorecard` GET | ✅ Done | Aggregates portfolio health, kill signals, hypothesis counts |
| 2.7 | `/api/tools` GET | ✅ Done | Returns tool status from env check |
| 2.8 | `/api/experiments` CRUD | ✅ Done | Full CRUD with marketplace include |

---

## 3. UI COMPONENTS

| # | Item | Status | Chi tiết |
|---|------|--------|----------|
| 3.1 | Main Dashboard (`page.tsx`) | ✅ Done | 6 tabs, state management |
| 3.2 | PhaseIndicator | ✅ Done | Phase 1/2/3 buttons + confirmation |
| 3.3 | PipelineView | ✅ Done | Drag-and-drop 6 stages, tool chips, kill signal badge |
| 3.4 | ChatInterface | ✅ Done | Role selector, auto-detect, starter prompts |
| 3.5 | HypothesisBoard | ✅ Done | 3-column Kanban, promote/demote/delete/ready |
| 3.6 | PatternLibrary | ✅ Done | Form + search/filter + color coding |
| 3.7 | Scorecard | ✅ Done | Portfolio health, alerts, hypothesis counts |
| 3.8 | MarketplaceForm | ✅ Done | Name/vertical/geography form |
| 3.9 | ToolsDashboard | ✅ Done | 3 views: By Layer, By Category, Config Status |
| 3.10 | ToolsConfig | ✅ Done | Per-tool ready/missing status |
| 3.11 | Experiment Tracking UI | ✅ Done | ExperimentTracker component with W1-8 progress, kill signal |
| 3.12 | Liquidity Score Chart | ❌ Missing | Không có trend chart cho LS over time |

---

## 4. PROMPT ARCHITECTURE (AI Chat)

| # | Item | Status | Chi tiết |
|---|------|--------|----------|
| 4.1 | `buildSystemPrompt()` | ✅ Done | Injects phase + role + marketplaces + patterns |
| 4.2 | `detectRole()` | ✅ Done | Keyword-based auto-detection |
| 4.3 | `buildRolePrompt()` | ✅ Done | 8 role prompts from CLAUDE.md |
| 4.4 | Phase-aware constraints | ✅ Done | Phase 1 limits, Phase 2 adds distribution, Phase 3 full |
| 4.5 | Role 1 — Strategy Director | ✅ Done | System prompt hardcoded |
| 4.6 | Role 2 — Market Research Agent | ✅ Done | System prompt hardcoded |
| 4.7 | Role 3 — Devil's Advocate | ✅ Done | System prompt hardcoded |
| 4.8 | Role 4 — Segment Analyst | ✅ Done | System prompt hardcoded |
| 4.9 | Role 5 — CVP Architect | ✅ Done | System prompt hardcoded |
| 4.10 | Role 6 — Biz Dev Agent | ✅ Done | System prompt hardcoded |
| 4.11 | Role 7 — Investment Analyst | ✅ Done | System prompt hardcoded |
| 4.12 | Role 8 — CEO Cockpit | ✅ Done | System prompt hardcoded |
| 4.13 | Devil's Advocate auto-trigger | ❌ Missing | Không tự động trigger sau positive result |

---

## 5. TOOL SERVICE WRAPPERS

### 5.1 AI Tools
| # | Tool | Wrapper | Env Var | Key Set? |
|---|------|---------|---------|----------|
| 5.1.1 | Claude API | ✅ `claudeChat()` | `ANTHROPIC_API_KEY` | ✅ Set |
| 5.1.2 | Perplexity | ✅ `perplexitySearch()` | `PERPLEXITY_API_KEY` | ❌ Empty |

### 5.2 Crawl Tools
| # | Tool | Wrapper | Env Var | Key Set? |
|---|------|---------|---------|----------|
| 5.2.1 | Firecrawl Scrape | ✅ `firecrawlScrape()` | `FIRECRAWL_API_KEY` | ✅ Set |
| 5.2.2 | Firecrawl Crawl | ✅ `firecrawlCrawl()` | `FIRECRAWL_API_KEY` | ✅ Set |
| 5.2.3 | Apify | ✅ `apifyRunActor()` | `APIFY_API_TOKEN` | ❌ Empty |
| 5.2.4 | Playwright Scrape | ✅ `playwrightScrape()` | (no key needed) | ✅ Ready |
| 5.2.5 | Playwright Screenshot | ✅ `playwrightScreenshot()` | (no key needed) | ✅ Ready |

### 5.3 Data Tools
| # | Tool | Wrapper | Env Var | Key Set? |
|---|------|---------|---------|----------|
| 5.3.1 | SerpAPI Search | ✅ `serpSearch()` | `SERPAPI_API_KEY` | ✅ Set |
| 5.3.2 | Google Trends | ✅ `googleTrends()` | `SERPAPI_API_KEY` | ✅ Set |
| 5.3.3 | Notion Add Page | ✅ `notionAddPage()` | `NOTION_API_KEY` | ❌ Empty |
| 5.3.4 | Notion Query | ✅ `notionQuery()` | `NOTION_API_KEY` | ❌ Empty |
| 5.3.5 | Airtable List | ✅ `airtableList()` | `AIRTABLE_API_KEY` + `AIRTABLE_BASE_ID` | ❌ Empty |
| 5.3.6 | Airtable Create | ✅ `airtableCreate()` | `AIRTABLE_API_KEY` + `AIRTABLE_BASE_ID` | ❌ Empty |
| 5.3.7 | Supabase Query | ✅ `supabaseQuery()` | `SUPABASE_URL` + `SUPABASE_ANON_KEY` | ❌ Empty |
| 5.3.8 | Supabase Insert | ✅ `supabaseInsert()` | `SUPABASE_URL` + `SUPABASE_ANON_KEY` | ❌ Empty |
| 5.3.9 | Google Sheets | ✅ `googleSheetsRead()` | `GOOGLE_SERVICE_ACCOUNT_KEY` | ❌ Empty |

### 5.4 Outreach Tools
| # | Tool | Wrapper | Env Var | Key Set? |
|---|------|---------|---------|----------|
| 5.4.1 | Apollo.io Search | ✅ `apolloSearch()` | `APOLLO_API_KEY` | ❌ Empty |
| 5.4.2 | Hunter Find Email | ✅ `hunterFindEmail()` | `HUNTER_API_KEY` | ❌ Empty |
| 5.4.3 | Hunter Domain Search | ✅ `hunterDomainSearch()` | `HUNTER_API_KEY` | ❌ Empty |
| 5.4.4 | Lemlist Add Lead | ✅ `lemlistAddLead()` | `LEMLIST_API_KEY` | ❌ Empty |
| 5.4.5 | Zalo OA Message | ✅ `zaloSendMessage()` | `ZALO_OA_ACCESS_TOKEN` | ❌ Empty |
| 5.4.6 | HubSpot Create Contact | ✅ `hubspotCreateContact()` | `HUBSPOT_API_KEY` | ❌ Empty |

### 5.5 Analytics Tools
| # | Tool | Wrapper | Env Var | Key Set? |
|---|------|---------|---------|----------|
| 5.5.1 | Mixpanel Track | ✅ `mixpanelTrack()` | `MIXPANEL_TOKEN` | ❌ Empty |
| 5.5.2 | Mixpanel Track Liquidity | ✅ `mixpanelTrackLiquidity()` | `MIXPANEL_TOKEN` | ❌ Empty |
| 5.5.3 | Mixpanel Track Experiment | ✅ `mixpanelTrackExperiment()` | `MIXPANEL_TOKEN` | ❌ Empty |
| 5.5.4 | GA4 Track Event | ✅ `ga4TrackEvent()` | `GA4_MEASUREMENT_ID` + `GA4_API_SECRET` | ❌ Empty |

### 5.6 Automation Tools
| # | Tool | Wrapper | Env Var | Key Set? |
|---|------|---------|---------|----------|
| 5.6.1 | n8n Trigger Workflow | ✅ `n8nTriggerWorkflow()` | `N8N_BASE_URL` + `N8N_API_KEY` | ❌ Empty |
| 5.6.2 | n8n List Workflows | ✅ `n8nListWorkflows()` | `N8N_BASE_URL` + `N8N_API_KEY` | ❌ Empty |
| 5.6.3 | Slack Webhook | ✅ `slackSendWebhook()` | `SLACK_WEBHOOK_URL` | ❌ Empty |
| 5.6.4 | Slack Message | ✅ `slackSendMessage()` | `SLACK_BOT_TOKEN` | ❌ Empty |
| 5.6.5 | CEO Alert | ✅ `ceoAlert()` | `SLACK_WEBHOOK_URL` or `TELEGRAM_BOT_TOKEN` | ❌ Empty |
| 5.6.6 | Telegram Send | ✅ `telegramSend()` | `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` | ❌ Empty |
| 5.6.7 | RSS Fetch | ✅ `rssFetch()` | (no key needed) | ✅ Ready |
| 5.6.8 | Market Signals (RSS) | ✅ `fetchMarketSignals()` | (no key needed) | ✅ Ready |

### 5.7 Payment Tools
| # | Tool | Wrapper | Env Var | Key Set? |
|---|------|---------|---------|----------|
| 5.7.1 | VNPay | ✅ `vnpayCreatePaymentUrl()` | `VNPAY_TMN_CODE` + `VNPAY_HASH_SECRET` | ❌ Empty |
| 5.7.2 | MoMo | ✅ `momoCreatePayment()` | `MOMO_PARTNER_CODE` + `MOMO_ACCESS_KEY` + `MOMO_SECRET_KEY` | ❌ Empty |
| 5.7.3 | Stripe | ✅ `stripeCreateCheckout()` | `STRIPE_SECRET_KEY` | ❌ Empty |

### 5.8 Config System
| # | Item | Status | Chi tiết |
|---|------|--------|----------|
| 5.8.1 | `getToolStatus()` | ✅ Done | Checks 28 tools against env vars |
| 5.8.2 | `.env` file | ✅ Done | 77+ env vars defined |
| 5.8.3 | `.env.example` template | ✅ Done | Documented by category |
| 5.8.4 | Barrel export `tools/index.ts` | ✅ Done | All functions exported |

---

## 6. AUTOMATION & WORKFLOWS

| # | Item | Status | Chi tiết |
|---|------|--------|----------|
| 6.1 | n8n self-hosted installed | ❌ Skipped | Disk space insufficient — replaced with cron API routes |
| 6.2 | Workflow: Signal scan → Hypothesis auto-create | ✅ Done | `POST /api/cron/signal-scan` — RSS → Tier 1 hypotheses |
| 6.3 | Workflow: Weekly scorecard → Slack/Telegram | ✅ Done | `POST /api/cron/weekly-scorecard` — scorecard + ceoAlert |
| 6.4 | Workflow: Kill signal alert → CEO | ✅ Done | Auto-detected in scorecard + increment-week routes |
| 6.5 | Workflow: Auto-increment weekNumber | ✅ Done | `POST /api/cron/increment-week` — experiments + marketplaces |
| 6.6 | CEO Alert channel configured | ✅ Done | Slack webhook set — ceoAlert() active |

---

## 7. TYPESCRIPT & BUILD

| # | Item | Status | Chi tiết |
|---|------|--------|----------|
| 7.1 | TypeScript types defined | ✅ Done | Phase, Stage, RoleType, MarketplaceData, HypothesisData, PatternData, ExperimentData |
| 7.2 | `tsc --noEmit` passes | ✅ Done | Zero errors (verified) |
| 7.3 | Dev server runs | ✅ Done | `http://localhost:3000` |
| 7.4 | All API routes respond | ✅ Done | Verified via dev server logs |
| 7.5 | NPM packages installed | ✅ Done | All 15+ packages in package.json |

---

## 8. DOCUMENTATION

| # | Item | Status | Chi tiết |
|---|------|--------|----------|
| 8.1 | `CLAUDE.md` | ✅ Done | Full system spec — 8 roles, phases, pipeline, fitness functions |
| 8.2 | `SESSION_NOTES.md` | ✅ Done | Session persistence — progress, decisions, next steps |
| 8.3 | `TOOL_GUIDE.md` | ✅ Done | Technical guide — tools, data flows, setup, components, prompts |
| 8.4 | `PLAYBOOK.md` | ✅ Done | Business guide — agent coordination, conflict resolution, cadence |
| 8.5 | `CHECKLIST.md` | ✅ Done | This file |

---

## 9. PIPELINE FLOW (end-to-end)

| # | Step | Status | Blocker |
|---|------|--------|---------|
| 9.1 | Signal detection (RSS scan) | ✅ Ready | `rssFetch()` + `fetchMarketSignals()` work without API key |
| 9.2 | Signal detection (SerpAPI) | ✅ Ready | `SERPAPI_API_KEY` set |
| 9.3 | Signal detection (Google Trends) | ✅ Ready | `SERPAPI_API_KEY` set |
| 9.4 | Signal detection (Firecrawl) | ✅ Ready | `FIRECRAWL_API_KEY` set |
| 9.5 | Hypothesis creation (manual) | ✅ Ready | UI + API working |
| 9.6 | Hypothesis auto-create from signal | ✅ Ready | POST /api/cron/signal-scan |
| 9.7 | AI analysis (any role) | ✅ Ready | `ANTHROPIC_API_KEY` set |
| 9.8 | Marketplace create + track | ✅ Ready | UI + API working |
| 9.9 | Marketplace drag through pipeline | ✅ Ready | Drag-and-drop working |
| 9.10 | Experiment create + track | ✅ Ready | API route + ExperimentTracker UI |
| 9.11 | Liquidity Score input | ⚠️ Partial | Can update via marketplace PUT, but no dedicated UI |
| 9.12 | Kill signal detection | ✅ Done | Scorecard API checks week>8 + low LS |
| 9.13 | Kill signal auto-action | ✅ Ready | ceoAlert in scorecard + increment-week (needs Slack/Telegram key) |
| 9.14 | Pattern logging (manual) | ✅ Ready | UI + API working |
| 9.15 | Pattern → Intelligence feedback | ⚠️ Partial | Patterns injected into AI prompt, but no structured query |
| 9.16 | CEO Scorecard view | ✅ Ready | UI + API working |
| 9.17 | CEO Alert push | ✅ Ready | Slack webhook configured |
| 9.18 | Weekly auto-scorecard delivery | ✅ Ready | POST /api/cron/weekly-scorecard (needs scheduler + Slack/Telegram) |

---

## 10. DEPLOYMENT & INFRASTRUCTURE

| # | Item | Status | Chi tiết |
|---|------|--------|----------|
| 10.1 | Local dev environment | ✅ Done | Running on localhost:3000 |
| 10.2 | Production deploy (Vercel) | ❌ Not started | SQLite needs migration to PostgreSQL/Supabase |
| 10.3 | Authentication | ❌ Missing | No auth — anyone can access |
| 10.4 | Backup/restore | ❌ Missing | No backup mechanism for SQLite |
| 10.5 | Mobile responsive | ⚠️ Partial | Tailwind responsive classes exist but not fully tested |
| 10.6 | Disk space | ⚠️ Warning | C: drive ~3-4GB free on 238GB — monitor closely |

---

## SUMMARY

| Category | Done | Partial | Missing | Total |
|----------|------|---------|---------|-------|
| Database & ORM | 4 | 0 | 1 | 5 |
| API Routes | 8 | 0 | 0 | 8 |
| UI Components | 11 | 0 | 1 | 12 |
| Prompt Architecture | 12 | 0 | 1 | 13 |
| Tool Wrappers | 33 | 0 | 0 | 33 |
| Tool Keys Configured | 8 | 0 | 25 | 33 |
| Automation & Workflows | 5 | 0 | 1 | 6 |
| TypeScript & Build | 5 | 0 | 0 | 5 |
| Documentation | 5 | 0 | 0 | 5 |
| Pipeline Flow (E2E) | 16 | 2 | 0 | 18 |
| Deploy & Infra | 1 | 2 | 3 | 6 |

### Overall: ~80% Done, ~2% Partial, ~18% Missing

---

## PRIORITY ACTION LIST

### Phải làm ngay (unblock core flow):
1. ~~**Set `ANTHROPIC_API_KEY`** trong `.env`~~ → ✅ Done (2026-03-18)
2. ~~**Tạo `/api/experiments` route**~~ → ✅ Done (2026-03-18)
3. ~~**Tạo Experiment Tracking UI**~~ → ✅ Done (2026-03-18) — W1-8 progress bar, kill signal, LS input

### Nên làm sớm (unblock signal scanning):
4. ~~**Set `SERPAPI_API_KEY`**~~ → ✅ Done (2026-03-18)
5. ~~**Set `FIRECRAWL_API_KEY`**~~ → ✅ Done (2026-03-18)
6. ~~**Set `SLACK_WEBHOOK_URL`**~~ → ✅ Done (2026-03-18)

### Nên làm (automation):
7. ~~**Install n8n**~~ → Skipped (disk space) — replaced with cron API routes
8. ~~**Tạo workflow: Signal → Hypothesis**~~ → ✅ Done (2026-03-18) — `POST /api/cron/signal-scan`
9. ~~**Tạo workflow: Weekly Scorecard → Alert**~~ → ✅ Done (2026-03-18) — `POST /api/cron/weekly-scorecard`
10. ~~**Tạo cron: Auto-increment weekNumber**~~ → ✅ Done (2026-03-18) — `POST /api/cron/increment-week`

### Nice to have (Phase 1 enhancements):
11. ~~Add `ExperimentData` TypeScript interface~~ → ✅ Done (2026-03-18)
12. Liquidity Score trend chart
13. Devil's Advocate auto-trigger
14. Export scorecard to PDF
