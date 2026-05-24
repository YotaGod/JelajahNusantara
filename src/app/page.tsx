import { Suspense } from 'react'
import HomeClient from '@/components/home/HomeClient'

export default function Home() {
  return (
    <Suspense fallback={<div className="container grid" style={{ placeItems: 'center', minHeight: '50vh' }}>Loading...</div>}>
      <HomeClient />
    </Suspense>
  )
}
