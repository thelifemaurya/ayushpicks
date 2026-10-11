# AyushPicks
Next.js 15 · React 19 · TypeScript · Tailwind · Supabase. `npm i && npm run dev`.

Env (.env.local): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SITE_URL,
optional NEXT_PUBLIC_GSC_VERIFICATION (Google Search Console token), NEXT_PUBLIC_CONTACT_EMAIL.

- Public site reads published rows from `ayushpicks_products` (cached 60s).
- Admin: /admin (noindex, email-locked in the UI and by Supabase RLS to the admin email).
- Product images: uploaded in admin → compressed WebP in the `ksnatic-product-images` bucket.

Optional server env: ANTHROPIC_API_KEY (enables admin AI auto-fill and the site chatbot; without it the chatbot falls back to product search), ANTHROPIC_MODEL.
Table: ayushpicks_products. Site name: AyushPicks.
