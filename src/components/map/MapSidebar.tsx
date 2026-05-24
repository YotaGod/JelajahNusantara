'use client'

import { Search, RotateCcw } from 'lucide-react'
import './map.css'

interface MapSidebarProps {
  categories: any[]
  cities: any[]
  selectedCategory: string
  setSelectedCategory: (val: string) => void
  selectedCity: string
  setSelectedCity: (val: string) => void
  searchQuery: string
  setSearchQuery: (val: string) => void
  onReset: () => void
}

export default function MapSidebar({
  categories,
  cities,
  selectedCategory,
  setSelectedCategory,
  selectedCity,
  setSelectedCity,
  searchQuery,
  setSearchQuery,
  onReset
}: MapSidebarProps) {
  return (
    <div className="mapSidebar">
      <h3>Cari Destinasi</h3>

      <div className="sidebarGroup">
        <label>Pencarian</label>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Ketik nama destinasi..." 
            className="input-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      <div className="sidebarGroup">
        <label>Kategori</label>
        <select 
          className="input-field" 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="sidebarGroup">
        <label>Kabupaten/Kota</label>
        <select 
          className="input-field" 
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option value="">Semua Kota</option>
          {cities.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <button 
        className="btn btn-outline" 
        onClick={onReset}
        style={{ marginTop: '0.5rem', width: '100%', display: 'flex', justifyContent: 'center' }}
      >
        <RotateCcw size={16} /> Reset Filter
      </button>
    </div>
  )
}
