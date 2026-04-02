# Luồng vận hành đề xuất: CEO + Agent System

> Thiết kế cho 1 CEO vận hành Doitay.vn với 7 AI agents, 50 skills
> 3 kênh: Facebook (content) · Zalo (reach thợ) · TikTok (cold audience)
> Nguyên tắc: Agent làm nặng, CEO ra quyết định. Không có bước nào agent tự chạy mà CEO không biết.

---

## Nhịp vận hành

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   DAILY (15 phút)          Mục tiêu: ĐĂNG + TƯƠNG TÁC             │
│   ──────────────           Content ra đúng giờ, engage đúng người   │
│                                                                     │
│   WEEKLY (45 phút)         Mục tiêu: LÊN KẾ HOẠCH + ĐO LƯỜNG     │
│   ────────────────         Tuần sau đăng gì, tuần này học được gì   │
│                                                                     │
│   MONTHLY (2 giờ)          Mục tiêu: ĐIỀU CHỈNH CHIẾN LƯỢC        │
│   ───────────────          Channel nào hiệu quả, pivot hay tiếp    │
│                                                                     │
│   QUARTERLY (nửa ngày)     Mục tiêu: QUYẾT ĐỊNH LỚN               │
│   ────────────────────     Scale / Pivot / Kill, resource nào       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## DAILY STANDUP — 15 phút, mỗi sáng 8:30

### CEO mở Dashboard → 3 việc duy nhất

```
8:30 ┌──────────────────────────────────────────────────────────────┐
     │                                                              │
     │  ❶ REVIEW & PUBLISH (5 phút)                                │
     │  ────────────────────────────                                │
     │                                                              │
     │  Xem bài hôm nay (đã gen từ weekly plan):                   │
     │                                                              │
     │  ┌─────────────────────────────────────────────────────┐    │
     │  │ 10:00  FB  "Thợ điện 15 năm kể chuyện..."  [Ảnh ✓] │    │
     │  │        → Approve ✅  hoặc  Sửa ✏️  hoặc  Bỏ ❌     │    │
     │  │                                                      │    │
     │  │ 14:00  FB  "Anh Hùng nhận 5 việc/tuần..."  [Chưa ảnh]│   │
     │  │        → Tạo ảnh 🖼️ → Approve ✅                    │    │
     │  │                                                      │    │
     │  │ 20:00  FB  "Giá thợ điện 2026..."           [Ảnh ✓] │    │
     │  │        → Approve ✅                                   │    │
     │  └─────────────────────────────────────────────────────┘    │
     │                                                              │
     │  Approved → Nhấn "Publish" hoặc auto-publish theo giờ       │
     │                                                              │
     │                                                              │
     │  ❷ CHECK ENGAGEMENT (5 phút)                                │
     │  ─────────────────────────────                               │
     │                                                              │
     │  Agent tóm tắt overnight:                                    │
     │  ┌─────────────────────────────────────────────────────┐    │
     │  │ Bài hôm qua: 3 posted                               │    │
     │  │ → "Thợ điện HN" đạt 1,200 reach, 45 reactions       │    │
     │  │ → 3 comments cần reply (2 hỏi giá, 1 muốn đăng ký) │    │
     │  │ → 1 DM hỏi tìm thợ nước                             │    │
     │  └─────────────────────────────────────────────────────┘    │
     │                                                              │
     │  CEO: Reply comment quan trọng (hoặc delegate cho agent)     │
     │                                                              │
     │                                                              │
     │  ❸ QUICK SIGNAL (5 phút) — nếu có                          │
     │  ──────────────────────────────────                          │
     │                                                              │
     │  Agent alert (nếu có):                                       │
     │  ┌─────────────────────────────────────────────────────┐    │
     │  │ 🔥 Trend: "mất điện Cầu Giấy" đang viral FB        │    │
     │  │    → Suggest: Viết bài nhanh về thợ điện Cầu Giấy?  │    │
     │  │    CEO: Duyệt → Agent viết + đăng nhanh              │    │
     │  └─────────────────────────────────────────────────────┘    │
     │                                                              │
8:45 └──────────────────────────────────────────────────────────────┘
```

### Agent flow phía sau Daily

