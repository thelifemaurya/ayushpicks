import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { id: "/", name: "AyushPicks", short_name: "AyushPicks", description: "Discover, compare and decide on products worth buying.", start_url: "/?source=pwa", scope: "/", display: "standalone", orientation: "portrait", background_color: "#F4E9DB", theme_color: "#FBF9F5", lang: "en-IN", categories: ["shopping", "lifestyle"],
    icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" }, { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }, { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }],
    shortcuts: [{ name: "Discover products", url: "/search", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] }, { name: "Compare", url: "/compare", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] }] };
}
