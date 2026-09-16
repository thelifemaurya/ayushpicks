import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PageShell } from '@/components/site'
import { supabaseServer } from '@/lib/supabase-server'
import { SITE_URL } from '@/lib/config'
import { editorialGuides, getEditorialGuide } from '@/lib/editorial-guides'

export const revalidate = 300

async function getGuide(slug: string) {
  const staticGuide = getEditorialGuide(slug)
  if (staticGuide) return { kind: 'static' as const, guide: staticGuide }
  const { data: article } = await supabaseServer().from('articles').select('*').eq('slug', slug).eq('published', true).maybeSingle()
  return article ? { kind: 'database' as const, guide: article } : null
}

export async function generateStaticParams() {
  return editorialGuides.map((guide) => ({ slug: guide.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const result = await getGuide(slug)
  if (!result) return {}
  const title = result.guide.title
  const description = result.guide.excerpt || 'A practical buying guide from AYUSHPICKS.'
  return { title, description, alternates: { canonical: `${SITE_URL}/guides/${slug}` }, openGraph: { title: `${title} | AYUSHPICKS`, description, url: `${SITE_URL}/guides/${slug}`, type: 'article' } }
}

export default async function GuideDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await getGuide(slug)
  if (!result) notFound()
  const guide: any = result.guide
  const sections = result.kind === 'static' ? guide.sections : (guide.content || '').split(/\n\s*\n/).map((p: string) => ({ heading: '', paragraphs: [p] }))

  return <PageShell title={guide.title} kicker="BUYING GUIDE">
    <article className="article">
      <p className="lead">{guide.excerpt}</p>
      {result.kind === 'static' ? sections.map((section: any) => <section className="articleSection" key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((p: string, i: number) => <p key={i}>{p}</p>)}</section>) : <div className="articlebody">{sections.map((section: any, i: number) => <p key={i}>{section.paragraphs[0]}</p>)}</div>}
      <aside className="articleNote"><strong>Editorial note</strong><p>Product prices, availability and retailer policies can change. Always verify transaction details at the retailer before purchasing.</p></aside>
      <Link className="textlink" href="/products">Explore product picks →</Link>
    </article>
  </PageShell>
}
