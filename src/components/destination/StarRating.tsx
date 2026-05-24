'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'
import styles from './Reviews.module.css'

interface StarRatingProps {
  rating: number
  isInteractive?: boolean
  onChange?: (rating: number) => void
  size?: number
}

export default function StarRating({ rating, isInteractive = false, onChange, size = 16 }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const handleMouseEnter = (index: number) => {
    if (!isInteractive) return
    setHoverRating(index)
  }

  const handleMouseLeave = () => {
    if (!isInteractive) return
    setHoverRating(0)
  }

  const handleClick = (index: number) => {
    if (!isInteractive || !onChange) return
    onChange(index)
  }

  const currentDisplayRating = hoverRating || rating

  return (
    <div className={styles.starContainer} onMouseLeave={handleMouseLeave}>
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1
        const isFilled = starValue <= currentDisplayRating

        return (
          <div
            key={i}
            className={isInteractive ? styles.starInteractive : ''}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onClick={() => handleClick(starValue)}
          >
            <Star
              size={size}
              fill={isFilled ? 'var(--color-warning)' : 'none'}
              color={isFilled ? 'var(--color-warning)' : 'var(--color-border-focus)'}
            />
          </div>
        )
      })}
    </div>
  )
}
