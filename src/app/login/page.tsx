'use client'

import { useState, Suspense } from 'react'
import { login } from './actions'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const searchParams = useSearchParams()
  const errorQuery = searchParams.get('error')
  
  const [errorMsg, setErrorMsg] = useState<string | null>(
    errorQuery === 'AuthCallbackError' ? 'Gagal memproses login. Silakan coba lagi.' : null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)
    
    const formData = new FormData(e.currentTarget)
    try {
      const result = await login(formData)
      if (result?.error) {
        setErrorMsg(result.error)
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== 'NEXT_REDIRECT') {
        setErrorMsg('Terjadi kesalahan yang tidak terduga.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setErrorMsg(null)
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        setErrorMsg(error.message)
        setIsGoogleLoading(false)
      }
      // If successful, the browser will automatically redirect to Google
    } catch {
      setErrorMsg('Gagal terhubung dengan Google.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="container" style={{ padding: 'var(--spacing-16) 0', maxWidth: '400px' }}>
      <div style={{ backgroundColor: 'var(--color-card)', padding: 'var(--spacing-8)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-6)', textAlign: 'center' }}>
          Login ke <span className="text-gradient">Wisata Banten</span>
        </h1>
        
        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: '0.875rem' }}>
            <AlertTriangle size={18} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div className="filterGroup">
            <label className="label">Email</label>
            <input type="email" name="email" className="input-field" placeholder="nama@email.com" required suppressHydrationWarning />
          </div>
          <div className="filterGroup">
            <label className="label">Password</label>
            <input type="password" name="password" className="input-field" placeholder="Minimal 6 karakter" required minLength={6} suppressHydrationWarning />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--spacing-4)' }} disabled={isLoading || isGoogleLoading} suppressHydrationWarning>
            {isLoading ? 'Loading...' : 'Login dengan Email'}
          </button>
        </form>

        <div style={{ margin: 'var(--spacing-6) 0', display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', flexGrow: 1 }}></div>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>atau</span>
          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', flexGrow: 1 }}></div>
        </div>

        <button 
          type="button" 
          className="btn btn-outline" 
          style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 'var(--spacing-2)' }} 
          onClick={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
          suppressHydrationWarning
        >
          {isGoogleLoading ? 'Menghubungkan...' : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Login dengan Google
            </>
          )}
        </button>

        <div style={{ marginTop: 'var(--spacing-6)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Belum punya akun? <Link href="/register" style={{ color: 'var(--color-tosca-main)', fontWeight: 600 }}>Daftar di sini</Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: 'var(--spacing-16) 0', textAlign: 'center' }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
