import { ImageResponse } from 'next/og'

// iPhone home-screen icon, generated as a PNG so it always matches public/icon.svg.
// Full-bleed orange (no rounded corners) because iOS applies its own mask.
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

const dot = (left: number, top: number, d: number) => (
  <div style={{ position: 'absolute', left, top, width: d, height: d, borderRadius: 9999, background: '#fff9f1' }} />
)

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#d17b58' }}>
        {dot(33.5, 49.5, 45)}
        {dot(101.5, 49.5, 45)}
        {dot(73, 107, 34)}
      </div>
    ),
    size,
  )
}
