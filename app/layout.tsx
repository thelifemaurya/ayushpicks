import type { Metadata } from 'next'
import './globals.css'
import { SITE_URL } from '@/lib/config'
import AssistantWidget from '@/components/assistant-widget'
import AdSenseScript from '@/components/adsense-script'
import { SEO_KEYWORDS, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, FOUNDER_NAME, INSTAGRAM_URL, siteJsonLd, jsonLdString } from '@/lib/seo'

const DEFAULT_TITLE = `${SITE_NAME} (Ayush Picks) — ${SITE_TAGLINE}`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: FOUNDER_NAME, url: INSTAGRAM_URL }],
  creator: FOUNDER_NAME,
  publisher: SITE_NAME,
  keywords: SEO_KEYWORDS,
  category: 'shopping',
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  other: { 'google-adsense-account': 'ca-pub-1101292617046429' },
  openGraph: {
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/opengraph-image'],
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className="light">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(siteJsonLd()) }} />
        <link rel="me" href={INSTAGRAM_URL} />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable site summary" />
      </head>
      <body>{children}<AdSenseScript /><AssistantWidget /></body>
    </html>
  )
}
