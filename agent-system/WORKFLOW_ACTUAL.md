# Luồng làm việc thực tế: CEO + Agent System

> Đây là luồng **đang hoạt động** — CEO trigger, Agent thực thi, CEO review & quyết định.
> Cập nhật: 2026-03-25

---

## Tổng quan

```
CEO (bạn)                         Agent System                        Bên ngoài
─────────                         ────────────                        ──────────

  Nhấn "Scan"  ──────────────────→  Research Agent (R1/R4/R6)  ────→  Web Search
                                         │                          (Tavily API)
  ◄── Xem insights ──────────────  Lưu DB: audience_intel

  Nhấn "Tạo plan" ──────────────→  Content Agent (C1)  ────────────→  Claude API
       + chọn angle/tuần                 │
       + ghi chú                         │
  ◄── Xem draft posts ──────────  Lưu DB: scheduled_posts

  Review từng bài ──────────────→  (CRUD trực tiếp)
  Approve / Reject / Sửa

  Nhấn "Tạo ảnh" ──────────────→  Content Agent (C11) + Replicate ─→  AI Image Gen
  ◄── Xem ảnh ──────────────────  Lưu file + DB: image_path

  Nhấn "Đăng" ─────────────────→  Facebook Graph API ──────────────→  Facebook Page
  ◄── Nhận link bài ────────────  Lưu DB: fb_post_id, post_url
  ◄── Telegram thông báo ──────  Telegram Bot

  Nhấn "Sync metrics" ─────────→  Facebook Insights API ───────────→  FB Analytics
  ◄── Xem số liệu ─────────────  Lưu DB: impressions, reach, ...

  Nhấn "Extract patterns" ─────→  Analytics Agent (A7)
  ◄── Xem patterns ────────────  Lưu DB: patterns

  Nhấn "Generate hypotheses" ──→  Strategy Agent (S7)
                                     + Analytics Agent (A2) score
                                     + Devils Advocate (A1) stress
  ◄── Xem hypotheses xếp hạng ─  Lưu DB: hypotheses
```

---

## 4 Vòng lặp chính — Tất cả đang WORK

### Vòng 1: Xác định Insight (DISCOVER)

```
┌─────────────────────────────────────────────────────────────┐
│                    CEO TRIGGERS                              │
│                                                              │
│  Frontend: Tab "Intelligence"                                │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ Scan Market (R1)│  │ Scan Comp(R4)│  │ Scan Audience  │ │
│  │ Tín hiệu thị   │  │ Đối thủ đang │  │ (R6) Nỗi đau  │ │
│  │ trường          │  │ làm gì       │  │ khách hàng     │ │
│  └───────┬─────────┘  └──────┬───────┘  └───────┬────────┘ │
│          │                   │                   │          │
│          ▼                   ▼                   ▼          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Agent chạy → Lưu DB                     │   │
│  │  scan_reports (summary)  +  audience_intel (pain)    │   │
│  └──────────────────────────────────────────────────────┘   │
│          │                                                   │
│          ▼                                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          CEO xem kết quả trên Dashboard              │   │
│  │  "À khách hàng đang kêu về X, đối thủ chưa giải"   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Endpoint:  POST /api/marketing/intel/scan-market           │
│             POST /api/marketing/intel/scan-competitors       │
│             POST /api/marketing/intel/scan-audience          │
│  Agent:     research (R1, R4, R6)                           │
│  Input:     dynamic queries từ project.yaml                  │
│  Output:    scan_reports + audience_intel                    │
│  Status:    ✅ WORKING                                       │
└─────────────────────────────────────────────────────────────┘
```

### Vòng 2: Xây Content (BUILD)

