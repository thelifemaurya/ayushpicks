// Google Trends "Trending now" public RSS feed (India). Used ONLY as a trend signal, never as product data.
export type Trend = { term: string; traffic: number };
export async function fetchTrends(): Promise<Trend[]> {
  const r = await fetch("https://trends.google.com/trending/rss?geo=IN", { signal: AbortSignal.timeout(12000), headers: { "user-agent": "AyushPicks/1.0 (+https://ayushpicks.vercel.app)" }, cache: "no-store" });
  if (!r.ok) throw new Error(`Trends ${r.status}`);
  const xml = await r.text(); const out: Trend[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const title = m[1].match(/<title>(?:<!\[CDATA\[)?([^<\]]+)/)?.[1]?.trim(); if (!title) continue;
    const t = m[1].match(/<ht:approx_traffic>([^<]+)/)?.[1] || "0";
    const n = parseInt(t.replace(/[^0-9]/g, ""), 10) * (/m/i.test(t) ? 1000000 : 1) || 0;
    out.push({ term: title, traffic: n });
  }
  return out;
}
// 0..100 interest from how many trending terms overlap the product's words.
export function trendSignal(text: string, trends: Trend[]): number {
  const words = new Set(text.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2));
  let best = 0;
  for (const t of trends) {
    const tw = t.term.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
    if (!tw.length) continue;
    const hit = tw.filter((w) => words.has(w)).length / tw.length;
    if (hit >= 0.6) best = Math.max(best, Math.min(100, 40 + Math.log10(Math.max(t.traffic, 1)) * 10));
  }
  return Math.round(best);
}
