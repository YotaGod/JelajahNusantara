'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitReview, updateReview } from '@/lib/api'
import StarRating from './StarRating'
import styles from './Reviews.module.css'

interface ReviewFormProps {
  destinationId: string
  userId: string
  existingReview?: {
    id: string
    rating: number
    comment: string
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ReviewForm({ destinationId, userId, existingReview, onSuccess, onCancel }: ReviewFormProps) {
  const queryClient = useQueryClient()
  const isEditing = !!existingReview

  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [errorMsg, setErrorMsg] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEditing && existingReview) {
        return await updateReview(existingReview.id, rating, comment)
      } else {
        return await submitReview(destinationId, userId, rating, comment)
      }
    },
    onSuccess: () => {
      // Invalidate the destination query to fetch updated reviews and avg_rating
      queryClient.invalidateQueries({ queryKey: ['destination', destinationId] })
      if (onSuccess) onSuccess()
      
      // Reset form if it's a new review submission
      if (!isEditing) {
        setRating(0)
        setComment('')
      }
    },
    onError: (error: any) => {
      setErrorMsg(error.message || 'Gagal menyimpan ulasan.')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (rating === 0) {
      setErrorMsg('Silakan pilih rating bintang terlebih dahulu.')
      return
    }
    if (comment.trim().length < 10) {
      setErrorMsg('Komentar harus minimal 10 karakter.')
      return
    }
    if (comment.length > 1000) {
      setErrorMsg('Komentar maksimal 1000 karakter.')
      return
    }

    mutation.mutate()
  }

  return (
    <div className={styles.formCard}>
      <div className={styles.formHeader}>
        <h4>{isEditing ? 'Edit Ulasan Anda' : 'Tulis Ulasan Anda'}</h4>
        <p>Bagikan pengalaman Anda mengunjungi tempat ini untuk membantu pengunjung lain.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Pilih Penilaian Anda</label>
          <div className={styles.ratingInput}>
            <StarRating rating={rating} isInteractive={true} onChange={setRating} size={24} />
            <span className={styles.ratingText}>
              {rating === 0 ? '' : rating === 1 ? 'Sangat Buruk' : rating === 2 ? 'Buruk' : rating === 3 ? 'Cukup' : rating === 4 ? 'Bagus' : 'Sangat Bagus'}
            </span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Ceritakan Pengalaman Anda</label>
          <textarea
            className="input-field"
            rows={4}
            placeholder="Bagaimana pemandangannya? Apakah fasilitasnya lengkap? (Minimal 10 karakter)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {errorMsg && <div className={styles.errorText}>{errorMsg}</div>}

        <div className={styles.formActions}>
          {isEditing && onCancel && (
            <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={mutation.isPending}>
              Batal
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Kirim Ulasan'}
          </button>
        </div>
      </form>
    </div>
  )
}
