// Blueprint 30 ngày (Q10) chuyển thành checklist từng bước.
// t = buổi; ref = chương sách để tra chi tiết (mở Blueprint book).

export const DEFAULT_START = "2026-08-03"; // Ngày 1 = thứ Hai ra quân (đổi được trong app)

export const BOOK_URL = "/sach.html"; // sách self-host ngay trong app — chạy cả local lẫn tunnel

export interface Step {
  t: "sáng" | "chiều" | "tối";
  text: string;
  ref?: string;
}

export interface DayPlan {
  title: string;
  gate?: string; // ngày gate: câu hỏi quyết định
  steps: Step[];
}

// 3 việc không được bỏ dù bận (Q5 §A2) — hiện MỖI ngày
export const DAILY_MUSTS = [
  "Seed comment 30' đầu cho ≥1 bài",
  "Chào ≥5 thợ / dựng hồ sơ đã hứa",
  "Nhắc ≥3 thợ share link",
];

export const WEEK_TARGETS: Record<number, string> = {
  1: "Hồ sơ ≥30 · share ≥40% · 5 group đang cày · 1-2 CTV",
  2: "Hồ sơ ≥70 · share ≥45% · khách thật đầu tiên · 4 CTV",
  3: "Hồ sơ ≥110 · share ≥50% · ⭐ 5-10 KHÁCH THẬT",
  4: "Hồ sơ ≥150 · share ≥55% · quyết định mở rộng",
};

