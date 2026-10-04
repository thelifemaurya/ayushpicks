import Link from 'next/link'
import { ArrowRight, SlidersHorizontal, Sparkles } from 'lucide-react'
import { ProductCard, PageShell } from '@/components/site'
import ProductFilters from '@/components/product-filters-v2'
import { supabaseServer } from '@/lib/supabase-server'

export const revalidate = 60

export default async function Products({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string }> }) {
  const params = searchParams ? await searchParams : {}
  const q = (params.q || '').trim()
  const category = (params.category || '').trim()
  const sb = supabaseServer()

  let query = sb.from('products').select('*').eq('published', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (q) query = query.ilike('name', `%${q}%`)
  if (category) query = query.eq('category_id', category)

  const [{ data: products }, { data: categories }] = await Promise.all([
    query,
    sb.from('categories').select('*').order('name'),
  ])

  const productList = products || []
  const categoryList = categories || []
  const selectedCategory = categoryList.find((c: any) => c.id === category)
  const heading = selectedCategory ? selectedCategory.name : q ? `Results for “${q}”` : 'Discover products'

  return (
    <PageShell title="" kicker="" compactHero>
      <section className="discoveryHero">
        <div className="discoveryHeroTop">
          <div>
            <div className="eyebrow"><Sparkles size={13}/> KSNATIC DISCOVERY</div>
            <h1>{heading}</h1>
            <p>
              {selectedCategory
                ? `A focused selection of ${selectedCategory.name.toLowerCase()} products worth considering.`
                : q
                  ? 'Products matching your search, curated for a clearer buying decision.'
                  : 'A focused collection of products worth understanding before you buy.'}
            </p>
          </div>
          <div className="discoveryMeta">
            <strong>{productList.length}</strong>
            <span>{productList.length === 1 ? 'pick' : 'picks'} available</span>
          </div>
        </div>

        <div className="discoverySearchRow">
          <form className="discoverySearch" action="/products">
            <input name="q" defaultValue={q} placeholder="Search products, brands or categories…" aria-label="Search products" />
            <button className="btn primary"><span>Search</span><ArrowRight size={15}/></button>
          </form>
          <div className="discoveryHint"><SlidersHorizontal size={14}/> Filter by category below</div>
        </div>
      </section>

      <section className="discoveryControls" aria-label="Discovery filters">
        <ProductFilters categories={categoryList} />
      </section>

      <section className="discoveryResults">
        <div className="resultsHead">
          <div>
            <span className="sectionKicker">{selectedCategory ? 'CATEGORY PICKS' : q ? 'SEARCH RESULTS' : 'CURATED PICKS'}</span>
            <h2>{productList.length ? 'Worth a closer look' : 'Nothing matched this time'}</h2>
          </div>
          <span className="resultsCount">{productList.length} {productList.length === 1 ? 'result' : 'results'}</span>
        </div>

        {productList.length ? (
          <div className="grid productgrid">
            {productList.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="empty discoveryEmpty">
            <h3>No matching picks yet.</h3>
            <p>Try a broader search or explore another category.</p>
            <Link className="btn" href="/products">View all picks</Link>
          </div>
        )}
      </section>

      <section className="discoveryNote">
        <div>
          <span className="sectionKicker">HOW KSNATIC WORKS</span>
          <h2>Discovery first. Decision second.</h2>
          <p>We keep the shortlist focused so you can understand what a product does, where it fits, and what to consider before leaving KSNATIC to buy.</p>
        </div>
        <Link className="textlink" href="/about">Learn about our approach <ArrowRight size={15}/></Link>
      </section>
    </PageShell>
  )
}
