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
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const text = String(body?.text || '').trim()
    const productName = String(body?.productName || '').trim()
    const mode = String(body?.mode || 'improve')

    if (!text) return NextResponse.json({ error: 'Description is required.' }, { status: 400 })
    if (text.length > 5000) return NextResponse.json({ error: 'Description is too long.' }, { status: 400 })

    const instructions: Record<string, string> = {
      improve: 'Improve clarity, grammar and usefulness while keeping the original meaning and facts.',
      shorten: 'Make it concise and clean. Keep the important buying information and remove fluff.',
      premium: 'Rewrite it in a polished, premium consumer-tech/ecommerce editorial style.',
      seo: 'Make it naturally search-friendly without keyword stuffing or sounding robotic.',
    }

    const { text: output } = await generateText({
      model: 'openai/gpt-5.5',
      temperature: 0.3,
      system: `You are the editorial copy assistant for AYUSHPICKS, a product-discovery website. ${instructions[mode] || instructions.improve}

Rules:
- Preserve every factual claim from the input; never invent specifications, prices, ratings, discounts, guarantees or features.
- Do not copy the retailer's wording verbatim. Create genuinely rewritten wording.
- Do not mention that AI was used.
- Keep it natural, trustworthy and useful to a shopper.
- Return only the finished description, with no quotation marks, headings or commentary.
- Prefer 1 short paragraph for a product short description.`,
      prompt: `Product: ${productName || 'Unknown product'}\n\nOriginal copy:\n${text}`,
    })

    return NextResponse.json({ text: output.trim() })
  } catch (error) {
    console.error('AI rewrite error', error)
    return NextResponse.json({ error: 'AI rewrite failed. Check the AI Gateway setup.' }, { status: 500 })
  }
}
