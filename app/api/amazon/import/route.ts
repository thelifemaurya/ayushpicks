import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ADMIN_EMAIL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/lib/config'

function getAsin(value: string) {
  const text = value.trim()
  const match = text.match(/(?:\/dp\/|\/gp\/product\/|\/product\/|[?&]asin=)([A-Z0-9]{10})(?:[/?&]|$)/i) || text.match(/\b([A-Z0-9]{10})\b/i)
  return match?.[1]?.toUpperCase() || null
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (!token) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })

    const sb = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } })
    const { data: { user } } = await sb.auth.getUser(token)
    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
    }

    const body = await request.json()
    const asin = getAsin(String(body?.url || ''))
    if (!asin) return NextResponse.json({ error: 'Could not find a valid 10-character Amazon ASIN in that URL.' }, { status: 400 })

    const accessToken = process.env.AMAZON_CREATORS_API_TOKEN
    const partnerTag = process.env.AMAZON_PARTNER_TAG
    if (!accessToken || !partnerTag) {
      return NextResponse.json({
        error: 'Amazon import is not connected yet. Add AMAZON_CREATORS_API_TOKEN and AMAZON_PARTNER_TAG in Vercel Environment Variables.',
        asin,
        setupRequired: true,
      }, { status: 503 })
    }

    const response = await fetch('https://creatorsapi.amazon/catalog/v1/getItems', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-marketplace': 'www.amazon.in',
      },
      body: JSON.stringify({
        itemIds: [asin],
        itemIdType: 'ASIN',
        marketplace: 'www.amazon.in',
        partnerTag,
        resources: [
          'images.primary.large',
          'itemInfo.title',
          'offersV2.listings.price',
        ],
      }),
      cache: 'no-store',
    })

    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json({ error: data?.message || data?.errors?.[0]?.message || 'Amazon API request failed.', asin }, { status: 502 })
    }

    const item = data?.itemsResult?.items?.[0]
    if (!item) return NextResponse.json({ error: data?.itemsResult?.errors?.[0]?.message || 'Amazon could not return this product.', asin }, { status: 404 })

    return NextResponse.json({
      asin: item.asin || asin,
      name: item.itemInfo?.title?.displayValue || '',
      image_url: item.images?.primary?.large?.url || item.images?.primary?.medium?.url || '',
      price: item.offersV2?.listings?.[0]?.price?.amount ?? null,
      affiliate_url: item.detailPageURL || '',
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Import failed.' }, { status: 500 })
  }
}
