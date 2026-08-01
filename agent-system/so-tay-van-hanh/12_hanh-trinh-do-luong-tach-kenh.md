# QUYỂN 12 — HÀNH TRÌNH MARKETING → SALE & ĐO LƯỜNG TÁCH KÊNH

> Phân tích kỹ hành trình 2 phía (THỢ = cung, KHÁCH = cầu) theo từng chặng: điểm chạm nào,
> kênh nào, đo bằng số nào, công cụ nào — và ai "bán" ở chặng đó. Kèm hệ tách kênh
> (thotot_card / seo / facebook / zalo / tiktok / ctv) đã cài vào code + hướng dẫn bật GA4/GSC.

---

## 0. BỨC TRANH LỚN — marketing và sale của doitay là MỘT vòng, không phải 2 phòng

```
        MARKETING (tạo biết & tin)                 SALE (chốt & giữ)
┌───────────────────────────────────┐   ┌─────────────────────────────────────┐
│ FB group · TikTok · Zalo · CTV    │   │ Concierge dựng hồ sơ (chốt THỢ)     │
│ · SEO · thẻ thợ share             │──▶│ Thợ gọi lại khách (chốt KHÁCH)      │
└───────────────────────────────────┘   └─────────────────────────────────────┘
                 ▲                                        │
                 └───── khách hài lòng → thợ tin → share thêm → marketing miễn phí ─┘
```
Đặc thù mô hình: **người chốt sale phía khách là CHÍNH NGƯỜI THỢ** (gọi lại xác nhận lịch).
Doitay không có đội sale gọi khách — nên chất lượng hồ sơ + tốc độ thợ gọi lại chính là "kỹ năng sale" của hệ thống.

---

## 1. HÀNH TRÌNH THỢ (cung) — 6 chặng

| # | Chặng | Điểm chạm (kênh) | Ai "bán" | Đo bằng | Công cụ đo |
|---|---|---|---|---|---|
| T1 | **Biết** | FB group thợ · TikTok · cửa hàng vật tư (CTV) · thợ bạn giới thiệu | Bài PL-A/Q11 · CTV nói miệng | #inbox/kênh · #thợ CTV chào | Sheet kênh (Q8 §5) |
| T2 | **Tin** | Nhắn riêng · xem hồ sơ mẫu · case proof | Bạn/CTV (concierge pitch) | tỉ lệ đồng ý/lời chào (chuẩn 3-5/15) | Sheet thợ |
| T3 | **Tạo hồ sơ** | ThợTốt-CV (Zalo Mini App) | Làm hộ — ma sát 0 | `profile_published` | product_events (tự động) |
| T4 | **Share cho khách** ⭐ | Nút "Gửi thẻ" trong app · nhắc qua Zalo | Câu chốt + nhắc ngày 2-3 | `profile_shared` · %share | product_events (khi app tracking live) + sheet |
| T5 | **Có khách đầu tiên** | Khách quét thẻ → gọi | (tự chạy) | `contact_clicked` trên hồ sơ thợ đó | product_events |
| T6 | **Trung thành / rủ thợ khác** | OA thông báo · referral | Kết quả thật + quan hệ | thợ quay lại D30 · #thợ từ referral | Zalo OA analytics + sheet |

**Điểm gãy nguy hiểm nhất:** T3→T4 (tạo mà không share) — vì vậy NSM của ThợTốt-CV là %share, và cả chiến dịch ngày 15 tồn tại chỉ để vá chặng này.

## 2. HÀNH TRÌNH KHÁCH (cầu) — 5 chặng × theo từng nguồn

| # | Chặng | thotot_card (khách quen của thợ) | seo (Google) | facebook (group cư dân) | Đo bằng |
|---|---|---|---|---|---|
| K1 | **Có nhu cầu** | hỏng đồ, hỏi thợ quen | gõ "thợ điện quận X" | than trong group | — (thị trường) |
| K2 | **Chạm** | nhận thẻ QR từ thợ | trang /dich-vu/[nghề]/[quận] | bài demand_capture + comment keyword | `profile_viewed` theo `src` · GSC impressions · GA4 sessions |
| K3 | **Tin** | tin sẵn (quen thợ) — chỉ cần XEM ĐƯỢC tay nghề | cần: ảnh thật + giá + đánh giá + thợ gần | cần: reply nhanh + hồ sơ | thời gian trên trang (GA4) · % cuộn (GA4) |
| K4 | **Hành động** | bấm GỌI/Zalo ngay (trực tiếp) | đặt lịch guest (không đăng nhập) | inbox → nhận link → đặt | `contact_clicked` / `booking_confirmed` theo `src` |
| K5 | **Được phục vụ** | thợ nghe máy ngay | thợ gọi lại ≤15' (lời hứa trên form) | như SEO | SLA gọi lại (hỏi thợ/sheet) · đánh giá sau việc |

**Insight quyết định:** 3 nguồn khách có "độ tin sẵn" khác hẳn nhau → **cùng một hồ sơ nhưng vai trò khác nhau**:
- `thotot_card`: hồ sơ = danh thiếp (khách đã tin thợ) → tối ưu tốc độ GỌI.
- `seo`: hồ sơ = người bán hàng thay thợ (khách lạ hoàn toàn) → tối ưu BẰNG CHỨNG (ảnh, giá, đánh giá).
- `facebook`: nửa quen nửa lạ → tối ưu tốc độ REPLY + link kèm ngữ cảnh.
→ Vì thế PHẢI tách kênh khi đo: 100 lượt xem từ thẻ ≠ 100 lượt xem từ Google.

