import { ImageResponse } from "next/og";
export const alt = "AyushPicks — Discover products worth knowing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    (<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, background: "#FBF9F5", color: "#1E1C18" }}>
      <div style={{ fontSize: 52, letterSpacing: -1, fontWeight: 700 }}>AyushPicks</div>
      <div style={{ fontSize: 76, fontWeight: 600, marginTop: 36, lineHeight: 1.1, maxWidth: 900 }}>Discover products worth knowing.</div>
      <div style={{ fontSize: 32, color: "#6B665C", marginTop: 32 }}>Discover · Understand · Compare · Decide</div>
      <div style={{ fontSize: 30, color: "#4B5A3F", marginTop: 20 }}>instagram.com/ayushpicks</div>
      <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 14, background: "#4B5A3F" }} />
    </div>), size);
}
