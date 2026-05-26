'use client'

import { useState } from 'react'
import { signup } from '../login/actions'
import { AlertTriangle, CheckCircle, Compass } from 'lucide-react'
import Link from 'next/link'
import styles from '../login/login.module.css'

export default function RegisterPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    
    const formData = new FormData(e.currentTarget)
    
    // Validasi konfirmasi password
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string
    
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.')
      setIsLoading(false)
      return
    }

    try {
      const result = await signup(formData)
      if (result?.error) {
        setErrorMsg(result.error)
      } else if (result?.success) {
        setSuccessMsg('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi sebelum login.')
        // Form akan tetap tampil atau bisa di-reset.
      }
    } catch (err: any) {
      if (err.message !== 'NEXT_REDIRECT') {
        setErrorMsg('Terjadi kesalahan yang tidak terduga saat pendaftaran.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.overlay}></div>
      <div className={styles.loginCard}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>
            <Compass size={28} />
          </div>
          <div className={styles.logoText}>Jelajah<br/>Nusantara</div>
        </div>
        
        {errorMsg && (
          <div className={styles.errorBox}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} /> <span>{errorMsg}</span>
          </div>
        )}
        
        {successMsg && (
          <div className={styles.errorBox} style={{ backgroundColor: 'rgba(20, 184, 166, 0.15)', borderColor: 'rgba(20, 184, 166, 0.3)', color: '#5eead4' }}>
            <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} /> <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Nama Lengkap</label>
            <input 
              type="text" 
              name="full_name" 
              className={styles.input} 
              placeholder="Nama Anda" 
              required 
              suppressHydrationWarning 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input 
              type="email" 
              name="email" 
              className={styles.input} 
              placeholder="nama@email.com" 
              required 
              suppressHydrationWarning 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input 
              type="password" 
              name="password" 
              className={styles.input} 
              placeholder="Minimal 6 karakter" 
              required 
              minLength={6} 
              suppressHydrationWarning 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Konfirmasi Password</label>
            <input 
              type="password" 
              name="confirm_password" 
              className={styles.input} 
              placeholder="Ketik ulang password" 
              required 
              minLength={6} 
              suppressHydrationWarning 
            />
          </div>
          <button type="submit" className={styles.primaryBtn} disabled={isLoading} suppressHydrationWarning>
            {isLoading ? 'Loading...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className={styles.footerText}>
          Sudah punya akun? <Link href="/login" className={styles.link}>Login di sini</Link>
        </div>
      </div>
    </div>
  )
}
