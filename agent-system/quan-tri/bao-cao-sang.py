# -*- coding: utf-8 -*-
"""BÁO CÁO SÁNG — cockpit quản trị 1 màn hình.

Chạy mỗi sáng (bao_cao_sang.bat): kéo số THẬT từ API Bắc Đẩu (doitay.vn),
đối chiếu mục tiêu tuần (Blueprint Q10), nhắc việc chính HÔM NAY, và cảnh báo gate.
Không cần thư viện ngoài. Token đọc từ agent-system/.env (METRICS_TOKEN).
"""
import json
import os
import sys
import urllib.request
from datetime import date, datetime

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)  # agent-system/
CONFIG = os.path.join(BASE, "config.json")
API = "https://doitay.vn/api/v1/public/metrics/bac-dau"
BOOK_URL = "https://claude.ai/code/artifact/e2ed3149-b0c1-4a84-b010-94e670f4122b"

# ── Việc chính từng ngày (rút gọn từ Blueprint Q10 — sửa thoải mái) ──────────
DAY_FOCUS = {
    1: "Khai hỏa: zmp deploy batch app · chốt quận atomic · lập 3 sheet + Form · xin vào 5 group · duyệt lịch content tuần",
    2: "Chào 5 thợ QUEN (concierge, dựng hồ sơ trong ngày) · đăng JD CTV lên Ybox + 2 nhóm SV",
    3: "6h30 ra 2 cửa hàng vật tư (5 thợ mới) · phỏng vấn CTV bằng scorecard · tương tác group",
    4: "Nhắn riêng 10 thợ trong group · TRAINING CTV 30' · tối nhắc thợ ngày 2-3 share",
    5: "CTV ra quân (đi kèm chỉnh kịch bản) · gọi 10 số cột điện · dựng hồ sơ SLA trong ngày · TRẢ TIỀN CTV thứ 6",
    6: "Referral: mỗi thợ giới thiệu 1 thợ bạn · đăng bài group (≤3 group) · dựng hồ sơ",
    7: "⭐ REVIEW TUẦN 1: 5 số + 3 câu · GATE: <20 hồ sơ → sửa phễu trước khi thêm CTV · lịch content tuần 2",
    8: "Tuyển CTV đợt 2 (mục tiêu 4 CTV) · bật TikTok 1 reel/ngày",
    9: "Training CTV đợt 2 · chia địa bàn không trùng",
    10: "Chốt SLA duyệt hồ sơ <2h (2 khung 11h30 & 17h) · agent rút bảng nghe thợ",
    11: "TikTok comment-seeding 30' · lập danh sách 10 micro-KOL thợ",
    12: "NGHIỆM THU CTV + chuyển khoản · chấm KPI từng CTV · nhân bản kịch bản người giỏi",
    13: "Nhắn 3 micro-KOL (làm hồ sơ miễn phí) · đăng bài group đợt 2",
    14: "⭐ REVIEW TUẦN 2: ~70 hồ sơ? share ≥40%? KHÁCH THẬT đầu tiên chưa? · cắt/giữ CTV",
    15: "Chiến dịch 'share lại': gọi TẤT CẢ thợ chưa share",
    16: "App qua duyệt → publish bản tracking · verify events chảy vào /metrics/bac-dau",
    17: "Thợ có khách qua link → xin nhận xét + screenshot → làm bài PROOF",
    18: "Đăng case proof lên group + nhóm CTV · dựng hồ sơ cho KOL nhận lời",
    19: "Nghiệm thu + trả CTV · ⭐ soi chi phí/thợ-có-share (>150k 2 tuần → dừng scale, sửa phễu)",
    20: "Tổng vệ sinh dữ liệu: hồ sơ thiếu ảnh · RÀ SEED DATA (chuẩn bị điều kiện bật SEO)",
    21: "⭐ GATE LỚN NHẤT THÁNG: đã có 5-10 khách thật chưa? CÓ → tuần 4 mở rộng · CHƯA → toàn lực sửa V1",
    22: "Nhánh A: bật SEO_INDEX + Search Console | Nhánh B: phỏng vấn 5 thợ share-mà-khách-không-hỏi",
    23: "Nhánh A: chọn quận atomic #2 | Nhánh B: sửa 10 hồ sơ yếu nhất",
    24: "Nhánh A: tuyển 2 CTV quận mới + đề bạt trưởng nhóm | Nhánh B: thử QR card cứng dán thùng đồ nghề",
    25: "Nhánh A: case study quận 1 → chào thợ quận 2 | Nhánh B: A/B gọi-điện-hướng-dẫn-share vs chỉ nhắn",
    26: "Nghiệm thu + trả CTV · (B: đánh giá lại đơn giá CTV)",
    27: "Nhánh A: chuẩn hoá playbook nhân quận | Nhánh B: tổng hợp 5 nguyên nhân khách-không-đến",
    28: "⭐ REVIEW TUẦN 4 (5 số + 3 câu)",
    29: "⭐ TỔNG KẾT THÁNG: điền DoA · kill/pivot/continue từng cấu phần · chốt ngân sách tháng 2",
    30: "Viết 'Bài học tháng 1' · cập nhật Q0 §9 · lên Blueprint tháng 2",
}

# Mục tiêu lũy kế theo tuần (Q10 bảng số)
WEEK_TARGETS = {
    1: {"hồ sơ": 30, "%share": 40, "khách thật": 0, "CTV": 2},
    2: {"hồ sơ": 70, "%share": 45, "khách thật": 1, "CTV": 4},
    3: {"hồ sơ": 110, "%share": 50, "khách thật": 7, "CTV": 4},
    4: {"hồ sơ": 150, "%share": 55, "khách thật": 15, "CTV": 5},
}


