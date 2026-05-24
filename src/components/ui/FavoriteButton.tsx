'use client'

import { Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useRouter } from 'next/navigation'

interface FavoriteButtonProps {
  destinationId: string
  className?: string
  style?: React.CSSProperties
  size?: number
}

export default function FavoriteButton({ destinationId, className = '', style = {}, size = 20 }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isLoggedIn } = useFavorites()
  const router = useRouter()
  
  const favorited = isFavorite(destinationId)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Mencegah klik menembus ke card

    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    toggleFavorite({ destinationId, isFavorited: favorited })
  }

  return (
    <button 
      onClick={handleClick}
      className={`fav-btn ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size + 16,
        height: size + 16,
        borderRadius: '50%',
        backgroundColor: favorited ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)',
        border: 'none',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.2s ease',
        ...style
      }}
      aria-label={favorited ? "Hapus dari favorit" : "Tambah ke favorit"}
      title={favorited ? "Hapus dari favorit" : "Tambah ke favorit"}
    >
      <Heart 
        size={size} 
        color={favorited ? '#ef4444' : 'var(--color-text-muted)'} 
        fill={favorited ? '#ef4444' : 'none'} 
        style={{
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        className={favorited ? 'scale-110' : ''}
      />
    </button>
  )
}
