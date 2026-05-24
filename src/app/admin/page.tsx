'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getAdminDashboardStats, getAdminChartData } from '@/lib/adminApi'
import { getUserProfile } from '@/lib/api'
import Link from 'next/link'
import { Map, Users, AlertTriangle, Star } from 'lucide-react'
import DashboardCharts from '@/components/admin/DashboardCharts'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [chartData, setChartData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 7 days ago
    endDate: new Date()
  })
  
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const profile = await getUserProfile(user.id)
        if (profile) {
          try {
            const [statsData, chartsData] = await Promise.all([
              getAdminDashboardStats(profile.role, profile.region_city_id),
              getAdminChartData(profile.role, profile.region_city_id, dateRange.startDate, dateRange.endDate)
            ])
            setStats(statsData)
            setChartData(chartsData)
          } catch (error) {
            console.error("Failed to fetch dashboard data", error)
          }
        }
      }
      setIsLoading(false)
    }
    fetchData()
  }, [dateRange])

  if (isLoading && !stats) return <div>Memuat data...</div>
  if (!stats) return <div>Gagal memuat statistik.</div>

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'startDate' | 'endDate') => {
    const newDate = new Date(e.target.value)
    if (!isNaN(newDate.getTime())) {
      setDateRange(prev => ({ ...prev, [field]: newDate }))
    }
  }

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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--spacing-8)', marginBottom: 'var(--spacing-2)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Visualisasi Data</h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Mulai:</label>
            <input 
              type="date" 
              className="input-field" 
              style={{ padding: 'var(--spacing-2)', minHeight: 'auto' }}
              value={dateRange.startDate.toISOString().split('T')[0]} 
              onChange={e => handleDateChange(e, 'startDate')}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Sampai:</label>
            <input 
              type="date" 
              className="input-field" 
              style={{ padding: 'var(--spacing-2)', minHeight: 'auto' }}
              value={dateRange.endDate.toISOString().split('T')[0]} 
              onChange={e => handleDateChange(e, 'endDate')}
            />
          </div>
        </div>
      </div>

      <DashboardCharts data={chartData} />

    </div>
  )
}
