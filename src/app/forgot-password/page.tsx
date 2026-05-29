'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Compass, CheckCircle2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import styles from '@/app/login/login.module.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Tautan reset password telah dikirim ke email Anda. Silakan periksa inbox atau folder spam.' })
        setEmail('')
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan yang tidak terduga.' })
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
          <div className={styles.logoText}>Lupa<br/>Password</div>
        </div>
        
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Masukkan alamat email yang terdaftar, dan kami akan mengirimkan tautan untuk mengatur ulang password Anda.
        </p>

        {message && (
          <div className={styles.errorBox} style={{ backgroundColor: message.type === 'success' ? 'rgba(20, 184, 166, 0.15)' : '', color: message.type === 'success' ? '#14B8A6' : '', borderColor: message.type === 'success' ? 'rgba(20, 184, 166, 0.3)' : '' }}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />} 
            <span style={{ marginLeft: '0.5rem' }}>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input 
              type="email" 
              name="email" 
              className={styles.input} 
              placeholder="nama@email.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              suppressHydrationWarning 
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.primaryBtn} 
            disabled={isLoading} 
            suppressHydrationWarning
          >
            {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
          </button>
        </form>

        <div className={styles.footerText} style={{ marginTop: '2rem' }}>
          Ingat password Anda? <Link href="/login" className={styles.link}>Kembali ke Login</Link>
        </div>
      </div>
    </div>
  )
}
