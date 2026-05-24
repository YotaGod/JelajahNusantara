'use client'

import dynamic from 'next/dynamic'

const MapClient = dynamic(() => import('./MapClient'), { 
  ssr: false,
  loading: () => (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background-alt)' }}>
      <div className="spinner"></div>
      <span style={{ marginLeft: '1rem', color: 'var(--color-text-muted)' }}>Memuat Peta...</span>
    </div>
  )
})

export default function MapDynamicWrapper(props: any) {
  return <MapClient {...props} />
}
