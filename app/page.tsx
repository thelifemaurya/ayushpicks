import Link from 'next/link'
import { ArrowRight, BadgeCheck, ChevronRight, Search, Sparkles, Star, Zap } from 'lucide-react'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'
import { Header, Footer, ProductCard } from '@/components/site'

export default async function Home({ searchParams }: { searchParams?: Promise<{ code?: string; next?: string }> }) {
  const params = searchParams ? await searchParams : {}
  if (params.code) redirect(`/auth/callback?code=${encodeURIComponent(params.code)}&next=/admin`)

  const supabase = supabaseServer()
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('published', true).order('featured', { ascending: false }).order('created_at', { ascending: false }).limit(8),
    supabase.from('categories').select('*').order('name'),
  ])

  const categoryList = categories || []
  const beauty = categoryList.find((c: any) => /beauty/i.test(c.name))
  const clothing = categoryList.find((c: any) => /cloth|fashion|apparel/i.test(c.name))
  const priorityCategories = [beauty, clothing].filter(Boolean)
  const otherCategories = categoryList.filter((c: any) => !priorityCategories.some((p: any) => p.id === c.id))

  const categoryProducts = async (categoryId?: string) => categoryId ? (await supabase.from('products').select('*').eq('published', true).eq('category_id', categoryId).order('featured', { ascending: false }).order('created_at', { ascending: false }).limit(8)).data || [] : []
  const [beautyProducts, clothingProducts] = await Promise.all([categoryProducts(beauty?.id), categoryProducts(clothing?.id)])

  return (
    <main>
      <div className="container">
        <Header />

        <div className="categoryBar" aria-label="Product categories">
          <Link className="categoryActive" href="/products">All</Link>
          {priorityCategories.map((category: any) => <Link key={category.id} href={`/products?category=${encodeURIComponent(category.id)}`}>{category.name}</Link>)}
          {otherCategories.map((category: any) => <Link key={category.id} href={`/products?category=${encodeURIComponent(category.id)}`}>{category.name}</Link>)}
        </div>

        <section className="homeHero" style={{ minHeight: 365, paddingTop: 38, paddingBottom: 34 }}>
          <div className="heroCopy">
            <div className="eyebrow"><Sparkles size={13}/> Curated picks, without the noise</div>
            <h1 style={{ fontSize: 'clamp(46px, 6vw, 70px)' }}>Find things<br/><span>worth buying.</span></h1>
            <p>Discover useful beauty, clothing and everyday products, with the details that actually help you choose.</p>
            <div className="heroActions"><Link className="btn primary big" href="/products">Explore picks <ArrowRight size={17}/></Link><Link className="textlink" href="/guides">Read our guides <ChevronRight size={15}/></Link></div>
            <div className="heroTrust"><span><BadgeCheck size={16}/> Hand-picked</span><span><Zap size={16}/> Useful details</span><span><Star size={15}/> Honest pros & cons</span></div>
          </div>
          <div className="heroVisual" style={{ minHeight: 280 }}>
            <div className="floatingCard cardA"><span className="miniIcon">★</span><div><b>Better picks</b><small>Less endless scrolling</small></div></div>
            <div className="visualOrb" style={{ width: 175, height: 175 }}><span style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontWeight: 800, fontSize: 27, letterSpacing: '-0.065em' }}><span style={{ color: 'var(--text)' }}>AYUSH</span><span style={{ color: 'var(--accent)' }}>PICKS</span></span></div>
            <div className="floatingCard cardB"><small>Why we picked it</small><strong>Details that actually matter.</strong></div>
          </div>
        </section>

        <section className="quickStrip" aria-label="How AYUSHPICKS works">
          <div><Search size={19}/><b>Discover</b><span>Find products worth considering</span></div>
          <div><BadgeCheck size={19}/><b>Compare</b><span>Pros, cons & useful details</span></div>
          <div><Zap size={19}/><b>Decide</b><span>Then shop from the store</span></div>
        </section>

        {(beauty || clothing) && <section className="section" style={{ paddingTop: 42, paddingBottom: 10 }}>
          <div className="sectionhead"><div><span className="sectionKicker">SHOP BY CATEGORY</span><h2>Beauty & clothing</h2><div className="muted small">Quick picks first. Open any product for the full details.</div></div></div>
          {beauty && <div style={{ marginBottom: 28 }}><div className="sectionhead" style={{ marginBottom: 12 }}><h3 style={{ margin: 0, fontSize: 20 }}>{beauty.name}</h3><Link className="viewAll" href={`/products?category=${encodeURIComponent(beauty.id)}`}>See all <ChevronRight size={15}/></Link></div>{beautyProducts.length ? <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'thin' }}>{beautyProducts.map((p: any) => <ProductCard key={p.id} product={p} compact />)}</div> : <div className="empty">Beauty picks are coming soon.</div>}</div>}
          {clothing && <div><div className="sectionhead" style={{ marginBottom: 12 }}><h3 style={{ margin: 0, fontSize: 20 }}>{clothing.name}</h3><Link className="viewAll" href={`/products?category=${encodeURIComponent(clothing.id)}`}>See all <ChevronRight size={15}/></Link></div>{clothingProducts.length ? <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'thin' }}>{clothingProducts.map((p: any) => <ProductCard key={p.id} product={p} compact />)}</div> : <div className="empty">Clothing picks are coming soon.</div>}</div>}
        </section>}

        <section className="section picksSection" style={{ paddingTop: 34 }}>
          <div className="sectionhead"><div><span className="sectionKicker">JUST IN</span><h2>Latest picks</h2><div className="muted small">A clean shortlist of products worth your attention.</div></div><Link className="viewAll" href="/products">View all <ChevronRight size={16}/></Link></div>
          {products?.length ? <div className="grid productgrid">{products.map((p: any) => <ProductCard key={p.id} product={p}/>)}</div> : <div className="empty">Our first picks are being prepared. Check back soon.</div>}
        </section>

        <section className="guideBanner"><div><span className="sectionKicker">BUYING GUIDES</span><h2>Don’t just buy.<br/>Know what you’re buying.</h2><p>Simple guides for choosing products without getting lost in hundreds of listings.</p></div><Link className="btn primary" href="/guides">Explore guides <ArrowRight size={16}/></Link></section>
        <Footer />
      </div>
    </main>
  )
}
