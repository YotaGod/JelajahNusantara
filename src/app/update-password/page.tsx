'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Compass, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '@/app/login/login.module.css'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Password dan Konfirmasi Password tidak sama.' })
      return
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password harus minimal 6 karakter.' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Password berhasil diperbarui! Mengalihkan...' })
        setTimeout(() => {
          router.push('/login')
        }, 2000)
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
          <div className={styles.logoText}>Perbarui<br/>Password</div>
        </div>
        
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Silakan masukkan password baru Anda di bawah ini.
        </p>

        {message && (
          <div className={styles.errorBox} style={{ backgroundColor: message.type === 'success' ? 'rgba(20, 184, 166, 0.15)' : '', color: message.type === 'success' ? '#14B8A6' : '', borderColor: message.type === 'success' ? 'rgba(20, 184, 166, 0.3)' : '' }}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />} 
            <span style={{ marginLeft: '0.5rem' }}>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Password Baru</label>
            <input 
              type="password" 
              name="password" 
              className={styles.input} 
              placeholder="Minimal 6 karakter" 
              required 
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              suppressHydrationWarning 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Konfirmasi Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              className={styles.input} 
              placeholder="Masukkan ulang password" 
              required 
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              suppressHydrationWarning 
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.primaryBtn} 
            disabled={isLoading || message?.type === 'success'} 
            suppressHydrationWarning
          >
            {isLoading ? 'Menyimpan...' : 'Perbarui Password'}
          </button>
        </form>
        
        <div className={styles.footerText} style={{ marginTop: '2rem' }}>
          <Link href="/login" className={styles.link}>Kembali ke Login</Link>
        </div>
      </div>
    </div>
  )
}
