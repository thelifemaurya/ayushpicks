import { lookup } from "node:dns/promises";
import net from "node:net";
function privateIp(ip: string): boolean {
  if (net.isIPv6(ip)) { const l = ip.toLowerCase(); return l === "::1" || l === "::" || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80") || l.startsWith("::ffff:"); }
  const [a, b] = ip.split(".").map(Number);
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}
async function check(u: URL) {
  if (u.protocol !== "https:") throw new Error("Only https:// links are supported");
  if (u.port && u.port !== "443") throw new Error("Unsupported port");
  const h = u.hostname; if (h === "localhost" || net.isIP(h)) throw new Error("Link not allowed");
  const addrs = await lookup(h, { all: true }); if (!addrs.length || addrs.some((a) => privateIp(a.address))) throw new Error("Link not allowed");
}
// Fetches a public https page. Blocks private networks, follows at most 4 redirects, caps size and time.
export async function safeFetch(url: string): Promise<{ finalUrl: string; html: string } | null> {
  let u = new URL(url);
  for (let i = 0; i < 5; i++) {
    await check(u);
    const r = await fetch(u, { redirect: "manual", signal: AbortSignal.timeout(12000), headers: { "user-agent": "Mozilla/5.0 (compatible; AyushPicksBot/1.0)", accept: "text/html,application/xhtml+xml", "accept-language": "en-IN,en;q=0.9" } });
    if (r.status >= 300 && r.status < 400 && r.headers.get("location")) { u = new URL(r.headers.get("location")!, u); continue; }
    if (!r.ok) return null;
    const ct = r.headers.get("content-type") || ""; if (!ct.includes("html")) return null;
    const buf = await r.arrayBuffer(); if (buf.byteLength > 2_500_000) return null;
    return { finalUrl: u.toString(), html: new TextDecoder("utf-8").decode(buf) };
  }
  return null;
}
const meta = (html: string, key: string) => { const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, "i")) || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, "i")); return m ? m[1].replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"') : ""; };
export function extract(html: string) {
  const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "").trim();
  const ld: string[] = []; for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) ld.push(m[1].trim().slice(0, 4000));
  const text = html.replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().slice(0, 9000);
  return { title, ogTitle: meta(html, "og:title"), ogImage: meta(html, "og:image"), ogDescription: meta(html, "og:description") || meta(html, "description"), price: meta(html, "product:price:amount") || meta(html, "og:price:amount"), ld: ld.slice(0, 3), text };
}
// Returns the final HTTP status of a public https link (0 = could not be checked). Used by the admin link check.
export async function probe(url: string): Promise<number> {
  try {
    let u = new URL(url);
    for (let i = 0; i < 5; i++) {
      await check(u);
      const r = await fetch(u, { redirect: "manual", signal: AbortSignal.timeout(9000), headers: { "user-agent": "Mozilla/5.0 (compatible; AyushPicksBot/1.0)", accept: "text/html", "accept-language": "en-IN,en;q=0.9" } });
      if (r.status >= 300 && r.status < 400 && r.headers.get("location")) { u = new URL(r.headers.get("location")!, u); continue; }
      await r.body?.cancel().catch(() => {});
      return r.status;
    }
  } catch {}
  return 0;
}
