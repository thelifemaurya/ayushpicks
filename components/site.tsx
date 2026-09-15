import Link from 'next/link'
import { Search } from 'lucide-react'

type Product = {
  id: string
  name: string
  slug: string
  store?: string | null
  image_url?: string | null
  price?: number | null
  old_price?: number | null
  short_description?: string | null
  featured?: boolean | null
}

function BrandText() {
  return <span aria-hidden="true" style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontWeight: 800, fontSize: 21, letterSpacing: '-0.06em', whiteSpace: 'nowrap', lineHeight: 1 }}><span style={{ color: 'var(--text)' }}>AYUSH</span><span style={{ color: 'var(--accent)' }}>PICKS</span></span>
}

export function Header() {
  return (
    <header className="nav">
      <Link className="brand" href="/" aria-label="AYUSHPICKS home"><BrandText /></Link>
      <form className="navSearch" action="/products" role="search">
        <Search size={16}/><input name="q" aria-label="Search products" placeholder="Search products, brands & categories" />
      </form>
      <nav className="navlinks" aria-label="Primary navigation"><Link href="/">Home</Link><Link href="/products">Discover</Link><Link href="/guides">Guides</Link><Link href="/about">About</Link></nav>
      <div className="navActions"><Link className="btn navExplore" href="/products">Explore</Link></div>
    </header>
  )
}

export function Footer() {
  return <footer className="sitefooter"><div className="footergrid"><div><Link className="brand" href="/"><BrandText /></Link><p className="muted small">Useful products. Better decisions.</p></div><div><strong>Explore</strong><Link href="/">Home</Link><Link href="/products">Products</Link><Link href="/guides">Guides</Link></div><div><strong>Company</strong><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/editorial-policy">Editorial policy</Link></div><div><strong>Legal</strong><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookie-policy">Cookie policy</Link><Link href="/affiliate-disclosure">Affiliate disclosure</Link></div></div><div className="footerbottom">© {new Date().getFullYear()} AYUSHPICKS. Product discovery and recommendations by Ayush Mourya.</div></footer>
}

export function ProductCard({ product }: { product: Product }) {
  const price = product.price != null ? `₹${Number(product.price).toLocaleString('en-IN')}` : null
  const oldPrice = product.old_price != null ? `₹${Number(product.old_price).toLocaleString('en-IN')}` : null
  return <article className="card productcard"><Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}><div className="image" style={{ aspectRatio: '1.06 / 1' }}>{product.image_url ? <img src={product.image_url} alt={product.name} loading="lazy" referrerPolicy="no-referrer" style={{ transform: 'scale(1.08)' }}/> : <span>No image</span>}</div><div className="cardbody" style={{ padding: '14px 14px 15px' }}><div className="tag">{product.store || 'Store'}</div><h3 style={{ marginTop: 6, marginBottom: 6 }}>{product.name}</h3>{product.short_description&&<p className="muted small line2" style={{ minHeight: 32, marginBottom: 0 }}>{product.short_description}</p>}<div className="priceLine" style={{ marginTop: 11 }}>{price&&<strong className="price">{price}</strong>}{oldPrice&&<span className="oldprice">{oldPrice}</span>}</div><div className="picklink" style={{ marginTop: 11 }}>View pick <span>→</span></div></div></Link></article>
}

export function PageShell({ title, kicker, children, compactHero = false }: { title: string; kicker?: string; children: React.ReactNode; compactHero?: boolean }) {
  return <><div className="container"><Header/><section className="pagehero" style={compactHero ? { paddingTop: 42, paddingBottom: 22 } : undefined}>{kicker&&<div className="eyebrow">{kicker}</div>}<h1 style={compactHero ? { fontSize: 'clamp(38px, 5vw, 58px)', marginTop: 14, marginBottom: 10 } : undefined}>{title}</h1></section>{children}<Footer/></div></>
}
