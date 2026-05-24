'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'
import styles from './SearchFilter.module.css'
import { useState, useEffect } from 'react'

interface SearchFilterProps {
  categories: any[]
  cities: any[]
  initialSearch: string
  initialCategory: string
  initialCity: string
  initialPrice: string
  onFilterChange: (key: string, value: string) => void
  onReset: () => void
}

export default function SearchFilter({
  categories,
  cities,
  initialSearch,
  initialCategory,
  initialCity,
  initialPrice,
  onFilterChange,
  onReset,
}: SearchFilterProps) {
  const [searchValue, setSearchValue] = useState(initialSearch)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Sync state if URL changes externally
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
      <div className={styles.searchBar}>
        <div className={styles.inputWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            className="input-field"
            placeholder="Cari destinasi wisata..."
            value={searchValue}
            onChange={handleSearchChange}
            suppressHydrationWarning
          />
        </div>
        <button 
          className={`btn ${isFilterOpen ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          suppressHydrationWarning
        >
          <SlidersHorizontal size={20} />
          <span className="hidden-mobile">Filter</span>
        </button>
      </div>

      {isFilterOpen && (
        <div className={`${styles.filterPanel} animate-fade-in`}>
          <div className={styles.filterGroup}>
            <label className="label">Kategori</label>
            <select
              className="input-field"
              value={initialCategory}
              onChange={(e) => onFilterChange('category', e.target.value)}
              suppressHydrationWarning
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className="label">Kota/Kabupaten</label>
            <select
              className="input-field"
              value={initialCity}
              onChange={(e) => onFilterChange('city', e.target.value)}
              suppressHydrationWarning
            >
              <option value="">Semua Kota</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className="label">Harga Tiket</label>
            <select
              className="input-field"
              value={initialPrice}
              onChange={(e) => onFilterChange('price', e.target.value)}
              suppressHydrationWarning
            >
              <option value="">Semua Harga</option>
              <option value="free">Gratis</option>
              <option value="0-25">Rp 0 - 25.000</option>
              <option value="25-50">Rp 25.000 - 50.000</option>
              <option value="50-100">Rp 50.000 - 100.000</option>
              <option value="100+">Di atas Rp 100.000</option>
            </select>
          </div>

          <div className={styles.filterActions}>
            <button className="btn btn-ghost" onClick={onReset} suppressHydrationWarning>
              <X size={18} />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
