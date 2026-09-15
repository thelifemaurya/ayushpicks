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

  return (
    <PageShell title={heading} kicker="THE PICKS">
      <div className="productsIntro">
        <Link href="/" className="backhome">← Home</Link>
        <p>{selectedCategory ? `Our picks from ${selectedCategory.name}.` : q ? 'Showing products that match your search.' : 'Simple recommendations, useful details, and products worth considering.'}</p>
      </div>

      <section className="toolbar productsToolbar">
        <form className="searchbox" action="/products">
          <input name="q" defaultValue={q} placeholder="Search products…" aria-label="Search products" />
          <button className="btn primary">Search</button>
        </form>
        <ProductFilters categories={categories || []} />
      </section>

      {products?.length ? (
        <section className="grid productgrid">
          {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </section>
      ) : (
        <div className="empty">
          <h3>No matching picks yet.</h3>
          <p>Try another category or clear your filters.</p>
          <Link className="btn" href="/products">View all picks</Link>
        </div>
      )}

      <style jsx global>{`
        .productsIntro{margin:-8px 0 26px;display:flex;align-items:center;gap:14px}
        .productsIntro p{margin:0;color:var(--muted);font-size:13px;line-height:1.5}
        .backhome{font-size:12px;color:var(--muted);white-space:nowrap}
        .backhome:hover{color:var(--text)}
        .productsToolbar{gap:10px;margin-bottom:20px}
        .productsToolbar .searchbox{max-width:760px}
        .productsToolbar .searchbox input{padding:11px 13px;border-radius:10px}
        .productsToolbar .searchbox .btn{padding:10px 15px}
        .productsToolbar .filterbar{border-radius:10px;padding:9px 10px;background:transparent}
        .productsToolbar .filtertop{margin-bottom:6px}
        .productgrid{grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
        .productgrid .card{border-radius:13px;box-shadow:none}
        .productgrid .card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.08)}
        .productgrid .image{aspect-ratio:1.08/1;background:#f5f6f8}
        .productgrid .cardbody{padding:11px 12px 12px}
        .productgrid .card h3{font-size:13px;margin:6px 0;line-height:1.35}
        .productgrid .line2{font-size:11px;min-height:0}
        .productgrid .priceLine{margin-top:8px}
        .productgrid .price{font-size:15px}
        .productgrid .picklink{margin-top:9px;font-size:11px}
        @media(max-width:980px){.productgrid{grid-template-columns:repeat(3,minmax(0,1fr))}}
        @media(max-width:650px){
          .productsIntro{display:block;margin:-2px 0 20px}
          .productsIntro p{margin-top:7px}
          .productsToolbar{gap:9px}
          .productsToolbar .searchbox{width:100%}
          .productsToolbar .filterbar{padding:8px 0;border-left:0;border-right:0;border-radius:0}
          .productgrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
          .productgrid .image{aspect-ratio:1.08/1}
          .productgrid .cardbody{padding:10px}
        }
      `}</style>
    </PageShell>
  )
}
