# SYSTEM MAP — Agent Marketing Pipeline

> Toàn bộ luồng, chức năng, truy vấn, và mối liên hệ giữa Roles, Skills, project.yaml

---

## 1. TỔNG QUAN KIẾN TRÚC

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
│  4 Tabs: Today │ Weekly │ Intelligence │ Quarterly              │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP API
┌──────────────────────────────▼──────────────────────────────────┐
│                   src/api/marketing.py                           │
│                   (FastAPI Router)                               │
│  28 endpoints — mỗi endpoint gọi đúng agent + skill            │
└──────┬──────────┬──────────┬──────────┬─────────────────────────┘
       │          │          │          │
  ┌────▼───┐ ┌───▼────┐ ┌───▼───┐ ┌───▼────────┐
  │project │ │Agent   │ │ Tools │ │ Database   │
  │.yaml   │ │ Runner │ │       │ │ (SQLite)   │
  └────────┘ └───┬────┘ └───────┘ └────────────┘
                 │
       ┌─────────▼─────────┐
       │   Agent Loader    │
       │  agents/*.md      │
       │  skills/**/*.md   │
       └─────────┬─────────┘
                 │
       ┌─────────▼─────────┐
       │   Claude API      │
       │  (via Agent SDK)  │
       └───────────────────┘
```

---

## 2. PROJECT.YAML → DYNAMIC CONTEXT

Mọi truy vấn và prompt đều đọc từ `project.yaml` thay vì hardcode.

### `get_project_context()` trả về:

| Field | Nguồn trong YAML | Ví dụ |
|-------|-------------------|-------|
| `name` | `name` | `Doitay.vn` |
| `tagline` | `tagline` | `Tìm Thợ Chuyên Nghiệp...` |
| `description` | `description` | mô tả dự án |
| `geography` | `geography` | `Hà Nội` |
| `website` | `website` | `https://doitay.vn` |
| `vertical` | `primary_audience.who` | `thợ sửa chữa` |
| `trades` | `primary_audience.trades` (cleaned) | `[Thợ điện, Thợ nước, ...]` |
| `competitors` | `competitors` (cleaned) | `[bTaskee, JupViec, ...]` |
| `pain_points` | `primary_audience.pain_points` | `[...]` |
| `desires` | `primary_audience.desires` | `[...]` |
| `angles` | `content_angles[].name` | `[Cái Uy, Sĩ Diện, Cơ Hội]` |
| `angle_details` | `content_angles[]` | full objects |
| `tone` | `tone` | conversational style |
| `default_cta` | `default_cta` | CTA mặc định |

### `build_search_queries(scan_type, custom_queries)` — Tạo queries tự động:

```
scan_type              Queries tạo ra (từ project.yaml)
─────────────────────  ──────────────────────────────────────────────
social_listening       "{trade} {geography} than phiền"
                       "{pain_point} {geography}"
                       → tối đa 5 queries

trends                 "xu hướng {vertical} {geography} 2025 2026"
                       "{top_trade} mùa hè {geography} nhu cầu"
                       "nhu cầu tìm {vertical} online"

competitors            "ứng dụng tìm {vertical}"
                       "app đặt {top_trade} online"
                       "sàn kết nối {vertical} quảng cáo"
                       "{competitor_names}"
                       "Facebook ads {vertical} dịch vụ nhà"

audience_supply        "{trade} {geography} tìm việc khó khăn"
                       "{top_trade} freelance thu nhập 2025"
                       "nhóm Facebook {vertical} chia sẻ kinh nghiệm"

audience_demand        "tìm {vertical} uy tín {geography} ở đâu"
                       "khách hàng phàn nàn {vertical} lừa đảo"
                       "cách chọn {vertical} tốt"
                       "review dịch vụ {vertical} {geography}"
```

> **Custom queries**: Mọi scan endpoint đều nhận `{"custom_queries": ["q1", "q2"]}` để override queries mặc định.

