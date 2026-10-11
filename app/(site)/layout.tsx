import { StoreProvider } from "@/lib/store";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CompareBar } from "@/components/ui";
import Link from "next/link";
import { Chatbot } from "@/components/Chatbot";
import { ListDrawer } from "@/components/ListDrawer";
import { BottomNav } from "@/components/BottomNav";
import { JsonLd } from "@/components/JsonLd";
import { getProducts } from "@/lib/products";
import { ALT_NAMES, INSTAGRAM, SHORT_DESC, SITE } from "@/lib/site";
export const revalidate = 60;
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const products = await getProducts();
  return (<StoreProvider products={products}>
    <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-accent focus:p-2 focus:text-white">Skip to content</a>
    <div className="border-b border-line bg-s2 px-4 py-1.5 text-center text-xs text-muted">We don&apos;t sell anything. Every “View at” link takes you to the retailer. <Link href="/about" className="underline">How it works</Link></div>
    <Navbar /><main id="main" className="min-h-[70vh]">{children}</main><Footer /><CompareBar /><Chatbot /><ListDrawer /><BottomNav />
    <JsonLd data={{ "@context": "https://schema.org", "@graph": [
      { "@type": "Organization", "@id": `${SITE}/#org`, name: "AyushPicks", alternateName: ALT_NAMES, url: SITE, sameAs: [INSTAGRAM], logo: { "@type": "ImageObject", url: `${SITE}/logo.png`, width: 512, height: 512 }, image: `${SITE}/opengraph-image`, description: SHORT_DESC, areaServed: "IN", knowsAbout: ["product recommendations", "price comparison", "consumer products"] },
      { "@type": "WebSite", "@id": `${SITE}/#site`, name: "AyushPicks", alternateName: ALT_NAMES, url: SITE, inLanguage: "en-IN", description: SHORT_DESC, publisher: { "@id": `${SITE}/#org` }, potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${SITE}/search?q={search_term_string}` }, "query-input": "required name=search_term_string" } }] }} />
  </StoreProvider>);
}
