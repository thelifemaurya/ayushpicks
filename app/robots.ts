import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/config'

// Pages that should never be crawled: admin, auth, APIs, affiliate redirects, cart and search UI.
const PRIVATE_PATHS = ['/admin', '/auth', '/api', '/go', '/cart', '/search']

// Search engines and AI crawlers/assistants we explicitly welcome, so AI answers can
// describe AyushPicks. Training-only bots are allowed too; remove a name here to opt out.
const AI_AND_SEARCH_BOTS = [
  'Googlebot',
  'Bingbot',
  'DuckDuckBot',
  'Applebot',
  'Applebot-Extended',
  'Google-Extended',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Meta-ExternalAgent',
  'Meta-ExternalFetcher',
  'Amazonbot',
  'CCBot',
  'YouBot',
  'cohere-ai',
  'MistralAI-User',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
      ...AI_AND_SEARCH_BOTS.map((userAgent) => ({ userAgent, allow: '/', disallow: PRIVATE_PATHS })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
