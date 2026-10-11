"use client";
import { useEffect, useState } from "react";
// Short launch animation, shown ONLY when AyushPicks is opened as an installed app (not in the normal browser), once per app session.
export function AppSplash() {
  const [phase, setPhase] = useState<"off" | "in" | "out">("off");
  useEffect(() => {
    let standalone = false;
    try { standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true; } catch {}
    if (!standalone) return;
    try { if (sessionStorage.getItem("ap:splash")) return; sessionStorage.setItem("ap:splash", "1"); } catch {}
    setPhase("in");
    const a = setTimeout(() => setPhase("out"), 1150), b = setTimeout(() => setPhase("off"), 1650);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  if (phase === "off") return null;
  return (<div aria-hidden className={`app-splash ${phase === "out" ? "app-splash-out" : ""}`}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/brand/wordmark.png" alt="" width={900} height={381} className="app-splash-mark" />
  </div>);
}
