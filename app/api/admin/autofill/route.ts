import { NextResponse } from "next/server";
import { ADMIN_EMAIL, SB_KEY, SB_URL } from "@/lib/site";
import { AUTOFILL_SYSTEM, callClaude, cleanDraft, hasAI } from "@/lib/ai";
import { extract, safeFetch } from "@/lib/safe-fetch";
export const runtime = "nodejs";
export const maxDuration = 60;
const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });
export async function POST(req: Request) {
  // Only the signed-in admin may use this endpoint (token is verified with Supabase Auth).
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || !SB_URL) return fail("Not signed in", 401);
  const who = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_KEY, authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  if (!who?.email || String(who.email).toLowerCase() !== ADMIN_EMAIL) return fail("Not allowed", 403);

  let url = ""; try { url = String((await req.json()).url || "").trim(); new URL(url); } catch { return fail("Paste a valid product link"); }
  let page: Awaited<ReturnType<typeof safeFetch>> = null; let pageErr = "";
  try { page = await safeFetch(url); } catch (e) { pageErr = (e as Error).message; }
  if (pageErr) return fail(pageErr);
  const info = page ? extract(page.html) : null;
  const basic = info ? cleanDraft({ name: info.ogTitle || info.title, description: info.ogDescription, image_url: info.ogImage, price: info.price }) : null;
  if (!hasAI()) {
    if (!basic?.name) return fail("Could not read this page and the AI key is not set. Add ANTHROPIC_API_KEY in Vercel or fill the form by hand.");
    return NextResponse.json({ ok: true, source: "basic", note: "AI key not set: filled only the title, image, short text and price found on the page.", data: basic, sourceUrl: url });
  }
  try {
    const content = `Product link: ${url}\n\n` + (info ? `PAGE DATA (untrusted):\ntitle: ${info.title}\nog:title: ${info.ogTitle}\nog:image: ${info.ogImage}\ndescription: ${info.ogDescription}\nprice meta: ${info.price}\nJSON-LD: ${info.ld.join("\n")}\ntext: ${info.text}` : "The page could not be fetched directly (many stores block bots). Use web search to find this exact product's details.");
    const out = await callClaude({ system: AUTOFILL_SYSTEM, messages: [{ role: "user", content }], maxTokens: 2500, webSearch: true });
    const s = out.indexOf("{"), e = out.lastIndexOf("}");
    if (s < 0 || e < s) throw new Error("bad-json");
    const d = cleanDraft(JSON.parse(out.slice(s, e + 1)));
    if (!d.image_url && basic?.image_url) d.image_url = basic.image_url;
    if (!d.name) throw new Error("empty");
    return NextResponse.json({ ok: true, source: "ai", note: "Draft created by AI from the page. Check every line before publishing.", data: d, sourceUrl: url });
  } catch (err) {
    if (basic?.name) return NextResponse.json({ ok: true, source: "basic", note: "AI step failed, so only basic details were filled.", data: basic, sourceUrl: url });
    return fail(`Auto-fill failed (${(err as Error).message}). Try again or fill by hand.`, 502);
  }
}
