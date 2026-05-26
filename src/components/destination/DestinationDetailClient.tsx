'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDestinationDetail, submitReport, getUserProfile, getUserReports, cancelUserReport } from '@/lib/api'
import { ArrowLeft, Star, MapPin, Map, Clock, Phone, AlertTriangle, X, FileWarning } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import styles from './DestinationDetailClient.module.css'
import reviewStyles from './Reviews.module.css'
import ReviewList from './ReviewList'
import ReviewForm from './ReviewForm'
import StarRating from './StarRating'
import FavoriteButton from '@/components/ui/FavoriteButton'
import WeatherWidget from './WeatherWidget'
import { useToast } from '@/components/ui/ToastProvider'

export default function DestinationDetailClient({ destinationId, userId }: { destinationId: string, userId: string | null }) {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [mainImage, setMainImage] = useState<string>('')
  
  // Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [reportType, setReportType] = useState('info_salah')
  const [reportDesc, setReportDesc] = useState('')

  // Review State
  const [editingReview, setEditingReview] = useState<any>(null)

  const { data: dest, isLoading, isError } = useQuery({
    queryKey: ['destination', destinationId],
    queryFn: () => getDestinationDetail(destinationId),
  })

  const { data: userProfile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId,
  })

  const { data: userReports } = useQuery({
    queryKey: ['user-reports'],
    queryFn: getUserReports,
    enabled: !!userId,
  })

  const existingReport = userReports?.find((r: any) => r.destination?.id === destinationId)
  const isPendingReport = existingReport?.status === 'pending'

  const cancelReportMutation = useMutation({
    mutationFn: cancelUserReport,
    onSuccess: () => {
      addToast('Laporan berhasil dibatalkan', 'success')
      queryClient.invalidateQueries({ queryKey: ['user-reports'] })
      setIsReportOpen(false)
    },
    onError: (error: any) => {
      addToast(error.message || 'Gagal membatalkan laporan', 'error')
    }
  })

  useEffect(() => {
    if (dest?.photos && dest.photos.length > 0) {
      const primary = dest.photos.find((p: any) => p.is_primary)
      setMainImage(primary ? primary.image_url : dest.photos[0].image_url)
    }
  }, [dest])

  const reportMutation = useMutation({
    mutationFn: () => submitReport(destinationId, userId!, reportType, reportDesc),
    onSuccess: () => {
      setIsReportOpen(false)
      setReportDesc('')
      addToast('Laporan berhasil dikirim. Terima kasih atas bantuan Anda!', 'success')
      queryClient.invalidateQueries({ queryKey: ['user-reports'] })
    },
    onError: (error: any) => {
      addToast(error.message || 'Gagal mengirim laporan', 'error')
    }
  })

  if (isLoading) {
    return <div className="container grid" style={{ placeItems: 'center', minHeight: '50vh' }}><h3>Loading detail destinasi...</h3></div>
  }

  if (isError || !dest) {
    return (
      <div className="container grid" style={{ placeItems: 'center', minHeight: '50vh', textAlign: 'center' }}>
        <AlertTriangle size={64} color="var(--color-error)" style={{ marginBottom: '1rem' }} />
        <h1>404 - Destinasi Tidak Ditemukan</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Maaf, destinasi yang Anda cari tidak ada atau telah dihapus.</p>
        <Link href="/" className="btn btn-primary">Kembali ke Beranda</Link>
      </div>
    )
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return 'Gratis'
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
  }

  const parsedFacilities = typeof dest.facilities === 'string' ? JSON.parse(dest.facilities) : dest.facilities
  
  const userRole = userProfile?.role || 'visitor'
  const canReview = ['user', 'regional_admin', 'super_admin'].includes(userRole)
  const userReview = dest.reviews?.find((r: any) => r.user_id === userId)
  
  const reviewCount = dest.reviews?.length || 0
  const totalRating = dest.reviews?.reduce((acc: number, r: any) => acc + r.rating, 0) || 0
  const avgRating = reviewCount > 0 ? totalRating / reviewCount : 0

  return (
    <div className={`container ${styles.pageContainer}`}>
      <Link href="/" className={`btn btn-ghost ${styles.backBtn}`}>
        <ArrowLeft size={20} /> Kembali
      </Link>

      <div className={styles.gridContainer}>
        {/* Main Column */}
        <div>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImageContainer}>
              {mainImage ? (
                <img src={mainImage} alt={dest.name} className={styles.mainImage} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>Tidak ada foto</div>
              )}
            </div>
            {dest.photos && dest.photos.length > 1 && (
              <div className={styles.thumbnailList}>
                {dest.photos.map((photo: any) => (
                  <div 
                    key={photo.id} 
                    className={`${styles.thumbnail} ${mainImage === photo.image_url ? styles.thumbnailActive : ''}`}
                    onClick={() => setMainImage(photo.image_url)}
                  >
                    <img src={photo.image_url} alt="Thumbnail" className={styles.thumbImg} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Header Info */}
          <div className={styles.headerRow}>
            <div className={styles.titleArea}>
              <h1>{dest.name}</h1>
              <div className={styles.badges}>
                <span className={styles.badge}>{dest.category?.name}</span>
                <span className={styles.badge}><MapPin size={14} /> {dest.city?.name}</span>
                <span className={styles.badge} style={{ backgroundColor: 'var(--color-warning)', color: 'white' }}>
                  <Star size={14} fill="white" /> {avgRating > 0 ? avgRating.toFixed(1) : 'Baru'} ({reviewCount} Ulasan)
                </span>
              </div>
            </div>
            <div className={styles.actionButtons}>
              <FavoriteButton 
                destinationId={destinationId} 
                size={24} 
                style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }} 
              />
            </div>
          </div>

          {/* Description */}
          <div className={styles.descriptionSection}>
            <h2>Tentang Destinasi</h2>
            <div className={styles.descriptionText} style={{ textAlign: 'justify' }}>{dest.description || 'Belum ada deskripsi.'}</div>
          </div>

          {/* Reviews Section */}
          <div className={reviewStyles.reviewsContainer}>
            <div className={reviewStyles.reviewsHeader}>
              <h2>Ulasan Pengunjung</h2>
              <div className={reviewStyles.reviewsStats}>
                <span className={reviewStyles.avgRating}>{avgRating > 0 ? avgRating.toFixed(1) : '0.0'}</span>
                <StarRating rating={avgRating} size={18} />
                <span className={reviewStyles.totalReviews}>({reviewCount} Ulasan)</span>
              </div>
            </div>

            {/* Form Section */}
            {userId ? (
              canReview ? (
                // User can review
                (!userReview || editingReview) ? (
                  <ReviewForm 
                    destinationId={destinationId} 
                    userId={userId} 
                    existingReview={editingReview}
                    onSuccess={() => setEditingReview(null)}
                    onCancel={() => setEditingReview(null)}
                  />
                ) : null // User has a review but is not editing, don't show form (it will be in the list with edit button)
              ) : (
                // Logged in but insufficient role
                <div className={reviewStyles.emptyState} style={{ padding: 'var(--spacing-4)' }}>
                  <p>Anda belum memiliki akses untuk memberi ulasan. Hubungi admin untuk meningkatkan role Anda.</p>
                </div>
              )
            ) : (
              // Not logged in
              <div className={reviewStyles.emptyState} style={{ padding: 'var(--spacing-4)' }}>
                <p>Silakan <Link href="/login" style={{ color: 'var(--color-tosca-main)', fontWeight: 600 }}>Login</Link> untuk menulis ulasan.</p>
              </div>
            )}

            {/* List Section */}
            <ReviewList 
              destinationId={destinationId}
              reviews={dest.reviews} 
              currentUserId={userId}
              onEdit={(review) => {
                setEditingReview(review)
                // Scroll to form smoothly
                window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' })
              }}
            />
          </div>
        </div>

        {/* Sidebar Column */}
        <div>
          <div className={styles.infoCard}>
            <div className={styles.infoSection}>
              <span className={styles.infoLabel}>Harga Tiket Masuk</span>
              <span className={styles.priceValue}>{formatPrice(dest.price)}</span>
            </div>

            <div className={styles.infoSection}>
              <span className={styles.infoLabel}>Jam Operasional</span>
              <span className={styles.infoValue}><Clock size={18} color="var(--color-tosca-main)" /> {dest.open_hours || 'Tidak tersedia'}</span>
            </div>

            {dest.latitude && dest.longitude && (
              <WeatherWidget latitude={dest.latitude} longitude={dest.longitude} />
            )}

            <div className={styles.infoSection}>
              <span className={styles.infoLabel}>Alamat Lokasi</span>
              <span className={styles.infoValue} style={{ alignItems: 'flex-start' }}>
                <MapPin size={18} color="var(--color-tosca-main)" style={{ flexShrink: 0, marginTop: '4px' }} />
                <span>{dest.address || 'Tidak tersedia'}</span>
              </span>
              {dest.map_url && (
                <a 
                  href={dest.map_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
                >
                  <Map size={16} /> Buka di Google Maps
                </a>
              )}
            </div>

            <div className={styles.infoSection}>
              <span className={styles.infoLabel}>Kontak Info</span>
              <span className={styles.infoValue}>
                <Phone size={18} color="var(--color-tosca-main)" /> 
                {dest.contact ? (
                  <a href={`tel:${dest.contact}`} style={{ color: 'var(--color-text)' }}>{dest.contact}</a>
                ) : 'Tidak tersedia'}
              </span>
            </div>

            <div className={styles.infoSection}>
              <span className={styles.infoLabel}>Fasilitas</span>
              {parsedFacilities && parsedFacilities.length > 0 ? (
                <div className={styles.facilities}>
                  {parsedFacilities.map((fac: string, idx: number) => (
                    <span key={idx} className={styles.facilityTag}>{fac}</span>
                  ))}
                </div>
              ) : (
                <span className={styles.infoValue}>-</span>
              )}
            </div>

            {/* Report Button */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <button 
                className="btn btn-ghost" 
                style={{ width: '100%', color: 'var(--color-error)' }}
                onClick={() => {
                  if (!userId) return addToast('Silakan login untuk melaporkan destinasi.', 'error')
                  setIsReportOpen(true)
                }}
              >
                <AlertTriangle size={18} /> Laporkan Info Salah
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {isReportOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsReportOpen(false)}>
          <div className={`${styles.modalContent} animate-fade-in`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Laporkan Destinasi</h3>
              <button className={styles.closeBtn} onClick={() => setIsReportOpen(false)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              {existingReport ? (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <FileWarning size={48} color="var(--color-warning)" style={{ margin: '0 auto 1rem' }} />
                  <h4>Anda telah melaporkan destinasi ini</h4>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                    Pada tanggal {new Date(existingReport.created_at).toLocaleDateString('id-ID')}<br/>
                    Status: <strong>{existingReport.status}</strong>
                  </p>
                  
                  {isPendingReport && (
                    <button 
                      className="btn btn-outline"
                      style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                      onClick={() => {
                        if (confirm('Yakin ingin membatalkan laporan ini?')) {
                          cancelReportMutation.mutate(existingReport.id)
                        }
                      }}
                      disabled={cancelReportMutation.isPending}
                    >
                      {cancelReportMutation.isPending ? 'Membatalkan...' : 'Batalkan Laporan'}
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="filterGroup">
                    <label className="label">Jenis Laporan</label>
                    <select className="input-field" value={reportType} onChange={e => setReportType(e.target.value)}>
                      <option value="info_salah">Informasi Salah</option>
                      <option value="tempat_tutup">Tempat Tutup Permanen/Sementara</option>
                      <option value="harga_berubah">Harga Tiket Berubah</option>
                      <option value="lokasi_salah">Lokasi Tidak Sesuai</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div className="filterGroup">
                    <label className="label">Deskripsi Tambahan <span style={{ color: 'var(--color-error)' }}>*</span></label>
                    <textarea 
                      className="input-field" 
                      rows={4} 
                      placeholder="Jelaskan masalah yang Anda temukan (min 10 karakter)..."
                      value={reportDesc}
                      onChange={e => setReportDesc(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="filterGroup">
                    <label className="label">Bukti Foto (Opsional)</label>
                    <div style={{ padding: '12px', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                      Fitur upload foto segera hadir
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className="btn btn-ghost" onClick={() => setIsReportOpen(false)}>
                {existingReport ? 'Tutup' : 'Batal'}
              </button>
              {!existingReport && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => reportMutation.mutate()}
                  disabled={reportMutation.isPending || reportDesc.trim().length < 10}
                >
                  {reportMutation.isPending ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
