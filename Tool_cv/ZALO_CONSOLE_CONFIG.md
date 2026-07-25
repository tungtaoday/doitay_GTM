# Cấu hình Zalo Console cho Mini App "Ground Truth - Hồ Sơ Thợ"

> Sau khi code đã hỗ trợ xuất bản hồ sơ lên doitay.vn (Tầng 1), cần khai báo mấy
> mục sau trong Zalo Mini App Console để tính năng chạy được + qua duyệt.
> Console: https://mini.zalo.me → chọn app → mục tương ứng.

---

## 1. ⭐ KHAI BÁO DOMAIN (bắt buộc — nếu thiếu, mọi call API chết)

Mini App gọi API ra `doitay.vn`. Zalo chặn theo allowlist. Phải khai:

**Console → Thông tin ứng dụng → Cấu hình (Settings) → Trusted Domains / Domain tin cậy:**

| Loại | Giá trị |
|---|---|
| Request domain (gọi API) | `doitay.vn` |
| Webview domain (mở trang web) | `doitay.vn` |

> Có 2 chỗ khai: **domain cho phép request** (để `fetch` API chạy) và **domain webview**
> (để nút "Xem trên doitay" / "Đưa hồ sơ lên chợ" mở được trang doitay.vn qua `openWebview`).
> Khai CẢ HAI. Nếu Console gộp thành 1 ô "Domain tin cậy" thì thêm `doitay.vn` là đủ.

Đã làm phía server: CORS đã cho phép origin Zalo (`zdn.vn`, `zalo.me`) — verify preflight OK.

---

## 2. QUYỀN (Permissions / Scope)

**Console → Thông tin ứng dụng → Quyền:**

| Quyền | Dùng để | Bắt buộc? |
|---|---|---|
| **Thông tin người dùng** (getUserInfo: tên + ảnh) | Điền sẵn tên/ảnh khi tạo thẻ | Nên bật (đã dùng trong code) |
| **Số điện thoại** (getPhoneNumber) | *Nâng cấp sau* — lấy SĐT đã xác thực từ Zalo để chống spam | Chưa cần ngay; xem §5 |
| **openShareSheet** (chia sẻ) | Nút "Gửi thẻ cho khách" | Mặc định có, không cần xin |

> Hiện code lấy SĐT từ ô thợ tự nhập (không cần quyền getPhoneNumber). Quyền số điện thoại
> thường chỉ được cấp SAU khi app xác thực Hộ KD xong — nên để §5 làm sau.

---

## 3. KHAI BÁO DỮ LIỆU SỬ DỤNG (để qua duyệt về quyền riêng tư)

**Console → phần "Dữ liệu ứng dụng sử dụng" / Privacy:**

Khai đúng những gì app thật sự gửi đi:
- **Tên, số điện thoại, nghề, khu vực, bảng giá, ảnh** → gửi lên máy chủ doitay.vn
  **chỉ khi người dùng bấm đồng ý** (checkbox "đồng ý đồng bộ với doitay.vn").
- Mục đích: tạo hồ sơ thợ công khai để khách tìm.
- Chính sách bảo mật: `https://doitay.vn/bao-mat` (đã có, link sống).
- Điều khoản: `https://doitay.vn/dieu-khoan`.

> Khai KHỚP với luồng thật. Reviewer đối chiếu: app gửi SĐT ra ngoài mà không khai = rớt.

---

## 4. THÔNG TIN ỨNG DỤNG (nhất quán để qua duyệt)

| Mục | Giá trị |
|---|---|
| Tên ứng dụng | **Ground Truth - Hồ Sơ Thợ** (khớp code + zmp-cli.json) |
| Icon | `logo/app-icon-512.png` (bàn tay, không chữ) |
| Loại hình sở hữu | **Hộ Kinh doanh** (Ground Truth) |
| Danh mục | **Công nghệ / Tiện ích phần mềm** — KHÔNG chọn "Sửa chữa" (né đòi giấy phép con) |
| Mô tả | "Ứng dụng tạo hồ sơ nghề (danh thiếp điện tử) cho thợ: nhập thông tin, chụp ảnh việc, tạo mã QR gửi khách. Danh tính do Zalo cung cấp, không có đăng nhập riêng." |

---

## 5. NÂNG CẤP SAU (khi app đã được duyệt + có quyền SĐT)

Để chống spam hồ sơ ảo triệt để, chuyển sang **getPhoneNumber của Zalo**:
1. Bật quyền "Số điện thoại" trong Console.
2. Code: `getPhoneNumber()` → nhận token → server đổi token với Zalo lấy SĐT đã xác thực.
3. Endpoint publish nhận SĐT-đã-xác-thực thay vì SĐT tự nhập.
→ SĐT thật + 1 tài khoản Zalo giới hạn hồ sơ = diệt bot/số rác. (Tôi làm khi bạn bật quyền.)

Ngoài ra bật `MINIAPP_AUTOPUBLISH=true` trong `.env` server nếu muốn hồ sơ **lên chợ ngay**
(mặc định `false` = vào hàng đợi duyệt `/sale/duyet` để kiểm soát chất lượng).

---

## 6. QUY TRÌNH DEPLOY + SUBMIT

```bash
# 1. Backend đã deploy sẵn (endpoint /public/tho-profiles đã sống — verify bằng curl).
# 2. Đăng nhập + deploy Mini App:
cd C:\doitay_all_in_one\Strategy\Tool_cv
npx zmp login      # quét QR bằng Zalo của chủ
npx zmp deploy     # đẩy bản www/ mới nhất lên Console

# 3. Trong Console: khai §1 (domain) + §3 (dữ liệu) + §4 (thông tin) → Submit duyệt.
```

**Trước khi Submit — TEST trong Zalo thật:**
- Mở Mini App (bản Testing) → tạo thẻ + tick "đồng ý đồng bộ" → kiểm tra có báo "đang chờ duyệt".
- Vào `/quan-tri` hoặc `/sale/duyet` (web, tài khoản Quản lý) xem hồ sơ có vào hàng đợi.
- Duyệt → mở lại Mini App → nút "Xem trên doitay" phải mở được `doitay.vn/tho/<id>`.
- Nếu call API chết → 90% do quên khai domain §1.

---

## Checklist nhanh trước Submit
- [ ] §1 Khai `doitay.vn` vào Trusted/Request/Webview domains
- [ ] §3 Khai dữ liệu sử dụng + link bảo mật
- [ ] §4 Tên = "Ground Truth - Hồ Sơ Thợ", icon bàn tay, danh mục Công nghệ/Phần mềm
- [ ] Test tạo hồ sơ trong Zalo thật → thấy trong hàng đợi duyệt
- [ ] `npx zmp deploy` bản mới nhất
