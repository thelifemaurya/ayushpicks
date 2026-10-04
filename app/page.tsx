import Link from 'next/link'
import { ArrowRight, BadgeCheck, ChevronRight, Search, ShieldCheck, Sparkles, Star, Zap } from 'lucide-react'
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

  const productList = products || []
  const categoryList = categories || []
  const featuredProduct = productList[0]
  const featuredCategories = categoryList.slice(0, 6)

  return (
    <main>
      <div className="container">
        <Header />

        <div className="categoryBar" aria-label="Product categories">
          <Link className="categoryActive" href="/products">All picks</Link>
          {categoryList.map((category: any) => (
            <Link key={category.id} href={`/products?category=${encodeURIComponent(category.id)}`}>{category.name}</Link>
          ))}
        </div>

        <section className="homeHero ksnaticHero">
          <div className="heroCopy">
            <div className="eyebrow"><Sparkles size={13}/> INDEPENDENT PRODUCT DISCOVERY</div>
            <h1>Find what’s worth it.<br/><span>Skip the noise.</span></h1>
            <p>KSNATIC helps you discover, understand, compare, and choose products before you buy — with useful details, honest context, and clear recommendations.</p>
            <div className="heroActions">
              <Link className="btn primary big" href="/products">Explore picks <ArrowRight size={17}/></Link>
              <Link className="textlink" href="/guides">How we choose <ChevronRight size={15}/></Link>
            </div>
            <div className="heroTrust">
              <span><BadgeCheck size={15}/> Curated picks</span>
              <span><ShieldCheck size={15}/> Practical details</span>
              <span><Star size={14}/> Pros & cons</span>
            </div>
          </div>

          <div className="heroVisual premiumHeroVisual">
            <div className="heroGridGlow" />
            <div className="heroVisualLabel">FEATURED DISCOVERY</div>
            {featuredProduct?.image_url ? (
              <div className="heroProductStage">
                <img src={featuredProduct.image_url} alt="" />
                <div className="heroProductInfo">
                  <span>KSNATIC PICK</span>
                  <strong>{featuredProduct.name}</strong>
                  {featuredProduct.price != null && <b>₹{Number(featuredProduct.price).toLocaleString('en-IN')}</b>}
                </div>
              </div>
            ) : (
              <div className="heroFallback">
                <span>KSNATIC</span>
                <small>DISCOVER · UNDERSTAND · COMPARE · DECIDE</small>
              </div>
            )}
          </div>
        </section>

        <section className="quickStrip premiumQuickStrip" aria-label="How KSNATIC works">
          <div><Search size={19}/><b>01 · Discover</b><span>Find products that deserve a closer look.</span></div>
          <div><BadgeCheck size={19}/><b>02 · Understand</b><span>See the details that actually matter.</span></div>
          <div><Zap size={19}/><b>03 · Decide</b><span>Compare your options, then shop with confidence.</span></div>
        </section>

        <section className="section categorySection">
          <div className="sectionhead">
            <div><span className="sectionKicker">EXPLORE</span><h2>What are you looking for?</h2><div className="muted small">Start with a category and discover what’s worth considering.</div></div>
            <Link className="viewAll" href="/products">All products <ChevronRight size={15}/></Link>
          </div>
          <div className="categoryTiles">
            {featuredCategories.map((category: any, index: number) => (
              <Link className="categoryTile" key={category.id} href={`/products?category=${encodeURIComponent(category.id)}`}>
                <span>0{index + 1}</span><strong>{category.name}</strong><ChevronRight size={16}/>
              </Link>
            ))}
          </div>
        </section>

        <section className="section picksSection">
          <div className="sectionhead">
            <div><span className="sectionKicker">CURATED NOW</span><h2>Worth a closer look</h2><div className="muted small">A focused shortlist — not an endless product dump.</div></div>
            <Link className="viewAll" href="/products">View all <ChevronRight size={16}/></Link>
          </div>
          {productList.length ? <div className="grid productgrid">{productList.map((p: any) => <ProductCard key={p.id} product={p}/>)}</div> : <div className="empty">Our first picks are being prepared. Check back soon.</div>}
        </section>

        <section className="editorialHome">
          <div>
            <span className="sectionKicker">THE KSNATIC STANDARD</span>
            <h2>Not everything needs a recommendation.</h2>
            <p>We’re building KSNATIC around a simple idea: fewer, better-informed choices. Every pick should give you enough context to decide whether it belongs on your shortlist.</p>
          </div>
          <div className="editorialPoints">
            <div><b>Useful, not noisy.</b><span>Details with a reason to exist.</span></div>
            <div><b>Clear, not complicated.</b><span>Pros, limitations and who it suits.</span></div>
            <div><b>Decision-first.</b><span>Research before you reach the store.</span></div>
          </div>
        </section>

        <section className="guideBanner">
          <div><span className="sectionKicker">BUYING GUIDES</span><h2>Don’t just buy.<br/>Know what you’re buying.</h2><p>Simple, practical guides for choosing products without getting lost in hundreds of listings.</p></div>
          <Link className="btn primary" href="/guides">Explore guides <ArrowRight size={16}/></Link>
        </section>

        <Footer />
      </div>
    </main>
  )
}
