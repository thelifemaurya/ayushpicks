import Link from 'next/link'
import { ArrowRight, BadgeCheck, ChevronRight, Search, ShieldCheck, Sparkles, Star, Zap } from 'lucide-react'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'
import { Header, Footer, ProductCard } from '@/components/site'
import CategoryRail from '@/components/category-rail'
import HomeSpotlight from '@/components/home-spotlight'

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
  const spotlightProducts = productList.filter((p: any) => p.featured).slice(0, 4)
  const spotlightSlides = spotlightProducts.length ? spotlightProducts : productList.slice(0, 4)

  return (
    <main>
      <div className="container">
        <Header />

        <CategoryRail categories={categoryList} />

        <section className="homeHero ayushpicksHero">
          <div className="heroCopy">
            <div className="eyebrow"><Sparkles size={13}/> INDEPENDENT PRODUCT DISCOVERY</div>
            <h1>Find what’s worth it.<br/><span>Skip the noise.</span></h1>
            <p>AYUSHPICKS helps you discover, understand, compare, and choose products before you buy — with useful details, honest context, and clear recommendations.</p>
            <div className="heroActions">
              <Link className="btn primary big" href="/products">Explore picks <ArrowRight size={17}/></Link>
              <Link className="textlink" href="/about">How we choose <ChevronRight size={15}/></Link>
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
                  <span>AYUSHPICKS PICK</span>
                  <strong>{featuredProduct.name}</strong>
                  {featuredProduct.price != null && <b>₹{Number(featuredProduct.price).toLocaleString('en-IN')}</b>}
                </div>
              </div>
            ) : (
              <div className="heroFallback">
                <span>AYUSHPICKS</span>
                <small>DISCOVER · UNDERSTAND · COMPARE · DECIDE</small>
              </div>
            )}
          </div>
        </section>

        <section className="homeSearchSection" aria-label="Search AYUSHPICKS">
          <form className="homeSearch" action="/products" role="search">
            <Search size={20} aria-hidden="true" />
            <input name="q" placeholder="Search products, brands or categories…" aria-label="Search products, brands or categories" />
            <button aria-label="Search"><ArrowRight size={18}/></button>
          </form>
          <div className="homeSearchHint">Try “gaming”, “beauty”, “under ₹1000”, or a product name.</div>
        </section>

        <section className="spotlightIntro">
          <div>
            <span className="sectionKicker">AYUSHPICKS SPOTLIGHT</span>
            <h2>Worth seeing right now.</h2>
            <p>Selected picks, rotating automatically. Swipe, tap, or use the controls to explore.</p>
          </div>
          <span className="spotlightIntroMeta">01—04 · AUTO</span>
        </section>
        <HomeSpotlight slides={spotlightSlides} />

        <section className="quickStrip premiumQuickStrip" aria-label="How AYUSHPICKS works">
          <div><Search size={19}/><b>01 · Discover</b><span>Find products worth a closer look.</span></div>
          <div><BadgeCheck size={19}/><b>02 · Compare</b><span>Understand the differences and trade-offs.</span></div>
          <div><ShieldCheck size={19}/><b>03 · Decide</b><span>Use clear pros, limitations and context.</span></div>
          <div><Zap size={19}/><b>04 · Buy</b><span>Leave AYUSHPICKS with confidence, not guesswork.</span></div>
        </section>

        <section className="section categorySection">
          <div className="sectionhead">
            <div><span className="sectionKicker">EXPLORE</span><h2>What are you looking for?</h2><div className="muted small">Start with a category and discover what’s worth considering.</div></div>
            <Link className="viewAll" href="/products">All products <ChevronRight size={15}/></Link>
          </div>
          <CategoryRail categories={categoryList} />
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
            <span className="sectionKicker">THE AYUSHPICKS STANDARD</span>
            <h2>Not everything needs a recommendation.</h2>
            <p>We’re building AYUSHPICKS around a simple idea: fewer, better-informed choices. Every pick should give you enough context to decide whether it belongs on your shortlist.</p>
          </div>
          <div className="editorialPoints">
            <div><b>Useful, not noisy.</b><span>Details with a reason to exist.</span></div>
            <div><b>Clear, not complicated.</b><span>Pros, limitations and who it suits.</span></div>
            <div><b>Decision-first.</b><span>Research before you reach the store.</span></div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  )
}
