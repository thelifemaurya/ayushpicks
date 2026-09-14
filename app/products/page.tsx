import Link from 'next/link'
import { ProductCard, PageShell } from '@/components/site'
import { supabaseServer } from '@/lib/supabase-server'

export const revalidate = 60

export default async function Products({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string }> }) {
  const params = searchParams ? await searchParams : {}
  const q = (params.q || '').trim()
  const category = (params.category || '').trim()
  const sb = supabaseServer()
  let query = sb.from('products').select('*').eq('published', true).order('featured', { ascending: false }).order('created_at', { ascending: false })
  if (q) query = query.ilike('name', `%${q}%`)
  if (category) query = query.eq('category_id', category)
  const [{ data: products }, { data: categories }] = await Promise.all([
    query,
    sb.from('categories').select('*').order('name'),
  ])
  return <PageShell title="Discover products worth your attention." kicker="THE PICKS">
    <section className="toolbar"><form className="searchbox" action="/products"><input name="q" defaultValue={q} placeholder="Search products…"/><button className="btn primary">Search</button></form><div className="chips"><Link className={!category?'chip active':'chip'} href="/products">All</Link>{(categories||[]).map((c:any)=><Link key={c.id} className={category===c.id?'chip active':'chip'} href={`/products?category=${c.id}`}>{c.name}</Link>)}</div></section>
    {products?.length ? <section className="grid productgrid">{products.map((p:any)=><ProductCard key={p.id} product={p}/>)}</section> : <div className="empty"><h3>No matching picks yet.</h3><p>Try another search or browse all categories.</p><Link className="btn" href="/products">Reset filters</Link></div>}
  </PageShell>
}
