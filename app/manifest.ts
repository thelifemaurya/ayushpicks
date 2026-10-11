import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "AyushPicks", short_name: "AyushPicks", description: "Discover, compare and decide on products worth buying.", start_url: "/", display: "standalone", background_color: "#FBF9F5", theme_color: "#FBF9F5", lang: "en-IN",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }, { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" }] };
}
