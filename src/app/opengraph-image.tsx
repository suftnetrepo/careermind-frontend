import { ImageResponse } from 'next/og'

export const alt = 'Interquis — AI Interview Coach'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: 80,
          background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 45%, #ede9fe 100%)',
        }}
      >
        <div style={{ display: 'flex', fontSize: 44, fontWeight: 800, color: '#0f172a' }}>
          Inter<span style={{ color: '#6366f1' }}>quis</span>
        </div>
        <div style={{ display: 'flex', marginTop: 40, fontSize: 92, fontWeight: 800, color: '#0f172a', lineHeight: 1.05 }}>
          Practice interviews. Land the job.
        </div>
        <div style={{ display: 'flex', marginTop: 32, fontSize: 36, color: '#475569' }}>
          Tailored questions · Live voice AI coaching · First interview free
        </div>
      </div>
    ),
    size,
  )
}
