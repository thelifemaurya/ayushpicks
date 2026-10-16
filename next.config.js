module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Inline the (small) stylesheet so it no longer blocks first paint.
  experimental: { inlineCss: true },
  images: {
    formats: ["image/avif", "image/webp"], minimumCacheTTL: 2592000,
    // Only known catalogue/storage hosts are optimised (a wildcard would let anyone use the image quota). Keep in sync with OPT_HOSTS in components/ui.tsx.
    remotePatterns: ["supabase.co", "media-amazon.com", "ssl-images-amazon.com", "flixcart.com", "myntassets.com", "nykaa.com"].map((h) => ({ protocol: "https", hostname: `**.${h}` })),
  },
  // Old project hostnames all serve the same site. Send them to the one canonical domain so search engines index a single copy.
  async redirects() {
    return ["ksnatic.vercel.app", "ksnatic-topaz.vercel.app", "ksnatic-ayushs-projects-7fda96e9.vercel.app"].map((host) => ({ source: "/:path*", has: [{ type: "host", value: host }], destination: "https://ayushpicks.vercel.app/:path*", permanent: true }));
  },
  async headers() {
    const longCache = { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" };
    return [{ source: "/icons/:path*", headers: [longCache] }, { source: "/brand/:path*", headers: [longCache] }, { source: "/logo.png", headers: [longCache] }, { source: "/(.*)", headers: [
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
    ] }];
  },
};
