# Ground Truth - Hồ Sơ Thợ — Hồ sơ SUBMIT LẠI Zalo Mini App (vòng 3)

> **Vòng 1 (đã fix):** đồng nhất brand + gỡ cụm từ đăng nhập — code đã sửa, deploy.
> **Vòng 2 (đã fix):** đổi tên + loại hình sở hữu + danh mục — việc trên Console + giấy tờ.
> **Vòng 3 (HIỆN TẠI):** Zalo từ chối vì *"Vui lòng cập nhật, hiển thị nội dung điều khoản, bảo mật."*
> Nguyên nhân: app chỉ có LINK NGOÀI ra doitay.vn → reviewer không thấy nội dung ngay trong app.
> **Đã fix bằng code + web (xem mục ✅ VÒNG 3 ngay dưới).**

---

## ✅ VÒNG 3 (HIỆN TẠI) — Hiển thị Điều khoản & Bảo mật NGAY TRONG APP

### Đã fix (code Mini App — build sạch, đã commit)
- Thêm trang **in-app** `LegalPage.tsx` hiển thị **đầy đủ** Điều khoản sử dụng + Chính sách bảo mật, có **tab chuyển** giữa 2 văn bản, nút quay lại. Truy cập từ **3 nơi**:
  1. **Màn chào** — dòng dưới nút chính "Làm thẻ thợ".
  2. **Menu trang chủ** — 2 mục "Điều khoản sử dụng" / "Chính sách bảo mật".
  3. **Bước tạo hồ sơ** — dòng dưới ô đồng ý đồng bộ.
- Nội dung viết đúng luồng dữ liệu thật: tên/ảnh từ Zalo (chỉ khi đồng ý), thông tin thợ tự nhập, lưu trên máy, **chỉ** gửi doitay.vn khi thợ chủ động bật đồng bộ/chia sẻ; không bán dữ liệu; miễn phí.
- Render dạng overlay → mở từ trong form **không mất** dữ liệu đang nhập.

### Web legal đã đồng bộ + tách 2 thương hiệu (đã deploy LIVE, verify 200)
- `doitay.vn/dieu-khoan` + `/bao-mat` → nội dung **app Ground Truth - Hồ Sơ Thợ** (khớp trang in-app). Đây là link "bản đầy đủ" app trỏ tới.
- `doitay.vn/doitay/dieu-khoan` + `/doitay/bao-mat` → điều khoản/bảo mật **nền tảng doitay.vn** (giữ thương hiệu marketplace).
- Hotline legal thống nhất **0972 585 990**; footer + sitemap + liên kết chéo 2 chiều.

### 📋 GHI CHÚ CHO ĐỘI DUYỆT (dán vào ô phản hồi kiểm duyệt)
```
Kính gửi đội kiểm duyệt,

Theo góp ý "cập nhật, hiển thị nội dung điều khoản, bảo mật", chúng tôi đã bổ sung:

1. NỘI DUNG HIỂN THỊ NGAY TRONG ỨNG DỤNG (không chỉ link ngoài): Điều khoản sử dụng
   và Chính sách bảo mật hiển thị đầy đủ trong app, có tab chuyển giữa hai văn bản.
   Truy cập tại: (1) màn chào - dòng dưới nút chính; (2) menu trang chủ;
   (3) bước tạo hồ sơ - dòng dưới ô đồng ý.

2. Bản đầy đủ cũng đăng tại: https://doitay.vn/dieu-khoan và https://doitay.vn/bao-mat

3. Cách test: Mở app, ở màn chào bấm "Điều khoản sử dụng" hoặc "Chính sách bảo mật"
   sẽ hiện trang nội dung đầy đủ.

Trân trọng cảm ơn.
```

### Checklist resubmit vòng 3
```
☐ cd Tool_cv && zmp deploy  -> Testing (bản mới có trang legal in-app)
☐ Kiểm trên Zalo devtools: màn chào -> bấm "Điều khoản"/"Bảo mật" -> hiện nội dung đầy đủ
☐ Web đã live (doitay.vn/dieu-khoan, /bao-mat) — không cần làm gì thêm
☐ Dán "GHI CHÚ CHO ĐỘI DUYỆT" ở trên vào ô phản hồi kiểm duyệt
☐ Bấm "Gửi duyệt"
```

> Ghi chú domain: app hiện KHÔNG còn dùng Firebase (chỉ còn comment) và KHÔNG dùng api.qrserver.com (QR sinh cục bộ). Domain ngoài duy nhất còn gọi là **doitay.vn** (API đồng bộ hồ sơ). Có thể rút gọn khai báo domain ở mục 6 xuống chỉ còn `doitay.vn` (+ font nếu Console yêu cầu) — không bắt buộc.

---

## 1. TÊN MỚI (đã chốt + đã đổi trong code)

**Tên Mini App:** `Ground Truth - Hồ Sơ Thợ`

- Gắn thương hiệu chủ sở hữu (Doitay — bạn sở hữu domain doitay.vn) đứng TRƯỚC, mô tả sau → đúng chính sách đặt tên.
- Code đã đồng bộ tên này (vite.config, app-config, zmp-cli, index.html, các màn UI) — build sạch, không còn "Thợ Tốt"/"Hồ Sơ Thợ Online".
- ⚠️ Console → Thông tin ứng dụng → đổi **Tên ứng dụng = `Ground Truth - Hồ Sơ Thợ`** cho khớp code.

## 2. TICKET "THAY ĐỔI THÔNG TIN ỨNG DỤNG" (bắt buộc, theo đúng chữ Zalo yêu cầu)

