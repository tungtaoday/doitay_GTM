# QUYỂN 7 — KÊNH × METRICS × FEATURES

> Trả lời: trên TỪNG kênh/bề mặt, con số nào là sao dẫn đường (north star), đo bằng gì,
> và feature nào phục vụ con số đó. Mỗi metric đều chỉ rõ **feature đi kèm + trạng thái** —
> để biết cái gì đã có, cái gì phải build.
> Bắc Đẩu TOÀN CỤC (Q0): **thợ THẬT chia sẻ hồ sơ → khách THẬT liên hệ.** Mọi north star kênh là mảnh ghép của nó.

---

## 0. BẢN ĐỒ HỆ THỐNG — kênh nào giữ vai gì

```
                 CUNG (THỢ)                                CẦU (KHÁCH)
┌────────────────────────────────────┐      ┌────────────────────────────────────┐
│  ThợTốt-CV (Zalo Mini App)         │      │  doitay.vn (Web)                   │
│  NSM: % thợ CHIA SẺ hồ sơ          │─────▶│  NSM: khách THẬT liên hệ/đặt lịch  │
└────────────────────────────────────┘ link └────────────────────────────────────┘
        ▲ nạp thợ                                    ▲ nạp khách lạ
┌───────┴────────────────────────────┐      ┌────────┴───────────────────────────┐
│ KÊNH NẠP CUNG                      │      │ KÊNH NẠP CẦU                       │
│ · FB groups thợ (seed)             │      │ · SEO /dich-vu (kill-switch)       │
│ · TikTok (reach lạnh)              │      │ · FB groups cư dân (demand_capture)│
│ · Zalo OA (chạm thợ)               │      │ · Khách quen của thợ (V1 - chính)  │
│ · CTV vật lý (Q4, Q9)              │      │                                    │
└────────────────────────────────────┘      └────────────────────────────────────┘
```

---

## 1. ThợTốt-CV (Zalo Mini App) — bề mặt THỢ

**North Star Metric: `% thợ đã chia sẻ hồ sơ cho khách` (Profile Share Rate)** — metric #5 trong bộ xlsx.
Vì sao: app tồn tại để biến mỗi thợ thành 1 kênh phân phối. Cài app/tạo hồ sơ mà không share = 0 giá trị.

### Bảng metric → feature (trạng thái thật, kiểm 2026-07)

| # | Metric | Mục tiêu | Feature đi kèm | Trạng thái |
|---|---|---|---|---|
| NSM | % thợ share hồ sơ | ≥60% | Nút **"Gửi thẻ cho khách"** (openShareSheet native, path `?tho=<id>`); event `profile_shared` | ✅ code xong, **chờ zmp deploy** |
| 1 | Hoàn tất hồ sơ lần đầu | ≥70% | Prefill tên/ảnh từ Zalo (`getUserInfo`); form 4 bước | ✅ live |
| 2 | Time-to-First-Profile | <5 phút | Concierge flow: bỏ qua được bảng giá, lưu localStorage | ✅ live |
| 3 | Publish lên chợ | ≥75% | Checkbox đồng bộ doitay (mặc định bật) → `POST /tho-profiles`; event `profile_published` | ✅ live (event live) |
| 4 | Khách xem thẻ → liên hệ | ≥25% | Màn khách (`PublicProfileView`): nút **Gọi thợ ngay** + **Nhắn Zalo** + Đặt lịch; events `profile_viewed`/`contact_clicked` | ✅ code xong, chờ deploy (endpoint `/contact` đã live) |
| 5 | Thợ quay lại D30 | ≥50% | Trạng thái duyệt tự dò (`checkProfileLive`); mẹo tăng uy tín | ✅ live · **thiếu: thông báo "có khách xem"** → backlog |
| 6 | Ghim/tần suất mở | tăng dần | `favoriteApp()` + `createShortcut()` (ghim Zalo + màn hình chính) | 🔲 **backlog batch duyệt kế** |
| 7 | Tin cậy pháp lý | pass duyệt | Trang Điều khoản/Bảo mật in-app + web | ✅ live, đã qua duyệt |

**Batch deploy Mini App kế tiếp (1 lượt duyệt):** tracking events + nút Gọi/Zalo + (tuỳ chọn) nút ghim. → Sau deploy, NSM đo được tự động qua `/metrics/bac-dau`.

---

## 2. doitay.vn (Web) — bề mặt KHÁCH

**North Star Metric: `khách THẬT liên hệ/đặt lịch với thợ`** (contact_clicked + booking_confirmed) — nửa sau Bắc Đẩu.

### Bảng metric → feature

| # | Metric | Mục tiêu | Feature đi kèm | Trạng thái |
|---|---|---|---|---|
| NSM | Khách liên hệ/đặt lịch | 5-10 khách thật đầu → ≥1/thợ-share/tháng | **Guest booking** (không cần đăng nhập, tự tạo tài khoản theo SĐT); nút gọi/đặt lịch; events | ✅ **live + verified** |
| 1 | Xem hồ sơ → liên hệ (CTR) | ≥25% | Trang `/tho/[id]`: ảnh việc thật, bảng giá, đánh giá, JSON-LD ProfessionalService, `data-track-contact` | ✅ live |
| 2 | Duyệt hồ sơ live nhanh (SLA) | <2 giờ | Hàng đợi duyệt company | ⚠️ live nhưng **duyệt tay — cần cam kết SLA/auto-approve** |
| 3 | Đặt lịch hoàn tất | ≥70% | Form đặt lịch 2 bước + confirm; throttle chống spam | ✅ live |
| 4 | Khách organic từ SEO | sau khi bật | Trang `/dich-vu/[nghề]/[quận]` (pSEO) + sitemap + `keywordsFor()` | ✅ built, **noindex** tới khi `SEO_INDEX_ENABLED` (điều kiện Q0/Q6) |
| 5 | Niềm tin | định tính | Trang legal 2 thương hiệu; TrustBadges; số liệu thật | ✅ live |
| 6 | Đo lường nền | 100% event | Bảng `product_events` + `POST /public/events` + `GET /metrics/bac-dau?token=` | ✅ **live + verified** |

