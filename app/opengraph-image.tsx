import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AYUSHPICKS — Products worth picking'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #07090d 0%, #101827 55%, #0b0d18 100%)',
          color: '#f5f7fa',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <div style={{ fontSize: 78, fontWeight: 800, letterSpacing: -4 }}>
            AYUSH<span style={{ color: '#6d8cff' }}>PICKS</span>
          </div>
          <div style={{ fontSize: 30, color: '#aab4c4' }}>Products worth picking.</div>
          <div style={{ fontSize: 20, color: '#7f8a9d' }}>Useful products • Honest details • Better decisions</div>
        </div>
      </div>
    ),
    { ...size },
  )
}
