import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auto/auth";
import { ADAPTERS } from "@/lib/auto/adapters";
import { db, getConfig, ready, type Candidate, type Config } from "@/lib/auto/core";
import { importCandidate } from "@/lib/auto/import";
import { runDiscover, runMonitor } from "@/lib/auto/run";
export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";
const out = (b: object, s = 200) => NextResponse.json(b, { status: s });
const num = (v: unknown, lo: number, hi: number, d: number) => { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };

// Admin only. GET = status of sources/secrets. POST = actions.
export async function GET(req: Request) {
  if (!(await isAdmin(req))) return out({ ok: false, error: "Not allowed" }, 403);
  return out({
    ok: true, ready: ready(), cron: !!process.env.CRON_SECRET, alerts: !!process.env.ALERT_WEBHOOK_URL,
    sources: [{ id: "trends", label: "Google Trends (public RSS)", on: true, note: "Trend signal only, never product data or images." }, ...ADAPTERS.map((a) => ({ id: a.id, label: a.label, on: !a.disabled(), note: a.disabled() || a.licence }))],
  });
}

export async function POST(req: Request) {
  if (!(await isAdmin(req))) return out({ ok: false, error: "Not allowed" }, 403);
  if (!ready()) return out({ ok: false, error: "Add SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables, then redeploy." }, 503);
  let b: { action?: string; id?: string; config?: Partial<Config> } = {};
  try { b = await req.json(); } catch {}
  try {
    switch (b.action) {
      case "run_discover": return out(await runDiscover("manual"));
      case "run_monitor": return out(await runMonitor("manual"));
      case "approve": {
        if (!b.id) return out({ ok: false, error: "Missing id" }, 400);
        const c = (await db<Candidate[]>(`ayushpicks_candidates?id=eq.${encodeURIComponent(b.id)}&select=*`))[0];
        if (!c) return out({ ok: false, error: "Not found" }, 404);
        if (c.status === "imported") return out({ ok: true, note: "Already imported" });
        if (!c.category) return out({ ok: false, error: "Set a category first (it is not mapped)" }, 400);
        if (!c.image_permission) return out({ ok: false, error: "Image has no usage permission" }, 400);
        const res = await importCandidate(c, true);
        await db(`ayushpicks_candidates?id=eq.${c.id}`, { method: "PATCH", body: JSON.stringify({ status: res.action === "skipped" ? "rejected" : "imported", product_id: res.productId ?? null, reasons: res.note ? [res.note] : c.reasons }) });
        return out({ ok: true, ...res });
      }
      case "reject": case "reopen": {
        if (!b.id) return out({ ok: false, error: "Missing id" }, 400);
        await db(`ayushpicks_candidates?id=eq.${encodeURIComponent(b.id)}&status=${b.action === "reject" ? "eq.pending" : "eq.rejected"}`, { method: "PATCH", body: JSON.stringify({ status: b.action === "reject" ? "rejected" : "pending" }) });
        return out({ ok: true });
      }
      case "save_config": {
        const cur = await getConfig(); const n = b.config || {};
        const cats = Array.isArray(n.categories) ? n.categories.filter((x): x is string => typeof x === "string").slice(0, 30) : cur.categories;
        const srcs = Array.isArray(n.auto_publish_sources) ? n.auto_publish_sources.filter((x): x is string => ADAPTERS.some((a) => a.id === x)) : cur.auto_publish_sources;
        const next: Config = { enabled: typeof n.enabled === "boolean" ? n.enabled : cur.enabled, categories: cats, auto_publish_sources: srcs,
          min_score: num(n.min_score, 0, 100, cur.min_score), min_rating: num(n.min_rating, 0, 5, cur.min_rating), min_reviews: num(n.min_reviews, 0, 1e6, cur.min_reviews),
          max_per_category: num(n.max_per_category, 1, 50, cur.max_per_category), unpublish_after_failures: num(n.unpublish_after_failures, 1, 20, cur.unpublish_after_failures), max_price_age_days: num(n.max_price_age_days, 1, 90, cur.max_price_age_days) };
        await db("ayushpicks_settings?on_conflict=key", { method: "POST", prefer: "resolution=merge-duplicates", body: JSON.stringify({ key: "config", value: next, updated_at: new Date().toISOString() }) });
        return out({ ok: true, config: next });
      }
      default: return out({ ok: false, error: "Unknown action" }, 400);
    }
  } catch (e) { return out({ ok: false, error: (e as Error).message }, 500); }
}
