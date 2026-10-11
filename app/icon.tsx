import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff',
      color: '#111111',
      fontSize: 30,
      fontWeight: 900,
      letterSpacing: '-0.08em',
      borderRadius: 14,
    }}>
      AP
    </div>,
    size,
  )
}
