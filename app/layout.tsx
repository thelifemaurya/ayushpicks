import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SITE, SHORT_DESC, ALT_NAMES } from "@/lib/site";
import { AuthRedirect } from "@/components/AuthRedirect";
import { AppSplash } from "@/components/AppSplash";
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const display = Playfair_Display({ subsets: ["latin"], display: "swap", variable: "--font-display", weight: ["500", "600"] });
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FBF9F5", interactiveWidget: "resizes-content" };
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "AyushPicks — Discover, Compare & Decide on Products Worth Buying", template: "%s | AyushPicks" },
  description: SHORT_DESC,
  applicationName: "AyushPicks",
  keywords: ["AyushPicks", ...ALT_NAMES, "ayushpicks instagram", "product recommendations India", "compare prices India", "product reviews pros and limitations", "what to buy"],
  authors: [{ name: "AyushPicks", url: SITE }], creator: "AyushPicks", publisher: "AyushPicks", category: "shopping",
  appleWebApp: { capable: true, title: "AyushPicks", statusBarStyle: "default" },
  formatDetection: { telephone: false, email: false, address: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { siteName: "AyushPicks", type: "website", locale: "en_IN" },
  twitter: { card: "summary_large_image" },
  verification: { ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } : {}), other: { "cuelinks-verification": "VERIFY-CL-P2ITAA", "google-adsense-account": "ca-pub-1101292617046429", ...(process.env.NEXT_PUBLIC_BING_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION } : {}) } },
};
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${inter.variable} ${display.variable}`}><body><AppSplash /><AuthRedirect />{children}</body></html>;
}
