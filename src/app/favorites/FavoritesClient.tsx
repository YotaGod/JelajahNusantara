'use client'

import { useQuery } from '@tanstack/react-query'
import { getFavoriteDestinations } from '@/lib/api'
import DestinationCard from '@/components/home/DestinationCard'
import Link from 'next/link'
import { HeartCrack } from 'lucide-react'
import { useState } from 'react'
import { useFavorites } from '@/hooks/useFavorites'

export default function FavoritesClient({ userId }: { userId: string }) {
  const { favoriteIds } = useFavorites() // kita butuh ini agar UI live update ketika favorite dihapus
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  const { data: initialFavorites, isLoading, isError } = useQuery({
    queryKey: ['favoriteDestinations', userId],
    queryFn: getFavoriteDestinations,
  })

  if (isLoading) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-16) 0' }}>
        <h1 style={{ marginBottom: 'var(--spacing-8)' }}>Favorit Saya</h1>
        <div className="grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: '300px', backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-xl)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-16) 0', textAlign: 'center' }}>
        <h2>Gagal memuat favorit</h2>
        <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: '1rem' }}>Coba Lagi</button>
      </div>
    )
  }

  // Sinkronisasi data server dengan local favoriteIds (jika user menghapus di halaman ini, card langsung hilang)
  const displayFavorites = initialFavorites?.filter(dest => favoriteIds.includes(dest.id)) || []

  const totalPages = Math.ceil(displayFavorites.length / itemsPerPage)
  const currentData = displayFavorites.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="container" style={{ padding: 'var(--spacing-16) 0' }}>
      <h1 style={{ marginBottom: 'var(--spacing-8)', fontSize: '2rem' }}>
        Favorit Saya <span style={{ color: 'var(--color-text-muted)', fontSize: '1.25rem', fontWeight: 'normal' }}>({displayFavorites.length} Destinasi)</span>
      </h1>

      {displayFavorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-16) 0', backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--color-border)' }}>
          <HeartCrack size={64} color="var(--color-text-muted)" style={{ margin: '0 auto var(--spacing-4)' }} />
          <h2 style={{ marginBottom: 'var(--spacing-2)' }}>Anda belum memiliki destinasi favorit</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-6)' }}>Yuk, jelajahi wisata Banten dan klik ikon hati di destinasi yang Anda sukai!</p>
          <Link href="/" className="btn btn-primary">
            Jelajahi Wisata
          </Link>
        </div>
      ) : (
        <>
          <div className="grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: 'var(--spacing-6)' 
          }}>
            {currentData.map(dest => (
              <DestinationCard key={dest.id} dest={dest} />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-4)', marginTop: 'var(--spacing-12)' }}>
              <button 
                className="btn btn-outline" 
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage(prev => prev - 1)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                Halaman {currentPage} dari {totalPages}
              </span>
              <button 
                className="btn btn-outline" 
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage(prev => prev + 1)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