### `_project_id()` — DB identifier:

```python
# "Doitay.vn" → "doitay" (dùng làm experiment_id, business_type trong DB)
name.lower().split(".")[0]
```

---

## 3. AGENTS & SKILLS

### Model Mapping

| Agent | Model | Dùng cho |
|-------|-------|----------|
| `research` | Sonnet 4.6 | Scan thị trường, đối thủ, đối tượng |
| `content` | Sonnet 4.6 | Viết content, hook, CTA, thiết kế ảnh |
| `strategy` | Opus 4.6 | Tổng hợp intelligence → hypotheses |
| `devils_advocate` | Opus 4.6 | Stress test hypotheses |
| `analytics` | Opus 4.6 | Phân tích performance → patterns |
| `distribution` | Sonnet 4.6 | Phân phối content |
| `product` | Sonnet 4.6 | Product decisions |

### Agent Runner Flow

```
_run_agent_task(agent_name, task, input_data, skill_code)
  │
  ├─ 1. load_agent(agent_name)
  │     ├─ Read agents/{name}.md (frontmatter + prompt)
  │     ├─ Load skills/*.md cho agent đó
  │     └─ focus_skill → chỉ load full 1 skill, còn lại 1-line summary
  │
  ├─ 2. inject_patterns (if enabled)
  │     └─ Query Pattern table → inject winning patterns vào prompt
  │
  ├─ 3. Call Claude API via Agent SDK
  │     └─ model, system_prompt, user_message (task + input_data)
  │
  ├─ 4. Parse JSON output (3 strategies: full, code block, {…})
  │
  ├─ 5. Validate against AGENT_CONTRACTS schema
  │
  └─ 6. Save to AgentOutput table
        └─ agent_name, skill_code, phase, output_data, cost_usd, duration_ms
```

---

## 4. ENDPOINT → AGENT → SKILL MAP

### Tab: Intelligence (Scan & Analyze)

```
POST /intel/scan-market
  │
  ├─ 1. _run_social_listening()
  │     ├─ Queries: build_search_queries("social_listening")
  │     ├─ Tool: web_search (SerpAPI)
  │     ├─ Agent: research │ Skill: R2 (Social Listening)
  │     ├─ Input: {search_results, vertical, geography}
  │     └─ Output: pain_phrases[] → save AudienceIntel
  │
  ├─ 2. Trend Detection
  │     ├─ Queries: build_search_queries("trends")
  │     └─ Tool: web_search (SerpAPI)
  │
  └─ 3. Signal Detection
        ├─ Agent: research │ Skill: R1 (Market Scanning)
        ├─ Input: {trends, vertical, geography}
        └─ Output: signals[] → save ScanReport
```

```
POST /intel/scan-competitors
  │
  ├─ 1. Search
  │     ├─ Queries: build_search_queries("competitors")
  │     └─ Tool: web_search (SerpAPI)
  │
  └─ 2. Analysis
        ├─ Agent: research │ Skill: R4 (Competitive Intelligence)
        ├─ Input: {search_results, vertical, geography}
        └─ Output: {competitors[], content_trends[], gaps[], ad_insights[]}
              → save ScanReport
```

```
POST /intel/scan-audience
  │
  ├─ 1. Supply Search
  │     ├─ Queries: build_search_queries("audience_supply")
  │     └─ Tool: web_search (SerpAPI)
  │
  ├─ 2. Demand Search
  │     ├─ Queries: build_search_queries("audience_demand")
  │     └─ Tool: web_search (SerpAPI)
  │
  └─ 3. Profiling
        ├─ Agent: research │ Skill: R6 (Customer Research)
        ├─ Input: {supply_data, demand_data, vertical, geography}
        └─ Output: {supply_profiles[], demand_profiles[], behaviors[],
              language_patterns[], gathering_places[], content_recommendations[]}
              → save ScanReport + AudienceIntel (language patterns)
```

