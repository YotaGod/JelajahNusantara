import dynamic from 'next/dynamic'
import { getDestinationsMap, getCategories, getCities } from '@/lib/api'

import MapDynamicWrapper from '@/components/map/MapDynamicWrapper'

export const metadata = {
  title: 'Peta Wisata - Jelajah Banten',
  description: 'Peta interaktif destinasi wisata di Provinsi Banten',
}

export default async function MapPage() {
  const [destinations, categories, cities] = await Promise.all([
    getDestinationsMap(),
    getCategories(),
    getCities()
  ])

  return (
    <div style={{ paddingTop: '80px' }}>
      <MapDynamicWrapper 
        destinations={destinations} 
        categories={categories} 
        cities={cities} 
      />
    </div>
  )
}
