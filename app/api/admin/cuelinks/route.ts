import { NextResponse } from "next/server";
import { ADMIN_EMAIL, SB_KEY, SB_URL } from "@/lib/site";
export const runtime = "nodejs";
export const maxDuration = 60;
const out = (body: object, status = 200) => NextResponse.json(body, { status });
const CONVERT = "https://developers.cuelinks.com/pub_api/v3/links/convert";
const pick = (j: unknown): string => {
  const o = (j && typeof j === "object" ? j : {}) as Record<string, unknown>; const d = (o.data && typeof o.data === "object" ? o.data : {}) as Record<string, unknown>;
  for (const v of [o.short_url, o.tracking_url, o.url, d.short_url, d.tracking_url, d.url]) if (typeof v === "string" && /^https:\/\//i.test(v)) return v;
  return "";
};
// Turns normal product links into Cuelinks tracking links. Admin only; the API key never leaves the server.
export async function POST(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || !SB_URL) return out({ ok: false, error: "Not signed in" }, 401);
  const who = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_KEY, authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  if (!who?.email || String(who.email).toLowerCase() !== ADMIN_EMAIL) return out({ ok: false, error: "Not allowed" }, 403);
  const key = process.env.CUELINKS_API_KEY;
  if (!key) return out({ ok: false, error: "CUELINKS_API_KEY is not set on the server" }, 501);
  let urls: string[] = [];
  try { const b = await req.json(); urls = (Array.isArray(b.urls) ? b.urls : []).map((u: unknown) => String(u).trim()).filter((u: string) => /^https:\/\//i.test(u)).slice(0, 25); } catch {}
  if (!urls.length) return out({ ok: false, error: "No valid https links received" }, 400);
  const results = await Promise.all(urls.map(async (url) => {
    try {
      const r = await fetch(CONVERT, { method: "POST", headers: { "content-type": "application/json", accept: "application/json", authorization: `Token ${key}` }, body: JSON.stringify({ url }), signal: AbortSignal.timeout(20000) });
      const text = await r.text(); let j: unknown = null; try { j = JSON.parse(text); } catch {}
      const link = r.ok ? pick(j) : "";
      if (link) return { url, link };
      const msg = (j && typeof j === "object" && (((j as Record<string, unknown>).error ?? (j as Record<string, unknown>).message) as unknown)) || text;
      return { url, error: `Cuelinks ${r.status}: ${String(typeof msg === "string" ? msg : JSON.stringify(msg)).replace(/\s+/g, " ").slice(0, 200)}` };
    } catch (e) { return { url, error: `Couldn't reach Cuelinks (${(e as Error).name})` }; }
  }));
  return out({ ok: true, results });
}
