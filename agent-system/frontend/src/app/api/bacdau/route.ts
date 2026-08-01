import { NextResponse } from "next/server";

// Proxy số Bắc Đẩu — token nằm server-side (frontend/.env.local), không lộ ra client/tunnel.
export async function GET(req: Request) {
  const token = process.env.METRICS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Thiếu METRICS_TOKEN trong frontend/.env.local" }, { status: 500 });
  }
  const days = new URL(req.url).searchParams.get("days") ?? "7";
  try {
    const r = await fetch(
      `https://doitay.vn/api/v1/public/metrics/bac-dau?token=${token}&days=${encodeURIComponent(days)}`,
      { cache: "no-store", signal: AbortSignal.timeout(12000) },
    );
    if (!r.ok) return NextResponse.json({ error: `API ${r.status}` }, { status: 502 });
    const json = await r.json();
    return NextResponse.json(json.data ?? json);
  } catch {
    return NextResponse.json({ error: "Không gọi được doitay.vn" }, { status: 502 });
  }
}