```
POST /intel/generate-hypotheses
  │
  ├─ Input: signals + pain_phrases + competitors + gaps + audience_profiles
  │         + content_recommendations + DB AudienceIntel (top 10)
  │
  ├─ Step 1: Strategy Agent │ Skill: S7 (Experiment Design)
  │     ├─ Input: {intelligence_context}
  │     └─ Output: {experiment_plan[], thesis, cvp, content_pillars}
  │
  ├─ Step 2: Analytics Agent │ Skill: A2 (Opportunity Scoring) — per hypothesis
  │     ├─ Input: {opportunity_name, signal_data, tam_estimate, timing, feasibility, NE}
  │     └─ Output: {opportunity_score 0-100, priority HIGH/MEDIUM/PARK, scoring breakdown}
  │           ≥72 → HIGH (tier 2) │ 45-71 → MEDIUM (tier 1) │ <45 → PARK (tier 1)
  │
  └─ Save: Hypothesis rows with A2 score + tier
```

```
POST /intel/stress-test/{id}
  │
  ├─ Agent: devils_advocate │ Skill: A1 (Stress Testing)
  ├─ Input: {hypothesis, context}
  └─ Output: {critical_weaknesses[], unvalidated_assumptions[],
        competitive_vulnerability, kill_criteria, verdict}
        → update Hypothesis.stress_test
```

### Tab: Weekly (Content Pipeline)

```
POST /weekly-plan
  │
  ├─ 1. Social Listening (if run_listening=true)
  │     └─ (same as /intel/scan-market step 1)
  │
  ├─ 2. Build Enriched Context
  │     ├─ project.yaml (static context via get_content_prompt_context())
  │     ├─ AudienceIntel (top 10 by frequency)
  │     ├─ ScheduledPost (past 10 posted — performance data)
  │     ├─ Pattern (recent patterns — lessons learned)
  │     └─ Hypothesis (active tier 2+ — angles to test)
  │
  ├─ 3. Content Generation
  │     ├─ Agent: content │ Skill: C1 (Hook Writing)
  │     ├─ Input: {enriched_context, pillars, audience_intel, week, days}
  │     └─ Output: {items[]} — 14 posts (2/day × 7 days)
  │           Each: {date, time, angle, hook, body, cta, hashtags, image_prompt}
  │
  └─ 4. Save → ScheduledPost (status=draft)
```

```
POST /post/{id}/image
  │
  ├─ 1. Image Design (nếu không có custom prompt)
  │     ├─ Agent: content │ Skill: C11 (Image Design)
  │     ├─ Input: {hook, body, angle, platform, vertical, geography}
  │     └─ Output: {image_prompt, style, aspect_ratio, mood, composition_notes}
  │
  ├─ 2. Image Generation
  │     ├─ Tool: image_tools.generate_image()
  │     ├─ Google Gemini API (Imagen 3)
  │     └─ Prompt + style + aspect_ratio từ C11
  │
  └─ 3. Save image_path + image_url + designed prompt to ScheduledPost
```

```
POST /post/{id}/publish
  │
  ├─ 1. Upload image (if exists) → Facebook Graph API
  ├─ 2. Post text → Facebook Graph API
  └─ 3. Save fb_post_id, post_url, posted_at to ScheduledPost
```

```
POST /send-for-approval
  │
  └─ Tool: notifications.send_batch_for_approval()
        └─ Telegram bot: mỗi bài = 1 message + Approve/Reject buttons
```

### Tab: Quarterly (Analytics)

```
GET /stats
  │
  ├─ ScheduledPost (all posted) → posts, views, reach, engagement
  ├─ Pattern (all) → patterns learned
  ├─ Hypothesis (all active) → hypothesis status
  └─ AudienceIntel (count) → audience intelligence depth
```

