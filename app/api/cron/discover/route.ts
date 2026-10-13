import { NextResponse } from "next/server";
import { isCron } from "@/lib/auto/auth";
import { runDiscover } from "@/lib/auto/run";
export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  if (!isCron(req)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const r = await runDiscover("cron");
  return NextResponse.json(r, { status: r.ok ? 200 : 500 });
}
