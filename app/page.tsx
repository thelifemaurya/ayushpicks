import Link from 'next/link'
import { ArrowRight, Sparkles, ShieldCheck, Search } from 'lucide-react'
import { supabaseServer } from '@/lib/supabase-server'

export default async function Home() {
  const supabase = supabaseServer()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('published', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <main>
      <div className="container">
        <nav className="nav">
          <Link className="brand" href="/">AYUSH<span>PICKS</span></Link>
          <div className="navlinks">
            <Link href="/products">Discover</Link>
            <Link href="/guides">Guides</Link>
            <Link href="/about">About</Link>
          </div>
          <Link className="btn" href="/products"><Search size={16}/> Explore</Link>
        </nav>

        <section className="hero">
          <span className="eyebrow"><Sparkles size={13}/> Curated product discovery</span>
          <h1>Better picks.<br/><span style={{color:'var(--accent)'}}>Less scrolling.</span></h1>
          <p>AYUSHPICKS helps you discover useful products, compare the details that matter, and decide what is actually worth your money.</p>
          <div className="actions">
            <Link className="btn primary" href="/products">Explore picks <ArrowRight size={16}/></Link>
            <Link className="btn" href="/guides">Read buying guides</Link>
          </div>
        </section>

        <section className="section">
          <div className="sectionhead">
            <div><h2>Latest picks</h2><div className="muted small">Hand-picked products, not endless listings.</div></div>
            <Link className="muted small" href="/products">View all →</Link>
          </div>
          {products?.length ? (
            <div className="grid">
              {products.map((p) => (
                <Link className="card" key={p.id} href={`/products/${p.slug}`}>
                  <div className="image">{p.image_url ? <img src={p.image_url} alt={p.name}/> : 'Product image'}</div>
                  <div className="cardbody"><div className="tag">{p.store}</div><h3>{p.name}</h3>{p.price != null && <div className="price">₹{Number(p.price).toLocaleString('en-IN')}</div>}<div className="muted small">Why we picked it →</div></div>
                </Link>
              ))}
            </div>
          ) : <div className="empty">Our first picks are being prepared. Check back soon.</div>}
        </section>

        <section className="section">
          <div className="grid">
            <div className="adminpanel"><ShieldCheck size={20}/><h3>Curated, not crowded</h3><p className="muted small">We focus on products worth considering instead of filling pages with random listings.</p></div>
            <div className="adminpanel"><Search size={20}/><h3>Useful details</h3><p className="muted small">Prices, pros, cons and our reason for picking each product.</p></div>
            <div className="adminpanel"><Sparkles size={20}/><h3>Editorial guides</h3><p className="muted small">Practical buying guides designed to help you choose confidently.</p></div>
            <div className="adminpanel"><h3>Stores</h3><p className="muted small">Amazon first, with room for more stores and affiliate partners later.</p></div>
          </div>
        </section>

        <footer className="footer">© {new Date().getFullYear()} AYUSHPICKS · Product discovery by Ayush Mourya · Affiliate links may earn us a commission.</footer>
      </div>
    </main>
  )
}
