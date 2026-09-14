import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { SITE_URL } from '@/lib/config'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const sb = supabaseServer()
  const { data: product } = await sb.from('products').select('id,affiliate_url').eq('slug', slug).eq('published', true).maybeSingle()
  if (!product?.affiliate_url) return NextResponse.redirect(new URL('/products', SITE_URL))
  try {
    await sb.from('product_clicks').insert({ product_id: product.id })
  } catch {
    // Redirect should still work if analytics storage is temporarily unavailable.
  }
  return NextResponse.redirect(product.affiliate_url)
}