```
06:00  ┌─ AUTO (agent tự chạy trước khi CEO dậy) ──────────────┐
       │                                                         │
       │  G10 Trend Riding                                       │
       │  → Scan FB/Zalo/TikTok cho trending topics Hà Nội      │
       │  → Flag nếu có trend liên quan sửa chữa/thợ            │
       │                                                         │
       │  R2 Social Listening                                    │
       │  → Monitor comments/DMs/mentions overnight              │
       │  → Tóm tắt: X comments cần reply, Y DMs, Z mentions    │
       │                                                         │
       │  A4 Content Performance (quick)                         │
       │  → Kéo metrics bài hôm qua                              │
       │  → So sánh vs trung bình                                │
       │                                                         │
       └─────────────────────────────────────────────────────────┘

08:30  CEO mở Dashboard → thấy tất cả sẵn sàng

10:00  Auto-publish bài đã approved (hoặc CEO nhấn publish)
14:00  Auto-publish bài thứ 2
20:00  Auto-publish bài thứ 3

21:00  ┌─ AUTO ──────────────────────────────────────────────────┐
       │  G1 Strategic Engagement                                │
       │  → Tìm 5-9 posts liên quan trên FB groups thợ          │
       │  → Gợi ý reply mang giá trị (không spam)               │
       │  → CEO approve → post replies                           │
       │                                                         │
       │  G2 Community Building                                  │
       │  → Reply comments trên page (cái nào agent trả lời     │
       │    được → draft reply, CEO approve)                     │
       └─────────────────────────────────────────────────────────┘
```

### Endpoints cần cho Daily

| Endpoint | Agent/Skill | Hiện tại | Cần build |
|----------|-------------|----------|-----------|
| `GET /today` | — | ✅ Có | — |
| `POST /post/{id}/publish` | — | ✅ Có | — |
| `POST /post/{id}/image` | content C11 | ✅ Có | — |
| **`GET /overnight-summary`** | R2 + A4 | ❌ | Tóm tắt engagement + metrics hôm qua |
| **`GET /trend-alerts`** | G10 | ❌ | Trending topics liên quan |
| **`POST /quick-post`** | C3 + C11 | ❌ | Viết + gen ảnh nhanh cho trend |
| **`GET /pending-replies`** | G2 | ❌ | Comments/DMs cần reply |
| **`POST /reply/{id}`** | G1/G2 | ❌ | Gửi reply đã approved |

---

## WEEKLY REVIEW — 45 phút, mỗi Chủ nhật tối

### 3 phần rõ ràng

