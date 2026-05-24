'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
// @ts-ignore
import 'leaflet.markercluster'
import MapSidebar from './MapSidebar'
import './map.css'

// Perbaikan path icon default Leaflet di Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapClientProps {
  destinations: any[]
  categories: any[]
  cities: any[]
}

export default function MapClient({ destinations, categories, cities }: MapClientProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerClusterRef = useRef<any>(null)
  const markersRef = useRef<{ [id: string]: L.Marker }>({})

  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Inisialisasi Peta
  useEffect(() => {
    if (!mapRef.current) return;

    // Jika peta belum diinisialisasi
    if (!mapInstanceRef.current) {
      // Pusat awal Banten
      const map = L.map(mapRef.current).setView([-6.4, 106.0], 9)
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      // @ts-ignore
      const markers = L.markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true
      })
      
      map.addLayer(markers)
      mapInstanceRef.current = map
      markerClusterRef.current = markers
    }

    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Render Marker sesuai Filter
  useEffect(() => {
    if (!mapInstanceRef.current || !markerClusterRef.current) return;

    const markersGroup = markerClusterRef.current;
    markersGroup.clearLayers();
    markersRef.current = {};

    let filtered = destinations;
    
    if (selectedCategory) {
      filtered = filtered.filter(d => d.category_id === selectedCategory)
    }
    if (selectedCity) {
      filtered = filtered.filter(d => d.city?.name?.includes(cities.find(c => c.id === selectedCity)?.name))
    }
    if (searchQuery) {
      filtered = filtered.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    const newMarkers: L.Marker[] = [];

    filtered.forEach(dest => {
      if (dest.latitude && dest.longitude) {
        const marker = L.marker([dest.latitude, dest.longitude]);
        
        const photoUrl = dest.photos?.[0]?.image_url || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=300'
        
        const popupContent = `
          <div class="custom-popup">
            <h4>${dest.name}</h4>
            <span class="badge">${dest.category?.name || 'Wisata'}</span>
            <div class="rating">⭐ ${dest.avg_rating > 0 ? dest.avg_rating.toFixed(1) : 'Baru'}</div>
            <img src="${photoUrl}" alt="${dest.name}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-top: 5px;" />
            <a href="/destinations/${dest.id}" class="btn-detail">Lihat Detail</a>
          </div>
        `
        
        marker.bindPopup(popupContent);
        markersGroup.addLayer(marker);
        markersRef.current[dest.id] = marker;
        newMarkers.push(marker);
      }
    });

    // Sesuaikan view agar memuat semua marker jika ada filter, jika tidak reset ke default
    if (newMarkers.length > 0) {
      const group = new L.FeatureGroup(newMarkers);
      mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 12 });
    } else {
      mapInstanceRef.current.setView([-6.4, 106.0], 9);
    }

  }, [destinations, selectedCategory, selectedCity, searchQuery, cities])

  const handleReset = () => {
    setSelectedCategory('')
    setSelectedCity('')
    setSearchQuery('')
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-6.4, 106.0], 9)
    }
  }

  return (
    <div className="mapWrapper">
      <div ref={mapRef} className="mapContainer" />
      <MapSidebar 
        categories={categories}
        cities={cities}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onReset={handleReset}
      />
    </div>
  )
}
