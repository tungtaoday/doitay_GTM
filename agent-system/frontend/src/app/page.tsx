"use client";

// PHÒNG SALE & MARKETING — cockpit điều hành theo sách:
// Phễu Bắc Đẩu (số thật) · Trọng tâm tuần theo kênh (Q7+Q10) · Quản lý CTV (Q9).
// Chạy từng ngày ở /homnay · Sách ở /sach.html · Xưởng content (agent) ở /studio.

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_START, WEEK_TARGETS } from "./homnay/data";

/* ─── data: trọng tâm tuần × kênh (follow Q7 north-star + Q10 blueprint) ─── */

interface ChannelFocus {
  ch: string;
  ns: string; // north star của kênh (Q7)
  act: string; // hành động trọng tâm tuần này
  off?: boolean;
}

const WEEK_THEME: Record<number, { theme: string; gate: string }> = {
  1: { theme: "NỀN MÓNG — 30 thợ thật đầu tiên", gate: "CN: ≥30 hồ sơ? <20 → sửa phễu trước khi thêm CTV" },
  2: { theme: "NHÂN CTV + MÁY NỘI DUNG CHẠY ĐỀU", gate: "CN: ~70 hồ sơ · share ≥45% · khách thật đầu tiên?" },
  3: { theme: "ĐẨY BẮC ĐẨU — TỪ HỒ SƠ SANG KHÁCH THẬT", gate: "Ngày 21 — GATE LỚN NHẤT: 5-10 khách thật? → chọn nhánh A/B" },
  4: { theme: "KHOÁ SỔ — MỞ RỘNG (A) HOẶC CỦNG CỐ (B)", gate: "Ngày 29-30: DoA + kill/pivot/continue + ngân sách tháng 2" },
};

const WEEK_CHANNELS: Record<number, ChannelFocus[]> = {
  1: [
    { ch: "🤝 Offline + CTV", ns: "chi phí/thợ ≤44k", act: "Chào thợ quen (concierge) · 2-3 buổi sáng cửa hàng vật tư · tuyển + training CTV #1 · TRẢ TIỀN đúng thứ 6" },
    { ch: "📘 FB Group", ns: "#thợ inbox/tuần", act: "Vào 5 group (Q8) · tương tác thật 3-4 ngày ĐẦU, CHƯA đăng bài bán · nhắn riêng 10 thợ/ngày (PL-A §1)" },
    { ch: "💬 Zalo", ns: "% thợ share", act: "Dựng hồ sơ TRONG NGÀY · gửi link + câu chốt 'gửi thử 2-3 khách quen' · nhắc lại sau 2 ngày" },
    { ch: "🌐 Web + Mini App", ns: "khách liên hệ", act: "zmp deploy bản tracking + gửi duyệt · duyệt hồ sơ SLA trong ngày" },
    { ch: "🎵 TikTok", ns: "inbox từ video", act: "Chưa mở — dồn lực offline. Bật ở tuần 2.", off: true },
  ],
  2: [
    { ch: "📘 FB Group", ns: "inbox conv >15%", act: "Đăng bài 2A/2B (≤3 group/buổi) + comment-inbox keyword · mini-campaign F7→F1 (Q11 §3)" },
    { ch: "🎵 TikTok", ns: "inbox từ video", act: "BẬT: 1 reel/ngày · comment-seeding 30' dưới hub thợ · lập danh sách 10 micro-KOL" },
    { ch: "🤝 CTV", ns: "hồ sơ hợp lệ/CTV ≥10", act: "Nhân lên 4 CTV, chia địa bàn không trùng · nghiệm thu + trả thứ 6 · nhân bản kịch bản người giỏi nhất" },
    { ch: "💬 Zalo", ns: "% thợ share", act: "Nhóm Zalo CTV hỗ trợ 1-nơi · nhắc share thợ tuần 1 chưa share" },
    { ch: "🌐 Web + Mini App", ns: "SLA duyệt <2h", act: "Chốt 2 khung duyệt 11h30 & 17h · app duyệt xong thì publish bản tracking" },
  ],
  3: [
    { ch: "💬 Zalo + điện thoại", ns: "% thợ share ≥50%", act: "CHIẾN DỊCH SHARE LẠI: gọi/nhắn TẤT CẢ thợ chưa share — kịch bản ngày 15" },
    { ch: "📘 FB Group", ns: "inbox conv", act: "Bài PROOF từ case khách thật (khuôn K3, Q11) · đăng group + phát cho CTV làm vũ khí chào" },
    { ch: "🎵 TikTok", ns: "KOL hợp tác", act: "Dựng hồ sơ đẹp cho KOL nhận lời · tiếp tục 1 reel/ngày" },
    { ch: "🤝 CTV", ns: "chi phí/thợ-có-share ≤150k", act: "Nghiệm thu thứ 6 + SOI UNIT ECONOMICS (ngày 19) — vượt ngưỡng 2 tuần → dừng scale" },
    { ch: "🌐 Web + Mini App", ns: "khách liên hệ ⭐", act: "Verify tracking chảy số · vệ sinh hồ sơ thiếu ảnh · rà seed data (chuẩn bị SEO)" },
  ],
  4: [
    { ch: "⭐ Nhánh A (đã có khách thật)", ns: "mở rộng", act: "Bật SEO_INDEX + Search Console · chọn quận #2 · tuyển 2 CTV mới + đề bạt trưởng nhóm · case study chào quận 2" },
    { ch: "🔧 Nhánh B (chưa có)", ns: "sửa V1", act: "Phỏng vấn 5 thợ share-mà-không-ra-khách · sửa 10 hồ sơ yếu nhất · A/B cách nhắc share · QR card cứng" },
    { ch: "🤝 CTV", ns: "giữ người giỏi", act: "Nghiệm thu 2 tuần cuối · đánh giá lại đơn giá · chốt đội hình tháng 2" },
    { ch: "📊 Tổng kết", ns: "quyết định", act: "Ngày 29-30: DoA · kill/pivot/continue kênh-CTV-content · ngân sách tháng 2 theo CAC THẬT" },
  ],
};

