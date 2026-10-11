"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
// Fades and lifts content into view once as it scrolls on screen. Skipped for people who prefer reduced motion.
function useSeen() {
  const ref = useRef<HTMLElement | null>(null); const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return { ref, on };
}
const base = "reveal transition-[opacity,transform] duration-700 ease-[cubic-bezier(.2,.7,.2,1)]";
const state = (on: boolean) => (on ? "opacity-100" : "translate-y-5 opacity-0");
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, on } = useSeen();
  return <div ref={ref as React.RefObject<HTMLDivElement>} style={{ transitionDelay: `${delay}ms` }} className={`${base} ${state(on)} ${className}`}>{children}</div>;
}
export function RevealSection({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  const { ref, on } = useSeen();
  return <section id={id} ref={ref as React.RefObject<HTMLElement>} className={`${base} ${state(on)} ${className}`}>{children}</section>;
}
