import { NextResponse } from "next/server";
import { SB_KEY, SB_URL } from "@/lib/site";
export const runtime = "nodejs";
const out = (body: object, status = 200) => NextResponse.json(body, { status });
// Best-effort per-IP limit (resets when the server instance restarts): 5 suggestions per hour.
const hits = new Map<string, number[]>();
const clean = (v: unknown, n: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f]+/g, " ").trim().slice(0, n) : "");
// Public. Anyone can suggest a product link; it lands in the admin "Suggestions" tab. Nothing is published automatically.
export async function POST(req: Request) {
  if (!SB_URL || !SB_KEY) return out({ ok: false, error: "Suggestions are unavailable right now." }, 503);
  let b: Record<string, unknown> = {};
  try { b = await req.json(); } catch { return out({ ok: false, error: "Invalid request." }, 400); }
  if (clean(b.hp, 50)) return out({ ok: true }); // honeypot: bots fill hidden fields, we pretend it worked
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown", now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3600_000);
  if (recent.length >= 5) return out({ ok: false, error: "Too many suggestions. Please try again in a while." }, 429);
  const url = clean(b.url, 600);
  let ok = false; try { const u = new URL(url); ok = u.protocol === "https:" && u.hostname.includes("."); } catch {}
  if (!ok) return out({ ok: false, error: "Please paste a full product link starting with https://" }, 400);
  const row = { url, name: clean(b.name, 140) || null, note: clean(b.note, 500) || null, contact: clean(b.contact, 120) || null };
  const r = await fetch(`${SB_URL}/rest/v1/ayushpicks_suggestions`, { method: "POST", headers: { apikey: SB_KEY, "content-type": "application/json", prefer: "return=minimal" }, body: JSON.stringify(row) }).catch(() => null);
  if (!r || !r.ok) return out({ ok: false, error: "Couldn't save your suggestion. Please try again." }, 502);
  hits.set(ip, [...recent, now]);
  return out({ ok: true });
}
