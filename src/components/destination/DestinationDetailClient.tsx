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
    <div className={styles.pageContainer}>
      {/* Full Width Hero Image */}
      <div className={styles.heroImageContainer}>
        <Link href="/" className={`btn btn-ghost ${styles.backBtn}`}>
          <ArrowLeft size={20} /> Kembali
        </Link>
        {mainImage ? (
          <>
            <div className={styles.heroImageBlur} style={{ backgroundImage: `url(${mainImage})` }}></div>
            <img src={mainImage} alt={dest.name} className={styles.heroImage} />
          </>
        ) : (
          <div className={styles.heroPlaceholder}>Tidak ada foto</div>
        )}
      </div>

      <div className={`container ${styles.gridContainer}`}>
        {/* Main Column (White) */}
        <div className={styles.leftColumn}>
          {/* Header Info */}
          <div className={styles.headerRow}>
            <div className={styles.titleArea}>
              <h1>{dest.name}</h1>
              <div className={styles.badges}>
                <span className={styles.badge} style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                  <Star size={14} fill="#F59E0B" color="#F59E0B" /> {avgRating > 0 ? avgRating.toFixed(1) : 'Baru'} ({reviewCount} Ulasan)
                </span>
                <span className={styles.badge} style={{ backgroundColor: '#f1f5f9' }}>{dest.category?.name}</span>
                <span className={styles.badge} style={{ backgroundColor: '#f1f5f9' }}><MapPin size={14} /> {dest.city?.name}</span>
                <span className={`${styles.badge} ${styles.popular}`}>Populer</span>
              </div>
            </div>
            <div className={styles.actionButtons}>
              <FavoriteButton 
                destinationId={destinationId} 
                size={24} 
              />
            </div>
          </div>

          {/* Description */}
          <div className={styles.descriptionSection}>
            <h2 className={styles.sectionTitle}>Tentang Destinasi</h2>
            <div className={styles.descriptionText} style={{ textAlign: 'justify' }}>{dest.description || 'Belum ada deskripsi.'}</div>
          </div>

          {/* Gallery */}
          {dest.photos && dest.photos.length > 0 && (
            <div className={styles.descriptionSection}>
              <h2 className={styles.sectionTitle}>Galeri Foto</h2>
              <div className={styles.galleryGrid}>
                {dest.photos.slice(0, 5).map((photo: any) => (
                  <div key={photo.id} className={styles.galleryThumb} onClick={() => setMainImage(photo.image_url)}>
                    <img src={photo.image_url} alt="Thumbnail" className={styles.thumbImg} loading="lazy" />
                  </div>
                ))}
              </div>
              {dest.photos.length > 5 && (
                <button className={styles.seeAllBtn}>Lihat Semua Foto</button>
              )}
            </div>
          )}



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
                window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' })
              }}
            />
            
            {/* Write Review Button mapped to Form state */}
            {canReview && (!userReview || editingReview) && (
              <button 
                className={reviewStyles.writeReviewBtn}
                onClick={() => {
                  if (!editingReview) {
                    // To do: expand form
                  }
                }}
              >
                Tulis Ulasan
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className={styles.rightColumn}>
          {/* Harga Tiket */}
          <div className={`${styles.glassCard} ${styles.ticketCard}`}>
            <span className={styles.ticketLabel}>Harga Tiket Masuk</span>
            <div className={styles.ticketPrice}>{formatPrice(dest.price)}</div>
          </div>

          {/* Jam Operasional */}
          <div className={styles.glassCard}>
            <div className={styles.infoRow}>
              <Clock size={24} className={styles.infoIcon} color="#FBBF24" />
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Jam Operasional</span>
                <span className={styles.infoValue}>{dest.open_hours || 'Buka Setiap Hari | 08:00 - 17:00 WIB'}</span>
              </div>
            </div>
          </div>

          {/* Cuaca Langsung */}
          {dest.latitude && dest.longitude && (
            <div className={styles.glassCard} style={{ padding: '0' }}>
              <WeatherWidget latitude={dest.latitude} longitude={dest.longitude} />
            </div>
          )}

          {/* Alamat Lengkap */}
          <div className={styles.glassCard}>
            <div className={styles.infoRow}>
              <MapPin size={24} className={styles.infoIcon} color="#FBBF24" />
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Alamat Lengkap</span>
                <span className={styles.infoValue}>{dest.address || 'Tidak tersedia'}</span>
              </div>
            </div>
            
            {/* Map Placeholder or Actual Component */}
            {dest.latitude && dest.longitude ? (
              <div style={{ marginTop: '1rem', width: '100%', height: '200px', backgroundColor: '#e2e8f0', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <iframe 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  loading="lazy" 
                  allowFullScreen 
                  referrerPolicy="no-referrer-when-downgrade" 
                  src={`https://maps.google.com/maps?q=${dest.latitude},${dest.longitude}&z=14&output=embed`}
                ></iframe>
              </div>
            ) : (
              <div style={{ marginTop: '1rem', width: '100%', height: '200px', backgroundColor: '#e2e8f0', borderRadius: '0.5rem', overflow: 'hidden', position: 'relative' }}>
                 <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexDirection: 'column', gap: '0.5rem' }}>
                    <MapPin size={32} />
                    <span>Peta tidak tersedia</span>
                 </div>
              </div>
            )}

            {dest.map_url && (
              <a 
                href={dest.map_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none' }}
              >
                Buka di Google Maps
              </a>
            )}
          </div>

          {/* Fasilitas & Kontak */}
          <div className={styles.glassCard}>
            <div className={styles.infoRow}>
              <Phone size={20} className={styles.infoIcon} />
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Kontak Info</span>
                <span className={styles.infoValue}>
                  {dest.contact ? <a href={`tel:${dest.contact}`} style={{ color: 'white' }}>{dest.contact}</a> : 'Tidak tersedia'}
                </span>
              </div>
            </div>
            <div className={styles.infoRow} style={{ marginTop: '1rem' }}>
              <div className={styles.infoContent} style={{ width: '100%' }}>
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
            </div>
            
            {/* Report Button */}
            <div style={{ marginTop: '1.5rem' }}>
              <button 
                className="btn btn-outline" 
                style={{ width: '100%', justifyContent: 'center', borderColor: 'rgba(239, 68, 68, 0.5)', color: '#fca5a5' }}
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
