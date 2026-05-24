'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getAdminReports, updateReportStatus } from '@/lib/adminApi'
import { getUserProfile } from '@/lib/api'
import { Search, CheckCircle, XCircle, Info, X } from 'lucide-react'
import Link from 'next/link'

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const [filterStatus, setFilterStatus] = useState('pending')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [adminNote, setAdminNote] = useState('')

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
        const { data, totalPages: tp } = await getAdminReports(p.role, p.region_city_id, page, filterStatus)
        setReports(data)
        setTotalPages(tp)
      }
    } catch (e) {
      console.error(e)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [page, filterStatus])

  const openDetail = (report: any) => {
    setSelectedReport(report)
    setAdminNote(report.admin_note || '')
    setIsModalOpen(true)
  }

  const handleUpdateStatus = async (status: string) => {
    if (!selectedReport) return
    setIsUpdating(true)
    try {
      await updateReportStatus(selectedReport.id, status, profile.id, adminNote)
      setIsModalOpen(false)
      loadData()
    } catch (error) {
      alert('Gagal mengupdate status laporan.')
    }
    setIsUpdating(false)
  }

  const formatIssueType = (type: string) => {
    const map: Record<string, string> = {
      'info_salah': 'Informasi Salah',
      'tempat_tutup': 'Tempat Tutup',
      'harga_berubah': 'Harga Berubah',
      'lainnya': 'Lainnya'
    }
    return map[type] || type
  }

  return (
    <div>
      <div className="tableHeader" style={{ backgroundColor: 'transparent', padding: '0 0 var(--spacing-4) 0', border: 'none', justifyContent: 'flex-start' }}>
        <div className="adminControls">
          <select className="input-field adminControlInput" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">Semua Status</option>
            <option value="pending">Menunggu Tindakan</option>
            <option value="resolved">Telah Diselesaikan</option>
            <option value="rejected">Ditolak</option>
            <option value="cancelled_by_user">Dibatalkan User</option>
          </select>
        </div>
      </div>

      <div className="tableContainer">
        <div className="adminTableWrapper">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Destinasi</th>
                <th>Pelapor</th>
                <th>Jenis Laporan</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Memuat...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada laporan.</td></tr>
              ) : (
                reports.map(r => (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/destinations/${r.destination.id}`} target="_blank" style={{ color: 'var(--color-tosca-main)', fontWeight: 500, textDecoration: 'none' }}>
                        {r.destination.name}
                      </Link>
                    </td>
                    <td>{r.reporter?.full_name || 'Anonim'}</td>
                    <td>{formatIssueType(r.issue_type)}</td>
                    <td>{new Date(r.created_at).toLocaleDateString('id-ID')}</td>
                    <td>
                      <span className={`badge ${r.status}`}>
                        {r.status === 'pending' ? 'Menunggu' : r.status === 'resolved' ? 'Selesai' : r.status === 'rejected' ? 'Ditolak' : 'Batal'}
                      </span>
                    </td>
                    <td>
                      <div className="actionCell" style={{ justifyContent: 'flex-end' }}>
                        <button className="iconBtn" title="Lihat Detail" onClick={() => openDetail(r)}>
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
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Halaman {page} dari {totalPages || 1}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(p=>p-1)}>Prev</button>
            <button className="btn btn-ghost" disabled={page >= totalPages} onClick={() => setPage(p=>p+1)}>Next</button>
          </div>
        </div>
      </div>

      {isModalOpen && selectedReport && (
        <div className="modalOverlay" onClick={() => setIsModalOpen(false)}>
          <div className="modalContent small animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modalHeader">
              <h3>Detail Laporan</h3>
              <button className="closeBtn" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            
            <div className="modalBody" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Destinasi</div>
                <div style={{ fontWeight: 600 }}>{selectedReport.destination.name}</div>
              </div>
              
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Pelapor</div>
                <div>{selectedReport.reporter?.full_name || 'Anonim'}</div>
              </div>
              
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Jenis Isu</div>
                <div>{formatIssueType(selectedReport.issue_type)}</div>
              </div>
              
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Deskripsi</div>
                <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-alt)', borderRadius: '8px', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                  {selectedReport.description}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Catatan Internal Admin</div>
                {selectedReport.status === 'pending' ? (
                  <textarea 
                    className="input-field" 
                    rows={3} 
                    placeholder="Tambahkan catatan internal (opsional)..."
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                  />
                ) : (
                  <div style={{ padding: '12px', backgroundColor: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: '8px', fontSize: '0.875rem', whiteSpace: 'pre-wrap', color: selectedReport.admin_note ? 'inherit' : 'var(--color-text-muted)' }}>
                    {selectedReport.admin_note || 'Tidak ada catatan.'}
                  </div>
                )}
              </div>
              
              {selectedReport.status !== 'pending' && selectedReport.status !== 'cancelled_by_user' && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Diselesaikan Oleh</div>
                  <div>{selectedReport.resolver?.full_name}</div>
                </div>
              )}
            </div>
            
            <div className="modalFooter" style={{ justifyContent: 'space-between' }}>
              <Link href={`/admin/destinations?edit=${selectedReport.destination.id}`} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
                Edit Destinasi
              </Link>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedReport.status === 'pending' ? (
                  <>
                    <button className="btn btn-ghost" style={{ color: 'var(--color-error)' }} onClick={() => handleUpdateStatus('rejected')} disabled={isUpdating}>
                      <XCircle size={16} /> Tolak
                    </button>
                    <button className="btn btn-primary" onClick={() => handleUpdateStatus('resolved')} disabled={isUpdating}>
                      <CheckCircle size={16} /> Tandai Selesai
                    </button>
                  </>
                ) : (
                  <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Tutup</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
