import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'
import styles from './DestinationCard.module.css'
import FavoriteButton from '@/components/ui/FavoriteButton'

interface DestinationProps {
  id: string
  name: string
  categoryName: string
  cityName: string
  avg_rating: number
  price: number | null
  primaryPhoto: string | null
}

export default function DestinationCard({ dest }: { dest: DestinationProps }) {
  const formatPrice = (price: number | null) => {
    if (price === null) return 'Gratis'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Link href={`/destinations/${dest.id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        {dest.primaryPhoto ? (
          <img src={dest.primaryPhoto} alt={dest.name} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.imagePlaceholder}>No Image</div>
        )}
        <span className={styles.categoryBadge}>{dest.categoryName}</span>
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
          <FavoriteButton destinationId={dest.id} />
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name} title={dest.name}>{dest.name}</h3>
          <div className={styles.rating}>
            <Star size={16} fill="var(--color-warning)" color="var(--color-warning)" />
            <span>{dest.avg_rating > 0 ? dest.avg_rating.toFixed(1) : 'New'}</span>
          </div>
        </div>
        <div className={styles.location}>
          <MapPin size={16} />
          <span>{dest.cityName}</span>
        </div>
        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(dest.price)}</span>
        </div>
      </div>
    </Link>
  )
}
