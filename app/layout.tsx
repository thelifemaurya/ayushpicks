import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ayushpicks.vercel.app'),
  title: { default: 'AYUSHPICKS — Products worth picking', template: '%s | AYUSHPICKS' },
  description: 'Discover useful, well-picked products worth buying online.',
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}