Tạo ticket trên Console với nội dung:
- **Loại hình sở hữu:** `Hộ Kinh doanh` (bạn đã có giấy đăng ký hộ kinh doanh)
- **Danh mục:** `Tiện ích đời sống` → `Sửa chữa, bảo hành`

Sau khi ticket được duyệt → **làm lại toàn bộ quy trình xác thực** theo loại hình Hộ Kinh doanh: https://go.zalo.me/miniappverification

## 3. GIẤY TỜ CẦN CHUẨN BỊ (xác thực Hộ Kinh doanh)

```
☐ Giấy chứng nhận đăng ký Hộ kinh doanh (bản chụp rõ nét, đủ 4 góc)
☐ CCCD chủ hộ kinh doanh (2 mặt) — người đứng tên phải trùng chủ hộ trên giấy ĐKKD
☐ Chứng minh sở hữu thương hiệu "Doitay": domain doitay.vn đứng tên bạn/hộ KD
  (ảnh chụp trang quản trị domain hoặc hoá đơn mua domain — phòng khi Zalo hỏi
  vì tên hộ KD có thể không chứa chữ "Doitay")
☐ (Nếu Zalo yêu cầu thêm) Giấy tờ liên quan ngành nghề "sửa chữa" trong ĐKKD
   → nếu ngành nghề hộ KD chưa có mảng sửa chữa/dịch vụ, cân nhắc bổ sung ngành nghề
```

## 4. TRÌNH TỰ THỰC HIỆN (đúng thứ tự, đừng đảo)

```
1 ☐ Console: tạo ticket đổi Loại hình sở hữu = Hộ Kinh doanh,
    Danh mục = Tiện ích đời sống - Sửa chữa, bảo hành → chờ ticket duyệt
2 ☐ Ticket duyệt xong → làm quy trình xác thực Hộ Kinh doanh (upload giấy tờ mục 3)
3 ☐ Console: đổi Tên ứng dụng = "Ground Truth - Hồ Sơ Thợ"
4 ☐ Deploy bản build mới (đã đổi tên trong code): zmp deploy → Testing
5 ☐ Cập nhật mô tả + screenshot (mục 5 dưới) nếu Console còn bản cũ
6 ☐ Bấm "Gửi duyệt"
```

## 5. THÔNG TIN ỨNG DỤNG (dán vào Console)

**Mô tả ứng dụng (301 ký tự, không ký tự đặc biệt):**
```
Doitay Hồ Sơ Thợ giúp thợ điện, nước, điều hoà, xây dựng, mộc tạo hồ sơ nghề chuyên nghiệp miễn phí. Thợ đăng ảnh dự án, kỹ năng, bảng giá và tạo mã QR để gửi khách xem tay nghề. Hồ sơ được xác thực bởi Doitay, nền tảng kết nối thợ và khách hàng uy tín tại Việt Nam. Không thu phí thợ, không trung gian.
```

**Mô tả phiên bản:**
```
Đổi tên ứng dụng thành "Ground Truth - Hồ Sơ Thợ" — trùng đúng tên Hộ Kinh doanh Ground Truth (chủ sở hữu ứng dụng), theo góp ý của bộ phận kiểm duyệt. Đã cập nhật loại hình sở hữu Hộ Kinh doanh và danh mục Tiện ích đời sống - Sửa chữa, bảo hành. Website doitay.vn xuất hiện trong ứng dụng là website của chính Hộ KD Ground Truth (ghi rõ tại footer website). Ứng dụng không có đăng nhập hay tài khoản riêng, người dùng mở là tạo hồ sơ ngay, danh tính do Zalo cung cấp.
```

**Icon:** logo Doitay (bàn tay). **Screenshot:** chụp từ bản mới, không còn màn đăng nhập.

## 6. KHAI BÁO DOMAIN (tránh rớt vì app trắng)
```
firestore.googleapis.com / identitytoolkit.googleapis.com / securetoken.googleapis.com
firebasestorage.googleapis.com / doitay-cv-zalo.firebaseapp.com
fonts.googleapis.com / fonts.gstatic.com / api.qrserver.com
lh3.googleusercontent.com / via.placeholder.com / doitay.vn
```

---
## GHI CHÚ
- ✅ (vòng 3) doitay.vn/dieu-khoan + /bao-mat đã đổi sang nội dung "Ground Truth - Hồ Sơ Thợ" khớp app; điều khoản/bảo mật nền tảng doitay.vn chuyển sang /doitay/*. Đã deploy live.
- DEFERRED-001 (bỏ Firebase → đọc doitay API) vẫn hoãn đến sau khi QUA DUYỆT (Firebase hiện chỉ còn comment, không chạy).

## Cập nhật kỹ thuật 2026-07-24 (trước submit)

- QR sinh CỤC BỘ (lib qrcode), trỏ tới **zalo.me/<SĐT thợ>** — khách quét là mở chat
  Zalo với thợ NGAY (bỏ link doitay.vn/tho/<uid> cũ vốn 404 + bỏ api.qrserver.com).
- Tích hợp **zmp-sdk**: getUserInfo (điền sẵn tên/ảnh từ Zalo — đúng lời khai "danh
  tính do Zalo cung cấp") + openShareSheet (nút Gửi qua Zalo chuẩn Mini App).
- Gỡ: trang admin ẩn 5-tap (rủi ro kiểm duyệt), firebase (dead code), alert() → toast.
- Ảnh tips nén 1.9MB → 0.24MB; footer thẻ bỏ link chết; thêm attribution
  "Sản phẩm của Hộ KD Ground Truth — vận hành doitay.vn" ở màn chào.
- Link Điều khoản/Bảo mật đã verify sống (200).

