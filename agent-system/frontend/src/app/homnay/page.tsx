"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BOOK_URL, DAILY_MUSTS, DAYS, DEFAULT_START, WEEK_TARGETS, type Step } from "./data";

/* ─── helpers ─────────────────────────────────────────────────────────── */

const dayMs = 86_400_000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const parseISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

interface Funnel {
  funnel: { tho_published: number; tho_shared: number; profile_viewed: number; khach_contacted: number };
  bac_dau: { share_rate: number; real_lead_rate: number };
}

const BUOI: Record<Step["t"], string> = { sáng: "🌅 Sáng", chiều: "🌤 Chiều", tối: "🌙 Tối" };

/* ─── page ────────────────────────────────────────────────────────────── */

export default function HomNay() {
  const [today] = useState(() => iso(new Date()));
  const [viewDate, setViewDate] = useState(today);
  const [startDate, setStartDate] = useState(DEFAULT_START);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [m7, setM7] = useState<Funnel | null>(null);
  const [loaded, setLoaded] = useState(false);

  // load config + ticks
  useEffect(() => {
    const s = localStorage.getItem("homnay:start");
    if (s) setStartDate(s);
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const raw = localStorage.getItem(`homnay:${viewDate}`);
    setDone(raw ? JSON.parse(raw) : {});
  }, [viewDate, loaded]);

  // metrics (7 ngày)
  useEffect(() => {
    fetch("/api/bacdau?days=7", { signal: AbortSignal.timeout(15000) })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.funnel && setM7(d))
      .catch(() => {});
  }, []);

  const dayN = useMemo(
    () => Math.floor((parseISO(viewDate).getTime() - parseISO(startDate).getTime()) / dayMs) + 1,
    [viewDate, startDate],
  );
  const weekN = Math.min(4, Math.max(1, Math.ceil(dayN / 7)));
  const plan = DAYS[dayN];
  const inMonth = dayN >= 1 && dayN <= 30;

  const toggle = useCallback(
    (id: string) => {
      setDone((prev) => {
        const next = { ...prev, [id]: !prev[id] };
        localStorage.setItem(`homnay:${viewDate}`, JSON.stringify(next));
        return next;
      });
    },
    [viewDate],
  );

  const shift = (delta: number) => setViewDate(iso(new Date(parseISO(viewDate).getTime() + delta * dayMs)));

  const changeStart = () => {
    const v = prompt("Ngày 1 của Blueprint (YYYY-MM-DD):", startDate);
    if (v && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
      localStorage.setItem("homnay:start", v);
      setStartDate(v);
    }
  };

  // progress
  const stepIds = useMemo(() => {
    const musts = DAILY_MUSTS.map((_, i) => `m${i}`);
    const steps = (plan?.steps ?? []).map((_, i) => `s${i}`);
    return [...musts, ...steps];
  }, [plan]);
  const doneCount = stepIds.filter((id) => done[id]).length;
  const pct = stepIds.length ? Math.round((doneCount / stepIds.length) * 100) : 0;
  const allDone = stepIds.length > 0 && doneCount === stepIds.length;

  /* ─── render ─── */
  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-24 pt-5">
      {/* header */}
      <header className="mb-4 flex items-center justify-between">
        <button onClick={() => shift(-1)} className="rounded-lg bg-bg2 px-3 py-2 text-text1 active:bg-bg3" aria-label="Hôm qua">◀</button>
        <div className="text-center">
          {inMonth ? (
            <>
              <div className="text-2xl font-bold text-text0">Ngày {dayN}<span className="text-text2">/30</span></div>
              <div className="text-xs text-text2">Tuần {weekN} · {viewDate}{viewDate === today ? " · hôm nay" : ""}</div>
            </>
          ) : (
            <>
              <div className="text-xl font-bold text-text0">{viewDate}</div>
              <div className="text-xs text-text2">{dayN < 1 ? `Còn ${1 - dayN} ngày tới Ngày 1` : "Đã qua tháng ra quân"}</div>
            </>
          )}
        </div>
        <button onClick={() => shift(1)} className="rounded-lg bg-bg2 px-3 py-2 text-text1 active:bg-bg3" aria-label="Ngày mai">▶</button>
      </header>

      {/* progress */}
      {inMonth && (
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs text-text2">
            <span>{plan?.title}</span>
            <span>{doneCount}/{stepIds.length} bước</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-bg2">
            <div className={`h-full transition-all ${allDone ? "bg-teal" : "bg-blue"}`} style={{ width: `${pct}%` }} />
          </div>
          {allDone && <div className="mt-2 rounded-lg bg-teal-dim px-3 py-2 text-sm text-teal">✅ Xong ngày {dayN}! Ghi 3 số vào sheet rồi nghỉ.</div>}
        </div>
      )}

      {/* gate banner */}
      {plan?.gate && (
        <div className="mb-4 rounded-xl border border-amber/40 bg-amber-dim p-3">
          <div className="mb-1 text-xs font-bold uppercase tracking-wider text-amber">⭐ Ngày Gate — quyết định theo số, không theo cảm xúc</div>
          <div className="text-sm leading-relaxed text-text0">{plan.gate}</div>
        </div>
      )}

      {/* mục tiêu tuần */}
      {inMonth && (
        <div className="mb-4 rounded-lg bg-bg1 px-3 py-2 text-xs text-text1">
          🎯 Tuần {weekN}: {WEEK_TARGETS[weekN]}
        </div>
      )}

      {/* 3 việc bất di bất dịch */}
      {inMonth && (
        <section className="mb-4">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-red">Không được bỏ dù bận</h2>
          <div className="space-y-2">
            {DAILY_MUSTS.map((text, i) => (
              <Check key={i} id={`m${i}`} text={text} done={!!done[`m${i}`]} onToggle={toggle} accent />
            ))}
          </div>
        </section>
      )}

      {/* các bước trong ngày */}
      {inMonth && plan && (
        <section className="mb-5">
          {(["sáng", "chiều", "tối"] as const).map((buoi) => {
            const items = plan.steps.map((s, i) => ({ ...s, id: `s${i}` })).filter((s) => s.t === buoi);
            if (!items.length) return null;
            return (
              <div key={buoi} className="mb-3">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-text2">{BUOI[buoi]}</h2>
                <div className="space-y-2">
                  {items.map((s) => (
                    <Check key={s.id} id={s.id} text={s.text} refTag={s.ref} done={!!done[s.id]} onToggle={toggle} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {!inMonth && dayN < 1 && (
        <div className="mb-5 rounded-xl bg-bg1 p-4 text-sm leading-relaxed text-text1">
          Chưa tới ngày ra quân. Hôm nay chuẩn bị trước các việc Ngày 1 (bấm ▶ để xem), hoặc đổi ngày bắt đầu bên dưới.
        </div>
      )}

      {/* số thật */}
      <section className="mb-5">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-text2">📊 Số thật 7 ngày (tự động)</h2>
        {m7 ? (
          <>
            <div className="grid grid-cols-4 gap-2 text-center">
              <Stat label="Lên chợ" v={m7.funnel.tho_published} />
              <Stat label="Đã share" v={m7.funnel.tho_shared} warn={m7.funnel.tho_shared === 0} />
              <Stat label="Khách xem" v={m7.funnel.profile_viewed} />
              <Stat label="LIÊN HỆ ⭐" v={m7.funnel.khach_contacted} good={m7.funnel.khach_contacted > 0} />
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-text2">
              Share tự đếm khi bản app tracking live — trước đó đếm tay ở sheet. Khách LIÊN HỆ &gt; 0 = xin nhận xét làm bài proof (Ngày 17).
            </p>
          </>
        ) : (
          <div className="rounded-lg bg-bg1 px-3 py-2 text-xs text-text2">Đang tải… (cần backend Next chạy + METRICS_TOKEN trong frontend/.env.local)</div>
        )}
      </section>

      {/* footer */}
      <footer className="flex flex-wrap items-center gap-2 text-xs">
        <a href={BOOK_URL} target="_blank" rel="noreferrer" className="rounded-lg bg-bg2 px-3 py-2 text-text1 active:bg-bg3">📕 Sách chi tiết</a>
        <a href="/" className="rounded-lg bg-bg2 px-3 py-2 text-text1 active:bg-bg3">📊 Dashboard đầy đủ</a>
        <button onClick={changeStart} className="rounded-lg bg-bg2 px-3 py-2 text-text2 active:bg-bg3">⚙ Ngày bắt đầu: {startDate}</button>
      </footer>
    </div>
  );
}

/* ─── components ─────────────────────────────────────────────────────── */

function Check({ id, text, refTag, done, onToggle, accent }: {
  id: string; text: string; refTag?: string; done: boolean; accent?: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onToggle(id)}
      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
        done ? "border-teal/30 bg-teal-dim" : accent ? "border-red/30 bg-bg1" : "border-border bg-bg1"
      } active:bg-bg2`}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-sm font-bold ${
          done ? "border-teal bg-teal text-bg0" : "border-border text-transparent"
        }`}
      >
        ✓
      </span>
      <span className={`text-sm leading-relaxed ${done ? "text-text2 line-through" : "text-text0"}`}>
        {text}
        {refTag && <span className="ml-2 rounded bg-bg3 px-1.5 py-0.5 text-[10px] text-text2">{refTag}</span>}
      </span>
    </button>
  );
}

function Stat({ label, v, good, warn }: { label: string; v: number; good?: boolean; warn?: boolean }) {
  return (
    <div className={`rounded-lg p-2 ${good ? "bg-teal-dim" : warn ? "bg-red-dim" : "bg-bg1"}`}>
      <div className={`text-xl font-bold ${good ? "text-teal" : warn ? "text-red" : "text-text0"}`}>{v}</div>
      <div className="text-[10px] text-text2">{label}</div>
    </div>
  );
}