```
CN tối ┌───────────────────────────────────────────────────────────┐
       │                                                           │
       │  PHẦN 1: ĐO LƯỜNG TUẦN QUA (15 phút)                    │
       │  ─────────────────────────────────────                    │
       │                                                           │
       │  CEO nhấn "Weekly Review" → Agent chạy:                   │
       │                                                           │
       │  ┌────────────────────────────────────────────────────┐  │
       │  │  A4 Content Performance                             │  │
       │  │  → Kéo metrics tất cả bài tuần này (FB + Zalo)     │  │
       │  │                                                     │  │
       │  │  A6 CMF Scoring                                     │  │
       │  │  → Content-Market Fit score tuần này                │  │
       │  │  → So sánh vs tuần trước: ↑ hay ↓?                 │  │
       │  │                                                     │  │
       │  │  A5 Traction Scoring                                │  │
       │  │  → Acquisition + Activation + Retention signals     │  │
       │  │  → "Tuần này thêm 3 thợ mới đăng ký"               │  │
       │  └────────────────────────────────────────────────────┘  │
       │                                                           │
       │  CEO xem Weekly Scorecard:                                │
       │  ┌────────────────────────────────────────────────────┐  │
       │  │  TUẦN W13 — Doitay.vn                               │  │
       │  │                                                     │  │
       │  │  Content: 18 posted / 21 planned                    │  │
       │  │  Reach:   8,450 (↑12% vs W12)                      │  │
       │  │  Engage:  340 (↑8%)                                 │  │
       │  │  CMF:     0.42 (→ chưa fit, cần thử hướng khác)    │  │
       │  │  Traction: 0.35                                     │  │
       │  │                                                     │  │
       │  │  Top bài: "Thợ điện kể chuyện..." — 2,100 reach    │  │
       │  │  Flop:    "Tips sửa ống nước..."  — 120 reach      │  │
       │  │                                                     │  │
       │  │  Angle breakdown:                                    │  │
       │  │  Cái Uy: 45% reach (WINNER)                         │  │
       │  │  Sĩ Diện: 30%                                       │  │
       │  │  Cơ Hội: 25%                                         │  │
       │  └────────────────────────────────────────────────────┘  │
       │                                                           │
       │                                                           │
       │  PHẦN 2: RÚT BÀI HỌC (15 phút)                          │
       │  ────────────────────────────────                         │
       │                                                           │
       │  Agent tự chạy:                                           │
       │  ┌────────────────────────────────────────────────────┐  │
       │  │  A7 Pattern Extraction                              │  │
       │  │  → "Hook dạng câu hỏi + Cái Uy = reach cao nhất"  │  │
       │  │  → "Bài có ảnh thợ thật > ảnh AI 3x"              │  │
       │  │  → "Giờ 20:00 engage cao hơn 10:00 2x"            │  │
       │  │                                                     │  │
       │  │  A1 Kill Signal Check                               │  │
       │  │  → CMF < 0.3 liên tục 2 tuần? → ⚠️ CEO alert      │  │
       │  │  → Traction giảm 3 tuần liên tiếp? → ⚠️            │  │
       │  └────────────────────────────────────────────────────┘  │
       │                                                           │
       │  CEO đọc patterns → confirm/reject:                       │
       │  "Đúng, hook câu hỏi hiệu quả → tuần sau dùng thêm"     │
       │  "Ảnh thợ thật: đúng nhưng khó lấy → thử video ngắn?"   │
       │                                                           │
       │                                                           │
       │  PHẦN 3: LÊN PLAN TUẦN SAU (15 phút)                    │
       │  ────────────────────────────────────                     │
       │                                                           │
       │  CEO input:                                               │
       │  ┌────────────────────────────────────────────────────┐  │
       │  │  Tuần: 2026-W14                                     │  │
       │  │  Focus: Cái Uy (vì W13 cho thấy hiệu quả nhất)    │  │
       │  │  Ghi chú: "Thử thêm hook câu hỏi,                 │  │
       │  │            giảm bài tips sửa chữa (flop)"          │  │
       │  │  Bài/ngày: 3                                        │  │
       │  │  Kênh: Facebook + thử 1 bài Zalo                   │  │
       │  └────────────────────────────────────────────────────┘  │
       │                                                           │
       │  → Agent gen 21+ bài draft (C1)                           │
       │  → Gen ảnh batch (C11)                                    │
       │  → CEO lướt nhanh approve/reject                          │
       │  → Sẵn sàng cho tuần mới                                 │
       │                                                           │
       └───────────────────────────────────────────────────────────┘
```

### Endpoints cần cho Weekly

| Endpoint | Agent/Skill | Hiện tại | Cần build |
|----------|-------------|----------|-----------|
| `POST /sync-metrics` | FB API | ✅ Có | Mở rộng multi-platform |
| `POST /weekly-plan` | content C1 | ✅ Có | — |
| `POST /extract-patterns` | analytics A7 | ✅ Có | — |
| **`POST /weekly-review`** | A4+A6+A5+A7+A1 | ❌ | 1 nút chạy cả chain |
| **`GET /weekly-scorecard`** | — | ❌ | Render scorecard đẹp |
| **`POST /batch-image`** | content C11 | ❌ | Gen ảnh tất cả bài 1 lúc |
| **`GET /kill-signals`** | analytics A1 | ❌ | Check tự động |

---

## MONTHLY REVIEW — 2 giờ, ngày 1 mỗi tháng