```
POST /sync-metrics
  │
  └─ Facebook Graph API v21.0
        ├─ post_impressions → impressions (total views)
        ├─ post_impressions_unique → reach
        ├─ Object API → reactions, comments, shares
        └─ Update ScheduledPost rows
```

```
POST /extract-patterns
  │
  ├─ Agent: analytics │ Skill: A7 (Pattern Extraction)
  ├─ Input: {posts_performance}
  └─ Output: {patterns_discovered[]}
        → save Pattern rows
```

---

## 5. DATABASE MODELS

```
┌──────────────────┐     ┌──────────────────┐
│  ScheduledPost   │     │  AudienceIntel   │
│──────────────────│     │──────────────────│
│ id (PK)          │     │ id (PK)          │
│ hook, body, cta  │     │ experiment_id    │
│ hashtags (JSON)  │     │ pain_phrase      │
│ angle            │     │ source_platform  │
│ image_prompt     │     │ frequency (1-5)  │
│ image_path/url   │     │ sentiment        │
│ scheduled_date   │     │ segment          │
│ scheduled_time   │     │ used_in_content  │
│ platform         │     │ performance_score│
│ status           │     └──────────────────┘
│ fb_post_id       │
│ post_url         │     ┌──────────────────┐
│ impressions      │     │    Pattern       │
│ reach            │     │──────────────────│
│ engagements      │     │ id (PK)          │
│ clicks           │     │ experiment_id    │
│ comments         │     │ category         │
│ shares           │     │ title            │
│ reactions        │     │ description      │
│ week_label       │     │ result (win/fail)│
└──────────────────┘     │ confidence       │
                         │ evidence (JSON)  │
┌──────────────────┐     └──────────────────┘
│   Hypothesis     │
│──────────────────│     ┌──────────────────┐
│ id (PK)          │     │   ScanReport     │
│ title            │     │──────────────────│
│ description      │     │ id (PK)          │
│ tier (1/2/3)     │     │ scan_type        │
│ signal_type      │     │ data (JSON)      │
│ signal_score     │     │ summary          │
│ stress_test JSON │     │ created_at       │
│ is_active        │     └──────────────────┘
│ source_agent     │
└──────────────────┘     ┌──────────────────┐
                         │  AgentOutput     │
┌──────────────────┐     │──────────────────│
│   Experiment     │     │ id (PK)          │
│──────────────────│     │ experiment_id    │
│ id (PK)          │     │ agent_name       │
│ name, vertical   │     │ skill_code       │
│ geography        │     │ phase            │
│ phase            │     │ input_data JSON  │
│ week_number      │     │ output_data JSON │
│ cmf_score        │     │ raw_text         │
│ traction_score   │     │ cost_usd         │
│ is_active        │     │ duration_ms      │
└──────────────────┘     └──────────────────┘
```

---

## 6. TOOLS (src/tools/)

| Tool | File | API | Dùng bởi |
|------|------|-----|----------|
| `web_search()` | search_tools.py | SerpAPI | Market/Competitor/Audience scans |
| `generate_image()` | image_tools.py | Google Gemini (Imagen 3) | POST /post/{id}/image |
| `upload_image_to_facebook()` | image_tools.py | Facebook Graph API | POST /post/{id}/publish |
| `post_facebook()` | marketing_tools.py | Facebook Graph API v18 | POST /post/{id}/publish |
| `post_twitter()` | marketing_tools.py | Twitter API v2 | (future) |
| `post_instagram()` | marketing_tools.py | Instagram Graph API | (future) |
| `post_linkedin()` | marketing_tools.py | LinkedIn API v2 | (future) |
| `send_telegram()` | notifications.py | Telegram Bot API | Approval workflow |
| `send_post_for_approval()` | notifications.py | Telegram Bot API | Inline approve/reject buttons |
| `notify_ceo()` | notifications.py | Telegram + EventLog | Kill signals, alerts |
| `send_weekly_scorecard()` | notifications.py | Telegram | CEO weekly report |

