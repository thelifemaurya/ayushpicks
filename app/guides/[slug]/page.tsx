import { notFound } from 'next/navigation'
import { PageShell } from '@/components/site'
import { supabaseServer } from '@/lib/supabase-server'

export const revalidate = 300

export default async function GuideDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: article } = await supabaseServer().from('articles').select('*').eq('slug', slug).eq('published', true).maybeSingle()
  if (!article) notFound()
  return <PageShell title={article.title} kicker="BUYING GUIDE"><article className="article"><p className="lead">{article.excerpt}</p><div className="articlebody">{(article.content || '').split(/\n\s*\n/).map((p:string,i:number)=><p key={i}>{p}</p>)}</div></article></PageShell>
}
