import Link from 'next/link'
import { PageShell } from '@/components/site'
import { supabaseServer } from '@/lib/supabase-server'

export const revalidate = 300

export default async function Guides() {
  const { data: articles } = await supabaseServer().from('articles').select('*').eq('published', true).order('created_at', { ascending: false })
  return <PageShell title="Buying guides for smarter choices." kicker="GUIDES"><section className="articleGrid">{(articles||[]).map((a:any)=><article className="articleCard" key={a.id}><div className="tag">GUIDE</div><h2>{a.title}</h2><p className="muted">{a.excerpt || 'A practical guide from AYUSHPICKS.'}</p><Link className="textlink" href={`/guides/${a.slug}`}>Read guide →</Link></article>)}{!articles?.length&&<div className="empty"><h3>Guides are coming soon.</h3><p>We are preparing practical buying content instead of publishing thin, auto-filled pages.</p></div>}</section></PageShell>
}
