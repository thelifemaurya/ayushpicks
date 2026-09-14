import Link from 'next/link'
import { ProductCard, PageShell } from '@/components/site'
import ProductFilters from '@/components/product-filters-v2'
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
  const [{ data: products }, { data: categories }] = await Promise.all([query, sb.from('categories').select('*').order('name')])
  const selectedCategory = (categories || []).find((c: any) => c.id === category)
  const heading = selectedCategory ? selectedCategory.name : q ? `Results for “${q}”` : 'Discover products worth your attention.'

  return <PageShell title={heading} kicker="THE PICKS">
    <div className="productsIntro"><Link href="/" className="backhome">← Home</Link><p>{selectedCategory ? `Our picks from ${selectedCategory.name}.` : q ? 'Showing products that match your search.' : 'Simple recommendations, useful details, and products worth considering.'}</p></div>
    <section className="toolbar">
      <form className="searchbox" action="/products"><input name="q" defaultValue={q} placeholder="Search products…" aria-label="Search products"/><button className="btn primary">Search</button></form>
      <ProductFilters categories={categories || []}/>
    </section>
    {products?.length ? <section className="grid productgrid">{products.map((p: any)=><ProductCard key={p.id} product={p}/>)}</section> : <div className="empty"><h3>No matching picks yet.</h3><p>Try another category or clear your filters.</p><Link className="btn" href="/products">View all picks</Link></div>}
  </PageShell>
}