## 3. HỆ TÁCH KÊNH (đã cài vào code — chạy tự động)

### 3.1 Nhãn nguồn (`src`) — bộ từ vựng thống nhất
| Nhãn | Nghĩa | Cách hệ nhận ra |
|---|---|---|
| `thotot_app` | khách xem NGAY TRONG Mini App | channel=miniapp |
| `thotot_card` | khách bấm thẻ thợ share → mở web | utm_source=miniapp_card (link share đã gắn sẵn) |
| `seo` | Google/Bing/Cốc Cốc tự nhiên | referrer search engine, không utm |
| `facebook` / `zalo` / `tiktok` | từ bài đăng/inbox | utm hoặc referrer |
| `ctv` | link CTV phát | utm_source=ctv |
| `truc_tiep` | gõ thẳng địa chỉ | không referrer |

Quy tắc: **first-touch theo phiên** (nguồn đầu tiên thắng, nhớ suốt phiên) — khách từ Google đi 5 trang rồi mới gọi vẫn tính cho SEO.

### 3.2 Xem ở đâu
- **API**: `/metrics/bac-dau` → khối `sources` (viewed/contacted/booked theo nhãn).
- **Cockpit** (`/` trang Sale & Marketing): khối "Nguồn khách".
- Quy ước UTM khi đăng bài: theo Q11 §4.1 (`utm_source=fb|tiktok|zalo|ctv & utm_campaign=f2_qr...`) — **link không UTM = mất dấu kênh.**

## 4. BA LỚP ĐO — vai trò từng công cụ (đừng lẫn)

| Lớp | Công cụ | Trả lời câu hỏi | Trạng thái |
|---|---|---|---|
| **1. Phễu ra tiền** (nguồn sự thật) | `product_events` + `/metrics/bac-dau` + sources | Ai publish/share? Khách nguồn nào GỌI/ĐẶT? | ✅ live |
| **2. Hành vi web** | GA4 (env-gated) | Khách vào trang nào, ở lại bao lâu, rơi ở đâu K2→K3 | 🔑 chờ anh tạo property |
| **3. SEO từ khoá** | Google Search Console | Từ khoá nào ra impression/click, thứ hạng, trang nào index | 🔑 chờ anh xác minh |
| (phụ) Mini App | Zalo Mini App analytics | Lượt mở app, user | có sẵn trên Console Zalo |

Nguyên tắc: **quyết định bằng lớp 1** (phễu); lớp 2-3 để CHẨN ĐOÁN khi lớp 1 xấu (vd: SEO có view mà không contact → GA4 xem khách rơi ở đâu; không có view → GSC xem có index/impression không).

## 5. BẬT GA4 + SEARCH CONSOLE — 10 phút, làm 1 lần (việc của anh)

```
GA4:  1. analytics.google.com → Tạo property "doitay.vn" (VN, VND) → Web stream https://doitay.vn
      2. Lấy Measurement ID dạng G-XXXXXXXXXX
      3. Trên server: thêm vào /var/www/doitay-nextjs/frontend/.env.production (hoặc .env):
             NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
      4. Rebuild + pm2 restart (nhờ tôi làm sau khi anh có ID)

GSC:  1. search.google.com/search-console → Thêm property "URL prefix: https://doitay.vn"
      2. Chọn xác minh "HTML tag" → copy content="..."
      3. Thêm NEXT_PUBLIC_GSC_VERIFICATION=<content đó> vào cùng file env → rebuild
      4. Bấm Verify. (Sitemap: nộp https://doitay.vn/sitemap.xml — trang SEO sẽ vào sitemap khi bật index)
```
Chưa đặt biến = không chạy gì (an toàn). GA đã cấu hình anonymize IP + đã ghi chú minh bạch trong chính sách bảo mật.

## 6. KPI TÁCH KÊNH — ngưỡng hành động (nối Q6/Q11)

| Nguồn | Chỉ số chính | Ngưỡng khỏe | Nếu xấu → làm gì |
|---|---|---|---|
| thotot_card | contacted/viewed | ≥30% (khách đã tin) | <30%: hồ sơ thiếu SĐT/nút gọi lỗi → kiểm kỹ thuật trước, nội dung sau |
| seo | contacted/viewed | ≥10-15% (khách lạ) | thấp: thêm đánh giá thật + ảnh; 0 viewed: GSC xem index/impression |
| facebook | contacted/viewed · inbox conv | ≥15% | cây chẩn đoán Q11 §5 |
| ctv | hồ sơ/CTV (phía cung) | Q9 KPI | Q9 §3 |
| Tổng | **real_lead_rate** (khách thật/thợ share) | tăng theo tuần | gate Q10 ngày 21 |

Nhịp xem: **tuần** (CN, cùng review 5 số) — thêm 1 dòng vào review: *"Nguồn nào ra khách nhiều nhất tuần này? Dồn lực gì?"*

---
*Cập nhật 2026-08. Code liên quan: `frontend/src/lib/track.ts` (gắn src), `MetricsController@bacDau` (sources), cockpit `/` (khối Nguồn khách). Gắn với Q7 (north star kênh), Q11 (UTM + verdict bài), Q6 (gate).*
