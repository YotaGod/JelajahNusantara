'use client'

import { useState, useEffect } from 'react'
import { getAdminCategories, getAdminCities, addCategory, addCity, updateProposalStatus } from '@/lib/adminApi'
import { getUserProfile, getIslands } from '@/lib/api'
import { createClient } from '@/utils/supabase/client'
import { Check, X, Plus, Tag, MapPin } from 'lucide-react'

export default function AdminProposals() {
  const [activeTab, setActiveTab] = useState<'categories' | 'cities'>('categories')
  const [categories, setCategories] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [islands, setIslands] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newCityProvince, setNewCityProvince] = useState('')
  const [newCityIsland, setNewCityIsland] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const userProfile = await getUserProfile(user.id)
        setProfile(userProfile)
      }
      const [cats, cits, isls] = await Promise.all([
        getAdminCategories(),
        getAdminCities(),
        getIslands()
      ])
      setCategories(cats)
      setCities(cits)
      setIslands(isls)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (type: 'category' | 'city', id: string) => {
    if (!confirm('Setujui pengajuan ini?')) return
    try {
      await updateProposalStatus(type, id, 'approved')
      loadData()
    } catch (error) {
      alert('Gagal menyetujui.')
    }
  }

  const handleReject = async (type: 'category' | 'city', id: string) => {
    if (!confirm('Tolak pengajuan ini?')) return
    try {
      await updateProposalStatus(type, id, 'rejected')
      loadData()
    } catch (error) {
      alert('Gagal menolak.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const status = profile?.role === 'super_admin' ? 'approved' : 'pending'
      if (activeTab === 'categories') {
        await addCategory(newItemName, status)
      } else {
        if (!newCityProvince || !newCityIsland) {
          alert('Provinsi dan Pulau harus diisi untuk Kota/Kabupaten.')
          setIsSaving(false)
          return
        }
        await addCity(newItemName, newCityProvince, newCityIsland, status)
      }
      setIsModalOpen(false)
      setNewItemName('')
      setNewCityProvince('')
      setNewCityIsland('')
      loadData()
      alert('Berhasil disimpan!')
    } catch (error) {
      alert('Gagal menyimpan.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading data...</div>

  const isSuperAdmin = profile?.role === 'super_admin'

  const renderCategories = () => (
    <div className="tableContainer">
      <table className="adminTable">
        <thead>
          <tr>
            <th>Nama Kategori</th>
            <th>Status</th>
            {isSuperAdmin && <th>Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {categories.map((c: any) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>
                <span className={`badge ${c.status === 'approved' ? 'resolved' : c.status === 'pending' ? 'pending' : 'rejected'}`}>
                  {c.status}
                </span>
              </td>
              {isSuperAdmin && (
                <td>
                  {c.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="iconBtn resolved" title="Setujui" onClick={() => handleApprove('category', c.id)}><Check size={16}/></button>
                      <button className="iconBtn rejected" title="Tolak" onClick={() => handleReject('category', c.id)}><X size={16}/></button>
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
          {categories.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center' }}>Belum ada data kategori.</td></tr>}
        </tbody>
      </table>
    </div>
  )

  const renderCities = () => (
    <div className="tableContainer">
      <table className="adminTable">
        <thead>
          <tr>
            <th>Nama Daerah</th>
            <th>Provinsi</th>
            <th>Pulau</th>
            <th>Status</th>
            {isSuperAdmin && <th>Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {cities.map((c: any) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.province || '-'}</td>
              <td>{c.island?.name || '-'}</td>
              <td>
                <span className={`badge ${c.status === 'approved' ? 'resolved' : c.status === 'pending' ? 'pending' : 'rejected'}`}>
                  {c.status}
                </span>
              </td>
              {isSuperAdmin && (
                <td>
                  {c.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="iconBtn resolved" title="Setujui" onClick={() => handleApprove('city', c.id)}><Check size={16}/></button>
                      <button className="iconBtn rejected" title="Tolak" onClick={() => handleReject('city', c.id)}><X size={16}/></button>
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
          {cities.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center' }}>Belum ada data daerah.</td></tr>}
        </tbody>
      </table>
    </div>
  )

  return (
    <div>
      <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('categories')}
          >
            <Tag size={18} /> Kategori
          </button>
          <button 
            className={`btn ${activeTab === 'cities' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('cities')}
          >
            <MapPin size={18} /> Daerah
          </button>
        </div>
        
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> {isSuperAdmin ? 'Tambah' : 'Ajukan'} {activeTab === 'categories' ? 'Kategori' : 'Daerah'} Baru
        </button>
      </div>

      {activeTab === 'categories' ? renderCategories() : renderCities()}

      {isModalOpen && (
        <div className="modalOverlay" onClick={() => setIsModalOpen(false)}>
          <div className="modalContent animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modalHeader">
              <h3>{isSuperAdmin ? 'Tambah' : 'Ajukan'} {activeTab === 'categories' ? 'Kategori' : 'Daerah'}</h3>
              <button className="closeBtn" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="modalBody">
              <form id="addForm" onSubmit={handleSubmit} className="formGrid" style={{ gridTemplateColumns: '1fr' }}>
                <div>
                  <label className="label">Nama {activeTab === 'categories' ? 'Kategori' : 'Daerah'}</label>
                  <input 
                    type="text" 
                    required 
                    className="input-field" 
                    value={newItemName} 
                    onChange={e => setNewItemName(e.target.value)} 
                    placeholder={`Contoh: ${activeTab === 'categories' ? 'Wisata Alam' : 'Kota Serang'}`}
                  />
                </div>
                
                {activeTab === 'cities' && (
                  <>
                    <div>
                      <label className="label">Provinsi</label>
                      <input 
                        type="text" 
                        required 
                        className="input-field" 
                        value={newCityProvince} 
                        onChange={e => setNewCityProvince(e.target.value)} 
                        placeholder="Contoh: Banten"
                      />
                    </div>
                    <div>
                      <label className="label">Pulau</label>
                      <select 
                        required 
                        className="input-field" 
                        value={newCityIsland} 
                        onChange={e => setNewCityIsland(e.target.value)}
                      >
                        <option value="">Pilih Pulau...</option>
                        {islands.map(i => (
                          <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </form>
            </div>
            <div className="modalFooter">
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Batal</button>
              <button form="addForm" type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