### CEO + Agent cùng đánh giá chiến lược

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  PHẦN 1: TỔNG HỢP THÁNG (30 phút)                              │
│  ──────────────────────────────────                              │
│                                                                  │
│  Agent chạy:                                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │  A4 Content Performance (monthly aggregate)              │    │
│  │  → Tổng 4 tuần: reach, engage, clicks, conversions      │    │
│  │                                                          │    │
│  │  A6 CMF trend (4 tuần)                                   │    │
│  │  → 0.28 → 0.35 → 0.42 → 0.48 → TREND ↑ Tốt            │    │
│  │                                                          │    │
│  │  A5 Traction trend (4 tuần)                              │    │
│  │  → Thợ mới: +12 / Khách mới: +45 / Hoàn thành: +28     │    │
│  │                                                          │    │
│  │  A8 Customer Analytics                                   │    │
│  │  → Segment nào engage nhiều nhất?                        │    │
│  │  → "Thợ điện 25-35 tuổi, HN nội thành = core audience"  │    │
│  │  → "Thợ sơn ít engage — cần content khác?"              │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│                                                                  │
│  PHẦN 2: ĐÁNH GIÁ KÊNH PHÂN PHỐI (30 phút)                    │
│  ───────────────────────────────────────────                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  CHANNEL REPORT                                          │    │
│  │                                                          │    │
│  │  Facebook:  18K reach / 1,200 engage / 15 conversions    │    │
│  │  → CAC: ~0đ (organic) — KEEP, scale content              │    │
│  │  → Best: Cái Uy stories, 20:00 posting                   │    │
│  │                                                          │    │
│  │  Zalo OA:   2,100 followers / 45 messages / 8 bookings  │    │
│  │  → CAC: ~0đ — KEEP, direct reach to tradespeople         │    │
│  │  → Best: Job alerts, short updates                        │    │
│  │                                                          │    │
│  │  TikTok:    0 (chưa bắt đầu)                             │    │
│  │  → Decision: Bắt đầu tháng tới? Cần video drama.         │    │
│  │                                                          │    │
│  │  Referral:  5 thợ giới thiệu thợ khác                    │    │
│  │  → Organic, zero cost — cần program hóa?                  │    │
│  │                                                          │    │
│  │  Telegram CEO alerts: 100% delivered ✓                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  CEO quyết định:                                                 │
│  → Facebook: Tăng lên 4 bài/ngày? Hay giữ 3?                   │
│  → Zalo: Thử ZNS broadcast cho thợ mới?                         │
│  → TikTok: Bắt đầu tháng tới (1 video/tuần)?                   │
│  → Referral: Thử G8 Referral Partnership?                        │
│                                                                  │
│                                                                  │
│  PHẦN 3: SCAN CHIẾN LƯỢC (30 phút)                              │
│  ──────────────────────────────────                              │
│                                                                  │
│  Agent chạy:                                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │  R1 Market Scanning — Có tín hiệu thị trường mới?       │    │
│  │  → "Grab ra tính năng sửa chữa tại HCM"                 │    │
│  │  → "Nhóm FB 'Thợ Hà Nội' tăng 2,000 members"           │    │
│  │                                                          │    │
│  │  R4 Competitive Intel — Đối thủ đang làm gì?            │    │
│  │  → "bTaskee tăng budget Google Ads HN"                   │    │
│  │  → "Vua Thợ launch app mới"                              │    │
│  │                                                          │    │
│  │  S7 + A2 Generate & Score Hypotheses                     │    │
│  │  → Cơ hội mới nào? Score bao nhiêu?                      │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  CEO quyết định:                                                 │
│  → Hypothesis nào promote? Archive?                              │
│  → Cần pivot strategy không?                                     │
│  → Budget tháng tới: giữ / tăng / giảm?                         │
│                                                                  │
│                                                                  │
│  PHẦN 4: ĐIỀU CHỈNH (30 phút)                                   │
│  ─────────────────────────────                                   │
│                                                                  │
│  Dựa trên data → CEO cập nhật:                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  project.yaml:                                           │    │
│  │  → Thêm/sửa content_angles nếu cần                      │    │
│  │  → Cập nhật current_stats                                │    │
│  │  → Thêm channel mới (TikTok active?)                     │    │
│  │                                                          │    │
│  │  Pattern Library:                                         │    │
│  │  → Confirm patterns từ tháng → lưu vĩnh viễn             │    │
│  │  → Delete patterns sai                                    │    │
│  │                                                          │    │
│  │  Hypothesis Backlog:                                      │    │
│  │  → Promote / Park / Archive                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Endpoints cần cho Monthly

| Endpoint | Agent/Skill | Hiện tại | Cần build |
|----------|-------------|----------|-----------|
| `GET /stats` | — | ✅ Có (basic) | Mở rộng thêm trend data |
| `POST /intel/scan-*` | R1/R4/R6 | ✅ Có | — |
| `POST /intel/generate-hypotheses` | S7+A2+A1 | ✅ Có | — |
| **`POST /monthly-review`** | A4+A6+A5+A8+S6 | ❌ | 1 nút chạy full monthly |
| **`GET /channel-report`** | A4 per channel | ❌ | Performance by channel |
| **`POST /update-strategy`** | S6 | ❌ | Agent gợi ý điều chỉnh strategy |

