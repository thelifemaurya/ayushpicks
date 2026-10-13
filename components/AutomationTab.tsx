"use client";
import { useCallback, useEffect, useState } from "react";
import { sb } from "@/lib/sb";
import { CATEGORIES } from "@/lib/data";

type Cand = { id: string; source: string; name: string; brand: string; category: string; retailer: string; url: string; price: number | null; mrp: number | null; rating: number | null; review_count: number; image_url: string | null; image_permission: string | null; trend_signal: number; score: number; status: string; reasons: string[]; last_checked: string };
type Job = { id: string; kind: string; status: string; trigger: string; started_at: string; finished_at: string | null; stats: Record<string, unknown>; error: string | null };
type Info = { ok: boolean; ready: boolean; cron: boolean; alerts: boolean; sources: { id: string; label: string; on: boolean; note: string }[] };
type Cfg = { enabled: boolean; categories: string[]; min_score: number; min_rating: number; min_reviews: number; auto_publish_sources: string[]; max_per_category: number; unpublish_after_failures: number; max_price_age_days: number };
const when = (s: string) => new Date(s).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

export function AutomationTab({ say, reloadProducts }: { say: (m: string) => void; reloadProducts: () => Promise<void> }) {
  const [view, setView] = useState<"pending" | "history" | "sources" | "settings">("pending");
  const [cands, setCands] = useState<Cand[]>([]); const [jobs, setJobs] = useState<Job[]>([]); const [info, setInfo] = useState<Info | null>(null); const [cfg, setCfg] = useState<Cfg | null>(null);
  const [busy, setBusy] = useState(""); const [show, setShow] = useState<"pending" | "rejected" | "imported">("pending");

  const tok = async () => (await sb.auth.getSession()).data.session?.access_token || "";
  const call = useCallback(async (action: string, extra: object = {}) => {
    const r = await fetch("/api/admin/automation", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${await tok()}` }, body: JSON.stringify({ action, ...extra }) });
    return (await r.json().catch(() => ({ ok: false, error: "Bad response" }))) as { ok: boolean; error?: string; [k: string]: unknown };
  }, []);
  const load = useCallback(async () => {
    const [c, j, s] = await Promise.all([
      sb.from("ayushpicks_candidates").select("*").order("score", { ascending: false }).limit(300),
      sb.from("ayushpicks_jobs").select("*").order("started_at", { ascending: false }).limit(30),
      sb.from("ayushpicks_settings").select("value").eq("key", "config").maybeSingle(),
    ]);
    if (c.data) setCands(c.data as Cand[]); if (j.data) setJobs(j.data as Job[]); if (s.data?.value) setCfg(s.data.value as Cfg);
    const r = await fetch("/api/admin/automation", { headers: { authorization: `Bearer ${await tok()}` } }); if (r.ok) setInfo(await r.json());
  }, []);
  useEffect(() => { load(); }, [load]);

  async function act(label: string, action: string, extra: object = {}, okMsg = "Done ✓") {
    setBusy(label); const r = await call(action, extra); setBusy("");
    if (!r.ok) say(r.error || "Failed"); else { say(typeof r.skipped === "string" ? r.skipped : okMsg); await load(); if (action === "approve") await reloadProducts(); }
  }
  async function saveCfg() { if (!cfg) return; await act("cfg", "save_config", { config: cfg }, "Settings saved ✓"); }
  const list = cands.filter((c) => c.status === show);
  const noSource = info && !info.sources.some((s) => s.id !== "trends" && s.on);

  return (<section className="mt-6">
    <h2 className="text-lg font-semibold">Automation</h2>
    <p className="mt-1 text-sm text-muted">Daily discovery from licensed sources only. Nothing is invented, and nothing goes live unless it passes the checks (or you approve it).</p>
    {info && (!info.ready || !info.cron) && <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      {!info.ready && <p>Missing <b>SUPABASE_SERVICE_ROLE_KEY</b> in Vercel → Settings → Environment Variables. Runs are blocked until it is added.</p>}
      {!info.cron && <p>Missing <b>CRON_SECRET</b> (any random 32+ character text) in Vercel. The daily schedule will not run without it.</p>}</div>}
    {noSource && <div className="mt-3 rounded-xl border border-line bg-s1 p-3 text-sm text-muted">No licensed product source is connected yet (see Sources). Runs will only record trends and import nothing.</div>}
    <div className="mt-4 flex flex-wrap gap-2">
      <button disabled={!!busy} onClick={() => act("d", "run_discover", {}, "Discovery finished ✓")} className="btn-primary !py-2">{busy === "d" ? "Running…" : "Run discovery now"}</button>
      <button disabled={!!busy} onClick={() => act("m", "run_monitor", {}, "Monitoring finished ✓")} className="btn-ghost !py-2">{busy === "m" ? "Running…" : "Run price/link check"}</button></div>
    <div className="mt-4 flex gap-2 overflow-x-auto">{(["pending", "history", "sources", "settings"] as const).map((v) => <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={`chip shrink-0 ${view === v ? "!border-accent !text-accent" : ""}`}>{v === "pending" ? `Review (${cands.filter((c) => c.status === "pending").length})` : v[0].toUpperCase() + v.slice(1)}</button>)}</div>

    {view === "pending" && <div className="mt-4">
      <div className="flex gap-2">{(["pending", "rejected", "imported"] as const).map((v) => <button key={v} onClick={() => setShow(v)} aria-pressed={show === v} className={`chip ${show === v ? "!border-accent !text-accent" : ""}`}>{v}</button>)}</div>
      {!list.length ? <p className="mt-4 rounded-xl border border-line bg-s1 p-5 text-sm text-muted">Nothing here.</p> :
        <ul className="mt-4 space-y-3">{list.map((c) => <li key={c.id} className="rounded-xl border border-line bg-bg p-4 text-sm">
          <div className="flex gap-3">{c.image_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={c.image_url} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-line object-contain" />}
            <div className="min-w-0 flex-1"><p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted">{c.brand} · {c.category || "no category"} · {c.retailer} · via {c.source}</p>
              <p className="mt-1">{c.price != null ? `₹${c.price.toLocaleString("en-IN")}` : "no price"}{c.mrp ? ` (MRP ₹${c.mrp.toLocaleString("en-IN")})` : ""}{c.rating != null ? ` · ★${c.rating} (${c.review_count})` : " · no rating from source"}</p>
              <p className="text-xs text-muted">Score <b>{c.score}</b> · trend {c.trend_signal} · checked {when(c.last_checked)}</p></div></div>
          {!!c.reasons.length && <ul className="mt-2 list-disc pl-5 text-xs text-amber-800">{c.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>}
          <p className="mt-2 break-all text-xs text-muted">Image permission: {c.image_permission || "none — cannot publish"}</p>
          <div className="mt-3 flex flex-wrap gap-3"><a href={c.url} target="_blank" rel="noopener noreferrer nofollow" className="text-accent underline">Open link ↗</a>
            {c.status === "pending" && <><button disabled={!!busy} onClick={() => act(c.id, "approve", { id: c.id }, "Approved and published ✓")} className="btn-primary !py-1.5">{busy === c.id ? "…" : "Approve & publish"}</button>
              <button disabled={!!busy} onClick={() => act(c.id, "reject", { id: c.id }, "Rejected")} className="text-muted hover:text-ink">Reject</button></>}
            {c.status === "rejected" && <button disabled={!!busy} onClick={() => act(c.id, "reopen", { id: c.id }, "Moved back to review")} className="text-muted hover:text-ink">Move back to review</button>}</div></li>)}</ul>}</div>}

    {view === "history" && <ul className="mt-4 space-y-2">{!jobs.length ? <p className="rounded-xl border border-line bg-s1 p-5 text-sm text-muted">No runs yet.</p> : jobs.map((j) => <li key={j.id} className="rounded-xl border border-line bg-bg p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2"><b>{j.kind}</b><span className={`rounded-full px-2 py-0.5 text-xs ${j.status === "ok" ? "bg-green-100 text-green-800" : j.status === "running" ? "bg-s1 text-muted" : "bg-red-100 text-red-800"}`}>{j.status}</span><span className="text-xs text-muted">{j.trigger}</span><span className="ml-auto text-xs text-muted">{when(j.started_at)}</span></div>
      <p className="mt-1 text-xs text-muted">{Object.entries(j.stats || {}).filter(([k, v]) => k !== "notes" && typeof v !== "object").map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`).join(" · ")}</p>
      {Array.isArray(j.stats?.notes) && (j.stats.notes as string[]).map((n, i) => <p key={i} className="mt-1 text-xs text-amber-800">{n}</p>)}
      {j.error && <p className="mt-1 text-xs text-red-700">{j.error}</p>}
      {(j.status === "failed" || j.status === "partial") && <button disabled={!!busy} onClick={() => act(j.id, j.kind === "monitor" ? "run_monitor" : "run_discover", {}, "Retry finished ✓")} className="mt-2 text-accent underline">Retry</button>}</li>)}</ul>}

    {view === "sources" && <ul className="mt-4 space-y-2">{(info?.sources || []).map((s) => <li key={s.id} className="rounded-xl border border-line bg-bg p-3 text-sm">
      <div className="flex items-center gap-2"><b>{s.label}</b><span className={`rounded-full px-2 py-0.5 text-xs ${s.on ? "bg-green-100 text-green-800" : "bg-s1 text-muted"}`}>{s.on ? "on" : "off"}</span></div>
      <p className="mt-1 text-xs text-muted">{s.on ? "Image/licence: " : "Needed: "}{s.note}</p></li>)}
      <li className="rounded-xl border border-line bg-s1 p-3 text-xs text-muted">Amazon, Myntra, Nykaa and others are added only when their programme gives catalogue access and image-use permission. Alerts webhook: {info?.alerts ? "on" : "off (set ALERT_WEBHOOK_URL)"}.</li></ul>}

    {view === "settings" && cfg && <div className="mt-4 space-y-4 rounded-xl border border-line bg-bg p-4 text-sm">
      <label className="flex items-center gap-2"><input type="checkbox" checked={cfg.enabled} onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })} /> Automation enabled</label>
      <div className="grid grid-cols-2 gap-3">{([["min_score", "Min score (0-100)"], ["min_rating", "Min rating"], ["min_reviews", "Min reviews"], ["max_per_category", "Max new per category / run"], ["unpublish_after_failures", "Hide after N failed checks"], ["max_price_age_days", "Price stale after (days)"]] as const).map(([k, l]) => <label key={k} className="block text-xs text-muted">{l}<input type="number" inputMode="decimal" value={cfg[k]} onChange={(e) => setCfg({ ...cfg, [k]: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink" /></label>)}</div>
      <div><p className="text-xs text-muted">Categories to discover</p><div className="mt-1 flex flex-wrap gap-2">{CATEGORIES.map((n) => { const on = cfg.categories.includes(n); return <button key={n} onClick={() => setCfg({ ...cfg, categories: on ? cfg.categories.filter((x) => x !== n) : [...cfg.categories, n] })} aria-pressed={on} className={`chip ${on ? "!border-accent !text-accent" : ""}`}>{n}</button>; })}</div></div>
      <div><p className="text-xs text-muted">Auto-publish without review (only sources whose licence you have confirmed)</p><div className="mt-1 flex flex-wrap gap-2">{(info?.sources || []).filter((s) => s.id !== "trends").map((s) => { const on = cfg.auto_publish_sources.includes(s.id); return <button key={s.id} disabled={!s.on} onClick={() => setCfg({ ...cfg, auto_publish_sources: on ? cfg.auto_publish_sources.filter((x) => x !== s.id) : [...cfg.auto_publish_sources, s.id] })} aria-pressed={on} className={`chip ${on ? "!border-accent !text-accent" : ""} disabled:opacity-40`}>{s.label}</button>; })}</div></div>
      <button disabled={!!busy} onClick={saveCfg} className="btn-primary !py-2">{busy === "cfg" ? "Saving…" : "Save settings"}</button></div>}
  </section>);
}
