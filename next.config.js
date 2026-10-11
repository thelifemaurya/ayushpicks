module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Old project hostnames all serve the same site. Send them to the one canonical domain so search engines index a single copy.
  async redirects() {
    return ["ksnatic.vercel.app", "ksnatic-topaz.vercel.app", "ksnatic-ayushs-projects-7fda96e9.vercel.app"].map((host) => ({ source: "/:path*", has: [{ type: "host", value: host }], destination: "https://ayushpicks.vercel.app/:path*", permanent: true }));
  },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
    ] }];
  },
};
