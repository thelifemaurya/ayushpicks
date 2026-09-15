import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, Check, X } from 'lucide-react'
import { PageShell } from '@/components/site'
import { supabaseServer } from '@/lib/supabase-server'
import { SITE_URL } from '@/lib/config'

export const revalidate = 60

async function getProduct(slug: string) {
  const sb = supabaseServer()
  const { data } = await sb.from('products').select('*').eq('slug', slug).eq('published', true).maybeSingle()
  return data
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.short_description || 'A practical product pick from AYUSHPICKS.',
    openGraph: {
      title: `${product.name} | AYUSHPICKS`,
      description: product.short_description || 'A practical product pick from AYUSHPICKS.',
      url: `${SITE_URL}/products/${product.slug}`,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'AYUSHPICKS — Products worth picking' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | AYUSHPICKS`,
      description: product.short_description || 'A practical product pick from AYUSHPICKS.',
      images: ['/opengraph-image'],
    },
  }
}

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  return <PageShell title={product.name} kicker={product.store || 'PRODUCT PICK'}>
    <Link href="/products" className="backhome">← Back to picks</Link>
    <section className="detail"><div className="detailmedia"><div className="detailimage">{product.image_url?<img src={product.image_url} alt={product.name} referrerPolicy="no-referrer"/>:<span>No image available</span>}</div></div><div className="detailinfo"><div className="tag">{product.store || 'Store'}</div>{product.price!=null&&<div className="detailprice">₹{Number(product.price).toLocaleString('en-IN')}{product.old_price!=null&&<del>₹{Number(product.old_price).toLocaleString('en-IN')}</del>}</div>}<p className="lead">{product.short_description || 'A product selected for its practical value, features and overall usefulness.'}</p>{product.why_picked&&<div className="editorial"><div className="eyebrow">WHY WE PICKED IT</div><p>{product.why_picked}</p></div>}<Link className="btn primary buy" href={`/go/${product.slug}`}>Check on {product.store || 'store'} <ArrowUpRight size={17}/></Link><p className="muted micro">Prices and availability can change on the retailer’s website.</p></div></section>
    <section className="detailgrid">{Array.isArray(product.pros)&&product.pros.length>0&&<div className="infoPanel"><h2>Pros</h2>{product.pros.map((x:string,i:number)=><div className="bullet" key={i}><Check size={16}/><span>{x}</span></div>)}</div>}{Array.isArray(product.cons)&&product.cons.length>0&&<div className="infoPanel"><h2>Things to consider</h2>{product.cons.map((x:string,i:number)=><div className="bullet" key={i}><X size={16}/><span>{x}</span></div>)}</div>}</section>
  </PageShell>
}
