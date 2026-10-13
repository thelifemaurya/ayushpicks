import { timingSafeEqual } from "node:crypto";
import { ADMIN_EMAIL, SB_KEY, SB_URL } from "@/lib/site";
export async function isAdmin(req: Request): Promise<boolean> {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || !SB_URL) return false;
  const who = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_KEY, authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  return !!who?.email && String(who.email).toLowerCase() === ADMIN_EMAIL;
}
// Vercel Cron sends "Authorization: Bearer $CRON_SECRET". Refuses everything if the secret is not configured.
export function isCron(req: Request): boolean {
  const s = process.env.CRON_SECRET; if (!s || s.length < 16) return false;
  const got = Buffer.from(req.headers.get("authorization") || ""); const want = Buffer.from(`Bearer ${s}`);
  return got.length === want.length && timingSafeEqual(got, want);
}