```
┌─────────────────────────────────────────────────────────────┐
│                    CEO TRIGGERS                              │
│                                                              │
│  Frontend: Tab "Content"                                     │
│  ┌────────────────────────────────────┐                     │
│  │  "Tạo plan tuần 2026-W14"         │                     │
│  │  Angle: Cái Uy                     │                     │
│  │  3 bài/ngày                        │                     │
│  │  Ghi chú: "Tuần này focus thợ     │                     │
│  │   điện, vừa scan thấy pain mạnh"  │                     │
│  └───────────┬────────────────────────┘                     │
│              │                                               │
│              ▼                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Content Agent (C1) nhận:                            │   │
│  │  - project.yaml context (vertical, geography, tone)  │   │
│  │  - audience_intel từ DB (nỗi đau thực tế)           │   │
│  │  - past performance (bài nào tốt/xấu)               │   │
│  │  - pattern_library (lessons learned)                 │   │
│  │  - CEO angle + ghi chú                               │   │
│  │                                                      │   │
│  │  → Output: 21 bài (7 ngày × 3 bài)                  │   │
│  └───────────┬──────────────────────────────────────────┘   │
│              │                                               │
│              ▼                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  CEO review từng bài:                                │   │
│  │                                                      │   │
│  │  Bài 1: "Hook hay, approve" ──→ ✅ approved          │   │
│  │  Bài 2: "Sửa CTA" ──→ ✏️ edit → ✅ approved         │   │
│  │  Bài 3: "Yếu quá" ──→ ❌ reject                     │   │
│  │  Bài 4: "Tạo ảnh đi" ──→ 🖼️ C11 image → approve   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Endpoint:  POST /api/marketing/weekly-plan                  │
│  Agent:     content (C1)                                     │
│  Input:     enriched context (project + intel + perf + pat)  │
│  Output:    scheduled_posts (status: draft)                  │
│  Status:    ✅ WORKING                                       │
│                                                              │
│  CRUD:      PUT  /post/{id}          — sửa nội dung         │
│             PUT  /post/{id}/approve  — duyệt                │
│             PUT  /post/{id}/reject   — bỏ                   │
│             POST /post/{id}/image    — tạo ảnh (C11)        │
│  Status:    ✅ WORKING                                       │
└─────────────────────────────────────────────────────────────┘
```

### Vòng 3: Publish (DISTRIBUTE)

```
┌─────────────────────────────────────────────────────────────┐
│                    CEO TRIGGERS                              │
│                                                              │
│  Frontend: Tab "Content" → bài đã approved                   │
│  ┌────────────────────────────────────┐                     │
│  │  Nhấn "Đăng" trên từng bài        │                     │
│  │  hoặc "Approve All" → Đăng hàng   │                     │
│  │  loạt                              │                     │
│  └───────────┬────────────────────────┘                     │
│              │                                               │
│              ▼                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Publish flow:                                       │   │
│  │                                                      │   │
│  │  Có ảnh? ──Yes──→ upload_image_to_facebook()         │   │
│  │     │              (ảnh + caption cùng lúc)           │   │
│  │     No                                                │   │
│  │     └───────────→ post_facebook()                     │   │
│  │                   (text only)                         │   │
│  │                                                      │   │
│  │  ← fb_post_id + post_url                             │   │
│  │  → Lưu DB: status = "posted"                         │   │
│  │  → Telegram: "Đã đăng Facebook ✓"                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Endpoint:  POST /api/marketing/post/{id}/publish            │
│  Tool:      Facebook Graph API v21.0                         │
│  Output:    fb_post_id, post_url, posted_at                  │
│  Notify:    Telegram Bot → CEO                               │
│  Status:    ✅ WORKING                                       │
└─────────────────────────────────────────────────────────────┘
```

### Vòng 4: Đo lường & Học (MEASURE + LEARN)

