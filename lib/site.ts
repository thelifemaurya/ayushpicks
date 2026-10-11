export const BRAND = "AyushPicks";
// Other ways people type the name. Used in metadata, schema and llms.txt so "ayushpicks", "ayush picks" and "Ayush Picks" all resolve to this site.
export const ALT_NAMES = ["Ayush Picks", "ayushpicks", "ayush picks", "Ayush Picks India"];
export const TAGLINE = "Discover, compare and decide on products worth buying";
export const INSTAGRAM = "https://www.instagram.com/ayushpicks";
export const INSTAGRAM_HANDLE = "@ayushpicks";
export const DEFAULT_SITE = "https://ayushpicks.vercel.app";
// The env value is ignored if it still points at an old project hostname, so canonicals never leak the wrong domain.
const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
export const SITE = fromEnv && !/ksnatic/i.test(fromEnv) ? fromEnv : DEFAULT_SITE;
export const SHORT_DESC = "AyushPicks (Ayush Picks) is an independent product discovery and recommendation site from India. It explains what products do, shows pros and limitations, compares prices across stores and links to the retailer. It does not sell anything.";
export const ADMIN_EMAIL = "ayushmourya590@gmail.com";
export const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const BUCKET = "ksnatic-product-images";
