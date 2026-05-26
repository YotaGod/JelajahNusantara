import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'
import styles from './DestinationCard.module.css'

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
    if (price === null || price === 0) return 'Gratis'
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
      </div>
      <div className={styles.content}>
        <div className={styles.row}>
          <h3 className={styles.name} title={dest.name}>{dest.name}</h3>
          <div className={styles.rating}>
            <Star size={14} fill="#F59E0B" color="#F59E0B" />
            <span>{dest.avg_rating > 0 ? dest.avg_rating.toFixed(1) : '5.0'}</span>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.location}>
            <MapPin size={14} />
            <span>{dest.cityName}</span>
          </div>
          <span className={styles.price}>{formatPrice(dest.price)}</span>
        </div>
      </div>
    </Link>
  )
}
