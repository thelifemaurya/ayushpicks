"use client";
import { useEffect, useState } from "react";
type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
// Chrome only offers its own install prompt now and then. This keeps an "Install app" button handy whenever the browser says the site is installable.
export function InstallButton() {
  const [ev, setEv] = useState<BIP | null>(null);
  useEffect(() => {
    const on = (e: Event) => { e.preventDefault(); setEv(e as BIP); };
    const done = () => setEv(null);
    window.addEventListener("beforeinstallprompt", on); window.addEventListener("appinstalled", done);
    return () => { window.removeEventListener("beforeinstallprompt", on); window.removeEventListener("appinstalled", done); };
  }, []);
  if (!ev) return null;
  return <button type="button" onClick={async () => { try { await ev.prompt(); await ev.userChoice; } catch {} setEv(null); }} className="mt-3 block text-sm text-accent hover:underline">Install the AyushPicks app ↓</button>;
}
