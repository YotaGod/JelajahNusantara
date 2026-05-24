'use client'

import { useState, useEffect } from 'react'
import { getAdminUsers, updateUserRole } from '@/lib/adminApi'
import { getCities } from '@/lib/api'
import { Search, Edit2, Shield, X } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [newRole, setNewRole] = useState('')
  const [newRegionCity, setNewRegionCity] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      if (cities.length === 0) {
        const cits = await getCities()
        setCities(cits)
      }
      const { data, totalPages: tp } = await getAdminUsers(page, search, filterRole)
      setUsers(data)
      setTotalPages(tp)
    } catch (e) {
      console.error(e)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [page, search, filterRole])

  const openModal = (user: any) => {
    setEditingUser(user)
    setNewRole(user.role)
    setNewRegionCity(user.region_city_id || '')
    setIsModalOpen(true)
  }

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newRole === 'regional_admin' && !newRegionCity) {
      alert('Anda harus memilih kota penugasan untuk Regional Admin.')
      return
    }
    setIsSaving(true)
    try {
      await updateUserRole(editingUser.id, newRole, newRole === 'regional_admin' ? newRegionCity : null)
      setIsModalOpen(false)
      loadData()
    } catch (error) {
      alert('Gagal memperbarui role pengguna.')
    }
    setIsSaving(false)
  }

  return (
    <div>
      <div className="tableHeader" style={{ backgroundColor: 'transparent', padding: '0 0 var(--spacing-4) 0', border: 'none' }}>
        <div className="adminControls">
          <div className="adminControlInput" style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Cari nama pengguna..." 
              style={{ paddingLeft: '36px', width: '100%' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input-field adminControlInput" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="">Semua Role</option>
            <option value="super_admin">Super Admin</option>
            <option value="regional_admin">Regional Admin</option>
            <option value="user">User</option>
            <option value="visitor">Visitor</option>
          </select>
        </div>
      </div>

      <div className="tableContainer">
        <div className="adminTableWrapper">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Nama Pengguna</th>
                <th>Role Saat Ini</th>
                <th>Wilayah Penugasan</th>
                <th>Tanggal Bergabung</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Memuat...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada pengguna ditemukan.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', minWidth: '32px', flexShrink: 0, borderRadius: '50%', backgroundColor: 'var(--color-tosca-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                          {u.avatar_url ? <img src={u.avatar_url} alt="" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}}/> : u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500 }}>{u.full_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'super_admin' ? 'rejected' : u.role === 'regional_admin' ? 'pending' : u.role === 'user' ? 'resolved' : ''}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{u.role === 'regional_admin' ? u.city?.name : '-'}</td>
                    <td>{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                    <td>
                      <div className="actionCell" style={{ justifyContent: 'flex-end' }}>
                        <button className="iconBtn edit" title="Edit Role" onClick={() => openModal(u)}><Shield size={16}/></button>
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

      {isModalOpen && editingUser && (
        <div className="modalOverlay" onClick={() => setIsModalOpen(false)}>
          <div className="modalContent small animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modalHeader">
              <h3>Ubah Role Pengguna</h3>
              <button className="closeBtn" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            
            <div className="modalBody">
              <p style={{ marginBottom: '1rem' }}>Mengubah hak akses untuk <strong>{editingUser.full_name}</strong>.</p>
              
              <form id="roleForm" onSubmit={handleSaveRole} className="formGrid" style={{ gridTemplateColumns: '1fr' }}>
                <div>
                  <label className="label">Pilih Role Baru</label>
                  <select className="input-field" value={newRole} onChange={e => setNewRole(e.target.value)}>
                    <option value="visitor">Visitor (Hanya Lihat)</option>
                    <option value="user">User (Bisa Review)</option>
                    <option value="regional_admin">Regional Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                {newRole === 'regional_admin' && (
                  <div className="animate-fade-in">
                    <label className="label">Pilih Kota Penugasan</label>
                    <select required className="input-field" value={newRegionCity} onChange={e => setNewRegionCity(e.target.value)}>
                      <option value="">-- Pilih Kota --</option>
                      {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Regional Admin hanya bisa mengelola destinasi di kota ini.</p>
                  </div>
                )}
              </form>
            </div>
            
            <div className="modalFooter">
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Batal</button>
              <button form="roleForm" type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
