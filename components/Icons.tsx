export const PATHS = {
  home: "M3 11l9-8 9 8M5 10v10h14V10",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
  heart: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  chat: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z",
  close: "M6 6l12 12M18 6L6 18",
  bag: "M5 8h14l-1 12H6L5 8zM9 8a3 3 0 016 0",
} as const;
export function Ic({ d, className = "h-5 w-5", fill = false }: { d: string; className?: string; fill?: boolean }) {
  return <svg viewBox="0 0 24 24" className={className} fill={fill ? "currentColor" : "none"} fillOpacity={fill ? 0.18 : undefined} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;
}
