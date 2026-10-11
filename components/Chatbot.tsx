"use client";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { Ic, PATHS } from "./Icons";
type M = { role: "user" | "assistant"; content: string };
type Pos = { x: number; y: number };
const HINTS = ["Best earbuds under ₹2000?", "How does AyushPicks work?", "Compare two products for me"];
const SIZE = 56, EDGE = 8;
function Rich({ text }: { text: string }) {
  return <>{text.split(/(\/product\/[a-z0-9-]+)/g).map((t, i) => (/^\/product\//.test(t) ? <Link key={i} href={t} className="font-medium text-accent underline">View product</Link> : <Fragment key={i}>{t}</Fragment>))}</>;
}
const clampPos = (p: Pos): Pos => ({
  x: Math.min(Math.max(EDGE, p.x), Math.max(EDGE, window.innerWidth - SIZE - EDGE)),
  y: Math.min(Math.max(EDGE, p.y), Math.max(EDGE, window.innerHeight - SIZE - EDGE)),
});
export function Chatbot() {
  const { compare } = useStore();
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<M[]>([{ role: "assistant", content: "Hi! I'm the AyushPicks assistant. Ask me about any product, a comparison, or what to buy." }]);
  const [pos, setPos] = useState<Pos | null>(null);
  const [panel, setPanel] = useState<{ left: number; top: number; width: number; height: number; origin: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const btn = useRef<HTMLButtonElement>(null); const list = useRef<HTMLDivElement>(null);
  const home = useRef<Pos | null>(null);
  const drag = useRef<{ id: number; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const skipClick = useRef(false);

  useEffect(() => { // restore saved position
    try { const raw = localStorage.getItem("ks:fab"); if (raw) { const p = JSON.parse(raw); if (typeof p?.x === "number" && typeof p?.y === "number") { home.current = p; setPos(clampPos(p)); } } } catch {}
  }, []);
  useEffect(() => { const r = () => { if (home.current) setPos(clampPos(home.current)); }; window.addEventListener("resize", r); return () => window.removeEventListener("resize", r); }, []);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, []);
  useEffect(() => { const el = list.current; if (el) el.scrollTop = el.scrollHeight; }, [msgs, open, busy, panel]);

  const place = useCallback(() => {
    const b = btn.current; if (!b) return;
    const r = b.getBoundingClientRect(); const vw = window.innerWidth, vh = window.innerHeight;
    const width = Math.min(vw - 16, 380);
    const above = r.top, below = vh - r.bottom; const up = above >= below;
    const height = Math.max(240, Math.min(540, vh * 0.72, (up ? above : below) - 20));
    const top = up ? Math.max(8, r.top - 12 - height) : Math.min(vh - height - 8, r.bottom + 12);
    const cx = r.left + r.width / 2;
    const left = Math.min(Math.max(8, cx - width / 2), vw - width - 8);
    setPanel({ left, top, width, height, origin: `${Math.round(cx - left)}px ${up ? "bottom" : "top"}` });
  }, []);
  useEffect(() => {
    if (!open) return; place();
    window.addEventListener("resize", place); return () => window.removeEventListener("resize", place);
  }, [open, pos, compare.length, place]);

  function onDown(e: React.PointerEvent<HTMLButtonElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, moved: false };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  }
  function onMove(e: React.PointerEvent<HTMLButtonElement>) {
    const d = drag.current; if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    if (!d.moved) { d.moved = true; setDragging(true); }
    const p = clampPos({ x: d.ox + dx, y: d.oy + dy }); home.current = p; setPos(p);
  }
  function onUp(e: React.PointerEvent<HTMLButtonElement>) {
    const d = drag.current; if (!d || d.id !== e.pointerId) return;
    drag.current = null; setDragging(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    if (d.moved) { skipClick.current = true; setTimeout(() => { skipClick.current = false; }, 0); try { if (home.current) localStorage.setItem("ks:fab", JSON.stringify(home.current)); } catch {} }
  }
  function onClick() { if (skipClick.current) return; setOpen((o) => !o); }

  async function send(text: string) {
    const t = text.trim(); if (!t || busy) return;
    const next: M[] = [...msgs, { role: "user", content: t }]; setMsgs(next); setInput(""); setBusy(true);
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next.slice(1) }) });
      const j = await r.json(); setMsgs([...next, { role: "assistant", content: j.reply || "Sorry, something went wrong." }]);
    } catch { setMsgs([...next, { role: "assistant", content: "Network problem. Please try again." }]); }
    setBusy(false);
  }
  const defaultPos = compare.length ? "right-4 bottom-[8.5rem] md:bottom-20" : "right-4 bottom-[4.75rem] md:bottom-4";
  return (<>
    <button ref={btn} type="button" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onClick={onClick}
      aria-expanded={open} aria-label={open ? "Close assistant" : "Open assistant (drag to move)"}
      style={pos ? { left: pos.x, top: pos.y } : undefined}
      className={`fixed z-40 grid h-14 w-14 shrink-0 touch-none select-none place-items-center rounded-full bg-ink text-white shadow-lg shadow-black/25 ring-2 ring-white/70 ${dragging ? "scale-105 cursor-grabbing" : "cursor-grab transition-transform hover:scale-105 active:scale-95"} ${pos ? "" : defaultPos}`}>
      <Ic d={open ? PATHS.close : PATHS.chat} className="h-6 w-6" /></button>
    {open && panel && <section aria-label="AyushPicks assistant" style={{ left: panel.left, top: panel.top, width: panel.width, height: panel.height, transformOrigin: panel.origin }}
      className="fixed z-40 flex animate-pop flex-col overflow-hidden rounded-2xl border border-line bg-bg shadow-2xl shadow-black/20">
      <header className="flex items-center justify-between border-b border-line px-4 py-3"><div><h2 className="font-sans text-sm font-semibold">AyushPicks assistant</h2><p className="text-xs text-muted">Products, comparisons, how the site works</p></div>
        <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full hover:bg-s2"><Ic d={PATHS.close} className="h-4 w-4" /></button></header>
      <div ref={list} className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm" aria-live="polite">
        {msgs.map((m, i) => <div key={i} className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 ${m.role === "user" ? "ml-auto bg-accent text-white" : "bg-s2"}`}>{m.role === "assistant" ? <Rich text={m.content} /> : m.content}</div>)}
        {busy && <div className="w-fit rounded-2xl bg-s2 px-3 py-2 text-muted">Thinking…</div>}
        {msgs.length === 1 && <div className="flex flex-wrap gap-2 pt-1">{HINTS.map((h) => <button key={h} onClick={() => send(h)} className="chip transition hover:border-accent hover:text-ink">{h}</button>)}</div>}</div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-line p-3">
        <div className="flex gap-2"><input value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} aria-label="Your message" placeholder="Ask about a product…" className="field" />
          <button disabled={busy || !input.trim()} className="btn-primary shrink-0 disabled:opacity-50">Send</button></div>
        <p className="mt-2 text-[11px] text-muted">AI can make mistakes. Check the retailer for the final price.</p></form>
    </section>}
  </>);
}
