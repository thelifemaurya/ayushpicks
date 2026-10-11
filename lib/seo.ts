import { SITE_URL } from '@/lib/config'

export const SITE_NAME = 'AyushPicks'
export const INSTAGRAM_URL = 'https://www.instagram.com/ayushpicks'
export const GITHUB_URL = 'https://github.com/thelifemaurya/ayushpicks'
export const FOUNDER_NAME = 'Ayush Maurya'

// Every way a person might type or say the brand. Used in schema alternateName,
// metadata keywords and the visible "also written as" line on the About page.
export const BRAND_ALIASES = ['AyushPicks', 'Ayush Picks', 'AYUSHPICKS', 'ayushpicks', 'Ayush Picks India']

export const SITE_TAGLINE = 'Honest product picks, comparisons and buying guides'

export const SITE_DESCRIPTION =
  'AyushPicks (also written Ayush Picks) is an independent Indian product-discovery site. It helps you discover, compare and choose products with clear pros and cons, buying guides and honest context. It links out to retailers such as Amazon, Flipkart and Myntra.'

export const SEO_KEYWORDS = [
  'AyushPicks',
  'Ayush Picks',
  'AYUSHPICKS',
  'ayushpicks.vercel.app',
  'ayushpicks instagram',
  'ayush picks reviews',
  'product recommendations India',
  'best products to buy India',
  'buying guides India',
  'product comparison India',
  'honest product reviews',
  'Amazon India picks',
  'Flipkart picks',
]

// Visible FAQ on /about. The same list feeds FAQPage JSON-LD, so schema and page text always match.
export const BRAND_FAQ = [
  {
    q: 'What is AyushPicks?',
    a: 'AyushPicks (also written Ayush Picks) is an independent product-discovery website from India. It curates products, explains why they are worth considering, lists pros and cons, and links to retailers where the purchase is completed.',
  },
  {
    q: 'Who runs AyushPicks?',
    a: `AyushPicks is created and run by ${FOUNDER_NAME}.`,
  },
  {
    q: 'Is Ayush Picks the same as AyushPicks?',
    a: 'Yes. AyushPicks, Ayush Picks and AYUSHPICKS all refer to the same website and the same Instagram account, @ayushpicks.',
  },
  {
    q: 'What is the AyushPicks Instagram account?',
    a: `The official Instagram account is @ayushpicks: ${INSTAGRAM_URL}`,
  },
  {
    q: 'Does AyushPicks sell products or take payments?',
    a: 'No. AyushPicks does not process payments, hold inventory or ship orders. It links to retailers, and the purchase is completed on the retailer’s website.',
  },
  {
    q: 'How does AyushPicks make money?',
    a: 'AyushPicks may earn a commission from qualifying purchases made through some retailer links, at no extra cost to you. See the affiliate disclosure page for details.',
  },
]

const orgId = `${SITE_URL}/#organization`
const siteId = `${SITE_URL}/#website`
const personId = `${SITE_URL}/#founder`

export function siteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: SITE_NAME,
        alternateName: BRAND_ALIASES.filter((a) => a !== SITE_NAME),
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon`, width: 512, height: 512 },
        image: `${SITE_URL}/opengraph-image`,
        description: SITE_DESCRIPTION,
        slogan: SITE_TAGLINE,
        founder: { '@id': personId },
        areaServed: { '@type': 'Country', name: 'India' },
        knowsLanguage: ['en', 'hi'],
        sameAs: [INSTAGRAM_URL, GITHUB_URL],
        contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', url: `${SITE_URL}/contact` },
      },
      {
        '@type': 'WebSite',
        '@id': siteId,
        name: SITE_NAME,
        alternateName: BRAND_ALIASES.filter((a) => a !== SITE_NAME),
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: 'en-IN',
        publisher: { '@id': orgId },
      },
      {
        '@type': 'Person',
        '@id': personId,
        name: FOUNDER_NAME,
        url: `${SITE_URL}/about`,
        jobTitle: `Founder of ${SITE_NAME}`,
        worksFor: { '@id': orgId },
        sameAs: [INSTAGRAM_URL],
      },
    ],
  }
}

export function aboutJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${SITE_URL}/about#page`,
        url: `${SITE_URL}/about`,
        name: `About ${SITE_NAME}`,
        isPartOf: { '@id': siteId },
        about: { '@id': orgId },
        inLanguage: 'en-IN',
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/about#faq`,
        mainEntity: BRAND_FAQ.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  }
}

// Safe for <script type="application/ld+json">: stops "</script>" or "<!--" in data from breaking out.
export function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