---

## QUARTERLY ASSESSMENT — Nửa ngày, mỗi 3 tháng

### CEO + Full Agent Team đánh giá toàn diện

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  SÁNG: DATA & ANALYSIS (3 giờ)                                      │
│  ─────────────────────────────                                       │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │  STEP 1: Thu thập toàn bộ data (auto)                        │    │
│  │  ─────────────────────────────────────                        │    │
│  │  A4 → 12 tuần content performance (all channels)             │    │
│  │  A6 → CMF trend 12 tuần (biểu đồ đường)                     │    │
│  │  A5 → Traction trend 12 tuần                                 │    │
│  │  A3 → Unit Economics: CAC, LTV, LTV/CAC ratio               │    │
│  │  A8 → Customer segments & behavior                           │    │
│  │                                                              │    │
│  │  STEP 2: Rút toàn bộ patterns (auto)                         │    │
│  │  ────────────────────────────────────                         │    │
│  │  A7 → Content patterns (hook, format, angle, timing)         │    │
│  │  A7 → Distribution patterns (channel, frequency, CTA)       │    │
│  │  A7 → Customer patterns (segments, conversion path)          │    │
│  │  A7 → Marketplace patterns (supply/demand dynamics)          │    │
│  │                                                              │    │
│  │  STEP 3: Stress Test (auto)                                   │    │
│  │  ─────────────────────────                                    │    │
│  │  A1 (Devils Advocate) → Challenge mọi assumption:            │    │
│  │  → "CMF tăng vì mùa sửa chữa, không phải content tốt?"     │    │
│  │  → "105 thợ có bền không nếu chưa monetize?"                 │    │
│  │  → "Facebook reach sẽ giảm khi organic bị throttle?"         │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  CEO XEM: Quarterly Scorecard                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │  ╔══════════════════════════════════════════════════════╗    │    │
│  │  ║  DOITAY.VN — Q1 2026 SCORECARD                      ║    │    │
│  │  ╠══════════════════════════════════════════════════════╣    │    │
│  │  ║                                                      ║    │    │
│  │  ║  CMF Score:      0.48 (target: 0.5)  → GẦN ĐẠT     ║    │    │
│  │  ║  Traction Score:  0.35 (target: 0.4) → CẦN CẢI THIỆN║   │    │
│  │  ║  Opportunity:     72/100 → HIGH                       ║    │    │
│  │  ║                                                      ║    │    │
│  │  ║  Supply:  105 thợ (+45 vs Q4)                        ║    │    │
│  │  ║  Demand:  1,200 appointments (+320 vs Q4)            ║    │    │
│  │  ║  Match:   745 completed                              ║    │    │
│  │  ║  Rating:  4.0/5                                      ║    │    │
│  │  ║                                                      ║    │    │
│  │  ║  Content: 252 posts / 156K reach / 8,400 engage     ║    │    │
│  │  ║  CAC: 0đ (100% organic)                              ║    │    │
│  │  ║  LTV/CAC: ∞ (chưa monetize → tính theo engagement)  ║    │    │
│  │  ║                                                      ║    │    │
│  │  ║  DA Verdict: HOLD — CMF gần đạt, cần thêm 1 quý    ║    │    │
│  │  ╚══════════════════════════════════════════════════════╝    │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│                                                                      │
│  CHIỀU: CEO QUYẾT ĐỊNH (1-2 giờ)                                    │
│  ────────────────────────────────                                    │
│                                                                      │
│  Dựa trên Scorecard + DA stress test, CEO chọn 1 trong 4:           │
│                                                                      │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────┐       │
│  │   SCALE   │ │   HOLD    │ │   PIVOT   │ │     KILL      │       │
│  │           │ │           │ │           │ │               │       │
│  │ CMF > 0.5 │ │ CMF 0.3- │ │ CMF < 0.3 │ │ CMF < 0.2     │       │
│  │ Traction  │ │ 0.5       │ │ nhưng có  │ │ Traction < 0.1│       │
│  │ > 0.4     │ │ Trend ↑   │ │ signal    │ │ Trend ↓↓      │       │
│  │           │ │           │ │ 1 hướng   │ │ No signal     │       │
│  │ → Tăng    │ │ → Tiếp    │ │ → Đổi     │ │               │       │
│  │   budget  │ │   thêm    │ │   hướng   │ │ → Dừng        │       │
│  │   Thêm    │ │   1 quý   │ │   content │ │   experiment  │       │
│  │   kênh    │ │   Thử     │ │   Đổi     │ │   Extract     │       │
│  │   Tuyển   │ │   thêm    │ │   channel │ │   patterns    │       │
│  │           │ │   angle   │ │   Đổi     │ │   Move on     │       │
│  │           │ │           │ │   audience │ │               │       │
│  └───────────┘ └───────────┘ └───────────┘ └───────────────┘       │
│                                                                      │
│  Nếu SCALE:                                                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  D2 Resource Allocation → Budget/effort cho Q2             │    │
│  │  S6 Channel Strategy → Thêm kênh nào? (TikTok? Ads?)     │    │
│  │  S8 Go-to-Market → GTM plan cho scale phase              │    │
│  │  G6 Paid Acquisition → Bắt đầu Facebook/Zalo Ads?        │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Nếu PIVOT:                                                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  D5 Strategy Pivot → Phân tích hướng pivot                │    │
│  │  S3 Value Proposition → Redesign CVP                      │    │
│  │  S2 Segmentation → Thử segment khác?                      │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Nếu KILL:                                                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  A7 × 4 → Extract ALL patterns (content/dist/mkt/customer)│    │
│  │  S1 → Update thesis cho experiment tiếp theo              │    │
│  │  → Chuyển sang hypothesis mới từ backlog                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Endpoints cần cho Quarterly

