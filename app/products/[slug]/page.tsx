import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, Check, X, ArrowRight } from 'lucide-react'
import { PageShell } from '@/components/site'
import AffiliateDisclosure from '@/components/affiliate-disclosure'
import { supabaseServer } from '@/lib/supabase-server'
import { SITE_URL } from '@/lib/config'

export const revalidate = 60

async function getProduct(slug: string) {
  const { data } = await supabaseServer().from('products').select('*').eq('slug', slug).eq('published', true).maybeSingle()
  return data
}

function asList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string' && x.trim().length > 0) : []
}

function asSpecs(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.short_description || 'A practical product pick from KSNATIC.',
    alternates: { canonical: SITE_URL + '/products/' + product.slug },
    openGraph: { title: product.name + ' | KSNATIC', description: product.short_description || 'A practical product pick from KSNATIC.', url: SITE_URL + '/products/' + product.slug, images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'KSNATIC — Products worth considering' }] },
    twitter: { card: 'summary_large_image', title: product.name + ' | KSNATIC', description: product.short_description || 'A practical product pick from KSNATIC.', images: ['/opengraph-image'] },
  }
}

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const pros = asList(product.pros)
  const cons = asList(product.cons)
  const bestFor = asList(product.best_for)
  const notFor = asList(product.not_for)
  const productSpecs = asSpecs(product.specifications)
  const score = typeof product.score === 'number' ? product.score : null
  const hasEditorial = Boolean(product.why_picked) || pros.length > 0 || cons.length > 0 || bestFor.length > 0 || notFor.length > 0

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image_url ? [product.image_url] : undefined,
    description: product.short_description || undefined,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    url: SITE_URL + '/products/' + product.slug,
    ...(score !== null ? { review: { '@type': 'Review', reviewRating: { '@type': 'Rating', ratingValue: score, bestRating: 10, worstRating: 1 }, author: { '@type': 'Organization', name: 'KSNATIC' } } } : {}),
  }

  const displayTitle = product.name.length > 82 ? product.name.slice(0, 82).replace(/\s+\S*$/, '') + '…' : product.name\n\n  return <PageShell title={displayTitle} kicker={product.store || 'PRODUCT PICK'} compactHero>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <Link href="/products" className="backhome">← Back to discovery</Link>

    <section className="detail">
      <div className="detailmedia">
        <div className="detailimage">{product.image_url ? <img src={product.image_url} alt={product.name} referrerPolicy="no-referrer"/> : <span>No image available</span>}</div>
      </div>
      <div className="detailinfo">
        <div className="tag">{product.store || 'Store'}</div>
        {score !== null && <div className="productScoreHero"><strong>{score}/10</strong><span>KSNATIC score</span></div>}
        {product.price != null && <div className="detailprice">₹{Number(product.price).toLocaleString('en-IN')}{product.old_price != null && <del>₹{Number(product.old_price).toLocaleString('en-IN')}</del>}</div>}
        <p className="lead">{product.short_description || 'A product selected for its practical value, features and overall usefulness.'}</p>
        {product.why_picked && <div className="editorial"><div className="eyebrow">WHY WE PICKED IT</div><p>{product.why_picked}</p></div>}
        <Link className="btn primary buy" href={'/go/' + product.slug}>Check latest price <ArrowUpRight size={17}/></Link>
        <p className="muted micro">Prices and availability can change on the retailer’s website.</p>
      </div>
    </section>

    {hasEditorial && <section className="copySection"><div className="eyebrow">AT A GLANCE</div><h2>Look at the trade-offs, not just the price.</h2><p>There is no single product that is right for everyone. Use the details below alongside your own requirements, then verify the current retailer listing before purchasing.</p></section>}

    {(pros.length > 0 || cons.length > 0) && <section className="detailgrid">
      {pros.length > 0 && <div className="infoPanel"><h2>Pros</h2>{pros.map((x, i) => <div className="bullet" key={i}><Check size={16}/><span>{x}</span></div>)}</div>}
      {cons.length > 0 && <div className="infoPanel"><h2>Limitations</h2>{cons.map((x, i) => <div className="bullet negativeBullet" key={i}><X size={16}/><span>{x}</span></div>)}</div>}
    </section>}

    {(bestFor.length > 0 || notFor.length > 0) && <section className="audienceGrid">
      {bestFor.length > 0 && <div className="infoPanel"><div className="eyebrow">WHO IT’S FOR</div><h2>Ideal if…</h2>{bestFor.map((x, i) => <div className="bullet" key={i}><Check size={16}/><span>{x}</span></div>)}</div>}
      {notFor.length > 0 && <div className="infoPanel"><div className="eyebrow">NOT IDEAL IF</div><h2>Consider another option if…</h2>{notFor.map((x, i) => <div className="bullet negativeBullet" key={i}><X size={16}/><span>{x}</span></div>)}</div>}
    </section>}

    {Object.keys(productSpecs).length > 0 && <section className="specSection">
      <div className="eyebrow">SPECIFICATIONS</div><h2>Key details</h2>
      <div className="specTable">{Object.entries(productSpecs).slice(0, 20).map(([key, value]) => <div className="specRow" key={key}><span>{key.replace(/[_-]/g, ' ')}</span><strong>{String(value)}</strong></div>)}</div>
    </section>}

    <section className="copySection">
      <div className="eyebrow">FINAL CHECK</div><h2>Make the final decision for your needs.</h2>
      <p>KSNATIC provides product discovery and editorial context; it does not process the purchase. Check the retailer’s current price, availability, seller information, warranty and return terms before completing an order.</p>
      <Link className="textlink" href="/products">Explore more picks <ArrowRight size={15}/></Link>
    </section>

    <section className="researchNext"><div className="eyebrow">CONTINUE YOUR RESEARCH</div><h2>Buying better is usually about the comparison.</h2><p className="muted">Before purchasing, use KSNATIC’s practical guides to check the trade-offs, retailer details and questions worth asking.</p><div className="researchLinks"><Link href="/guides/how-to-compare-products-online">How to compare products <ArrowRight size={14}/></Link><Link href="/guides/how-to-build-a-useful-product-shortlist">Build a useful shortlist <ArrowRight size={14}/></Link><Link href="/guides/how-to-choose-products-worth-buying">Choose products worth buying <ArrowRight size={14}/></Link></div></section>\n\n    <AffiliateDisclosure />
  </PageShell>
}
