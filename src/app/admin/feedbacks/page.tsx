'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getAdminFeedbacks } from '@/lib/adminApi'
import { getUserProfile } from '@/lib/api'
import { Info, X, Mail, MapPin, ShieldAlert, Calendar, User } from 'lucide-react'

export default function AdminFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Detail Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null)

  const supabase = createClient()

  const loadData = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        let p = profile
        if (!p) {
          p = await getUserProfile(user.id)
          setProfile(p)
        }
        const { data, totalPages: tp } = await getAdminFeedbacks(p.role, p.region_city_id, page)
        setFeedbacks(data)
        setTotalPages(tp)
      }
    } catch (e) {
      console.error('Gagal mengambil data masukan/keluhan:', e)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [page])

  const openDetail = (fb: any) => {
    setSelectedFeedback(fb)
    setIsModalOpen(true)
  }

  return (
    <div>
      <div className="tableContainer animate-fade-in-up" style={{ marginTop: '1rem' }}>
        <div className="adminTableWrapper">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Pengirim</th>
                <th>Subjek</th>
                <th>Tujuan Admin</th>
                <th>Wilayah / Kota</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    Memuat data masukan...
                  </td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    Tidak ada masukan atau keluhan dari pengguna.
                  </td>
                </tr>
              ) : (
                feedbacks.map((fb) => (
                  <tr key={fb.id}>
                    <td>{new Date(fb.created_at).toLocaleDateString('id-ID')}</td>
                    <td>
                      <span style={{ fontWeight: 500 }}>
                        {fb.user?.full_name || 'Pengguna'}
                      </span>
                    </td>
                    <td>{fb.subject}</td>
                    <td>
                      <span className={`badge ${fb.target_admin_type === 'super_admin' ? 'resolved' : 'pending'}`}>
                        {fb.target_admin_type === 'super_admin' ? 'Admin Pusat' : 'Admin Regional'}
                      </span>
                    </td>
                    <td>{fb.city?.name || '-'}</td>
                    <td>
                      <div className="actionCell" style={{ justifyContent: 'flex-end' }}>
                        <button 
                          className="iconBtn" 
                          title="Lihat Pesan Lengkap" 
                          onClick={() => openDetail(fb)}
                        >
                          <Info size={16} color="var(--color-ocean-main)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="modalFooter" style={{ borderTop: '1px solid var(--color-border)', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Halaman {page} dari {totalPages || 1}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-ghost" 
              disabled={page <= 1} 
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>
            <button 
              className="btn btn-ghost" 
              disabled={page >= totalPages} 
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && selectedFeedback && (
        <div className="modalOverlay" onClick={() => setIsModalOpen(false)}>
          <div className="modalContent animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modalHeader">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={20} color="var(--color-tosca-main)" />
                Detail Masukan Pengguna
              </h3>
              <button className="closeBtn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modalBody" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>PENGIRIM</span>
                  <span style={{ fontSize: '0.9rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                    <User size={14} color="var(--color-text-muted)" /> {selectedFeedback.user?.full_name || 'Pengguna'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>TANGGAL KIRIM</span>
                  <span style={{ fontSize: '0.9rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="var(--color-text-muted)" /> {new Date(selectedFeedback.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>TUJUAN ADMIN</span>
                  <span style={{ fontSize: '0.9rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldAlert size={14} color="var(--color-text-muted)" /> {selectedFeedback.target_admin_type === 'super_admin' ? 'Admin Pusat' : 'Admin Regional'}
                  </span>
                </div>
                {selectedFeedback.city?.name && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>KOTA REGIONAL</span>
                    <span style={{ fontSize: '0.9rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--color-text-muted)" /> {selectedFeedback.city.name}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>SUBJEK MASUKAN</span>
                <span style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: 700 }}>
                  {selectedFeedback.subject}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>ISI PESAN / KELUHAN</span>
                <div style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.6', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'pre-wrap' }}>
                  {selectedFeedback.message}
                </div>
              </div>
            </div>

            <div className="modalFooter">
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
