import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import styles from './Header.module.css'
import { LogOut, User, LayoutDashboard, Map, ChevronDown, Compass } from 'lucide-react'
import UserDropdown from './UserDropdown'

export default async function Header() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userRole = 'visitor'
  let avatarUrl: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, avatar_url')
      .eq('id', user.id)
      .single()
    if (profile) {
      userRole = profile.role
      avatarUrl = profile.avatar_url
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
          <Link href="/kontak" className={styles.navLink}>Kontak</Link>
        </nav>

        {/* Right Nav */}
        <div className={styles.rightNav}>
          {user ? (
            <UserDropdown user={user} isAdmin={isAdmin} avatarUrl={avatarUrl} />
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
