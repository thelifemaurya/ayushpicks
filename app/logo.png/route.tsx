import { ImageResponse } from "next/og";
// Fixed PNG logo URL (/logo.png) for search engines, schema and social profiles.
export const dynamic = "force-static";
export function GET() {
  return new ImageResponse((<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#FBF9F5", color: "#1E1C18", fontSize: 150, fontWeight: 700, letterSpacing: -4 }}>A<span style={{ color: "#4B5A3F" }}>P</span></div>), { width: 512, height: 512 });
}
