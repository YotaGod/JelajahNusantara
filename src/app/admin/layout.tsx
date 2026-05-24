'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getUserProfile } from '@/lib/api'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Map as MapIcon, Users, AlertTriangle, LogOut, Menu, X, FolderPlus } from 'lucide-react'
import './admin.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        try {
          const userProfile = await getUserProfile(user.id)
          setProfile(userProfile)
        } catch (error) {
          console.error("Error fetching profile:", error)
        }
      }
      setIsLoading(false)
    }
    fetchProfile()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (isLoading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading Admin...</div>
  }

  if (!profile) return null // Handled by middleware

  const role = profile.role
  const isSuperAdmin = role === 'super_admin'

  return (
    <div className="adminLayout">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="modalOverlay" 
          style={{ zIndex: 90 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`adminSidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebarHeader">
          <h2>Wisata Banten</h2>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Admin Dashboard</p>
        </div>

        <nav className="sidebarMenu">
          <Link 
            href="/admin" 
            className={`menuItem ${pathname === '/admin' ? 'menuItemActive' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          
          <Link 
            href="/admin/destinations" 
            className={`menuItem ${pathname.startsWith('/admin/destinations') ? 'menuItemActive' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <MapIcon size={20} />
            Kelola Destinasi
          </Link>

          {isSuperAdmin && (
            <Link 
              href="/admin/users" 
              className={`menuItem ${pathname.startsWith('/admin/users') ? 'menuItemActive' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <Users size={20} />
              Kelola Pengguna
            </Link>
          )}

          <Link 
            href="/admin/reports" 
            className={`menuItem ${pathname.startsWith('/admin/reports') ? 'menuItemActive' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <AlertTriangle size={20} />
            Kelola Laporan
          </Link>

          <Link 
            href="/admin/proposals" 
            className={`menuItem ${pathname.startsWith('/admin/proposals') ? 'menuItemActive' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <FolderPlus size={20} />
            Pengajuan Data
          </Link>
        </nav>

        <div className="sidebarFooter">
          <button className="logoutBtn" onClick={handleLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="adminMain">
        <header className="adminHeader">
          <div className="headerTitle">
            <button className="mobileMenuBtn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <span>
              {pathname === '/admin' ? 'Dashboard Summary' : 
               pathname.startsWith('/admin/destinations') ? 'Destinasi' : 
               pathname.startsWith('/admin/users') ? 'Pengguna' : 
               pathname.startsWith('/admin/proposals') ? 'Pengajuan Data' : 'Laporan'}
            </span>
          </div>

          <div className="adminProfile">
            <div className="adminProfileInfo">
              <div className="adminName">{profile.full_name}</div>
              <div className="adminRole">{profile.role.replace('_', ' ')}</div>
            </div>
            <div className="adminAvatar">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                profile.full_name.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        </header>

        <div className="adminContent">
          {children}
        </div>
      </main>
    </div>
  )
}