| Endpoint | Agent/Skill | Hiện tại | Cần build |
|----------|-------------|----------|-----------|
| `GET /stats` | — | ✅ Có (basic) | — |
| `POST /extract-patterns` | A7 | ✅ Có (1 call) | Mở rộng 4 focus areas |
| **`POST /quarterly-assessment`** | A4+A6+A5+A3+A8+A7×4+A1 | ❌ | Full quarterly chain |
| **`GET /quarterly-scorecard`** | — | ❌ | Render scorecard |
| **`POST /ceo-decision`** | D1/D2/D5 | ❌ | Lưu quyết định + trigger next |

---

## DISTRIBUTION FLOW — Chi tiết 3 kênh

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                         CONTENT SINH RA 1 LẦN                        │
│                       (Weekly Plan — Content Agent C1)               │
│                                                                      │
│                              │                                       │
│                    ┌─────────┼─────────┐                            │
│                    ▼         ▼         ▼                            │
│                                                                      │
│  ┌──────────────────┐ ┌──────────────┐ ┌──────────────────────┐    │
│  │    FACEBOOK       │ │    ZALO      │ │    TIKTOK            │    │
│  │    (Content hub)  │ │  (Direct)    │ │  (Cold audience)     │    │
│  ├──────────────────┤ ├──────────────┤ ├──────────────────────┤    │
│  │                   │ │              │ │                      │    │
│  │  3 bài/ngày       │ │ 1-2 tin/ngày │ │ 1-2 video/tuần      │    │
│  │  10:00, 14:00,    │ │ 06:00, 20:00 │ │ 11:30 or 20:00     │    │
│  │  20:00            │ │              │ │                      │    │
│  │                   │ │              │ │                      │    │
│  │  Format:          │ │ Format:      │ │ Format:              │    │
│  │  · Post + ảnh     │ │ · Tin ngắn   │ │ · Drama video        │    │
│  │  · Story          │ │ · Job alert  │ │ · Day-in-the-life    │    │
│  │  · Reel (1/tuần)  │ │ · ZNS push   │ │ · Tips nhanh         │    │
│  │                   │ │              │ │                      │    │
│  │  Mục tiêu:        │ │ Mục tiêu:    │ │ Mục tiêu:            │    │
│  │  Brand awareness  │ │ Direct reach │ │ Viral reach          │    │
│  │  Trust building   │ │ to thợ       │ │ Young audience       │    │
│  │  Engagement       │ │ Job matching │ │ Brand discovery      │    │
│  │                   │ │              │ │                      │    │
│  │  Agent:           │ │ Agent:       │ │ Agent:               │    │
│  │  C1 Hook Writing  │ │ C3 Shortform │ │ C4 Storytelling      │    │
│  │  C11 Image Design │ │ G9 Schedule  │ │ C5 Visual Content    │    │
│  │  G1 Engagement    │ │ G4 Nurture   │ │ G10 Trend Riding     │    │
│  │  G2 Community     │ │              │ │                      │    │
│  │                   │ │              │ │                      │    │
│  │  Publish:         │ │ Publish:     │ │ Publish:             │    │
│  │  ✅ Auto (API)    │ │ 🔧 Manual    │ │ 🔧 Manual            │    │
│  │                   │ │ (Zalo OA)    │ │ (Upload)             │    │
│  │                   │ │              │ │                      │    │
│  │  Metrics:         │ │ Metrics:     │ │ Metrics:             │    │
│  │  ✅ Auto sync     │ │ 🔧 Manual    │ │ 🔧 Manual            │    │
│  │  (Graph API)      │ │ input        │ │ input                │    │
│  └──────────────────┘ └──────────────┘ └──────────────────────┘    │
│                                                                      │
│                              │                                       │
│                              ▼                                       │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     REPURPOSE LOOP (C10)                     │   │
│  │                                                              │   │
│  │  Top FB post (reach > 1,000) ──→ Rút gọn → Zalo tin ngắn   │   │
│  │  Top FB post (story hay) ──────→ Script → TikTok video      │   │
│  │  Top TikTok (> 10K views) ────→ Embed → FB post             │   │
│  │  Cluster 3 bài cùng chủ đề ──→ Thread → Zalo article       │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Distribution Engagement Flow (Daily)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  OUTBOUND ENGAGEMENT (Agent gợi ý, CEO approve)                    │
│  ──────────────────────────────────────────────                     │
│                                                                      │
│  ┌── G1 Strategic Engagement ────────────────────────────────┐     │
│  │                                                            │     │
│  │  Agent scan các group/page liên quan:                      │     │
│  │  · "Thợ Điện Hà Nội" (FB group, 15K members)              │     │
│  │  · "Sửa Chữa Nhà Hà Nội" (FB group, 8K)                  │     │
│  │  · "Tìm Thợ Uy Tín" (FB group, 12K)                       │     │
│  │                                                            │     │
│  │  → Tìm 5-9 posts có thể reply mang giá trị:               │     │
│  │    Post: "Ai biết thợ điện uy tín quận Cầu Giấy không?"  │     │
│  │    Reply gợi ý: "Anh/chị check doitay.vn, có 16 thợ      │     │
│  │    điện verified khu vực Cầu Giấy, miễn phí báo giá"     │     │
│  │                                                            │     │
│  │  CEO: Approve / Sửa / Skip từng reply                     │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌── G2 Community Building ──────────────────────────────────┐     │
│  │                                                            │     │
│  │  Overnight comments on Doitay page:                        │     │
│  │  · "Tôi muốn đăng ký làm thợ" → Draft reply + link       │     │
│  │  · "Giá sửa ống nước bao nhiêu?" → Draft reply + range   │     │
│  │  · "Thợ này tay nghề tốt lắm" → Draft thank + share      │     │
│  │                                                            │     │
│  │  CEO: Approve replies (hoặc auto cho câu hỏi phổ biến)    │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌── G4 Audience Nurturing ──────────────────────────────────┐     │
│  │                                                            │     │
│  │  Thợ đã đăng ký nhưng chưa active:                        │     │
│  │  · 15 thợ tạo profile > 7 ngày, chưa nhận việc           │     │
│  │  → Zalo message: "Anh [tên] ơi, có 3 việc thợ [nghề]    │     │
│  │    gần anh, vào app xem nhé"                               │     │
│  │                                                            │     │
│  │  CEO: Approve batch nurture messages                       │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tổng hợp: CEO Calendar View