---

## 7. AGENT CONTRACTS (Validation Schema)

| Agent | Required Output | KPIs |
|-------|----------------|------|
| `research` | signals[], audience_intel.pain_phrases, segments[] | signal_quality, intel_depth |
| `strategy` | thesis, cvp, content_pillars, experiment_plan[] | thesis_survival, experiment_hit_rate |
| `content` | items[] (platform, content_type, body) | cmf_contribution, approval_rate |
| `analytics` | cmf_score (0-1), traction_score (0-1) | score_accuracy, pattern_extraction_rate |
| `devils_advocate` | critical_weaknesses[], unvalidated_assumptions[], verdict | weakness_hit_rate, false_alarm_rate |

---

## 8. FULL PIPELINE FLOW (End-to-End)

```
                    ┌─────────────────────┐
                    │    project.yaml     │
                    │  (Single Source of  │
                    │      Truth)         │
                    └─────────┬───────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
     ┌────────────┐  ┌──────────────┐  ┌──────────────┐
     │ INTELLIGENCE│  │   CONTENT    │  │  ANALYTICS   │
     │    SCAN     │  │  GENERATION  │  │  & PATTERNS  │
     └──────┬─────┘  └──────┬───────┘  └──────┬───────┘
            │               │                 │
   ┌────────┼────────┐      │                 │
   │        │        │      │                 │
   ▼        ▼        ▼      ▼                 ▼
┌──────┐┌──────┐┌──────┐┌──────┐         ┌──────┐
│Market││Comp. ││Audi. ││Weekly│         │Patt. │
│ Scan ││ Scan ││ Scan ││ Plan │         │Extr. │
└──┬───┘└──┬───┘└──┬───┘└──┬───┘         └──┬───┘
   │       │       │       │                 │
   │  research     │  research          analytics
   │  R1+R2        │  R6                    A7
   │       │       │       │                 │
   │  research     │  content                │
   │  R4           │  C1                     │
   │       │       │       │                 │
   ▼       ▼       ▼       ▼                 ▼
┌──────────────────────────────────────────────────┐
│               DATABASE (SQLite)                   │
│                                                   │
│  ScanReport │ AudienceIntel │ ScheduledPost       │
│  Hypothesis │ Pattern       │ AgentOutput         │
└──────────────────────┬───────────────────────────┘
                       │
              ┌────────┼────────┐
              │        │        │
              ▼        ▼        ▼
        ┌──────┐ ┌──────┐ ┌──────┐
        │Hypo. │ │Stress│ │ CEO  │
        │ Gen  │ │ Test │ │Review│
        └──┬───┘ └──┬───┘ └──┬───┘
           │        │        │
        strategy  devils_    Telegram
        S7        advocate   Bot
                  A1
              │        │        │
              ▼        ▼        ▼
        ┌──────────────────────────┐
        │    PUBLISH & MEASURE     │
        │                          │
        │  Facebook Graph API      │
        │  → post + image upload   │
        │  → sync metrics          │
        │  → extract patterns      │
        │  → feed back to scans    │
        └──────────────────────────┘
```

---

## 9. CÁCH THAY ĐỔI CONTEXT

### Thay đổi vertical/geography/audience:
→ Sửa `project.yaml` — tất cả queries và prompts tự cập nhật.

### Custom queries cho 1 lần scan:
→ POST body: `{"custom_queries": ["query 1", "query 2", "query 3"]}`
→ Override hoàn toàn queries mặc định, chỉ cho lần scan đó.

### Thêm content angle mới:
→ Thêm vào `project.yaml` > `content_angles[]` — content generation tự nhận.

### Thêm competitor mới:
→ Thêm vào `project.yaml` > `competitors[]` — competitor scan tự query.

### Thay đổi trades:
→ Thêm/sửa `project.yaml` > `primary_audience.trades[]` — social listening + audience scan tự update queries.
