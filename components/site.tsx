import Link from 'next/link'
import { ArrowUpRight, Home, Menu, Search, Sparkles, Compass, BookOpen } from 'lucide-react'

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

function Brand() {
  return <span aria-hidden="true" style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontWeight: 800, fontSize: 21, letterSpacing: '-0.06em', whiteSpace: 'nowrap', lineHeight: 1 }}><span style={{ color: 'var(--text)' }}>AYUSH</span><span style={{ color: 'var(--accent)' }}>PICKS</span></span>
}

export function Header() {
  return (
    <header className="nav">
      <details className="mobileMenu">
        <summary aria-label="Open navigation menu"><Menu size={20}/></summary>
        <div className="mobileMenuPanel">
          <div className="mobileMenuTitle"><span>AYUSHPICKS</span><small>Explore the site</small></div>
          <form className="mobileSearch" action="/products" role="search">
            <Search size={16}/><input name="q" aria-label="Search products" placeholder="Search products…" />
          </form>
          <Link href="/">Home <ArrowUpRight size={14}/></Link>
          <Link href="/products">Discover <ArrowUpRight size={14}/></Link>
          <Link href="/guides">Guides <ArrowUpRight size={14}/></Link>
          <Link href="/about">About <ArrowUpRight size={14}/></Link>
        </div>
      </details>
      <Link className="brand" href="/" aria-label="AYUSHPICKS home"><Brand /></Link>
      <form className="navSearch" action="/products" role="search">
        <Search size={16} aria-hidden="true" />
        <input name="q" aria-label="Search products" placeholder="Search products, brands & categories" />
      </form>
      <nav className="navlinks" aria-label="Primary navigation">
        <Link href="/products">Discover</Link>
        <Link href="/guides">Guides</Link>
        <Link href="/about">About</Link>
      </nav>
      <div className="navActions">
        <Link className="btn navExplore" href="/products">Explore <ArrowUpRight size={15}/></Link>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="sitefooter">
      <div className="footergrid">
        <div className="footerBrand">
          <Link className="brand" href="/"><Brand /></Link>
          <p className="muted small">Discover better. Decide smarter.</p>
          <p className="muted small">Independent product discovery for everyday buying decisions.</p>
        </div>
        <div><strong>Explore</strong><Link href="/">Home</Link><Link href="/products">Discover</Link><Link href="/guides">Guides</Link></div>
        <div><strong>Company</strong><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/editorial-policy">Editorial policy</Link><a href="https://www.instagram.com/ayushpicks" target="_blank" rel="noopener noreferrer">Instagram</a></div>
        <div><strong>Legal</strong><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookie-policy">Cookie policy</Link><Link href="/affiliate-disclosure">Affiliate disclosure</Link></div>
      </div>
      <div className="footerbottom">© {new Date().getFullYear()} AYUSHPICKS. Product discovery and recommendations by Ayush Mourya.</div>
      <nav className="mobileBottomNav" aria-label="Mobile navigation">
        <Link href="/" className="mobileBottomItem"><Home size={18}/><span>Home</span></Link>
        <Link href="/products" className="mobileBottomItem"><Search size={18}/><span>Search</span></Link>
        <Link href="/products" className="mobileBottomItem"><Compass size={18}/><span>Picks</span></Link>
        <Link href="/guides" className="mobileBottomItem"><BookOpen size={18}/><span>Guides</span></Link>
      </nav>
    </footer>
  )
}

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const price = product.price != null ? `₹${Number(product.price).toLocaleString('en-IN')}` : null
  const oldPrice = product.old_price != null ? `₹${Number(product.old_price).toLocaleString('en-IN')}` : null
  return (
    <article className={`card productcard ${compact ? 'compactProductCard' : ''}`}>
      <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
        <div className="image productImage">
          {product.image_url ? <img src={product.image_url} alt={product.name} loading="lazy" referrerPolicy="no-referrer" /> : <span>No image</span>}
          {product.featured && <span className="productBadge"><Sparkles size={10}/> AYUSHPICKS PICK</span>}
        </div>
        <div className="cardbody">
          <div className="tag">{product.store || 'Worth considering'}</div>
          <h3>{product.name}</h3>
          {product.short_description && <p className="muted small line2 productDesc">{product.short_description}</p>}
          <div className="priceLine">{price && <strong className="price">{price}</strong>}{oldPrice && <span className="oldprice">{oldPrice}</span>}</div>
          <div className="picklink">See why we picked it <ArrowUpRight size={13}/></div>
        </div>
      </Link>
    </article>
  )
}

export function PageShell({ title, kicker, children, compactHero = false }: { title: string; kicker?: string; children: React.ReactNode; compactHero?: boolean }) {
  return (
    <>
      <div className="container">
        <Header />
        {(kicker || title) && (
          <section className={compactHero ? "pagehero productPageHero" : "pagehero"} style={compactHero ? { paddingTop: 18, paddingBottom: 8 } : undefined}>
            {kicker && <div className="eyebrow">{kicker}</div>}
            {title && <h1 style={compactHero ? { fontSize: 'clamp(38px, 5vw, 58px)', marginTop: 14, marginBottom: 10 } : undefined}>{title}</h1>}
          </section>
        )}
        {children}
        <Footer />
      </div>
    </>
  )
}