---

## 3. Facebook (Page + Groups) — kênh NẠP CUNG chính + bắt cầu

**North star kênh: `inbox conversion từ bài đăng` (>15% = nổ) + `#thợ inbox từ group/tuần`.**
KHÔNG đo like/follow (phù phiếm — Q6).

| Metric | Feature/công cụ đi kèm | Trạng thái |
|---|---|---|
| Inbox conversion / bài | **Comment-inbox keyword** (`/api/comment-inbox`: rules → scan → auto-inbox) | ✅ chạy được |
| # bài high-signal (thread ≥3) | Cron `fb_morning_distribution` (Layer 1-3) + seed comment G12 (3 mẫu/bài do agent sinh sẵn) | ✅ chạy được |
| Tín hiệu pain/language/intent | Cron `fb_evening_signals` → AudienceIntel → nuôi content mai | ✅ chạy được |
| # thợ mới từ group | Bài chào PL-A §2 đăng group (danh bạ Q8) + routing `posting_targets.json` | ✅ bài sẵn — **việc người: vào group Q8** |
| Hypothesis evidence | `/morning/link-hypotheses` + `/evening/capture-signals` (auto-promote tier) | ✅ chạy được |

Giờ vàng: 10:00 / 14:00 / 20:00 (Page ID 663482443525186). Mix: 55% narrative / 30% proof / 15% utility + demand_capture reactive.

## 4. TikTok — kênh REACH LẠNH (thợ trẻ + khách)

**North star kênh: `# thợ/khách inbox-follow từ video` (không phải view).**

| Metric | Feature/công cụ | Trạng thái |
|---|---|---|
| Video hoàn thành ≥50% | **Reel generator** (`reel_generator.py`: 18s, 5 frames, script từ weekly plan) | ✅ chạy được |
| Follow→profile click | Bio link → doitay.vn/tho hoặc QR ThợTốt | ✅ (thủ công) |
| Format thắng | Swipe file (Q3 §6) + khuôn: *"X năm nghề…", "Khách trả X triệu tưởng lãi?"* | ✅ quy trình sẵn |
| Đăng | `tiktok_uploader.py` | ⚠️ có code — cần test phiên đăng nhập |

Giờ: 11:30 / 20:00. Loại ăn: drama đi kèo, day-in-the-life, before/after.

## 5. Zalo OA — kênh CHẠM THỢ (giữ chân)

**North star kênh: `% thợ còn tương tác OA sau 30 ngày`.**

| Metric | Feature/công cụ | Trạng thái |
|---|---|---|
| Thợ quan tâm OA | Link OA trong Mini App + bio | ✅ |
| Mở broadcast | Repurpose bài utility (C10): bảng giá, tip — KHÔNG spam quảng cáo | quy trình sẵn |
| Vào lại Mini App từ OA | Menu OA → Mini App | cấu hình Console (việc người) |

Giờ: 06:00 / 11:30 / 20:00.

---

## 6. TỔNG HỢP — 1 trang nhìn cả hệ (in ra)

| Kênh | North star | Đo ở đâu | Nhịp xem |
|---|---|---|---|
| **ThợTốt-CV** | % thợ share hồ sơ | `/metrics/bac-dau` (share_rate) | Tuần |
| **doitay.vn** | Khách thật liên hệ/đặt lịch | `/metrics/bac-dau` (contacted, real_lead_rate) | Tuần |
| Facebook | Inbox conversion >15% | Báo cáo cron tối | Ngày |
| TikTok | Inbox/follow từ video | Đếm tay + TikTok analytics | Tuần |
| Zalo OA | % thợ còn tương tác D30 | OA dashboard | Tháng |
| CTV (Q9) | Chi phí/thợ hợp lệ ≤40k · %share ≥40% | Sheet nghiệm thu | Tuần |

**Một câu chốt:** *Mọi kênh chỉ có 2 nhiệm vụ: nạp thợ vào ThợTốt-CV, hoặc nạp khách vào doitay.vn — và cả hai quy về Bắc Đẩu: thợ share → khách liên hệ.*

---

## 7. BACKLOG FEATURE theo mức đẩy north-star (ưu tiên giảm dần)

1. **Deploy batch Mini App** (tracking + Gọi/Zalo) — mở khoá đo NSM cả 2 bề mặt. *(zmp deploy + duyệt)*
2. **SLA duyệt hồ sơ <2h** — chặn gãy trải nghiệm lần đầu (Q6 rủi ro số 1). *(auto-approve hồ sơ đạt chuẩn hoặc lịch duyệt 2 lần/ngày)*
3. **Thông báo "khách vừa xem/liên hệ hồ sơ anh"** (OA message) — dopamine → thợ share tiếp (V1).
4. Nút **ghim hồ sơ** (favoriteApp/createShortcut) — tăng tần suất mở.
5. **Bật SEO index** khi đủ điều kiện (Q6 gate) + Search Console.

*Cập nhật: 2026-07. Nguồn số: bộ metric xlsx (18 metric) + hiện trạng code đã verify.*
