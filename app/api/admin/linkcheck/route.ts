import { NextResponse } from "next/server";
import { ADMIN_EMAIL, SB_KEY, SB_URL } from "@/lib/site";
import { probe } from "@/lib/safe-fetch";
export const runtime = "nodejs";
export const maxDuration = 60;
const out = (body: object, status = 200) => NextResponse.json(body, { status });
// Admin only. Checks up to 24 store links and reports each one's HTTP status (0 = couldn't be checked).
export async function POST(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || !SB_URL) return out({ ok: false, error: "Not signed in" }, 401);
  const who = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_KEY, authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  if (!who?.email || String(who.email).toLowerCase() !== ADMIN_EMAIL) return out({ ok: false, error: "Not allowed" }, 403);
  let urls: string[] = [];
  try { const b = await req.json(); urls = (Array.isArray(b.urls) ? b.urls : []).filter((u: unknown): u is string => typeof u === "string" && u.startsWith("https://")).slice(0, 24); } catch {}
  if (!urls.length) return out({ ok: false, error: "No links to check" }, 400);
  const results: Record<string, number> = {};
  for (let i = 0; i < urls.length; i += 6) await Promise.all(urls.slice(i, i + 6).map(async (u) => { results[u] = await probe(u); }));
  return out({ ok: true, results });
}
