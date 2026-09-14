import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/config'
import { supabaseServer } from '@/lib/supabase-server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sb = supabaseServer()
  const [{ data: products }, { data: guides }] = await Promise.all([
    sb.from('products').select('slug,updated_at').eq('published', true),
    sb.from('articles').select('slug,updated_at').eq('published', true),
  ])
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/guides`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/affiliate-disclosure`, changeFrequency: 'monthly', priority: 0.3 },
  ]
  return [...staticPages,...(products||[]).map((p:any)=>({url:`${SITE_URL}/products/${p.slug}`,lastModified:p.updated_at,changeFrequency:'weekly' as const,priority:0.7})),...(guides||[]).map((g:any)=>({url:`${SITE_URL}/guides/${g.slug}`,lastModified:g.updated_at,changeFrequency:'monthly' as const,priority:0.6}))]
}
