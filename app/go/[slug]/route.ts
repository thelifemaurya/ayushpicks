import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const sb = supabaseServer()
  const { data: product } = await sb.from('products').select('id,affiliate_url').eq('slug', slug).eq('published', true).maybeSingle()
  if (!product?.affiliate_url) return NextResponse.redirect(new URL('/products', process.env.NEXT_PUBLIC_SITE_URL || 'https://ayushpicks-ayushs-projects-7fda96e9.vercel.app'))
  await sb.from('product_clicks').insert({ product_id: product.id }).catch(() => undefined)
  return NextResponse.redirect(product.affiliate_url)
}
