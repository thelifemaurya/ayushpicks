import Link from 'next/link'
import { PageShell } from '@/components/site'
import { supabaseServer } from '@/lib/supabase-server'
import { editorialGuides } from '@/lib/editorial-guides'

export const revalidate = 300

export default async function Guides() {
  const { data: articles } = await supabaseServer().from('articles').select('*').eq('published', true).order('created_at', { ascending: false })
  const databaseGuides = (articles || []).map((a: any) => ({ slug: a.slug, title: a.title, excerpt: a.excerpt || 'A practical guide from AYUSHPICKS.', updatedAt: a.updated_at || a.created_at }))
  const databaseSlugs = new Set(databaseGuides.map((a: any) => a.slug))
  const guides = [...editorialGuides.filter((g) => !databaseSlugs.has(g.slug)), ...databaseGuides]

  return <PageShell title="Buying guides for smarter choices." kicker="GUIDES">
    <section className="articleIntro"><p className="lead">Useful buying advice built to help you compare products, understand trade-offs and make decisions with more context.</p><p className="muted">We publish practical editorial guidance alongside our product picks. Prices and retailer terms are checked separately at the point of purchase.</p></section>
    <section className="articleGrid">{guides.map((a: any) => <article className="articleCard" key={a.slug}><div className="tag">GUIDE</div><h2>{a.title}</h2><p className="muted">{a.excerpt}</p><Link className="textlink" href={`/guides/${a.slug}`}>Read guide →</Link></article>)}</section>
    <section className="copySection"><div className="eyebrow">OUR APPROACH</div><h2>Research first. Recommendation second.</h2><p>AYUSHPICKS is not a retailer. We curate product information, add editorial context and explain the trade-offs that can matter before a purchase. Our guides are written to be useful even when you are not ready to buy anything.</p><p>Some retailer links may be affiliate links. That commercial relationship does not replace the need for clear, useful and independently written information.</p></section>
  </PageShell>
}
