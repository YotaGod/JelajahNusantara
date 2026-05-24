'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUserProfile, getUserStats, getUserFavorites, getCities, updateUserHomeCity } from '@/lib/api'
import { User, Mail, Shield, Calendar, Star, Heart, MessageSquare, LogOut, Edit, MapPin } from 'lucide-react'
import DestinationCard from '@/components/home/DestinationCard'
import { useFavorites } from '@/hooks/useFavorites'
import Link from 'next/link'
import styles from './Profile.module.css'

export default function ProfileClient({ userId, email }: { userId: string, email: string }) {
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getUserProfile(userId),
  })

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['profile-stats', userId],
    queryFn: () => getUserStats(userId),
  })

  const { data: favorites, isLoading: isFavsLoading } = useQuery({
    queryKey: ['profile-favorites', userId],
    queryFn: () => getUserFavorites(userId),
  })

  const { favoriteIds } = useFavorites()
  const displayFavorites = favorites?.filter((dest: any) => favoriteIds.includes(dest.id)) || []

  const [cities, setCities] = useState<any[]>([])
  const [selectedCity, setSelectedCity] = useState('')
  const [isSavingCity, setIsSavingCity] = useState(false)

  useEffect(() => {
    getCities().then(data => setCities(data || []))
  }, [])

  useEffect(() => {
    if (profile?.home_city_id) {
      setSelectedCity(profile.home_city_id)
    }
  }, [profile])

  const handleSaveCity = async () => {
    if (!selectedCity) return
    setIsSavingCity(true)
    try {
      await updateUserHomeCity(userId, selectedCity)
      alert('Daerah tempat tinggal berhasil disimpan!')
    } catch (e) {
      alert('Gagal menyimpan daerah.')
    }
    setIsSavingCity(false)
  }

  if (isProfileLoading) {
    return <div className="container grid" style={{ placeItems: 'center', minHeight: '50vh' }}><h3>Loading profil...</h3></div>
  }

  const roleText = {
    visitor: 'Pengunjung',
    user: 'Anggota',
    regional_admin: 'Admin Daerah',
    super_admin: 'Super Admin'
  }

  const roleBadgeColor = {
    visitor: 'var(--color-text-muted)',
    user: 'var(--color-tosca-main)',
    regional_admin: '#8b5cf6', // purple
    super_admin: 'var(--color-error)'
  }

  const profileRole = profile?.role || 'visitor'
  const displayRole = roleText[profileRole as keyof typeof roleText]
  const badgeColor = roleBadgeColor[profileRole as keyof typeof roleBadgeColor]
  const joinDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'

  return (
    <div className={`container ${styles.pageContainer}`}>
      <div className={styles.gridContainer}>
        {/* Sidebar Info Kiri */}
        <div className={styles.sidebar}>
          <div className={styles.profileCard}>
            <div className={styles.avatarContainer}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {profile?.full_name?.charAt(0).toUpperCase() || email.charAt(0).toUpperCase()}
                </div>
              )}
              <button 
                className={styles.editAvatarBtn} 
                title="Fitur ubah foto segera hadir"
                onClick={() => alert("Fitur edit profil akan hadir di tahap selanjutnya.")}
              >
                <Edit size={14} />
              </button>
            </div>
            
            <h2 className={styles.profileName}>{profile?.full_name || 'Pengguna Tanpa Nama'}</h2>
            <span 
              className={styles.roleBadge} 
              style={{ backgroundColor: `${badgeColor}15`, color: badgeColor }}
            >
              <Shield size={14} /> {displayRole}
            </span>

            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <Mail size={16} className={styles.infoIcon} />
                <span>{email}</span>
              </div>
              <div className={styles.infoItem}>
                <Calendar size={16} className={styles.infoIcon} />
                <span>Bergabung {joinDate}</span>
              </div>
            </div>

            <div style={{ marginTop: 'var(--spacing-4)', width: '100%' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>
                <MapPin size={14} /> Daerah Tempat Tinggal
              </label>
              <select 
                className="input-field" 
                style={{ width: '100%', marginBottom: '8px' }}
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
              >
                <option value="">-- Pilih Kota/Kab --</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {selectedCity !== profile?.home_city_id && selectedCity !== '' && (
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', fontSize: '0.875rem', padding: '6px' }}
                  onClick={handleSaveCity}
                  disabled={isSavingCity}
                >
                  {isSavingCity ? 'Menyimpan...' : 'Simpan Daerah'}
                </button>
              )}
            </div>

            <form action="/auth/signout" method="post" style={{ width: '100%', marginTop: 'var(--spacing-6)' }}>
              <button type="submit" className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 'var(--spacing-2)' }}>
                <LogOut size={18} /> Logout
              </button>
            </form>
          </div>
        </div>

        {/* Konten Kanan */}
        <div className={styles.contentArea}>
          {/* Stats Row */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
                <Star size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{isStatsLoading ? '-' : stats?.reviews}</span>
                <span className={styles.statLabel}>Ulasan</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' }}>
                <Heart size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{isStatsLoading ? '-' : favoriteIds.length}</span>
                <span className={styles.statLabel}>Favorit</span>
              </div>
            </div>
            <Link href="/reports/history" className={styles.statCard} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={styles.statIcon} style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                <MessageSquare size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{isStatsLoading ? '-' : stats?.reports}</span>
                <span className={styles.statLabel}>Laporan</span>
              </div>
            </Link>
          </div>

          {/* Favorites List */}
          <div className={styles.sectionHeader}>
            <h3>Destinasi Favorit Saya</h3>
            <Link href="/favorites" className="btn btn-ghost">
              Lihat Semua
            </Link>
          </div>
          
          {isFavsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '300px' }} />
              ))}
            </div>
          ) : displayFavorites && displayFavorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 'var(--spacing-4)' }}>
              {displayFavorites.map((dest: any) => (
                <DestinationCard key={dest.id} dest={dest} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Heart size={48} color="var(--color-border-focus)" style={{ marginBottom: '1rem' }} />
              <h4>Belum ada destinasi favorit</h4>
              <p>Jelajahi wisata Banten dan simpan destinasi favorit Anda di sini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