/* ─── CTV types ─── */

interface Ctv {
  id: string;
  name: string;
  area: string;
  hs: number; // hồ sơ hợp lệ tuần này
  share: number; // thợ đã share tuần này
  paid: number; // đã trả lũy kế (k)
  weeks: number; // số tuần đã chốt
}

const DON_GIA_HS = 30; // nghìn đ / hồ sơ hợp lệ (Q9 §4.1)
const DON_GIA_SHARE = 10; // nghìn đ thưởng share

interface Funnel {
  funnel: { tho_published: number; tho_shared: number; profile_viewed: number; khach_contacted: number };
  bac_dau: { share_rate: number; real_lead_rate: number };
  sources?: Record<string, { viewed: number; contacted: number; booked: number }>;
}

// Nhãn nguồn khách (Q12 §3.1)
const SRC_LABEL: Record<string, string> = {
  thotot_app: "📱 Trong app ThợTốt",
  thotot_card: "📇 Thẻ thợ share",
  seo: "🔍 Google (SEO)",
  facebook: "📘 Facebook",
  zalo: "💬 Zalo",
  tiktok: "🎵 TikTok",
  ctv: "🤝 CTV",
  truc_tiep: "↗ Trực tiếp",
  khac: "◌ Khác/chưa gắn nhãn",
};

const dayMs = 86_400_000;
const parseISO = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

/* ═══ PAGE ═══ */

