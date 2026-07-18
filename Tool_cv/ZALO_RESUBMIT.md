# Ground Truth - Hồ Sơ Thợ — Hồ sơ SUBMIT LẠI Zalo Mini App (vòng 2)

> **Vòng 1 (đã fix):** đồng nhất brand + gỡ cụm từ đăng nhập — code đã sửa, deploy.
> **Vòng 2 (hiện tại):** Zalo từ chối vì (1) tên "Hồ Sơ Thợ Online" là keyword chung,
> (2) loại hình sở hữu + danh mục chưa hợp lệ. Đây là việc trên Console + giấy tờ, KHÔNG phải code.

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
- Chính sách bảo mật doitay.vn/bao-mat đã đề cập app + thu thập SĐT (vòng 1) — nếu đổi tên chính thức, nên sửa câu "Zalo Mini App \"Thợ Tốt Doitay\"" thành "Ground Truth - Hồ Sơ Thợ" cho khớp.
- DEFERRED-001 (bỏ Firebase → đọc doitay API) vẫn hoãn đến sau khi QUA DUYỆT.
