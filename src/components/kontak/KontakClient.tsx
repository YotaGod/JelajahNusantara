'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCities, submitFeedback } from '@/lib/api'
import { MessageSquare, Send, Building, MapPin, AlertCircle, CheckCircle2, Home } from 'lucide-react'
import styles from './Kontak.module.css'

interface KontakClientProps {
  userId: string
}

export default function KontakClient({ userId }: KontakClientProps) {
  const router = useRouter()
  
  const [cities, setCities] = useState<any[]>([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [targetAdminType, setTargetAdminType] = useState<'super_admin' | 'regional_admin'>('super_admin')
  const [targetCityId, setTargetCityId] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const loadCities = async () => {
      try {
        setIsLoading(true)
        const data = await getCities()
        setCities(data || [])
      } catch (err) {
        console.error('Gagal mengambil data kota:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadCities()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    if (!subject.trim()) {
      setErrorMsg('Subjek masukan tidak boleh kosong.')
      return
    }
    if (!message.trim()) {
      setErrorMsg('Pesan masukan tidak boleh kosong.')
      return
    }
    if (targetAdminType === 'regional_admin' && !targetCityId) {
      setErrorMsg('Silakan pilih kota regional tujuan.')
      return
    }

    try {
      setIsSubmitting(true)
      await submitFeedback(
        userId,
        subject,
        message,
        targetAdminType,
        targetAdminType === 'regional_admin' ? targetCityId : undefined
      )
      setIsSuccess(true)
      setSubject('')
      setMessage('')
      setTargetCityId('')
    } catch (err: any) {
      console.error('Error submitting feedback:', err)
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengirimkan masukan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.pageContainer}>
      {/* Background Hero Image */}
      <div className={styles.heroBackground}>
        <img src="/img/About_us.jpg" alt="Background" className={styles.bgImage} />
        <div className={styles.darkOverlay}></div>
      </div>

      <main className={styles.mainContent}>
        <div className={styles.glassCard}>
          {isSuccess ? (
            <div className={styles.successWrapper}>
              <div className={styles.successIconWrapper}>
                <CheckCircle2 size={48} className={styles.successIcon} />
              </div>
              <h2 className={styles.successTitle}>Masukan Terkirim!</h2>
              <p className={styles.successMessage}>
                Terima kasih atas masukan Anda. Laporan/saran Anda telah berhasil dikirimkan ke{' '}
                {targetAdminType === 'super_admin' ? 'Admin Pusat' : 'Admin Regional'} untuk ditindaklanjuti.
              </p>
              
              <div className={styles.successActions}>
                <button 
                  onClick={() => setIsSuccess(false)} 
                  className={styles.btnSecondary}
                >
                  Kirim Masukan Lain
                </button>
                <button 
                  onClick={() => router.push('/')} 
                  className={styles.btnPrimary}
                >
                  <Home size={16} /> Kembali ke Beranda
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className={styles.title}>Hubungi Kami</h1>
              <div className={styles.divider}></div>
              <p className={styles.subtitle}>
                Kirimkan pertanyaan, laporan, maupun masukan Anda secara langsung kepada tim Admin Pusat kami atau Admin Regional kota tertentu.
              </p>

              {errorMsg && (
                <div className={styles.errorBanner}>
                  <AlertCircle size={18} className={styles.errorIcon} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Form Group: Subject */}
                <div className={styles.formGroup}>
                  <label htmlFor="subject" className={styles.label}>
                    Judul / Subjek Masukan
                  </label>
                  <div className={styles.inputWrapper}>
                    <MessageSquare size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Masukkan judul masukan Anda..."
                      className={styles.input}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                {/* Form Group: Target Admin Type */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tujuan Masukan</label>
                  <div className={styles.radioGrid}>
                    <label 
                      className={`${styles.radioLabel} ${targetAdminType === 'super_admin' ? styles.radioActive : ''}`}
                      onClick={() => setTargetAdminType('super_admin')}
                    >
                      <input
                        type="radio"
                        name="targetAdminType"
                        checked={targetAdminType === 'super_admin'}
                        onChange={() => setTargetAdminType('super_admin')}
                        className={styles.radioInput}
                        disabled={isSubmitting}
                      />
                      <Building size={16} />
                      <div className={styles.radioTextWrapper}>
                        <span className={styles.radioTitle}>Admin Pusat</span>
                        <span className={styles.radioDesc}>Umum & Seluruh Provinsi Banten</span>
                      </div>
                    </label>

                    <label 
                      className={`${styles.radioLabel} ${targetAdminType === 'regional_admin' ? styles.radioActive : ''}`}
                      onClick={() => setTargetAdminType('regional_admin')}
                    >
                      <input
                        type="radio"
                        name="targetAdminType"
                        checked={targetAdminType === 'regional_admin'}
                        onChange={() => setTargetAdminType('regional_admin')}
                        className={styles.radioInput}
                        disabled={isSubmitting}
                      />
                      <MapPin size={16} />
                      <div className={styles.radioTextWrapper}>
                        <span className={styles.radioTitle}>Admin Regional</span>
                        <span className={styles.radioDesc}>Khusus Kota/Kabupaten pilihan</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Form Group: City Selection (Visible only if target is regional) */}
                {targetAdminType === 'regional_admin' && (
                  <div className={`${styles.formGroup} ${styles.animateFadeIn}`}>
                    <label htmlFor="targetCityId" className={styles.label}>
                      Pilih Kota/Kabupaten Regional
                    </label>
                    <div className={styles.inputWrapper}>
                      <MapPin size={18} className={styles.inputIcon} />
                      <select
                        id="targetCityId"
                        value={targetCityId}
                        onChange={(e) => setTargetCityId(e.target.value)}
                        className={styles.select}
                        disabled={isSubmitting || isLoading}
                        required
                      >
                        <option value="">-- Pilih Kota/Kabupaten --</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Form Group: Message */}
                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.label}>
                    Isi Pesan / Masukan
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tuliskan saran, pertanyaan, atau masukan detail Anda di sini..."
                    className={styles.textarea}
                    rows={6}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {/* Action Submit */}
                <button
                  type="submit"
                  className={styles.btnSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className={styles.spinner}></div>
                      Mengirimkan...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Kirim Masukan
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
