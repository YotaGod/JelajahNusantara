'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getAdminDashboardStats } from '@/lib/adminApi'
import { getUserProfile } from '@/lib/api'
import Link from 'next/link'
import { Map, Users, AlertTriangle, Star } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const profile = await getUserProfile(user.id)
        if (profile) {
          try {
            const data = await getAdminDashboardStats(profile.role, profile.region_city_id)
            setStats(data)
          } catch (error) {
            console.error("Failed to fetch stats", error)
          }
        }
      }
      setIsLoading(false)
    }
    fetchStats()
  }, [])

  if (isLoading) return <div>Memuat data...</div>
  if (!stats) return <div>Gagal memuat statistik.</div>

  return (
    <div className="animate-fade-in">
      <div className="statsGrid">
        <div className="statCard">
          <div className="statIcon statIconBlue">
            <Map size={24} />
          </div>
          <div className="statInfo">
            <h3>Total Destinasi</h3>
            <div className="statValue">{stats.totalDestinations}</div>
          </div>
        </div>

        {stats.totalUsers > 0 && (
          <div className="statCard">
            <div className="statIcon statIconGreen">
              <Users size={24} />
            </div>
            <div className="statInfo">
              <h3>Total Pengguna</h3>
              <div className="statValue">{stats.totalUsers}</div>
            </div>
          </div>
        )}

        <Link href="/admin/reports" className="statCard" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="statIcon statIconRed">
            <AlertTriangle size={24} />
          </div>
          <div className="statInfo">
            <h3>Laporan Pending</h3>
            <div className="statValue">{stats.totalReports}</div>
          </div>
        </Link>

        <div className="statCard">
          <div className="statIcon statIconYellow">
            <Star size={24} />
          </div>
          <div className="statInfo">
            <h3>Rata-rata Rating</h3>
            <div className="statValue">{stats.avgRating.toFixed(1)} <span style={{fontSize:'0.875rem', fontWeight:'normal', color:'var(--color-text-muted)'}}>dari {stats.totalReviews} Ulasan</span></div>
          </div>
        </div>
      </div>

      <div className="tableContainer" style={{ padding: 'var(--spacing-6)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Selamat Datang di Dashboard Admin</h3>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
          Gunakan menu di sebelah kiri untuk mengelola destinasi, melihat laporan pengunjung, dan mengatur pengguna. 
          {stats.totalUsers === 0 ? ' Sebagai Regional Admin, Anda hanya memiliki akses terbatas pada destinasi di wilayah yang telah ditetapkan.' : ' Sebagai Super Admin, Anda memiliki kontrol penuh atas seluruh sistem.'}
        </p>
      </div>
    </div>
  )
}
