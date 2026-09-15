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
      <Link className="brand" href="/" aria-label="AYUSHPICKS home">AYUSH<span>PICKS</span></Link>
      <form className="navSearch" action="/products" role="search">
        <Search size={16}/><input name="q" aria-label="Search products" placeholder="Search products, brands & categories" />
      </form>
      <nav className="navlinks" aria-label="Primary navigation"><Link href="/">Home</Link><Link href="/products">Discover</Link><Link href="/guides">Guides</Link><Link href="/about">About</Link></nav>
      <div className="navActions"><Link className="btn navExplore" href="/products">Explore</Link></div>
    </header>
  )
}

export function Footer() {
  return <footer className="sitefooter"><div className="footergrid"><div><Link className="brand" href="/">AYUSH<span>PICKS</span></Link><p className="muted small">Useful products. Better decisions.</p></div><div><strong>Explore</strong><Link href="/">Home</Link><Link href="/products">Products</Link><Link href="/guides">Guides</Link></div><div><strong>Company</strong><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/editorial-policy">Editorial policy</Link></div><div><strong>Legal</strong><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookie-policy">Cookie policy</Link><Link href="/affiliate-disclosure">Affiliate disclosure</Link></div></div><div className="footerbottom">© {new Date().getFullYear()} AYUSHPICKS. Product discovery and recommendations by Ayush Mourya.</div></footer>
}

export function ProductCard({ product }: { product: Product }) {
  const price = product.price != null ? `₹${Number(product.price).toLocaleString('en-IN')}` : null
  const oldPrice = product.old_price != null ? `₹${Number(product.old_price).toLocaleString('en-IN')}` : null
  return <article className="card productcard"><Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}><div className="image">{product.image_url ? <img src={product.image_url} alt={product.name} loading="lazy" referrerPolicy="no-referrer"/> : <span>No image</span>}</div><div className="cardbody"><div className="tag">{product.store || 'Store'}</div><h3>{product.name}</h3>{product.short_description&&<p className="muted small line2">{product.short_description}</p>}<div className="priceLine">{price&&<strong className="price">{price}</strong>}{oldPrice&&<span className="oldprice">{oldPrice}</span>}</div><div className="picklink">View pick <span>→</span></div></div></Link></article>
}

export function PageShell({ title, kicker, children }: { title: string; kicker?: string; children: React.ReactNode }) {
  return <><div className="container"><Header/><section className="pagehero">{kicker&&<div className="eyebrow">{kicker}</div>}<h1>{title}</h1></section>{children}<Footer/></div></>
}
