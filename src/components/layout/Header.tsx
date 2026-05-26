import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import styles from './Header.module.css'
import { LogOut, User, LayoutDashboard, Map, ChevronDown, Compass } from 'lucide-react'

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
        
        {/* Logo */}
        <Link href="/" className={styles.logoGroup}>
          <div className={styles.logoIcon}>
            <Compass size={24} color="white" />
          </div>
          <span className={styles.logoText}>Jelajah<br/>Nusantara</span>
        </Link>

        {/* Center Nav */}
        <nav className={styles.centerNav}>
          <Link href="/" className={`${styles.navLink} ${styles.active}`}>Home</Link>
          <Link href="/map" className={styles.navLink}>Peta</Link>
          <Link href="/about" className={styles.navLink}>Tentang Kami</Link>
          <span className={styles.navLink}>Kontak</span>
        </nav>

        {/* Right Nav */}
        <div className={styles.rightNav}>
          {user ? (
            <div className={styles.userPill}>
              <div className={styles.avatar}>
                <User size={16} color="var(--color-bg)" />
              </div>
              <span className={styles.userName}>
                {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
              </span>
              <ChevronDown size={16} color="var(--color-text-muted)" />
              
              <div className={styles.dropdown}>
                {isAdmin && (
                  <Link href="/admin" className={styles.dropdownItem}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                )}
                <Link href="/profile" className={styles.dropdownItem}>
                  <User size={16} /> Profil
                </Link>
                <form action="/auth/signout" method="post" style={{ margin: 0 }}>
                  <button type="submit" className={styles.dropdownItem} style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                    <LogOut size={16} /> Logout
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className={styles.userMenu}>
              <Link href="/login" className={styles.navLink}>
                Login
              </Link>
              <Link href="/register" className={styles.registerBtn}>
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