```
┌─────────────────────────────────────────────────────────────┐
│                    CEO TRIGGERS                              │
│                                                              │
│  ┌─────────────────────┐   ┌────────────────────────────┐  │
│  │ "Sync Metrics"      │   │ "Extract Patterns"         │  │
│  │ Kéo số từ Facebook  │   │ AI phân tích → rút bài học │  │
│  └──────────┬──────────┘   └─────────────┬──────────────┘  │
│             │                             │                  │
│             ▼                             ▼                  │
│  ┌──────────────────┐       ┌──────────────────────────┐   │
│  │ Facebook Insights │       │ Analytics Agent (A7)     │   │
│  │ API v21.0         │       │ Pattern Extraction       │   │
│  │                   │       │                          │   │
│  │ Per post:         │       │ Input: posted posts      │   │
│  │ - impressions     │       │ + metrics + angles       │   │
│  │ - reach           │       │                          │   │
│  │ - clicks          │       │ Output:                  │   │
│  │ - reactions       │       │ "Angle Cái Uy + hook     │   │
│  │ - comments        │       │  hỏi trực tiếp → reach   │   │
│  │ - shares          │       │  cao hơn 40%"            │   │
│  └──────────┬────────┘       └────────────┬─────────────┘   │
│             │                             │                  │
│             ▼                             ▼                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  CEO xem Dashboard "Stats":                          │   │
│  │                                                      │   │
│  │  📊 Tổng: 45 posted | 12,340 views | 890 engagements│   │
│  │  📈 By angle: Cái Uy (40%) > Sĩ Diện > Cơ Hội      │   │
│  │  🏆 Top post: "Thợ điện HN..." — 2,100 views        │   │
│  │  📚 Patterns: 5 mới                                  │   │
│  │  💡 Hypotheses: 3 HIGH / 5 MEDIUM                    │   │
│  │                                                      │   │
│  │  → CEO dùng insight này cho plan tuần sau             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Endpoint:  POST /api/marketing/sync-metrics                 │
│             POST /api/marketing/extract-patterns             │
│             GET  /api/marketing/stats                        │
│  Agent:     analytics (A7)                                   │
│  Status:    ✅ WORKING                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Vòng 5: Chiến lược (STRATEGIZE) — CEO-driven

```
┌─────────────────────────────────────────────────────────────┐
│                    CEO TRIGGERS                              │
│                                                              │
│  Dựa trên insights + patterns + metrics, CEO quyết định:    │
│                                                              │
│  ┌─────────────────────────────────────┐                    │
│  │ "Generate Hypotheses"               │                    │
│  │  CEO muốn explore cơ hội mới       │                    │
│  └──────────┬──────────────────────────┘                    │
│             │                                                │
│             ▼                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pipeline 3 bước:                                    │   │
│  │                                                      │   │
│  │  1. Strategy Agent (S7) — brainstorm hypotheses      │   │
│  │     Input: scan data + audience intel + patterns     │   │
│  │     Output: danh sách hypothesis thô                 │   │
│  │                                                      │   │
│  │  2. Analytics Agent (A2) — score từng hypothesis     │   │
│  │     5 dimensions: TAM, Timing, Feasibility,          │   │
│  │     Signal, NE → score 0-100                         │   │
│  │     Thresholds: ≥72 HIGH / 45-71 MEDIUM / <45 PARK  │   │
│  │                                                      │   │
│  │  3. Devils Advocate (A1) — stress test               │   │
│  │     Challenge assumptions, find weaknesses           │   │
│  └──────────┬───────────────────────────────────────────┘   │
│             │                                                │
│             ▼                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  CEO review hypotheses:                              │   │
│  │                                                      │   │
│  │  #1 "Thợ điện HCM" — Score: 78 (HIGH) — Promote? ✅ │   │
│  │  #2 "Thợ sơn online" — Score: 52 (MED) — Keep 📋    │   │
│  │  #3 "Tool rental" — Score: 31 (PARK) — Archive 🗄️   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Endpoint:  POST /api/marketing/intel/generate-hypotheses    │
│             POST /api/marketing/intel/stress-test/{id}       │
│             PUT  /api/marketing/intel/hypothesis/{id}/promote│
│  Agents:    strategy (S7) + analytics (A2) + DA (A1)        │
│  Status:    ✅ WORKING                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Luồng tuần hoàn đầy đủ

```
         ┌──────────────────────────────────────────────┐
         │                 CEO quyết định                │
         │          "Tuần này focus gì?"                 │
         └──────────────────┬───────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
    ┌──────────────┐ ┌──────────┐ ┌──────────────┐
    │ 1. DISCOVER  │ │ Patterns │ │ Hypotheses   │
    │ Scan Market  │ │ từ tuần  │ │ từ tuần      │
    │ Scan Comp    │ │ trước    │ │ trước        │
    │ Scan Audience│ │          │ │              │
    └──────┬───────┘ └────┬─────┘ └──────┬───────┘
           │              │              │
           └──────────────┼──────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  2. BUILD             │
              │  Weekly Plan          │
              │  (C1 + enriched ctx)  │
              │  → 21 draft posts     │
              └──────────┬────────────┘
                         │
                         ▼
              ┌───────────────────────┐
              │  3. CEO REVIEW        │
              │  Approve / Edit /     │
              │  Reject / Add Image   │
              └──────────┬────────────┘
                         │
                         ▼
              ┌───────────────────────┐
              │  4. PUBLISH           │
              │  → Facebook           │
              │  → Telegram notify    │
              └──────────┬────────────┘
                         │
                         ▼
              ┌───────────────────────┐
              │  5. MEASURE           │
              │  Sync FB Metrics      │
              │  → views, reach,      │
              │    engagements        │
              └──────────┬────────────┘
                         │
                         ▼
              ┌───────────────────────┐
              │  6. LEARN             │
              │  Extract Patterns     │
              │  (A7)                 │
              │  → "Angle X works"    │
              └──────────┬────────────┘
                         │
                         ▼
              ┌───────────────────────┐
              │  7. STRATEGIZE        │
              │  Generate Hypotheses  │
              │  (S7 + A2 + A1)      │
              │  → "Cơ hội mới Y"    │
              └──────────┬────────────┘
                         │
                         ▼
                ┌────────────────┐
                │ Quay lại bước 1│
                │ Tuần kế tiếp   │
                └────────────────┘
```

