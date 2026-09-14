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
  const heading = selectedCategory ? selectedCategory.name : q ? `Results for “${q}”` : 'Discover products'

  return <PageShell title={heading} kicker="THE PICKS">
    <div className="productsIntro"><Link href="/" className="backhome">← Home</Link><p>{selectedCategory ? `Our picks from ${selectedCategory.name}.` : q ? 'Showing products that match your search.' : 'Simple recommendations, useful details, and products worth considering.'}</p></div>
    <section className="toolbar">
      <form className="searchbox" action="/products"><input name="q" defaultValue={q} placeholder="Search products…" aria-label="Search products"/><button className="btn primary">Search</button></form>
      <ProductFilters categories={categories || []}/>
    </section>
    {products?.length ? <section className="grid productgrid">{products.map((p: any)=><ProductCard key={p.id} product={p}/>)}</section> : <div className="empty"><h3>No matching picks yet.</h3><p>Try another category or clear your filters.</p><Link className="btn" href="/products">View all picks</Link></div>}
    <style jsx global>{`
      @media (max-width:650px){
        .pagehero{padding:28px 0 20px}
        .pagehero h1{font-size:30px;line-height:1.08;letter-spacing:-.045em;margin:10px 0 12px}
        .productsIntro{margin-bottom:14px}
        .productsIntro p{font-size:12px;line-height:1.5}
        .backhome{font-size:12px}
        .toolbar{gap:10px;margin-bottom:18px}
        .searchbox{gap:7px}.searchbox input{padding:10px 11px;border-radius:9px;font-size:12px}.searchbox .btn{padding:10px 12px;border-radius:9px;font-size:12px}
        .productgrid{gap:9px}.card{border-radius:12px}.cardbody{padding:10px}.card h3{font-size:12px;margin:5px 0}.price{font-size:14px}.picklink{font-size:11px;margin-top:9px}.tag{font-size:9px}
      }
    `}</style>
  </PageShell>
}
