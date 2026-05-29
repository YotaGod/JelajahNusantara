'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteReview } from '@/lib/api'
import { Edit2, Trash2 } from 'lucide-react'
import StarRating from './StarRating'
import { getUserBadge } from '@/utils/badges'
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
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  {currentUserId && rev.user?.avatar_url ? (
                    <img src={rev.user.avatar_url} alt={rev.user.full_name} className={styles.reviewAvatarImg} />
                  ) : (
                    (currentUserId && rev.user?.full_name) ? rev.user.full_name.charAt(0).toUpperCase() : 'A'
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className={styles.userName}>
                      {currentUserId ? (rev.user?.full_name || 'Pengguna Anonim') : 'Pengguna Anonim'}
                    </span>
                    
                    {/* User Badge Display */}
                    {(() => {
                      // Ambil total ulasan user dari Supabase relations (jika ada, default minimal 1 karena ini ulasannya)
                      const reviewCount = rev.user?.reviews?.[0]?.count || 1;
                      const badge = getUserBadge(reviewCount);
                      const BadgeIcon = badge.icon;
                      
                      return (
                        <div 
                          className={styles.userBadge} 
                          style={{ backgroundColor: badge.bg, color: badge.color }}
                          title={`${reviewCount} Ulasan`}
                        >
                          <span className={styles.badgeIcon}>
                            <BadgeIcon size={12} strokeWidth={2.5} />
                          </span>
                          {badge.name}
                        </div>
                      )
                    })()}
                  </div>
                  
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
            
            <div className={styles.reviewBody}>
              <p className={styles.reviewText}>{rev.comment}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
