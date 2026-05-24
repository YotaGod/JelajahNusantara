'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserReports, cancelUserReport } from '@/lib/api'
import Link from 'next/link'
import { FileWarning, Search, Info } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

export default function ReportsHistoryClient() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  const { data: reports, isLoading } = useQuery({
    queryKey: ['user-reports'],
    queryFn: getUserReports
  })

  const cancelMutation = useMutation({
    mutationFn: cancelUserReport,
    onSuccess: () => {
      addToast('Laporan berhasil dibatalkan', 'success')
      queryClient.invalidateQueries({ queryKey: ['user-reports'] })
    },
    onError: (err: any) => {
      addToast(err.message || 'Gagal membatalkan laporan', 'error')
    }
  })

  const handleCancel = (reportId: string) => {
    if (confirm('Apakah Anda yakin ingin membatalkan laporan ini?')) {
      cancelMutation.mutate(reportId)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="badge" style={{ backgroundColor: 'var(--color-warning)', color: '#fff' }}>Pending</span>
      case 'resolved': return <span className="badge" style={{ backgroundColor: 'var(--color-success)', color: '#fff' }}>Resolved</span>
      case 'rejected': return <span className="badge" style={{ backgroundColor: 'var(--color-error)', color: '#fff' }}>Rejected</span>
      case 'cancelled_by_user': return <span className="badge" style={{ backgroundColor: 'var(--color-text-muted)', color: '#fff' }}>Dibatalkan</span>
      default: return <span className="badge">{status}</span>
    }
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

  if (isLoading) {
    return <div className="container" style={{ padding: 'var(--spacing-16) 0', textAlign: 'center' }}><h3>Memuat riwayat laporan...</h3></div>
  }

  const filteredReports = (reports || []).filter((r: any) => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    const matchSearch = r.destination?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || r.issue_type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
  const currentData = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-12)', paddingBottom: 'var(--spacing-12)' }}>
      <h1 style={{ marginBottom: 'var(--spacing-8)' }}>Riwayat Laporan</h1>

      {reports?.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-16) 0', backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-xl)' }}>
          <FileWarning size={64} color="var(--color-text-muted)" style={{ margin: '0 auto var(--spacing-4)' }} />
          <h2 style={{ marginBottom: 'var(--spacing-2)' }}>Belum ada laporan</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-6)' }}>
            Anda belum pernah membuat laporan error. Temukan informasi yang salah?<br/>Laporkan melalui halaman detail destinasi.
          </p>
          <Link href="/" className="btn btn-primary">Kembali ke Beranda</Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                placeholder="Cari destinasi atau jenis laporan..." 
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <select 
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled_by_user">Dibatalkan</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto', backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', overflow: 'hidden' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface)', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: 'var(--spacing-4)' }}>Destinasi</th>
                  <th style={{ padding: 'var(--spacing-4)' }}>Jenis Laporan</th>
                  <th style={{ padding: 'var(--spacing-4)' }}>Deskripsi</th>
                  <th style={{ padding: 'var(--spacing-4)' }}>Status</th>
                  <th style={{ padding: 'var(--spacing-4)' }}>Tanggal</th>
                  <th style={{ padding: 'var(--spacing-4)' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? currentData.map((report: any) => (
                  <tr key={report.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: 'var(--spacing-4)' }}>
                      <Link href={`/destinations/${report.destination?.id}`} style={{ fontWeight: 600, color: 'var(--color-tosca-main)' }}>
                        {report.destination?.name}
                      </Link>
                    </td>
                    <td style={{ padding: 'var(--spacing-4)' }}>{formatIssueType(report.issue_type)}</td>
                    <td style={{ padding: 'var(--spacing-4)', maxWidth: '200px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {report.description}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--spacing-4)' }}>{getStatusBadge(report.status)}</td>
                    <td style={{ padding: 'var(--spacing-4)' }}>
                      {new Date(report.created_at).toLocaleDateString('id-ID')}
                      {report.resolved_at && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          Selesai: {new Date(report.resolved_at).toLocaleDateString('id-ID')}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: 'var(--spacing-4)' }}>
                      {report.status === 'pending' && (
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '6px 12px', fontSize: '0.85rem', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                          onClick={() => handleCancel(report.id)}
                          disabled={cancelMutation.isPending}
                        >
                          Batal
                        </button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} style={{ padding: 'var(--spacing-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      Tidak ada laporan yang sesuai dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-4)', marginTop: 'var(--spacing-8)' }}>
              <button 
                className="btn btn-outline" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center' }}>{currentPage} dari {totalPages}</span>
              <button 
                className="btn btn-outline" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
