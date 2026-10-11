import { NextResponse } from "next/server";
import { ADMIN_EMAIL, SB_KEY, SB_URL } from "@/lib/site";
import { SHOT_SYSTEM, callGeminiVision, cleanDraft, hasGemini } from "@/lib/ai";
export const runtime = "nodejs";
export const maxDuration = 60;
const out = (body: object, status = 200) => NextResponse.json(body, { status });
// Reads product-page screenshots with a free Gemini key. Admin only.
export async function POST(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || !SB_URL) return out({ ok: false, error: "Not signed in" }, 401);
  const who = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_KEY, authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  if (!who?.email || String(who.email).toLowerCase() !== ADMIN_EMAIL) return out({ ok: false, error: "Not allowed" }, 403);
  if (!hasGemini()) return out({ ok: false, code: "no-vision-key", error: "No GEMINI_API_KEY set" }, 501);
  let imgs: { mime: string; data: string }[] = [];
  try {
    const b = await req.json(); const list: unknown[] = Array.isArray(b.images) ? b.images.slice(0, 4) : [];
    imgs = list.map((x) => { const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(x)); return m ? { mime: m[1], data: m[2] } : null; }).filter((x): x is { mime: string; data: string } => !!x && x.data.length < 3_000_000);
  } catch {}
  if (!imgs.length) return out({ ok: false, error: "No readable screenshots received" }, 400);
  try {
    const text = await callGeminiVision({ system: SHOT_SYSTEM, text: "Screenshots of one product page follow (in scroll order). Extract the JSON.", images: imgs });
    const s = text.indexOf("{"), e = text.lastIndexOf("}"); if (s < 0 || e < s) throw new Error("bad-json");
    const raw = JSON.parse(text.slice(s, e + 1)) as Record<string, unknown>;
    const d = cleanDraft(raw);
    const r = Number(raw.rating); const rc = Number(String(raw.review_count ?? "").replace(/[,\s]/g, ""));
    if (!d.name) throw new Error("empty");
    return out({ ok: true, data: d, rating: Number.isFinite(r) && r > 0 && r <= 5 ? r : null, reviews: Number.isInteger(rc) && rc >= 0 ? rc : null });
  } catch (err) { return out({ ok: false, error: `Couldn't read the screenshots (${(err as Error).message}).` }, 502); }
}
