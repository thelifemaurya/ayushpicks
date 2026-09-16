import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ayushpicks.vercel.app'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/auth', '/api', '/go'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