export default function Cockpit() {
  const [win, setWin] = useState<7 | 30>(7);
  const [data, setData] = useState<Record<number, Funnel | null>>({ 7: null, 30: null });
  const [ctvs, setCtvs] = useState<Ctv[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [startDate, setStartDate] = useState(DEFAULT_START);

  useEffect(() => {
    const s = localStorage.getItem("homnay:start");
    if (s) setStartDate(s);
    const raw = localStorage.getItem("ctv:list");
    if (raw) try { setCtvs(JSON.parse(raw)); } catch {}
    setLoaded(true);
    for (const d of [7, 30] as const)
      fetch(`/api/bacdau?days=${d}`, { signal: AbortSignal.timeout(15000) })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => j?.funnel && setData((prev) => ({ ...prev, [d]: j })))
        .catch(() => {});
  }, []);

  const save = useCallback((next: Ctv[]) => {
    setCtvs(next);
    localStorage.setItem("ctv:list", JSON.stringify(next));
  }, []);

  const dayN = useMemo(
    () => Math.floor((Date.now() - parseISO(startDate).getTime()) / dayMs) + 1,
    [startDate],
  );
  const weekN = Math.min(4, Math.max(1, Math.ceil(dayN / 7)));
  const inMonth = dayN >= 1 && dayN <= 30;
  const wk = WEEK_THEME[inMonth ? weekN : 1];
  const channels = WEEK_CHANNELS[inMonth ? weekN : 1];

  const m = data[win];
  const maxV = m ? Math.max(m.funnel.tho_published, m.funnel.tho_shared, m.funnel.profile_viewed, m.funnel.khach_contacted, 1) : 1;

  /* CTV computed */
  const tienTuan = (c: Ctv) => c.hs * DON_GIA_HS + c.share * DON_GIA_SHARE;
  const tongTuan = ctvs.reduce((s, c) => s + tienTuan(c), 0);
  const tongHs = ctvs.reduce((s, c) => s + c.hs, 0);

  const addCtv = () => {
    const name = prompt("Tên CTV:");
    if (!name) return;
    const area = prompt("Địa bàn (quận / cụm cửa hàng vật tư):") || "";
    save([...ctvs, { id: `${Date.now()}`, name, area, hs: 0, share: 0, paid: 0, weeks: 0 }]);
  };
  const bump = (id: string, k: "hs" | "share", d: number) =>
    save(ctvs.map((c) => (c.id === id ? { ...c, [k]: Math.max(0, c[k] + d) } : c)));
  const removeCtv = (id: string) => {
    const c = ctvs.find((x) => x.id === id);
    if (c && confirm(`Xoá CTV "${c.name}"?`)) save(ctvs.filter((x) => x.id !== id));
  };
  const chotTuan = () => {
    if (!ctvs.length) return;
    if (!confirm(`Chốt tuần: tổng chi ${tongTuan.toLocaleString("vi-VN")}k cho ${ctvs.length} CTV?\n(Đã xác minh SĐT + check trùng + soi ảnh — Q9 §4.4)\nSau khi chốt, bộ đếm tuần về 0.`)) return;
    save(ctvs.map((c) => ({ ...c, paid: c.paid + tienTuan(c), weeks: c.weeks + 1, hs: 0, share: 0 })));
  };

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 pb-16 pt-6">
      {/* ── header ── */}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text0">PHÒNG SALE &amp; MARKETING</h1>
          <p className="text-xs text-text2">
            {inMonth ? `Ngày ${dayN}/30 · Tuần ${weekN} · ` : ""}doitay.vn × ThợTốt — điều hành theo sách
          </p>
        </div>
        <nav className="flex flex-wrap gap-2 text-xs">
          <a href="/homnay" className="rounded-lg bg-blue-dim px-3 py-2 font-bold text-blue active:opacity-80">▶ Hôm nay làm gì</a>
          <a href="/sach.html" target="_blank" className="rounded-lg bg-bg2 px-3 py-2 text-text1">📕 Sách</a>
          <a href="/studio" className="rounded-lg bg-bg2 px-3 py-2 text-text1">🎬 Xưởng content</a>
        </nav>
      </header>

      {/* ── A. PHỄU BẮC ĐẨU ── */}
      <section className="mb-6 rounded-2xl border border-border bg-bg1 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-text0">PHỄU BẮC ĐẨU <span className="font-normal text-text2">— thợ share → khách liên hệ</span></h2>
          <div className="flex gap-1 text-xs">
            {([7, 30] as const).map((d) => (
              <button key={d} onClick={() => setWin(d)}
                className={`rounded-md px-2.5 py-1 ${win === d ? "bg-blue text-white" : "bg-bg2 text-text2"}`}>
                {d} ngày
              </button>
            ))}
          </div>
        </div>
        {m ? (
          <>
            <div className="space-y-2">
              {([
                ["Thợ lên chợ", m.funnel.tho_published, "bg-blue"],
                ["Thợ đã share", m.funnel.tho_shared, "bg-violet"],
                ["Khách xem hồ sơ", m.funnel.profile_viewed, "bg-amber"],
                ["KHÁCH LIÊN HỆ ⭐", m.funnel.khach_contacted, "bg-teal"],
              ] as const).map(([label, v, color]) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-36 shrink-0 text-right text-xs text-text1">{label}</div>
                  <div className="h-7 flex-1 overflow-hidden rounded-md bg-bg2">
                    <div className={`flex h-full items-center rounded-md px-2 text-xs font-bold text-bg0 ${color}`}
                      style={{ width: `${Math.max((v / maxV) * 100, v > 0 ? 8 : 0)}%` }}>
                      {v > 0 ? v : ""}
                    </div>
                  </div>
                  <div className="w-8 text-xs text-text2">{v}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-text2">
              <span>Tỉ lệ share: <b className={m.bac_dau.share_rate > 0 ? "text-violet" : "text-red"}>{(m.bac_dau.share_rate * 100).toFixed(0)}%</b> (mục tiêu tuần {weekN}: {[40, 45, 50, 55][weekN - 1]}%)</span>
              <span>Khách thật / thợ share: <b className={m.bac_dau.real_lead_rate > 0 ? "text-teal" : "text-red"}>{(m.bac_dau.real_lead_rate * 100).toFixed(0)}%</b></span>
              <span className="text-text2">Share tự đếm khi app tracking live — trước đó đếm tay sheet.</span>
            </div>
          </>
        ) : (
          <div className="py-4 text-center text-xs text-text2">Đang tải số thật…</div>
        )}
      </section>

      {/* ── A2. NGUỒN KHÁCH — tách kênh (Q12) ── */}
      {m?.sources && Object.keys(m.sources).length > 0 && (
        <section className="mb-6 rounded-2xl border border-border bg-bg1 p-4">
          <h2 className="mb-3 text-sm font-bold text-text0">
            NGUỒN KHÁCH <span className="font-normal text-text2">— khách xem/liên hệ đến từ đâu ({win} ngày)</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-xs">
              <thead>
                <tr className="text-text2">
                  <th className="pb-2 pr-3 font-normal">Nguồn</th>
                  <th className="pb-2 pr-3 font-normal">Khách xem</th>
                  <th className="pb-2 pr-3 font-normal">Liên hệ ⭐</th>
                  <th className="pb-2 pr-3 font-normal">Đặt lịch</th>
                  <th className="pb-2 font-normal">Xem → Liên hệ</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(m.sources)
                  .sort((a, b) => b[1].contacted - a[1].contacted || b[1].viewed - a[1].viewed)
                  .map(([src, s]) => {
                    const rate = s.viewed > 0 ? s.contacted / s.viewed : 0;
                    return (
                      <tr key={src} className="border-t border-border">
                        <td className="whitespace-nowrap py-2 pr-3 font-bold text-text0">{SRC_LABEL[src] ?? src}</td>
                        <td className="py-2 pr-3 text-text1">{s.viewed}</td>
                        <td className={`py-2 pr-3 font-bold ${s.contacted > 0 ? "text-teal" : "text-text2"}`}>{s.contacted}</td>
                        <td className="py-2 pr-3 text-text1">{s.booked}</td>
                        <td className="py-2 text-text2">{s.viewed > 0 ? `${(rate * 100).toFixed(0)}%` : "—"}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-text2">
            Ngưỡng khỏe (Q12 §6): thẻ thợ ≥30% · SEO ≥10-15% · FB ≥15%. Link đăng bài PHẢI kèm UTM (Q11 §4.1) — không UTM = rơi vào &quot;Khác&quot;.
          </p>
        </section>
      )}

      {/* ── B. TUẦN NÀY — trọng tâm theo kênh ── */}
      <section className="mb-6 rounded-2xl border border-border bg-bg1 p-4">
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-bold text-text0">TUẦN {inMonth ? weekN : 1}: {wk.theme}</h2>
          <span className="text-xs text-text2">🎯 {WEEK_TARGETS[inMonth ? weekN : 1]}</span>
        </div>
        <div className="mb-3 rounded-lg bg-amber-dim px-3 py-2 text-xs text-amber">⭐ {wk.gate}</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead>
              <tr className="text-text2">
                <th className="pb-2 pr-3 font-normal">Kênh</th>
                <th className="pb-2 pr-3 font-normal">North star (Q7)</th>
                <th className="pb-2 font-normal">Hành động trọng tâm tuần này</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((c) => (
                <tr key={c.ch} className={`border-t border-border ${c.off ? "opacity-40" : ""}`}>
                  <td className="whitespace-nowrap py-2.5 pr-3 font-bold text-text0">{c.ch}</td>
                  <td className="whitespace-nowrap py-2.5 pr-3 text-text2">{c.ns}</td>
                  <td className="py-2.5 leading-relaxed text-text1">{c.act}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-text2">Việc cụ thể từng ngày → <a href="/homnay" className="text-blue underline">Hôm nay làm gì</a> · chi tiết thao tác → <a href="/sach.html" target="_blank" className="text-blue underline">Sách</a> (Q3, Q8, Q9, Q11)</p>
      </section>

      {/* ── C. QUẢN LÝ CTV ── */}
      <section className="mb-6 rounded-2xl border border-border bg-bg1 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-text0">
            CỘNG TÁC VIÊN <span className="font-normal text-text2">— {DON_GIA_HS}k/hồ sơ hợp lệ + {DON_GIA_SHARE}k thưởng share (Q9)</span>
          </h2>
          <div className="flex gap-2 text-xs">
            <button onClick={addCtv} className="rounded-lg bg-blue px-3 py-1.5 font-bold text-white active:opacity-80">+ Thêm CTV</button>
            <button onClick={chotTuan} disabled={!ctvs.length}
              className="rounded-lg bg-teal-dim px-3 py-1.5 font-bold text-teal active:opacity-80 disabled:opacity-30">
              💸 Chốt tuần &amp; trả tiền
            </button>
          </div>
        </div>

        {loaded && ctvs.length === 0 && (
          <div className="rounded-lg bg-bg2 px-3 py-4 text-center text-xs text-text2">
            Chưa có CTV. Tuần 1 mục tiêu 1-2 người — JD + scorecard trong Sách (Q9 §1-2).
          </div>
        )}

        {ctvs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead>
                <tr className="text-text2">
                  <th className="pb-2 pr-3 font-normal">CTV / địa bàn</th>
                  <th className="pb-2 pr-3 font-normal">Hồ sơ hợp lệ (tuần)</th>
                  <th className="pb-2 pr-3 font-normal">Thợ đã share</th>
                  <th className="pb-2 pr-3 font-normal">Tiền tuần</th>
                  <th className="pb-2 pr-3 font-normal">KPI</th>
                  <th className="pb-2 pr-3 font-normal">Lũy kế</th>
                  <th className="pb-2 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {ctvs.map((c) => {
                  const kpiOk = c.hs >= 10;
                  return (
                    <tr key={c.id} className="border-t border-border">
                      <td className="py-2.5 pr-3">
                        <div className="font-bold text-text0">{c.name}</div>
                        <div className="text-text2">{c.area}</div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <Counter v={c.hs} onDec={() => bump(c.id, "hs", -1)} onInc={() => bump(c.id, "hs", 1)} />
                      </td>
                      <td className="py-2.5 pr-3">
                        <Counter v={c.share} onDec={() => bump(c.id, "share", -1)} onInc={() => bump(c.id, "share", 1)} />
                      </td>
                      <td className="whitespace-nowrap py-2.5 pr-3 font-bold text-text0">{tienTuan(c).toLocaleString("vi-VN")}k</td>
                      <td className="py-2.5 pr-3">
                        <span className={`rounded-md px-2 py-0.5 font-bold ${kpiOk ? "bg-teal-dim text-teal" : "bg-red-dim text-red"}`}>
                          {kpiOk ? "ĐẠT" : `${c.hs}/10`}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-2.5 pr-3 text-text2">{c.paid.toLocaleString("vi-VN")}k · {c.weeks} tuần</td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => removeCtv(c.id)} className="text-text2 hover:text-red">✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-border font-bold text-text0">
                  <td className="py-2.5 pr-3">TỔNG ({ctvs.length} CTV)</td>
                  <td className="py-2.5 pr-3">{tongHs} hồ sơ</td>
                  <td className="py-2.5 pr-3">{ctvs.reduce((s, c) => s + c.share, 0)} share</td>
                  <td className="py-2.5 pr-3 text-amber">{tongTuan.toLocaleString("vi-VN")}k</td>
                  <td colSpan={3} className="py-2.5 text-text2">
                    ngân sách chuẩn ~7,1tr/tháng (Q9 §4.2)
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        <p className="mt-2 text-[11px] leading-relaxed text-text2">
          Chỉ +1 hồ sơ SAU khi xác minh SĐT + check trùng + soi ảnh thật. Trả tiền đúng thứ 6 — uy tín với CTV là số 1 (Q9 §4.4).
          Dữ liệu lưu trên trình duyệt này; sổ chính vẫn là Google Sheet nghiệm thu (PL-B §6).
        </p>
      </section>

      {/* ── footer ── */}
      <footer className="text-center text-[11px] text-text2">
        Nhịp quản trị: sáng /homnay · CN review 5 số + 3 câu · quyết định tại gate — không theo cảm xúc (quan-tri/00)
      </footer>
    </div>
  );
}

function Counter({ v, onInc, onDec }: { v: number; onInc: () => void; onDec: () => void }) {
  return (
    <span className="inline-flex items-center gap-1">
      <button onClick={onDec} className="h-6 w-6 rounded bg-bg2 text-text2 active:bg-bg3">−</button>
      <span className="w-7 text-center font-bold text-text0">{v}</span>
      <button onClick={onInc} className="h-6 w-6 rounded bg-blue text-white active:opacity-80">+</button>
    </span>
  );
}
