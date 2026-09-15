import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AYUSHPICKS — Products worth picking'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#07090d', color:'#f5f7fa', fontFamily:'Arial, sans-serif' }}>
        <div style={{ display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'center', fontSize:72, fontWeight:800, letterSpacing:-4 }}>
          <span style={{ color:'#f5f7fa' }}>AYUSH</span><span style={{ color:'#dc2626' }}>PICKS</span>
        </div>
        <div style={{ display:'flex', fontSize:30, color:'#aab4c4', marginTop:28 }}>Products worth picking.</div>
        <div style={{ display:'flex', fontSize:20, color:'#7f8a9d', marginTop:12 }}>Useful products • Honest details • Better decisions</div>
      </div>
    ),
    { ...size },
  )
}
