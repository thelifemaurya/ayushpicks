import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES, clip, discountPct, slugify } from "@/lib/data";
import { getProducts } from "@/lib/products";
import { EmptyState, Price, ProductGrid, ProductImage, Rating } from "@/components/ui";
import { SearchBox } from "@/components/Navbar";
import { RevealSection } from "@/components/Reveal";
import { INSTAGRAM, SITE, SHORT_DESC } from "@/lib/site";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
export const metadata: Metadata = {
  title: { absolute: "AyushPicks — Discover, Compare & Decide on Products Worth Buying" },
  description: "AyushPicks (Ayush Picks) helps you discover useful products, understand what they do, compare prices across stores and decide what's worth buying. It never sells, it only guides. Follow @ayushpicks on Instagram.",
  alternates: { canonical: "/" },
  openGraph: { title: "AyushPicks — Discover, Compare & Decide on Products Worth Buying", description: SHORT_DESC, url: "/", type: "website", siteName: "AyushPicks", locale: "en_IN" },
};
const EXAMPLES = ["Best earbuds for gaming", "Useful student products", "Desk setup essentials"];
const STEPS = [["Discover", "Find products relevant to what you need."], ["Understand", "See what they actually offer."], ["Compare", "Evaluate alternatives side by side."], ["Decide", "Understand the strengths and limitations."], ["Buy", "Visit the retailer that sells it."]];
const EMOJI: Record<string, string> = { "Tech & Gadgets": "💻", Gaming: "🎮", Audio: "🎧", "Beauty & Skincare": "🧴", Fashion: "👕", Lifestyle: "🌿", "Home & Room": "🛋️", "Student Essentials": "🎒", Travel: "🧳", "Useful Finds": "✨" };
const H = ({ t, s, href }: { t: string; s?: string; href?: string }) => (<div className="mb-6 flex items-end justify-between gap-4"><div><h2 className="text-2xl font-semibold tracking-tight">{t}</h2>{s && <p className="mt-1 text-sm text-muted">{s}</p>}</div>{href && <Link href={href} className="shrink-0 text-sm text-muted hover:text-ink">View all →</Link>}</div>);
export default async function Home() {
  const all = await getProducts();
  const picks = all.filter((p) => p.badge === "AyushPicks Pick");
  const hero = picks.find((p) => p.images.length) ?? all.find((p) => p.images.length) ?? picks[0] ?? all[0];
  const top = [...picks, ...all.filter((p) => p.badge !== "AyushPicks Pick")].slice(0, 8);
  const highlights = (picks.length >= 2 ? picks : all).filter((p) => p.id !== hero?.id).slice(0, 3);
  const deals = all.filter((p) => discountPct(p) > 0).sort((a, b) => discountPct(b) - discountPct(a)).slice(0, 3);
  const count = (c: string) => all.filter((p) => p.category === c).length;
  const catImg = (c: string) => all.find((p) => p.category === c && p.images[0])?.images[0];
  return (<>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "WebPage", "@id": `${SITE}/#home`, url: SITE, name: "AyushPicks — Discover, Compare & Decide on Products Worth Buying", isPartOf: { "@id": `${SITE}/#site` }, about: { "@id": `${SITE}/#org` }, inLanguage: "en-IN" }} />
    <section className="wrap pt-4 md:pt-6"><div className="marble relative overflow-hidden rounded-3xl border border-line">
      <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-8 p-6 md:grid-cols-2 md:p-12">
        <div>
          <p className="flex animate-rise items-center gap-3 font-sans text-[11px] font-medium uppercase tracking-[.18em] text-muted"><span className="h-px w-8 bg-gold" />AyushPicks · Honest picks · Real pros &amp; limitations</p>
          <h1 className="mt-3 max-w-md animate-rise [animation-delay:80ms] text-3xl font-semibold leading-[1.1] tracking-tight md:text-5xl"><span className="sr-only">AyushPicks: </span>Discover products worth knowing.</h1>
          <p className="mt-4 max-w-md animate-rise text-muted [animation-delay:160ms]">Explore useful products, understand what they do, compare your options, and decide what&apos;s actually worth buying.</p>
          <div className="mt-6 flex animate-rise flex-wrap gap-3 [animation-delay:240ms]"><Link href="/search" className="btn-primary">Explore Products</Link><Link href="/compare" className="btn-ghost">Compare Products</Link></div>
          <div className="mt-6 w-full min-w-0 max-w-md animate-rise [animation-delay:320ms]"><SearchBox big /><div className="mt-3 flex flex-wrap gap-2">{EXAMPLES.map((e) => <Link key={e} href={`/search?q=${encodeURIComponent(e)}`} className="chip bg-white/60 transition hover:border-accent hover:text-ink">{e}</Link>)}</div></div>
        </div>
        {hero ? (<Link href={`/product/${hero.slug}`} className="group block animate-rise rounded-2xl bg-white/80 p-3 shadow-soft [animation-delay:200ms] ring-1 ring-line transition hover:shadow-lg">
          <ProductImage p={hero} priority className="aspect-[4/3] rounded-xl bg-s1" />
          <div className="flex items-end justify-between gap-3 p-3"><div className="min-w-0"><span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">Featured pick</span>
            <h2 className="mt-2 truncate text-base font-semibold">{hero.name}</h2><div className="mt-1"><Rating value={hero.rating} count={hero.reviewCount} /></div></div>
            <div className="shrink-0 text-right"><Price p={hero} /><p className="mt-1 text-xs text-muted transition group-hover:text-ink">See why →</p></div></div></Link>)
          : <div className="hidden rounded-2xl border border-dashed border-line bg-white/50 p-10 text-center text-sm text-muted md:block">Your first featured pick will appear here.</div>}
      </div></div>
      <ul className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-3"><li>✓ Limitations always shown</li><li>✓ Discounts only from real listed prices</li><li>✓ We never sell. You buy from the retailer</li></ul>
    </section>
    <RevealSection id="categories" className="wrap pt-14"><H t="Browse categories" />
      <div className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-3 pt-1 sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-10">{CATEGORIES.map((c) => { const img = catImg(c), n = count(c);
        return (<Link key={c} href={`/category/${slugify(c)}`} className="group flex min-w-[84px] shrink-0 flex-col items-center text-center">
          <span className="grid aspect-square h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-s2 text-3xl transition-colors group-hover:border-accent">
            {img ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={img} alt="" width={80} height={80} loading="lazy" decoding="async" className="h-full w-full object-contain p-2" /> : <span aria-hidden>{EMOJI[c] ?? "✨"}</span>}</span>
          <span className="mt-2 text-xs font-medium leading-tight">{c}</span><span className="text-[11px] text-muted">{n} {n === 1 ? "item" : "items"}</span></Link>); })}</div></RevealSection>
    {highlights.length > 0 && <RevealSection className="wrap pt-14"><H t="Editor's highlights" s="Products we think deserve a closer look." />
      <div className="grid gap-4 md:grid-cols-3">{highlights.map((p) => (<Link key={p.id} href={`/product/${p.slug}`} className="group overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="marble"><ProductImage p={p} className="aspect-[16/10] bg-transparent transition-transform duration-300 group-hover:scale-[1.03]" /></div>
        <div className="p-5">{p.badge && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">{p.badge}</span>}
          <h3 className="mt-2 text-lg font-semibold leading-snug">{p.name}</h3><p className="mt-1 line-clamp-2 text-sm text-muted">{clip(p.verdict.summary || p.description, 110)}</p>
          <div className="mt-3 flex items-center justify-between"><Price p={p} /><span className="text-sm font-medium text-accent">View pick →</span></div></div></Link>))}</div></RevealSection>}
    <RevealSection className="wrap pt-14"><H t="Top picks" s="Useful products, without the noise." href="/search" />
      {top.length ? <ProductGrid items={top} cols={4} /> : <EmptyState title="Products are on the way" text="We're adding the first products now. Check back soon." />}</RevealSection>
    {deals.length > 0 && <RevealSection className="wrap pt-14"><div className="marble overflow-hidden rounded-3xl border border-line"><div className="grid gap-6 p-6 md:grid-cols-[1fr_1.5fr] md:items-center md:p-10">
      <div><span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">Up to {discountPct(deals[0])}% off</span>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Price drops worth a look</h2>
        <p className="mt-2 text-sm text-muted">Discounts are measured against the original price listed when we checked. Prices change often, so confirm on the retailer&apos;s page.</p></div>
      <div className="grid gap-3 sm:grid-cols-3">{deals.map((p) => (<Link key={p.id} href={`/product/${p.slug}`} className="rounded-2xl bg-white/80 p-3 ring-1 ring-line transition hover:shadow-md"><ProductImage p={p} className="aspect-square rounded-xl bg-s1" />
        <p className="mt-2 line-clamp-1 text-sm font-medium">{p.name}</p><div className="mt-1"><Price p={p} /></div></Link>))}</div></div></div></RevealSection>}
    <RevealSection className="wrap pt-14"><div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-line bg-s1 p-6 sm:flex-row sm:items-center md:p-8">
      <div><h2 className="text-xl font-semibold">Not sure which one to pick?</h2><p className="mt-1 text-sm text-muted">Put up to three products side by side and see what actually differs.</p></div>
      <Link href="/compare" className="btn-primary shrink-0">Compare Products</Link></div></RevealSection>
    <RevealSection className="wrap pt-14"><div className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-ink p-7 text-white sm:flex-row sm:items-center"><div><h2 className="text-xl font-semibold">Follow @ayushpicks</h2><p className="mt-1 text-sm text-white/70">New picks, honest takes and product finds on Instagram.</p></div>
      <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer me" className="btn shrink-0 bg-white text-ink hover:bg-white/90">Open Instagram ↗</a></div></RevealSection>
    <Faq />
    <RevealSection id="how" className="wrap pt-14"><H t="How AyushPicks works" s="We don't sell anything. We help you decide, then you buy from the retailer." />
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{STEPS.map(([t, d], i) => <li key={t} className="border-t border-line pt-3"><span className="text-xs text-accent">0{i + 1}</span><h3 className="mt-1 font-medium">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></li>)}</ol></RevealSection>
  </>);
}
