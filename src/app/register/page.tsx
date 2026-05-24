'use client'

import { useState } from 'react'
import { signup } from '../login/actions'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

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
    <div className="container" style={{ padding: 'var(--spacing-16) 0', maxWidth: '400px' }}>
      <div style={{ backgroundColor: 'var(--color-card)', padding: 'var(--spacing-8)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-6)', textAlign: 'center' }}>
          Daftar Akun <span className="text-gradient">Wisata Banten</span>
        </h1>
        
        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)', display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-2)', fontSize: '0.875rem' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} /> <span>{errorMsg}</span>
          </div>
        )}
        
        {successMsg && (
          <div style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', color: 'var(--color-tosca-dark)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)', display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-2)', fontSize: '0.875rem' }}>
            <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} /> <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div className="filterGroup">
            <label className="label">Nama Lengkap</label>
            <input type="text" name="full_name" className="input-field" placeholder="Nama Anda" required suppressHydrationWarning />
          </div>
          <div className="filterGroup">
            <label className="label">Email</label>
            <input type="email" name="email" className="input-field" placeholder="nama@email.com" required suppressHydrationWarning />
          </div>
          <div className="filterGroup">
            <label className="label">Password</label>
            <input type="password" name="password" className="input-field" placeholder="Minimal 6 karakter" required minLength={6} suppressHydrationWarning />
          </div>
          <div className="filterGroup">
            <label className="label">Konfirmasi Password</label>
            <input type="password" name="confirm_password" className="input-field" placeholder="Ketik ulang password" required minLength={6} suppressHydrationWarning />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--spacing-4)' }} disabled={isLoading} suppressHydrationWarning>
            {isLoading ? 'Loading...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div style={{ marginTop: 'var(--spacing-6)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Sudah punya akun? <Link href="/login" style={{ color: 'var(--color-tosca-main)', fontWeight: 600 }}>Login di sini</Link>
        </div>
      </div>
    </div>
  )
}
