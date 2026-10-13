"use client";
import { useState } from "react";
export function SuggestForm() {
  const [url, setUrl] = useState(""); const [name, setName] = useState(""); const [note, setNote] = useState(""); const [contact, setContact] = useState(""); const [hp, setHp] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle"); const [err, setErr] = useState("");
  const inp = "mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm";
  async function send(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setState("busy");
    try {
      const r = await fetch("/api/suggest", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url, name, note, contact, hp }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) { setState("done"); setUrl(""); setName(""); setNote(""); setContact(""); } else { setErr(d.error || "Something went wrong. Please try again."); setState("idle"); }
    } catch { setErr("Network problem. Please try again."); setState("idle"); }
  }
  if (state === "done") return (<div role="status" className="mt-6 rounded-xl border border-accent/30 bg-s1 p-5"><p className="font-medium">Thank you! ✓</p><p className="mt-1 text-sm text-muted">Your suggestion has been sent. We review every link before adding it, so it may take a few days.</p>
    <button onClick={() => setState("idle")} className="btn-ghost mt-4">Suggest another</button></div>);
  return (<form onSubmit={send} className="mt-6 space-y-4 rounded-xl border border-line bg-s1 p-5">
    <label className="block text-sm font-medium">Product link *<input required type="url" inputMode="url" placeholder="https://www.amazon.in/…  or Flipkart, Myntra, Nykaa…" value={url} onChange={(e) => setUrl(e.target.value)} className={inp} maxLength={600} /></label>
    <label className="block text-sm font-medium">Product name <span className="font-normal text-muted">(optional)</span><input value={name} onChange={(e) => setName(e.target.value)} className={inp} maxLength={140} /></label>
    <label className="block text-sm font-medium">Why do you recommend it? <span className="font-normal text-muted">(optional)</span><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={inp} maxLength={500} /></label>
    <label className="block text-sm font-medium">Your Instagram or email <span className="font-normal text-muted">(optional, only if you want a reply)</span><input value={contact} onChange={(e) => setContact(e.target.value)} className={inp} maxLength={120} /></label>
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Leave this empty<input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label></div>
    {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
    <button disabled={state === "busy"} className="btn-primary disabled:opacity-60">{state === "busy" ? "Sending…" : "Send suggestion"}</button>
    <p className="text-xs text-muted">We only use this to review the product. Suggestions are never published automatically, and AyushPicks may earn a commission on store links.</p>
  </form>);
}
