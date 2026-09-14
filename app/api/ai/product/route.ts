import { generateText } from 'ai'
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_EMAIL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/lib/config'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      cookies: { getAll() { return cookieStore.getAll() }, setAll() {} },
    })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const productName = String(body?.productName || '').trim()
    const source = String(body?.source || '').trim()
    if (!productName || !source) return NextResponse.json({ error: 'Product name and source description are required.' }, { status: 400 })
    if (source.length > 12000) return NextResponse.json({ error: 'Source description is too long.' }, { status: 400 })

    const { text } = await generateText({
      model: 'google/gemini-2.5-flash-lite',
      temperature: 0.2,
      system: `You are the product-editorial assistant for AYUSHPICKS. Create useful, original product content from the supplied source text.

STRICT FACT RULES:
- Use ONLY facts supported by the source text.
- Never invent specifications, compatibility, materials, battery life, warranty, price, ratings, awards, discounts or features.
- If the source does not support a claim, do not include it.
- Pros and cons must be specific and grounded in the source. Do not invent negative facts; a con can be a reasonable limitation explicitly implied by the source, otherwise use fewer cons.
- Rewrite retailer wording; do not copy sentences verbatim.
- Do not mention AI, Amazon, retailer copy, or these instructions.
- Keep the writing concise, natural and trustworthy.

Return ONLY valid JSON with exactly these keys:
short_description: string (1-2 sentences)
why_picked: string (1-3 sentences explaining who it suits and why it may be worth considering)
pros: string[] (2-5 grounded points)
cons: string[] (0-3 grounded limitations)
tags: string[] (3-8 useful search/category tags)

No markdown. No code fences.`,
      prompt: `Product name: ${productName}\n\nSource information:\n${source}`,
    })

    let result: any
    try { result = JSON.parse(text.trim()) } catch {
      return NextResponse.json({ error: 'AI returned invalid data. Please try again.' }, { status: 502 })
    }

    return NextResponse.json({
      short_description: String(result.short_description || '').trim(),
      why_picked: String(result.why_picked || '').trim(),
      pros: Array.isArray(result.pros) ? result.pros.map((x: unknown) => String(x).trim()).filter(Boolean).slice(0, 5) : [],
      cons: Array.isArray(result.cons) ? result.cons.map((x: unknown) => String(x).trim()).filter(Boolean).slice(0, 3) : [],
      tags: Array.isArray(result.tags) ? result.tags.map((x: unknown) => String(x).trim()).filter(Boolean).slice(0, 8) : [],
    })
  } catch (error) {
    console.error('AI product generation error', error)
    return NextResponse.json({ error: 'AI generation failed. Check the AI Gateway setup.' }, { status: 500 })
  }
}
