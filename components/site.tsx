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

export function Header() {
  return (
    <header className="nav">
      <Link className="brand" href="/" aria-label="AYUSHPICKS home">
        <img className="brandLogo" src="/ayushpicks-logo-transparent.png" alt="AYUSHPICKS" style={{ display: 'block', width: 132, height: 38, objectFit: 'contain', objectPosition: 'left center' }} />
      </Link>
      <form className="navSearch" action="/products" role="search">
        <Search size={16}/><input name="q" aria-label="Search products" placeholder="Search products, brands & categories" />
      </form>
      <nav className="navlinks" aria-label="Primary navigation"><Link href="/">Home</Link><Link href="/products">Discover</Link><Link href="/guides">Guides</Link><Link href="/about">About</Link></nav>
      <div className="navActions"><Link className="btn navExplore" href="/products">Explore</Link></div>
    </header>
  )
}

export function Footer() {
  return <footer className="sitefooter"><div className="footergrid"><div><Link className="brand" href="/"><img className="brandLogo" src="/ayushpicks-logo-transparent.png" alt="AYUSHPICKS" style={{ display: 'block', width: 132, height: 38, objectFit: 'contain', objectPosition: 'left center' }} /></Link><p className="muted small">Useful products. Better decisions.</p></div><div><strong>Explore</strong><Link href="/">Home</Link><Link href="/products">Products</Link><Link href="/guides">Guides</Link></div><div><strong>Company</strong><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/editorial-policy">Editorial policy</Link></div><div><strong>Legal</strong><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookie-policy">Cookie policy</Link><Link href="/affiliate-disclosure">Affiliate disclosure</Link></div></div><div className="footerbottom">© {new Date().getFullYear()} AYUSHPICKS. Product discovery and recommendations by Ayush Mourya.</div></footer>
}

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const price = product.price != null ? `₹${Number(product.price).toLocaleString('en-IN')}` : null
  const oldPrice = product.old_price != null ? `₹${Number(product.old_price).toLocaleString('en-IN')}` : null
  const compactImageStyle = compact ? { aspectRatio: '1.08 / 1', background: '#f5f6f8' } : undefined
  const compactBodyStyle = compact ? { padding: '11px 12px 12px' } : undefined
  const compactTitleStyle = compact ? { fontSize: 13, margin: '6px 0', lineHeight: 1.35 } : undefined
  const compactDescriptionStyle = compact ? { fontSize: 11, minHeight: 0 } : undefined
  const compactPriceStyle = compact ? { fontSize: 15 } : undefined
  return <article className="card productcard"><Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}><div className="image" style={compactImageStyle}>{product.image_url ? <img src={product.image_url} alt={product.name} loading="lazy" referrerPolicy="no-referrer"/> : <span>No image</span>}</div><div className="cardbody" style={compactBodyStyle}><div className="tag">{product.store || 'Store'}</div><h3 style={compactTitleStyle}>{product.name}</h3>{product.short_description&&<p className="muted small line2" style={compactDescriptionStyle}>{product.short_description}</p>}<div className="priceLine" style={compact ? { marginTop: 8 } : undefined}>{price&&<strong className="price" style={compactPriceStyle}>{price}</strong>}{oldPrice&&<span className="oldprice">{oldPrice}</span>}</div><div className="picklink" style={compact ? { marginTop: 9, fontSize: 11 } : undefined}>View pick <span>→</span></div></div></Link></article>
}

export function PageShell({ title, kicker, children, compactHero = false }: { title: string; kicker?: string; children: React.ReactNode; compactHero?: boolean }) {
  return <><div className="container"><Header/><section className="pagehero" style={compactHero ? { paddingTop: 42, paddingBottom: 22 } : undefined}>{kicker&&<div className="eyebrow">{kicker}</div>}<h1 style={compactHero ? { fontSize: 'clamp(38px, 5vw, 58px)', marginTop: 14, marginBottom: 10 } : undefined}>{title}</h1></section>{children}<Footer/></div></>
}
