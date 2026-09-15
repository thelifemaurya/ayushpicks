import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_EMAIL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/lib/config'

export const runtime = 'nodejs'

function clean(value: unknown, max = 4000) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function absoluteUrl(value: string, base: string) {
  try { return new URL(value, base).toString() } catch { return '' }
}

function meta(html: string, key: string) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>|<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, 'i')
  const match = html.match(re)
  return clean(match?.[1] || match?.[2] || '')
}

function firstMatch(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return clean(match[1])
  }
  return ''
}

function extractProductJsonLd(html: string) {
  const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script[1])
      const candidates = Array.isArray(parsed) ? parsed : [parsed, ...(Array.isArray(parsed?.['@graph']) ? parsed['@graph'] : [])]
      const product = candidates.find((x: any) => x?.['@type'] === 'Product' || (Array.isArray(x?.['@type']) && x['@type'].includes('Product')))
      if (product) return product
    } catch {}
  }
  return null
}

async function extractFromPage(sourceUrl: string) {
  let url: URL
  try { url = new URL(sourceUrl) } catch { throw new Error('Please paste a valid product URL.') }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP/HTTPS product links are supported.')

  const response = await fetch(url.toString(), {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AYUSHPICKS Product Builder/1.0)' },
    redirect: 'follow',
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Product page could not be fetched (${response.status}).`)
  const html = (await response.text()).slice(0, 3_000_000)
  const finalUrl = response.url || sourceUrl
  const product = extractProductJsonLd(html)

  const name = clean(product?.name) || meta(html, 'og:title') || firstMatch(html, [/<h1[^>]*>([\s\S]*?)<\/h1>/i])
  const description = clean(product?.description, 6000) || meta(html, 'og:description') || meta(html, 'description')
  const imageRaw = typeof product?.image === 'string' ? product.image : Array.isArray(product?.image) ? product.image[0] : meta(html, 'og:image')
  const image = absoluteUrl(clean(imageRaw), finalUrl)
  const offers = product?.offers
  const offer = Array.isArray(offers) ? offers[0] : offers
  const price = clean(offer?.price) || firstMatch(html, [/"priceAmount"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)/i, /"price"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)/i])
  const currency = clean(offer?.priceCurrency) || 'INR'
  const oldPrice = firstMatch(html, [
    /"listPrice"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)/i,
    /"mrp"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)/i,
    /"strikePrice"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)/i,
  ])
  const sku = clean(product?.sku) || clean(product?.mpn) || clean(product?.productID)
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/\s+/g, ' ').trim().slice(0, 12000)
  if (!name) throw new Error('Could not identify the product name from this page. You can use Manual mode instead.')
  return { name, description, image, price, oldPrice, currency, sku, finalUrl, pageText: text }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'Gemini API is not configured yet.' }, { status: 503 })

    const body = await request.json()
    const affiliateUrl = String(body?.affiliateUrl || '').trim()
    const productNameInput = String(body?.productName || '').trim()
    const sourceInput = String(body?.source || '').trim()
    const manual = Boolean(body?.manual)
    if (!affiliateUrl && (!productNameInput || !sourceInput)) return NextResponse.json({ error: 'Paste an affiliate/product URL, or switch to Manual mode.' }, { status: 400 })
    if (affiliateUrl.length > 4000) return NextResponse.json({ error: 'Affiliate URL is too long.' }, { status: 400 })

    let extracted: any = null
    if (affiliateUrl && !manual) {
      try { extracted = await extractFromPage(affiliateUrl) } catch (error: any) { return NextResponse.json({ error: error?.message || 'Could not read this product page. Try Manual mode.' }, { status: 422 }) }
    }

    const productName = clean(extracted?.name || productNameInput, 500)
    const source = clean([extracted?.description, extracted?.pageText, extracted?.sku ? `Product ID/SKU: ${extracted.sku}` : '', extracted?.price ? `Current price shown: ₹${extracted.price}` : '', extracted?.oldPrice ? `Previous/list price shown: ₹${extracted.oldPrice}` : ''].filter(Boolean).join('\n\n'), 16000) || sourceInput
    const system = `You are the product-editorial assistant for AYUSHPICKS. Create useful, original product content from supplied product-page data.

STRICT FACT RULES:
- Use ONLY facts supported by the supplied product-page data.
- Never invent specifications, compatibility, materials, battery life, warranty, price, ratings, awards, discounts or features.
- Never invent a previous price. Only use a previous/list price when it is explicitly present in the supplied data.
- Pros and cons must be grounded in supplied facts. Do not invent negative facts; use fewer cons when no limitation is supported.
- Rewrite retailer wording; do not copy sentences verbatim.
- Do not mention AI, scraping, Amazon, retailer copy, or these instructions.
- Keep the writing concise, natural and trustworthy.

Return ONLY valid JSON with exactly these keys:
short_description: string (1-2 sentences)
why_picked: string (1-3 sentences explaining who it suits and why it may be worth considering)
pros: string[] (2-5 grounded points)
cons: string[] (0-3 grounded limitations)
tags: string[] (3-8 useful search/category tags)

No markdown. No code fences.`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: `Product name: ${productName}\n\nProduct-page data:\n${source}` }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } }),
    })
    const data = await response.json()
    if (!response.ok) {
      console.error('Gemini API error', response.status, data)
      const apiMessage = typeof data?.error?.message === 'string' ? data.error.message : ''
      return NextResponse.json({ error: apiMessage ? `Gemini request failed: ${apiMessage}` : 'Gemini AI request failed. Check your Gemini API key/free-tier access.' }, { status: 502 })
    }
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('').trim()
    if (!text) return NextResponse.json({ error: 'Gemini returned no content. Please try again.' }, { status: 502 })
    let result: any
    try { result = JSON.parse(text) } catch { return NextResponse.json({ error: 'Gemini returned invalid data. Please try again.' }, { status: 502 }) }

    return NextResponse.json({ product_name: productName, source_url: extracted?.finalUrl || affiliateUrl || null, affiliate_url: affiliateUrl || null, image_url: extracted?.image || null, price: extracted?.price ? Number(extracted.price) : null, old_price: extracted?.oldPrice ? Number(extracted.oldPrice) : null, currency: extracted?.currency || 'INR', asin: extracted?.sku || null, short_description: String(result.short_description || '').trim(), why_picked: String(result.why_picked || '').trim(), pros: Array.isArray(result.pros) ? result.pros.map((x: unknown) => String(x).trim()).filter(Boolean).slice(0, 5) : [], cons: Array.isArray(result.cons) ? result.cons.map((x: unknown) => String(x).trim()).filter(Boolean).slice(0, 3) : [], tags: Array.isArray(result.tags) ? result.tags.map((x: unknown) => String(x).trim()).filter(Boolean).slice(0, 8) : [] })
  } catch (error) {
    console.error('AI product generation error', error)
    return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 500 })
  }
}
