'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteReview } from '@/lib/api'
import { Edit2, Trash2 } from 'lucide-react'
import StarRating from './StarRating'
import styles from './Reviews.module.css'

interface ReviewListProps {
  destinationId: string
  reviews: any[]
  currentUserId: string | null
  onEdit: (review: any) => void
}

export default function ReviewList({ destinationId, reviews, currentUserId, onEdit }: ReviewListProps) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destination', destinationId] })
    },
    onError: () => {
      alert('Gagal menghapus ulasan. Silakan coba lagi.')
    }
  })

  const handleDelete = (reviewId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus ulasan ini?')) {
      deleteMutation.mutate(reviewId)
    }
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Belum ada ulasan untuk destinasi ini. Jadilah yang pertama!</p>
      </div>
    )
  }

  return (
    <div className={styles.reviewList}>
      {reviews.map((rev) => {
        const isOwnReview = currentUserId === rev.user_id
        
        return (
          <div key={rev.id} className={`${styles.reviewCard} ${isOwnReview ? styles.reviewCardOwn : ''}`}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewUser}>
                <div className={styles.reviewAvatar}>
                  {rev.user?.avatar_url ? (
                    <img src={rev.user.avatar_url} alt={rev.user.full_name} className={styles.reviewAvatarImg} />
                  ) : (
                    rev.user?.full_name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className={styles.reviewMeta}>
                  <span className={styles.reviewName}>{rev.user?.full_name || 'Pengguna Anonim'}</span>
                  <span className={styles.reviewDate}>
                    {new Date(rev.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
              
              {isOwnReview && (
                <div className={styles.reviewActions}>
                  <button 
                    className={styles.actionBtn} 
                    title="Edit Ulasan"
                    onClick={() => onEdit(rev)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                    title="Hapus Ulasan"
                    onClick={() => handleDelete(rev.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <StarRating rating={rev.rating} size={14} />
            
            <div className={styles.reviewContent}>
              <p className={styles.reviewComment}>{rev.comment}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
