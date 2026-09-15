import Link from 'next/link'
import { ArrowRight, BadgeCheck, ChevronRight, Search, Sparkles, Star, Zap } from 'lucide-react'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'
import { Header, Footer, ProductCard } from '@/components/site'

export default async function Home({ searchParams }: { searchParams?: Promise<{ code?: string; next?: string }> }) {
  const params = searchParams ? await searchParams : {}

  if (params.code) {
    const next = params.next === '/admin' ? '/admin' : '/admin'
    redirect(`/auth/callback?code=${encodeURIComponent(params.code)}&next=${encodeURIComponent(next)}`)
  }

  const supabase = supabaseServer()
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('products').select('*').eq('published', true)
      .order('featured', { ascending: false }).order('created_at', { ascending: false }).limit(8),
    supabase.from('categories').select('*').order('name'),
  ])

  const categoryList = categories || []
  const beauty = categoryList.find((c: any) => /beauty/i.test(c.name))
  const clothing = categoryList.find((c: any) => /cloth|fashion|apparel/i.test(c.name))

  return (
    <main>
      <div className="container">
        <Header />

        <div className="categoryBar" aria-label="Product categories">
          <Link className="categoryActive" href="/products">All</Link>
          {categoryList.map((category: any) => (
            <Link key={category.id} href={`/products?category=${encodeURIComponent(category.id)}`}>{category.name}</Link>
          ))}
        </div>

        <section className="homeHero" style={{ minHeight: 430, paddingTop: 48, paddingBottom: 38 }}>
          <div className="heroCopy">
            <div className="eyebrow"><Sparkles size={13}/> Curated picks, without the noise</div>
            <h1 style={{ fontSize: 'clamp(50px, 6.6vw, 76px)' }}>Find things<br/><span>worth buying.</span></h1>
            <p>Discover useful beauty, clothing and everyday products, with the details that actually help you choose.</p>
            <div className="heroActions"><Link className="btn primary big" href="/products">Explore picks <ArrowRight size={17}/></Link><Link className="textlink" href="/guides">Read our guides <ChevronRight size={15}/></Link></div>
            <div className="heroTrust"><span><BadgeCheck size={16}/> Hand-picked</span><span><Zap size={16}/> Useful details</span><span><Star size={15}/> Honest pros & cons</span></div>
          </div>
          <div className="heroVisual" style={{ minHeight: 320 }}>
            <div className="floatingCard cardA"><span className="miniIcon">★</span><div><b>Better picks</b><small>Less endless scrolling</small></div></div>
            <div className="visualOrb"><Sparkles size={42}/><b>AYUSH<br/><span>PICKS</span></b></div>
            <div className="floatingCard cardB"><small>Why we picked it</small><strong>Details that actually matter.</strong></div>
          </div>
        </section>

        <section className="quickStrip" aria-label="How AYUSHPICKS works">
          <div><Search size={19}/><b>Discover</b><span>Find products worth considering</span></div>
          <div><BadgeCheck size={19}/><b>Compare</b><span>Pros, cons & useful details</span></div>
          <div><Zap size={19}/><b>Decide</b><span>Then shop from the store</span></div>
        </section>

        {(beauty || clothing) && <section className="section" style={{ paddingTop: 48, paddingBottom: 22 }}>
          <div className="sectionhead"><div><span className="sectionKicker">SHOP BY CATEGORY</span><h2>Beauty & clothing</h2><div className="muted small">Start with what you actually want to find.</div></div></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14 }}>
            {beauty && <Link href={`/products?category=${encodeURIComponent(beauty.id)}`} className="categorySpotlight" style={{ minHeight: 120, padding: 22, border: '1px solid var(--line)', borderRadius: 18, background: 'linear-gradient(135deg,var(--panel),rgba(124,77,255,.08))', display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 15 }}><div><span className="sectionKicker">BEAUTY</span><h3 style={{ margin: 0, font: '700 24px Manrope', letterSpacing: '-.04em' }}>{beauty.name}</h3></div><ChevronRight size={20}/></Link>}
            {clothing && <Link href={`/products?category=${encodeURIComponent(clothing.id)}`} className="categorySpotlight" style={{ minHeight: 120, padding: 22, border: '1px solid var(--line)', borderRadius: 18, background: 'linear-gradient(135deg,var(--panel),rgba(79,111,240,.08))', display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 15 }}><div><span className="sectionKicker">CLOTHING</span><h3 style={{ margin: 0, font: '700 24px Manrope', letterSpacing: '-.04em' }}>{clothing.name}</h3></div><ChevronRight size={20}/></Link>}
          </div>
        </section>}

        <section className="section picksSection" style={{ paddingTop: 42 }}>
          <div className="sectionhead"><div><span className="sectionKicker">JUST IN</span><h2>Latest picks</h2><div className="muted small">A clean shortlist of products worth your attention.</div></div><Link className="viewAll" href="/products">View all <ChevronRight size={16}/></Link></div>
          {products?.length ? <div className="grid productgrid">{products.map((p: any) => <ProductCard key={p.id} product={p}/>)}</div> : <div className="empty">Our first picks are being prepared. Check back soon.</div>}
        </section>

        <section className="guideBanner"><div><span className="sectionKicker">BUYING GUIDES</span><h2>Don’t just buy.<br/>Know what you’re buying.</h2><p>Simple guides for choosing products without getting lost in hundreds of listings.</p></div><Link className="btn primary" href="/guides">Explore guides <ArrowRight size={16}/></Link></section>

        <Footer />
      </div>
    </main>
  )
}