def load_token() -> str:
    tok = os.environ.get("METRICS_TOKEN", "")
    env_path = os.path.join(ROOT, ".env")
    if not tok and os.path.exists(env_path):
        for line in open(env_path, encoding="utf-8", errors="ignore"):
            if line.strip().startswith("METRICS_TOKEN="):
                tok = line.split("=", 1)[1].strip()
                break
    return tok


def load_config() -> dict:
    if os.path.exists(CONFIG):
        try:
            return json.load(open(CONFIG, encoding="utf-8"))
        except Exception:
            pass
    cfg = {"start_date": "2026-08-03", "_ghi_chu": "start_date = Ngày 1 của Blueprint (thứ Hai ra quân). Sửa tại đây."}
    json.dump(cfg, open(CONFIG, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    return cfg


def fetch(days: int, token: str):
    url = f"{API}?token={token}&days={days}"
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            return json.load(r)["data"]
    except Exception as e:
        return {"_error": str(e)}


def line(char="─", n=64):
    print(char * n)


def main():
    today = date.today()
    cfg = load_config()
    try:
        start = datetime.strptime(cfg.get("start_date", ""), "%Y-%m-%d").date()
    except ValueError:
        start = today
    day_n = (today - start).days + 1
    week_n = min(4, max(1, (day_n - 1) // 7 + 1)) if day_n >= 1 else 0

    print()
    line("═")
    print(f"  ☀ BÁO CÁO SÁNG — {today.strftime('%A %d/%m/%Y')}")
    line("═")

    # 1) HÔM NAY LÀM GÌ
    if day_n < 1:
        print(f"\n▶ Blueprint bắt đầu {start.strftime('%d/%m')} (còn {1 - day_n} ngày). Hôm nay: chuẩn bị Ngày 1.")
        print(f"  {DAY_FOCUS[1]}")
    elif day_n <= 30:
        print(f"\n▶ NGÀY {day_n}/30 (Tuần {week_n}) — VIỆC CHÍNH HÔM NAY:")
        print(f"  {DAY_FOCUS.get(day_n, 'Xem Q10')}")
        tg = WEEK_TARGETS.get(week_n, {})
        print(f"\n  Mục tiêu lũy kế tuần {week_n}: "
              + " · ".join(f"{k} ≥ {v}" + ("%" if k == "%share" else "") for k, v in tg.items()))
    else:
        print(f"\n▶ Đã qua tháng ra quân (ngày {day_n}). Chạy theo nhịp Q5 + lên Blueprint tháng mới (Q10 ngày 30).")

    print("\n  3 việc KHÔNG được bỏ dù bận (Q5 §A2):")
    print("   [ ] Seed comment 30' đầu cho ≥1 bài")
    print("   [ ] Chào ≥5 thợ / dựng hồ sơ đã hứa")
    print("   [ ] Nhắc ≥3 thợ share link")

    # 2) SỐ THẬT TỪ API
    token = load_token()
    line()
    print("  📊 SỐ THẬT (product_events — doitay.vn)")
    if not token:
        print("  [!] Thiếu METRICS_TOKEN trong agent-system/.env — bỏ qua phần số.")
        d7 = d30 = None
    else:
        d7, d30 = fetch(7, token), fetch(30, token)
        for label, d in (("7 ngày", d7), ("30 ngày", d30)):
            if d and "_error" not in d:
                f, b = d["funnel"], d["bac_dau"]
                print(f"  {label:>7}: publish {f['tho_published']:>3} → share {f['tho_shared']:>3}"
                      f" → khách xem {f['profile_viewed']:>3} → LIÊN HỆ {f['khach_contacted']:>3}"
                      f"   (share_rate {b['share_rate']:.0%} · real_lead {b['real_lead_rate']:.0%})")
            else:
                print(f"  {label:>7}: [lỗi API] {d.get('_error', '?') if d else '?'}")

    # 3) CẢNH BÁO GATE (tự động, dựa số 7 ngày)
    line()
    print("  🚨 CẢNH BÁO")
    warns = []
    if d7 and "_error" not in d7:
        f7, b7 = d7["funnel"], d7["bac_dau"]
        if f7["tho_published"] == 0:
            warns.append("7 ngày qua KHÔNG có thợ mới publish → hôm nay ưu tiên chào thợ/CTV.")
        if f7["tho_published"] > 0 and f7["tho_shared"] == 0:
            warns.append("Có thợ mới nhưng CHƯA AI SHARE → chạy kịch bản nhắc share (Q10 ngày 15). Lưu ý: share đo tự động chỉ khi bản app tracking đã live — trước đó đếm tay sheet.")
        if f7["tho_shared"] > 0 and f7["khach_contacted"] == 0:
            warns.append("Thợ share nhưng khách CHƯA liên hệ → soi chất lượng hồ sơ (ảnh/giá/đánh giá) — cây Q11 §5 nhánh 5.")
        if f7["khach_contacted"] > 0:
            warns.append(f"🎉 {f7['khach_contacted']} hồ sơ có khách liên hệ trong 7 ngày — xin nhận xét làm bài PROOF (Q10 ngày 17)!")
    if day_n in (7, 14, 21, 28):
        warns.append(f"HÔM NAY LÀ NGÀY GATE (review tuần {week_n}) — điền 5 số + 3 câu, đừng bỏ.")
    if not warns:
        warns.append("Không có cảnh báo tự động. Vẫn điền sheet tay: hồ sơ mới · %share · khách thật.")
    for w in warns:
        print(f"  • {w}")

    # 4) NHẮC SỔ QUẢN TRỊ
    line()
    print("  📔 Sổ quản trị: quan-tri/nhat-ky-quyet-dinh.md (mỗi quyết định = 1 dòng)")
    print(f"  📕 Blueprint book: {BOOK_URL}")
    line("═")
    print()


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    main()
