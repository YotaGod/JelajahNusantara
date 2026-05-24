import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import styles from './Header.module.css'
import { LogOut, User, LayoutDashboard, Map } from 'lucide-react'

export default async function Header() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userRole = 'visitor'
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile) {
      userRole = profile.role
    }
  }

  const isAdmin = userRole === 'regional_admin' || userRole === 'super_admin'

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <Link href="/" className={styles.logo}>
          <span className="text-gradient">Wisata Banten</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/map" className="btn btn-ghost" style={{ padding: 'var(--spacing-2) var(--spacing-3)' }}>
            <Map size={18} />
            <span className="hidden-mobile">Peta Wisata</span>
          </Link>
          
          {user ? (
            <div className={styles.userMenu}>
              {isAdmin && (
                <Link href="/admin" className="btn btn-ghost" style={{ padding: 'var(--spacing-2) var(--spacing-3)' }} title="Dashboard Admin">
                  <LayoutDashboard size={20} />
                </Link>
              )}
              
              <Link href="/profile" className={styles.userName}>
                <User size={18} />
                <span className="hidden-mobile">{profile?.full_name || user.email?.split('@')[0]}</span>
              </Link>
              
              <form action="/auth/signout" method="post">
                <button type="submit" className="btn btn-outline" style={{ padding: 'var(--spacing-2) var(--spacing-3)' }}>
                  <LogOut size={18} />
                  <span className="hidden-mobile">Logout</span>
                </button>
              </form>
            </div>
          ) : (
            <div className={styles.userMenu}>
              <Link href="/login" className="btn btn-ghost">
                Login
              </Link>
              <Link href="/register" className="btn btn-primary">
                Daftar
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
