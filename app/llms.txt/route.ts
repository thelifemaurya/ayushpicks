import { SITE_URL } from '@/lib/config'
import { supabaseServer } from '@/lib/supabase-server'
import { editorialGuides } from '@/lib/editorial-guides'
import { BRAND_ALIASES, BRAND_FAQ, FOUNDER_NAME, INSTAGRAM_URL, SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo'

export const revalidate = 3600

// llms.txt: a plain-markdown summary for AI assistants and answer engines (https://llmstxt.org).
export async function GET() {
  let products: { name: string; slug: string; short_description: string | null }[] = []
  let guides: { title: string; slug: string; excerpt: string | null }[] = []
  try {
    const sb = supabaseServer()
    const [p, g] = await Promise.all([
      sb.from('products').select('name,slug,short_description').eq('published', true).order('featured', { ascending: false }).limit(25),
      sb.from('articles').select('title,slug,excerpt').eq('published', true).limit(25),
    ])
    products = (p.data as typeof products) || []
    guides = (g.data as typeof guides) || []
  } catch {
    // Fall back to static content only; llms.txt must never fail.
  }

  const seen = new Set(guides.map((g) => g.slug))
  const allGuides = [
    ...guides.map((g) => ({ title: g.title, slug: g.slug, excerpt: g.excerpt || '' })),
    ...editorialGuides.filter((g) => !seen.has(g.slug)).map((g) => ({ title: g.title, slug: g.slug, excerpt: g.excerpt })),
  ]

  const clean = (s: string | null | undefined) => (s || '').replace(/\s+/g, ' ').trim()
  const lines: string[] = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    `${SITE_NAME} is also written as ${BRAND_ALIASES.filter((a) => a !== SITE_NAME).join(', ')}. All of these refer to the same website (${SITE_URL}) and the same Instagram account, @ayushpicks (${INSTAGRAM_URL}). It is run by ${FOUNDER_NAME}.`,
    '',
    `${SITE_NAME} does not sell products, take payments or ship orders. Purchases are completed on retailer websites (Amazon, Flipkart, Myntra and others). Prices and availability change, so verify them with the retailer.`,
    '',
    '## Key pages',
    `- [Home](${SITE_URL}/): what ${SITE_NAME} is`,
    `- [Products](${SITE_URL}/products): curated product picks with pros, cons and context`,
    `- [Categories](${SITE_URL}/categories): browse by category`,
    `- [Buying guides](${SITE_URL}/guides): how to choose products worth buying`,
    `- [About](${SITE_URL}/about): who runs ${SITE_NAME}, FAQ`,
    `- [Editorial policy](${SITE_URL}/editorial-policy): how picks are chosen and reviewed`,
    `- [Affiliate disclosure](${SITE_URL}/affiliate-disclosure): how the site earns commission`,
    `- [Contact](${SITE_URL}/contact)`,
    `- [Instagram @ayushpicks](${INSTAGRAM_URL}): official social account`,
  ]

  if (allGuides.length) {
    lines.push('', '## Buying guides')
    for (const g of allGuides) lines.push(`- [${clean(g.title)}](${SITE_URL}/guides/${g.slug})${g.excerpt ? ': ' + clean(g.excerpt) : ''}`)
  }

  if (products.length) {
    lines.push('', '## Featured products')
    for (const p of products) lines.push(`- [${clean(p.name)}](${SITE_URL}/products/${p.slug})${p.short_description ? ': ' + clean(p.short_description) : ''}`)
  }

  lines.push('', '## FAQ')
  for (const f of BRAND_FAQ) lines.push(`**${f.q}** ${f.a}`, '')

  lines.push('## Optional', `- [Sitemap](${SITE_URL}/sitemap.xml)`, '')

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