export const DAYS: Record<number, DayPlan> = {
  1: {
    title: "Khai hỏa hệ thống",
    steps: [
      { t: "sáng", text: "zmp deploy bản Mini App mới (tracking + nút Gọi/Zalo) → gửi duyệt Zalo", ref: "ZALO_RESUBMIT" },
      { t: "sáng", text: "Chốt QUẬN atomic + 3 nghề (điện/nước/điều hoà) — viết ra giấy", ref: "Q1 §2" },
      { t: "chiều", text: "Tạo 3 Google Sheet (Thợ · Kênh · CTV) + 1 Form thu info thợ theo mẫu", ref: "PL-B" },
      { t: "chiều", text: "Xin vào 2 group đã xác minh + tìm thêm 3 group", ref: "Q8 §1" },
      { t: "tối", text: "Duyệt lịch content tuần (agent draft) + liệt kê 5 thợ QUEN sẽ chào mai", ref: "Q3 §1" },
    ],
  },
  2: {
    title: "5 thợ quen đầu tiên",
    steps: [
      { t: "sáng", text: "Chào 5 thợ quen — xin 4 thứ (tên+nghề, khu vực, 3-5 ảnh, SĐT)", ref: "PL-A §1" },
      { t: "sáng", text: "Dựng hồ sơ NGAY trong ngày cho thợ đã gửi ảnh", ref: "Q3 §7" },
      { t: "chiều", text: "Gửi link+QR từng thợ + CÂU CHỐT: 'gửi thử 2-3 khách quen xem nha'", ref: "Q1 §5" },
      { t: "chiều", text: "Đăng JD tuyển CTV lên Ybox + 2 nhóm SV", ref: "Q9 §1" },
      { t: "tối", text: "Ghi sheet thợ · trả lời ứng viên CTV inbox" },
    ],
  },
  3: {
    title: "Ra thực địa lần đầu",
    steps: [
      { t: "sáng", text: "6h30-8h30: ra 2 cửa hàng vật tư — chào trực tiếp, mục tiêu 5 thợ", ref: "PL-A §3" },
      { t: "sáng", text: "Xin chủ tiệm dán QR ThợTốt ở quầy (đổi lại: làm hồ sơ cho tiệm)", ref: "Q8 §4" },
      { t: "chiều", text: "Dựng hồ sơ đợt sáng · phỏng vấn 2-3 ứng viên CTV bằng scorecard", ref: "Q9 §2" },
      { t: "tối", text: "Group được duyệt → tương tác thật 3-5 bài (chưa đăng bài bán)", ref: "Q8 §1.4" },
    ],
  },
  4: {
    title: "Kích hoạt group + training CTV",
    steps: [
      { t: "sáng", text: "Nhắn riêng 10 thợ trong group · dựng hồ sơ tồn", ref: "PL-A §1" },
      { t: "chiều", text: "TRAINING CTV 30' theo checklist + phát kịch bản in + giao địa bàn", ref: "Q9 §5" },
      { t: "tối", text: "Nhắn lại thợ ngày 2-3: 'Anh gửi link cho khách nào chưa?'" },
    ],
  },
  5: {
    title: "CTV ra quân + trả tiền lần đầu",
    steps: [
      { t: "sáng", text: "Đi kèm CTV buổi đầu — chỉnh kịch bản tại chỗ", ref: "Q9" },
      { t: "sáng", text: "Gọi 10 số thợ dán cột điện/thang máy", ref: "PL-A §1" },
      { t: "chiều", text: "Dựng hồ sơ từ Form CTV — SLA TRONG NGÀY, gửi link cho CTV chuyển thợ" },
      { t: "tối", text: "Nghiệm thu sơ bộ + CHUYỂN KHOẢN CTV đúng hẹn thứ 6 (uy tín số 1)", ref: "Q9 §4.4" },
    ],
  },
  6: {
    title: "Referral + đăng bài group",
    steps: [
      { t: "sáng", text: "Xin MỖI thợ đã có hồ sơ giới thiệu 1 thợ bạn", ref: "Q8 §4" },
      { t: "sáng", text: "Group đủ 3-4 ngày tương tác → đăng bài 2A/2B (tối đa 3 group)", ref: "PL-A §2" },
      { t: "chiều", text: "Dựng hồ sơ referral + trả lời inbox từ bài group" },
    ],
  },
  7: {
    title: "⭐ REVIEW TUẦN 1",
    gate: "GATE: ≥30 hồ sơ? Nếu <20 → SỬA PHỄU trước khi thêm CTV (kịch bản? kênh? nghề?). Điền 5 số + 3 câu.",
    steps: [
      { t: "sáng", text: "Đếm: hồ sơ thật · %share · khách hỏi · CTV · group đang cày" },
      { t: "sáng", text: "Điền review-tuan (5 số + 3 câu) + ghi nhật ký quyết định", ref: "quan-tri/" },
      { t: "chiều", text: "Duyệt lịch content tuần 2 · kiểm trạng thái duyệt Zalo app" },
      { t: "tối", text: "Chốt ≤3 điều chỉnh cho tuần 2" },
    ],
  },
  8: {
    title: "Nhân CTV + bật TikTok",
    steps: [
      { t: "sáng", text: "Đăng lại JD + phỏng vấn CTV đợt 2 (mục tiêu tổng 4 CTV)", ref: "Q9" },
      { t: "chiều", text: "Bật TikTok: 1 reel/ngày từ weekly plan (test uploader, fail thì đăng tay)", ref: "Q7 §4" },
      { t: "tối", text: "Nhịp nền: sheet + nhắc share" },
    ],
  },
  9: {
    title: "Training CTV đợt 2",
    steps: [
      { t: "chiều", text: "Training CTV mới + chia địa bàn KHÔNG trùng (theo cụm cửa hàng vật tư)" },
      { t: "tối", text: "Kiểm sheet: CTV nào chưa nộp Form → hỏi vướng gì" },
    ],
  },
  10: {
    title: "Chốt SLA duyệt hồ sơ",
    steps: [
      { t: "sáng", text: "Đặt 2 khung duyệt hồ sơ cố định: 11h30 & 17h (SLA <2h)", ref: "Q7 backlog" },
      { t: "chiều", text: "Agent rút 'bảng nghe thợ' tuần — đọc 10 phút, lấy 2 ý cho content", ref: "Q3 §8" },
    ],
  },
  11: {
    title: "TikTok seeding + săn KOL",
    steps: [
      { t: "sáng", text: "30' comment giá trị dưới 5 video hub thợ (KHÔNG dán link trần)", ref: "Q8 §2" },
      { t: "chiều", text: "Lập danh sách 10 micro-KOL thợ (10-100K follow) vào sheet" },
    ],
  },
  12: {
    title: "Nghiệm thu CTV tuần",
    steps: [
      { t: "chiều", text: "Nghiệm thu (xác minh SĐT + check trùng + soi ảnh) → chuyển khoản", ref: "Q9 §4" },
      { t: "chiều", text: "Chấm KPI từng CTV: ai <50% chuẩn → nhắc; ai giỏi → nhân bản kịch bản", ref: "Q9 §3" },
    ],
  },
  13: {
    title: "Chào KOL + bài group đợt 2",
    steps: [
      { t: "sáng", text: "Nhắn 3 micro-KOL: đề nghị làm hồ sơ miễn phí + kể trải nghiệm", ref: "Q8 §2.2" },
      { t: "chiều", text: "Đăng bài group đợt 2 (biến thể hook khác)", ref: "Q11 §5" },
    ],
  },
  14: {
    title: "⭐ REVIEW TUẦN 2",
    gate: "GATE: ~70 hồ sơ? share ≥45%? KHÁCH THẬT ĐẦU TIÊN xuất hiện chưa (xem số thật bên dưới)? CTV nào dừng/giữ?",
    steps: [
      { t: "sáng", text: "Điền 5 số + 3 câu · xếp hạng CTV · cắt group không ra thợ" },
      { t: "chiều", text: "Content: engine nào nổ (>15% inbox) → nhân bản tuần 3" },
      { t: "tối", text: "Ghi nhật ký quyết định + duyệt lịch tuần 3" },
    ],
  },
  15: {
    title: "Chiến dịch 'share lại'",
    steps: [
      { t: "sáng", text: "Gọi/nhắn TẤT CẢ thợ chưa share: 'hồ sơ anh đẹp mà khách chưa thấy — gửi thử 2 khách quen giúp em'" },
      { t: "chiều", text: "Ghi lại ai đã share vào sheet — mục tiêu %share +10 điểm" },
    ],
  },
  16: {
    title: "Publish bản app tracking",
    steps: [
      { t: "sáng", text: "App qua duyệt → publish bản tracking · chưa duyệt → đếm tay tiếp" },
      { t: "chiều", text: "Verify: số 'share' bên dưới bắt đầu nhảy (profile_shared chảy về)" },
    ],
  },
  17: {
    title: "Gom bằng chứng (proof)",
    steps: [
      { t: "sáng", text: "Thợ ĐÃ có khách qua link → xin 1 câu nhận xét + screenshot (xin phép)" },
      { t: "chiều", text: "Viết 2-3 bài PROOF từ case thật (khuôn K3)", ref: "Q11 §2" },
    ],
  },
  18: {
    title: "Lan proof + dựng hồ sơ KOL",
    steps: [
      { t: "sáng", text: "Đăng case proof lên group thợ + gửi nhóm Zalo CTV làm 'vũ khí chào'" },
      { t: "chiều", text: "KOL nhận lời → dựng hồ sơ thật đẹp cho KOL" },
    ],
  },
  19: {
    title: "Nghiệm thu + soi unit economics",
    gate: "Chi phí/thợ-CÓ-SHARE >150k 2 tuần liên tiếp? → DỪNG scale, sửa phễu trước.",
    steps: [
      { t: "chiều", text: "Nghiệm thu + trả CTV", ref: "Q9 §4" },
      { t: "chiều", text: "Tính chi phí/thợ hợp lệ và chi phí/thợ-có-share", ref: "Q9 §4.3" },
    ],
  },
  20: {
    title: "Tổng vệ sinh dữ liệu",
    steps: [
      { t: "sáng", text: "Hồ sơ thiếu ảnh/giá → nhắc thợ bổ sung (danh sách từ sheet)" },
      { t: "chiều", text: "RÀ SEED DATA cũ — chuẩn bị điều kiện bật SEO", ref: "Q6 §5" },
    ],
  },
  21: {
    title: "⭐ GATE LỚN NHẤT THÁNG",
    gate: "ĐÃ CÓ 5-10 KHÁCH THẬT liên hệ qua link chưa? CÓ → tuần 4 nhánh A (mở rộng). CHƯA → nhánh B (toàn lực sửa V1: hồ sơ đủ tin? thợ share thật? khách quen có nhu cầu?).",
    steps: [
      { t: "sáng", text: "Đếm khách thật (số bên dưới + sheet) — quyết định nhánh A hay B" },
      { t: "chiều", text: "Điền review tuần 3 + nhật ký quyết định (ghi rõ chọn nhánh nào, vì số nào)" },
    ],
  },
  22: {
    title: "Tuần 4 — bắt đầu theo nhánh",
    steps: [
      { t: "sáng", text: "[A] Kiểm điều kiện SEO (seed sạch + ≥3 thợ/cặp) → bật SEO_INDEX + Search Console", ref: "Q6 §5" },
      { t: "sáng", text: "[B] Phỏng vấn 5 thợ share-mà-khách-không-hỏi — xem hồ sơ họ như khách xem" },
    ],
  },
  23: {
    title: "Mở rộng / sửa sâu",
    steps: [
      { t: "sáng", text: "[A] Chọn quận atomic #2 (giáp ranh) theo checklist", ref: "Q1 §9" },
      { t: "sáng", text: "[B] Sửa 10 hồ sơ yếu nhất theo checklist chất lượng", ref: "Q3 §7.2" },
    ],
  },
  24: {
    title: "Nhân sự cho nhánh",
    steps: [
      { t: "sáng", text: "[A] Tuyển 2 CTV quận mới + đề bạt CTV giỏi nhất làm trưởng nhóm", ref: "Q9 §3.3" },
      { t: "sáng", text: "[B] Thử QR card cứng phát thợ dán thùng đồ nghề" },
    ],
  },
  25: {
    title: "Case study / A-B test",
    steps: [
      { t: "sáng", text: "[A] Dùng case quận 1 chào thợ quận 2: 'thợ bên X đã có khách qua link'" },
      { t: "sáng", text: "[B] A/B: 10 thợ gọi điện hướng dẫn share tận tay vs 10 thợ chỉ nhắn — đo chênh" },
    ],
  },
  26: {
    title: "Nghiệm thu CTV",
    steps: [
      { t: "chiều", text: "Nghiệm thu + trả CTV (cả 2 quận nếu nhánh A)" },
      { t: "chiều", text: "[B] Đánh giá lại đơn giá CTV (khó ra thợ → nâng 35-40k?)", ref: "Q9 §1" },
    ],
  },
  27: {
    title: "Đúc kết",
    steps: [
      { t: "sáng", text: "[A] Viết checklist 'nhân quận' từ những gì lặp lại được" },
      { t: "sáng", text: "[B] Tổng hợp 5 nguyên nhân khách-không-đến + 5 việc sửa" },
    ],
  },
  28: {
    title: "⭐ REVIEW TUẦN 4",
    gate: "Điền 5 số + 3 câu lần cuối của tháng. Chuẩn bị dữ liệu cho tổng kết ngày mai.",
    steps: [
      { t: "sáng", text: "Điền review tuần 4 đầy đủ" },
      { t: "chiều", text: "Gom số cả tháng: hồ sơ, %share, khách thật, chi phí, CAC" },
    ],
  },
  29: {
    title: "⭐ TỔNG KẾT THÁNG (1/2)",
    gate: "DoA: mật độ thợ/nghề-quận đủ? %share? khách thật? ≥1 giao dịch trọn vòng? → kill/pivot/continue từng cấu phần.",
    steps: [
      { t: "sáng", text: "Điền bảng DoA (network đã sống chưa)", ref: "Q1 §8" },
      { t: "chiều", text: "Quyết kill/pivot/continue: kênh · CTV · content engine", ref: "Q6 §4.3" },
      { t: "tối", text: "Chốt ngân sách tháng 2 theo CAC THẬT (không theo kế hoạch)", ref: "Q9 §4.2" },
    ],
  },
  30: {
    title: "⭐ TỔNG KẾT THÁNG (2/2) — lên đạn tháng 2",
    steps: [
      { t: "sáng", text: "Viết 1 trang 'Bài học tháng 1' (bảng HỌC ĐƯỢC)", ref: "Q11" },
      { t: "chiều", text: "Cập nhật hiện trạng số vào Q0 §9" },
      { t: "tối", text: "Lên Blueprint tháng 2 (copy khung 4 tuần, đổi mục tiêu theo số thật)" },
    ],
  },
};