```
═══════════════════════════════════════════════════════════════════════

  THỨ 2      THỨ 3      THỨ 4      THỨ 5      THỨ 6      THỨ 7    CN
  ──────     ──────     ──────     ──────     ──────     ──────   ────

  8:30       8:30       8:30       8:30       8:30
  Daily      Daily      Daily      Daily      Daily
  Standup    Standup    Standup    Standup    Standup
  (15m)      (15m)      (15m)      (15m)      (15m)
                                                                  20:00
  10/14/20   10/14/20   10/14/20   10/14/20   10/14/20            Weekly
  Publish    Publish    Publish    Publish    Publish             Review
  3 bài      3 bài      3 bài      3 bài      3 bài              (45m)
                                                                  + Plan
  21:00      21:00      21:00      21:00      21:00               tuần
  Engage     Engage     Engage     Engage     Engage              sau
  (auto)     (auto)     (auto)     (auto)     (auto)


  Ngày 1 mỗi tháng:  Monthly Review (2h sáng)
  Ngày 1 mỗi quý:    Quarterly Assessment (nửa ngày)

═══════════════════════════════════════════════════════════════════════

  Tổng thời gian CEO/tuần:
  · Daily: 15 phút × 5 = 75 phút
  · Weekly: 45 phút × 1 = 45 phút
  · TỔNG: ~2 giờ/tuần

  Agent chạy background:
  · 6:00 trend scan + social listening
  · 10/14/20 auto-publish
  · 21:00 engagement scan
  · Chủ nhật: metrics sync + pattern extraction

═══════════════════════════════════════════════════════════════════════
```

