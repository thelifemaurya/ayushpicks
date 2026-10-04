import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, X, Trophy } from 'lucide-react'
import { PageShell } from '@/components/site'
import AffiliateDisclosure from '@/components/affiliate-disclosure'
import { supabaseServer } from '@/lib/supabase-server'
import { SITE_URL } from '@/lib/config'

export const revalidate = 60

async function getProducts(slugs: string[]) {
  const { data } = await supabaseServer().from('products').select('*').in('slug', slugs).eq('published', true)
  const rows = data || []
  return slugs.map((slug) => rows.find((product: any) => product.slug === slug)).filter(Boolean)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const parts = slug.split('-vs-').map(decodeURIComponent)
  if (parts.length !== 2) return { title: 'Compare products' }
  const products = await getProducts(parts)
  if (products.length !== 2) return { title: 'Compare products | KSNATIC' }
  const title = products[0].name + ' vs ' + products[1].name
  return { title, description: 'Compare ' + products[0].name + ' and ' + products[1].name + ' side by side on KSNATIC.', alternates: { canonical: SITE_URL + '/compare/' + slug } }
}

function score(product: any) {
  return typeof product.score === 'number' ? product.score : null
}

function specs(product: any) {
  const value = product.specifications
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const parts = slug.split('-vs-').map(decodeURIComponent)
  if (parts.length !== 2) notFound()
  const products = await getProducts(parts)
  if (products.length !== 2) notFound()

  const [a, b] = products
  const sa = score(a)
  const sb = score(b)
  const winner = sa !== null && sb !== null && sa !== sb ? (sa > sb ? a : b) : null
  const allKeys = Array.from(new Set([...Object.keys(specs(a)), ...Object.keys(specs(b))])).slice(0, 12)

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [a, b].map((p: any, index: number) => ({
      '@type': 'ListItem', position: index + 1, name: p.name, url: SITE_URL + '/products/' + p.slug
    }))
  }

  return (
    <PageShell title={a.name + ' vs ' + b.name} kicker="COMPARISON">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <section className="compareIntro">
        <p className="lead">A side-by-side look at the differences that matter before you decide which product belongs on your shortlist.</p>
        <Link className="textlink" href="/products">Back to discovery <ArrowRight size={15}/></Link>
      </section>

      <section className="compareProducts" aria-label="Products being compared">
        {[a, b].map((p: any) => (
          <article className="compareProduct" key={p.id}>
            <div className="compareThumb">
              {p.image_url ? <Image src={p.image_url} alt="" fill sizes="(max-width: 650px) 42vw, 220px" style={{objectFit:'contain'}} unoptimized /> : <span>KSNATIC</span>}
            </div>
            <div className="compareProductInfo">
              <span className="tag">{p.store || 'Product'}</span>
              <h2>{p.name}</h2>
              {score(p) !== null && <div className="compareScore"><strong>{score(p)}/10</strong><span>KSNATIC score</span></div>}
              {p.price != null && <b className="comparePrice">₹{Number(p.price).toLocaleString('en-IN')}</b>}
              <Link className="btn primary" href={'/go/' + p.slug}>Check price <ArrowRight size={15}/></Link>
            </div>
          </article>
        ))}
      </section>

      <section className="compareMatrix">
        <div className="compareMatrixHead"><span>FEATURE MATRIX</span><strong>Where they differ</strong></div>
        <div className="compareRow compareRowHead"><span>Metric</span><b>{a.name}</b><b>{b.name}</b></div>
        <div className="compareRow"><span>KSNATIC score</span><strong>{sa !== null ? sa + '/10' : '—'}</strong><strong>{sb !== null ? sb + '/10' : '—'}</strong></div>
        {allKeys.map((key) => (
          <div className="compareRow" key={key}><span>{key.replace(/[_-]/g, ' ')}</span><strong>{String(specs(a)[key] ?? '—')}</strong><strong>{String(specs(b)[key] ?? '—')}</strong></div>
        ))}
      </section>

      <section className="compareTradeoffs">
        {[a, b].map((p: any) => (
          <article className="compareTradeoff" key={p.id}>
            <h2>{p.name}</h2>
            <div className="tradeoffList">
              {(Array.isArray(p.pros) ? p.pros.slice(0,4) : []).map((x: string, i: number) => <div key={'p-' + i}><Check size={15}/><span>{x}</span></div>)}
              {(Array.isArray(p.cons) ? p.cons.slice(0,3) : []).map((x: string, i: number) => <div key={'c-' + i} className="negative"><X size={15}/><span>{x}</span></div>)}
            </div>
          </article>
        ))}
      </section>

      <section className="compareVerdict">
        <div className="verdictIcon"><Trophy size={20}/></div>
        <div>
          <span className="sectionKicker">OVERALL VERDICT</span>
          <h2>{winner ? winner.name + ' leads on KSNATIC’s current score.' : 'Choose based on the trade-offs that matter to you.'}</h2>
          <p>{winner ? 'That does not make it universally better. Check the feature matrix and limitations above, then verify current price, seller, warranty and availability at the retailer.' : 'KSNATIC avoids declaring a universal winner when the available evidence does not support one.'}</p>
        </div>
      </section>

      <AffiliateDisclosure />
    </PageShell>
  )
}