---

## CEO làm gì vs Agent làm gì

| Bước | CEO làm | Agent làm | Ai quyết định |
|------|---------|-----------|----------------|
| **Scan insight** | Nhấn nút trigger | Research R1/R4/R6 chạy web search, phân tích | Agent tìm, **CEO đọc & đánh giá** |
| **Lên plan** | Chọn tuần, angle, ghi chú hướng dẫn | Content C1 viết 21 bài dựa trên context | Agent viết, **CEO duyệt từng bài** |
| **Tạo ảnh** | Nhấn "tạo ảnh" per bài | Content C11 thiết kế prompt + AI gen | Agent design, **CEO chọn dùng/không** |
| **Đăng bài** | Nhấn "Đăng" per bài approved | API gửi lên Facebook | **CEO quyết đăng lúc nào** |
| **Đo lường** | Nhấn "Sync metrics" | API kéo số từ Facebook | Agent kéo, **CEO đọc** |
| **Rút pattern** | Nhấn "Extract patterns" | Analytics A7 phân tích dữ liệu | Agent phân tích, **CEO confirm** |
| **Chiến lược** | Nhấn "Generate hypotheses" | S7 brainstorm + A2 score + A1 stress | Agent gợi ý, **CEO promote/archive** |

**Mô hình: Agent = nhân viên thông minh, CEO = người ra quyết định cuối cùng.**

---

## Những gì playbook YAML thêm (tương lai)

Playbook YAML thiết kế cho **auto-pilot** — agent tự chain, tự trigger, CEO chỉ review gate:

| Hiện tại (CEO trigger) | Tương lai (Playbook auto) | Khác biệt |
|------------------------|--------------------------|-----------|
| CEO nhấn Scan 3 lần riêng | `discover.yaml` chạy R1+R2+R4 parallel, auto → R5 → A1 → S1 | **Tự chain** |
| CEO nhấn Weekly Plan | `build_test_daily.yaml` chạy **mỗi ngày 9h**: G10 trends → C3 content → C5 visual → G9 schedule | **Daily thay weekly** |
| CEO nhấn Sync Metrics | `build_test_weekly.yaml` chạy **mỗi thứ 2**: A4 → A6 CMF + A5 Traction → A7 patterns → kill check | **Auto scoring** |
| Không có | `decide.yaml` tuần 8: full assessment + CEO GO/NO-GO | **Phase mới** |
| CEO nhấn Extract | `extract.yaml`: 4 parallel A7 (content/dist/market/customer) → compile → S1 update | **Multi-focus** |
| Không có CEO gate | Gates: CEO approval required trước khi BUILD_TEST / GO-NO-GO | **Approval flow** |

**Kết luận: Luồng hiện tại WORK đầy đủ cho mô hình CEO-driven. Playbook YAML là bước tiếp theo khi muốn tự động hóa — nhưng không bắt buộc để vận hành.**

---

## Data Flow qua DB

```
project.yaml ──→ get_project_context() ──→ Tất cả agent calls
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ audience_intel│ ←── Scan Audience (R6)
                                    │ scan_reports  │ ←── Scan Market/Comp (R1/R4)
                                    │              │
                                    │ scheduled_    │ ←── Weekly Plan (C1)
                                    │ posts         │ ──→ Publish → Facebook
                                    │              │ ←── Sync Metrics → FB Insights
                                    │              │
                                    │ patterns      │ ←── Extract Patterns (A7)
                                    │ hypotheses    │ ←── Generate Hypotheses (S7+A2+A1)
                                    │              │
                                    │ agent_outputs │ ←── Mọi agent call (log)
                                    └──────────────┘
                                           │
                                           ▼
                                    Frontend Dashboard
                                    (Stats, Content, Intel tabs)
```