---

## Implementation Priority

### Phase 1: Hoàn thiện Daily Loop (1-2 tuần)

```
Hiện tại đã có:  Publish + Image + Plan + Metrics
Cần thêm:

1. GET /overnight-summary
   → R2 social listening overnight + A4 quick metrics
   → Frontend: card "Hôm qua" trên dashboard

2. GET /trend-alerts
   → G10 trend riding scan
   → Frontend: banner alert nếu có trend

3. GET /pending-replies
   → G2 scan comments cần reply
   → Frontend: list replies cần approve

4. POST /reply/{id}
   → Gửi reply đã approve lên FB
```

### Phase 2: Hoàn thiện Weekly Loop (1-2 tuần)

```
Hiện tại đã có:  sync-metrics + weekly-plan + extract-patterns
Cần thêm:

5. POST /weekly-review  (chain: A4 → A6 + A5 → A7 + A1)
   → 1 nút chạy toàn bộ weekly analysis
   → Output: weekly scorecard JSON

6. GET /weekly-scorecard
   → Render scorecard đẹp với trend arrows

7. POST /batch-image
   → Gen ảnh tất cả bài draft 1 lúc (C11 × N)

8. GET /kill-signals
   → A1 auto-check, return warnings
```

### Phase 3: Monthly + Quarterly (2-3 tuần)

```
9.  POST /monthly-review  (A4+A6+A5+A8+R1+R4+S6)
10. GET /channel-report   (performance by platform)
11. POST /quarterly-assessment  (full chain)
12. POST /ceo-decision    (SCALE/HOLD/PIVOT/KILL + trigger next)
```

### Phase 4: Distribution Agents (2-3 tuần)

```
13. G1 strategic engagement  (scan groups → suggest replies)
14. G2 community building    (auto-draft replies for comments)
15. G4 audience nurturing    (Zalo messages for inactive users)
16. C10 repurposing          (FB top → Zalo/TikTok)
17. G8 referral partnership  (referral program automation)
```

---

## So sánh: Hiện tại vs Đề xuất

```
                    HIỆN TẠI                    ĐỀ XUẤT
                    ────────                    ────────

Daily:              CEO mở app khi nhớ          8:30 standup 15 phút
                    Publish thủ công từng bài   Auto-publish theo giờ
                    Không check engagement      Overnight summary sẵn
                    Không trend riding          Alert khi có trend

Weekly:             CEO nhấn sync + plan        1 nút "Weekly Review"
                    Không scoring               CMF + Traction auto
                    Không kill signal check     Auto warning
                    Pattern extraction thủ công  Auto sau review

Monthly:            Không có                    2h structured review
                                               Channel comparison
                                               Strategy adjustment

Quarterly:          stats endpoint basic         Full scorecard
                                               DA stress test
                                               CEO GO/NO-GO framework
                                               Extract → next experiment

Distribution:       Chỉ Facebook publish        FB + Zalo + TikTok
                    Không engagement             Strategic replies
                    Không nurturing             Inactive user outreach
                    Không repurpose             Top content → multi-platform
```
