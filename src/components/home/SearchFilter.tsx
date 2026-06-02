'use client'

import { Search } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'
import styles from './SearchFilter.module.css'
import { useState, useEffect } from 'react'

interface SearchFilterProps {
  categories: any[]
  islands: any[]
  cities: any[]
  initialSearch: string
  initialCategory: string
  initialIsland: string
  initialCity: string
  initialPrice: string
  onFilterChange: (keyOrUpdates: any, value?: string) => void
  onReset: () => void
}

export default function SearchFilter({
  categories,
  islands,
  cities,
  initialSearch,
  initialCategory,
  initialIsland,
  initialCity,
  initialPrice,
  onFilterChange,
  onReset,
}: SearchFilterProps) {
  const [searchValue, setSearchValue] = useState(initialSearch)

  useEffect(() => {
    setSearchValue(initialSearch)
  }, [initialSearch])

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onFilterChange('search', value)
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    debouncedSearch(e.target.value)
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} size={18} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Cari destinasi..."
          value={searchValue}
          onChange={handleSearchChange}
          suppressHydrationWarning
        />
      </div>

      <div className={styles.divider}></div>

      <select
        className={styles.selectInput}
        value={initialIsland}
        onChange={(e) => {
          onFilterChange({ island: e.target.value, city: '' })
        }}
        suppressHydrationWarning
      >
        <option value="">Pulau</option>
        {islands.map((i) => (
          <option key={i.id} value={i.id}>{i.name}</option>
        ))}
      </select>

      <div className={styles.divider}></div>

      <select
        className={styles.selectInput}
        value={initialCity}
        onChange={(e) => onFilterChange('city', e.target.value)}
        suppressHydrationWarning
      >
        <option value="">Kota</option>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <div className={styles.divider}></div>

      <select
        className={styles.selectInput}
        value={initialCategory}
        onChange={(e) => onFilterChange('category', e.target.value)}
        suppressHydrationWarning
      >
        <option value="">Kategori</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <div className={styles.divider}></div>

      <select
        className={styles.selectInput}
        value={initialPrice}
        onChange={(e) => onFilterChange('price', e.target.value)}
        suppressHydrationWarning
      >
        <option value="">Harga</option>
        <option value="free">Gratis</option>
        <option value="0-25">Rp 0 - 25k</option>
        <option value="25-50">Rp 25k - 50k</option>
        <option value="50-100">Rp 50k - 100k</option>
        <option value="100+">&gt; Rp 100k</option>
      </select>

      <button 
        className={styles.searchBtn} 
        onClick={onReset} 
        suppressHydrationWarning
        style={{ backgroundColor: '#ef4444' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
      >
        Hapus
      </button>
    </div>
  )
}
