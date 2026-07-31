# SỔ TAY VẬN HÀNH — doitay.vn / ThợTốt

> Bộ sách vận hành đầy đủ: **go-to-market → growth → vận hành (digital + cộng tác viên) → đo lường**.
> Viết để *mở ra là làm được ngay* — mỗi việc có: làm gì, làm thế nào, mất bao lâu, ai làm, đo bằng gì.

---

## Bộ sách gồm mấy quyển

| # | Quyển | Trả lời câu hỏi | Đọc khi |
|---|---|---|---|
| **0** | [Tổng quan & La bàn](00_tong-quan-va-la-ban.md) | Ta đang làm gì, thắng bằng cách nào, đo cái gì | Đọc **đầu tiên**, đọc lại mỗi tháng |
| **1** | [Go-To-Market](01_go-to-market.md) | Vào thị trường thế nào, địa bàn nào trước | Khi mở địa bàn/nghề mới |
| **2** | [Growth — các vòng tăng trưởng](02_growth.md) | Làm sao lớn lên: content, SEO, viral, referral | Khi cần thêm thợ/khách |
| **3** | [Vận hành Digital](03_van-hanh-digital.md) | Chi tiết từng thao tác online: FB/Zalo/TikTok, inbox, Tool-CV, SEO | Mỗi ngày |
| **4** | [Vận hành Cộng tác viên](04_van-hanh-ctv.md) | Tuyển – train – chạy – nghiệm thu – scale CTV | Khi chạy kênh vật lý |
| **5** | [Lịch vận hành — Daily / Weekly / Monthly](05_lich-van-hanh.md) | **Nhịp**: hôm nay/tuần này/tháng này làm gì | Mở **mỗi sáng** |
| **6** | [Đo lường & Ra quyết định](06_do-luong-va-quyet-dinh.md) | Đo gì, ngưỡng nào thì mở rộng / dừng / xoay | Cuối tuần & cuối tháng |
| **7** | [Kênh × Metrics × Features](07_kenh-metrics-features.md) | North star từng kênh (doitay.vn, ThợTốt-CV, FB, TikTok, Zalo) + feature đi kèm & trạng thái | Khi ưu tiên build/đo |
| **8** | [Danh bạ kênh seed thợ](08_danh-ba-kenh-seed.md) | Group FB/TikTok/Zalo/offline cụ thể + công thức tìm + kịch bản vào | Khi đi seed thợ |
| **9** | [CTV: JD · Scorecard · KPI · Tài chính](09_ctv-jd-scorecard-taichinh.md) | JD copy-paste, chấm ứng viên, KPI vòng đời, ngân sách 3 kịch bản | Khi tuyển & trả CTV |
| **10** | [Blueprint 30 ngày](10_blueprint-30-ngay.md) | Lịch ngày-qua-ngày tháng ra quân — mở ra biết hôm nay làm gì | Mở **mỗi sáng** cùng Q5 |
| **11** | [Content sản phẩm: Feature · Tracking · Iterate](11_content-feature-tracking-iterate.md) | Đăng feature gì (11 feature → thông điệp), 5 khuôn bài, UTM + nhật ký bài, cây quyết định sửa bài chết | Trước khi đăng bài sản phẩm |
| **PL-A** | [Ngân hàng bài viết](PL-A_ngan-hang-bai-viet.md) | Bài chào thợ / đăng nhóm / tuyển CTV theo 5 angle | Khi cần copy-paste |
| **PL-B** | [Thư viện template & sheet](PL-B_template-va-sheet.md) | Google Form, sheet theo dõi, script, checklist in được | Setup 1 lần |

---

## Đọc bộ này thế nào

- **Người mới vào (bạn/nhân sự/CTV lead):** đọc Quyển 0 → 5 → phần liên quan vai trò.
- **Chạy hằng ngày:** chỉ cần **Quyển 5** mở sẵn, tra Quyển 3 & 4 khi cần chi tiết thao tác.
- **Ra quyết định:** Quyển 6 (ngưỡng số) + Quyển 0 (thesis).
- Mỗi việc trong bộ này gắn với **1 con số Bắc Đẩu** (Quyển 0). Việc nào không đẩy con số đó → cắt.

## Nguyên tắc bất di bất dịch (rút gọn — chi tiết ở Q0)

1. **Thợ là tài sản. Marketplace là mồi giữ thợ. Tiền đến từ bán cho base thợ.** [[project_monetize_thesis]]
2. **Con người tạo QUAN HỆ. Agent lo NỘI DUNG & VẬN HÀNH.**
3. **Đo chuỗi ra tiền, không đo phù phiếm:** *thợ thật chia sẻ hồ sơ → khách thật liên hệ.*
4. **Concierge — làm hộ thợ, ma sát = 0.** Không bắt thợ tự làm gì.
5. **Không phá lòng tin:** không bịa review, không ảnh AI, không giọng bán lead. Uy tín 30 thợ đầu quyết định 300 thợ sau.

---

## Tài sản hệ thống đã có (bộ sách này vận hành trên đó)

| Tài sản | Ở đâu | Trạng thái |
|---|---|---|
| Web khách (Next.js) | `doitay-vn/frontend` | Live doitay.vn |
| Backend Laravel (headless) | `doitay-vn/core` | Live |
| Zalo Mini App (Tool-CV) | `Tool_cv/` | Chuẩn bị submit Zalo |
| Trang SEO nghề×khu vực | `/dich-vu/*` | Built, **noindex** tới khi bật `SEO_INDEX_ENABLED` [[project_seo_killswitch]] |
| Agent marketing + skills | `agent-system/` | Chạy được |
| Cron phân phối sáng/tối | `playbooks/fb_morning_distribution`, `fb_evening_signals` | Chạy được |
| Comment-inbox keyword | `src/api/comment_inbox.py` | Chạy được |
| Context injected vào mọi agent | `project.yaml` | Nguồn sự thật về giọng/angle |
| Kit tuyển thợ / tuyển CTV | `playbooks/tuyen_30_tho_dau_tien.md`, `thue_ctv_tuyen_tho.md` | Dùng được |

> Cập nhật bộ sách: sửa thẳng file, ghi ngày ở cuối quyển. Đây là tài liệu sống, không phải để trưng.
