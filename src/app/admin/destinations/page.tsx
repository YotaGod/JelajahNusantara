'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getAdminDestinations, deleteDestination, saveDestination, uploadImageToImgBB } from '@/lib/adminApi'
import { getUserProfile, getCategories, getCities } from '@/lib/api'
import { Search, Plus, Edit2, Trash2, X, Upload } from 'lucide-react'

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDest, setEditingDest] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    name: '', category_id: '', city_id: '', description: '', address: '', 
    map_url: '', price: '', open_hours: '', contact: ''
  })
  const [facilities, setFacilities] = useState('')
  const [photos, setPhotos] = useState<any[]>([])

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
          const cats = await getCategories()
          setCategories(cats)
          const cits = await getCities()
          setCities(cits)
        }
        
        const { data, totalPages: tp } = await getAdminDestinations(p.role, p.region_city_id, page, search, filterCategory, filterCity)
        setDestinations(data)
        setTotalPages(tp)
      }
    } catch (e) {
      console.error(e)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [page, search, filterCategory, filterCity])

  const handleDelete = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus destinasi ini? Semua foto dan ulasan terkait akan hilang.")) {
      await deleteDestination(id)
      loadData()
    }
  }

  const openModal = async (dest: any = null) => {
    if (dest) {
      // Fetch full detail including photos
      const { data } = await supabase.from('destinations').select('*, photos(id, image_url, is_primary)').eq('id', dest.id).single()
      setEditingDest(data)
      setFormData({
        name: data.name || '',
        category_id: data.category_id || '',
        city_id: data.city_id || '',
        description: data.description || '',
        address: data.address || '',
        map_url: data.map_url || '',
        price: data.price?.toString() || '',
        open_hours: data.open_hours || '',
        contact: data.contact || ''
      })
      setFacilities(typeof data.facilities === 'string' ? JSON.parse(data.facilities).join(', ') : (data.facilities || []).join(', '))
      setPhotos(data.photos || [])
    } else {
      setEditingDest(null)
      setFormData({
        name: '', category_id: categories[0]?.id || '', city_id: profile?.role === 'regional_admin' ? profile.region_city_id : (cities[0]?.id || ''),
        description: '', address: '', map_url: '', price: '', open_hours: '', contact: ''
      })
      setFacilities('')
      setPhotos([])
    }
    setIsModalOpen(true)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setIsSaving(true)
    try {
      const newPhotos = [...photos]
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i]
        const url = await uploadImageToImgBB(file)
        newPhotos.push({
          id: null, // null means new
          image_url: url,
          is_primary: newPhotos.length === 0 // Make first uploaded photo primary
        })
      }
      setPhotos(newPhotos)
    } catch (error) {
      alert("Gagal mengunggah gambar. Silakan coba lagi.")
    }
    setIsSaving(false)
  }

  const setPrimaryPhoto = (index: number) => {
    const updated = photos.map((p, i) => ({ ...p, is_primary: i === index }))
    setPhotos(updated)
  }

  const removePhoto = (index: number) => {
    const updated = [...photos]
    updated.splice(index, 1)
    if (updated.length > 0 && !updated.find(p => p.is_primary)) {
      updated[0].is_primary = true
    }
    setPhotos(updated)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const facArray = facilities.split(',').map(s => s.trim()).filter(s => s.length > 0)
      
      const payload = {
        name: formData.name,
        category_id: formData.category_id,
        city_id: formData.city_id,
        description: formData.description,
        address: formData.address,
        map_url: formData.map_url || null,
        price: formData.price ? parseInt(formData.price) : null,
        open_hours: formData.open_hours,
        contact: formData.contact,
        facilities: JSON.stringify(facArray)
      }

      await saveDestination(editingDest?.id || null, payload, photos, profile.id)
      setIsModalOpen(false)
      loadData()
    } catch (error) {
      console.error("Save destination error:", error)
      alert("Terjadi kesalahan saat menyimpan destinasi.")
    }
    setIsSaving(false)
  }

  return (
    <div>
      <div className="tableHeader" style={{ backgroundColor: 'transparent', padding: '0 0 var(--spacing-4) 0', border: 'none' }}>
        <div className="filterGroup" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Cari destinasi..." 
              style={{ paddingLeft: '36px', width: '250px' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input-field" style={{ width: 'auto', minWidth: '180px' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">Semua Kategori</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {profile?.role === 'super_admin' && (
            <select className="input-field" style={{ width: 'auto', minWidth: '180px' }} value={filterCity} onChange={e => setFilterCity(e.target.value)}>
              <option value="">Semua Kota</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}><Plus size={18}/> Tambah Destinasi</button>
      </div>

      <div className="tableContainer">
        <div className="adminTableWrapper">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nama Destinasi</th>
                <th>Kategori</th>
                <th>Kota</th>
                <th>Rating</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Memuat...</td></tr>
              ) : destinations.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada destinasi ditemukan.</td></tr>
              ) : (
                destinations.map(d => {
                  const primaryPhoto = d.photos?.find((p:any) => p.is_primary)?.image_url || d.photos?.[0]?.image_url
                  return (
                    <tr key={d.id}>
                      <td>
                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--color-bg-alt)' }}>
                          {primaryPhoto && <img src={primaryPhoto} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{d.name}</td>
                      <td>{d.category?.name}</td>
                      <td>{d.city?.name}</td>
                      <td>{d.avg_rating > 0 ? d.avg_rating.toFixed(1) : '-'}</td>
                      <td>
                        <div className="actionCell" style={{ justifyContent: 'flex-end' }}>
                          <button className="iconBtn edit" onClick={() => openModal(d)}><Edit2 size={16}/></button>
                          <button className="iconBtn delete" onClick={() => handleDelete(d.id)}><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls Here (Simplified) */}
        <div className="modalFooter" style={{ borderTop: '1px solid var(--color-border)', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Halaman {page} dari {totalPages || 1}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(p=>p-1)}>Prev</button>
            <button className="btn btn-ghost" disabled={page >= totalPages} onClick={() => setPage(p=>p+1)}>Next</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modalOverlay" onClick={() => setIsModalOpen(false)}>
          <div className="modalContent animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modalHeader">
              <h3>{editingDest ? 'Edit Destinasi' : 'Tambah Destinasi Baru'}</h3>
              <button className="closeBtn" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            
            <div className="modalBody">
              <form id="destForm" onSubmit={handleSave} className="formGrid">
                <div>
                  <label className="label">Nama Destinasi *</label>
                  <input required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="label">Kategori *</label>
                  <select required className="input-field" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                    <option value="">Pilih Kategori</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Kota/Kabupaten *</label>
                  <select required className="input-field" value={formData.city_id} onChange={e => setFormData({...formData, city_id: e.target.value})} disabled={profile?.role === 'regional_admin'}>
                    <option value="">Pilih Kota</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Harga Tiket Masuk</label>
                  <input type="number" className="input-field" placeholder="Kosongkan jika gratis" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="fullWidth">
                  <label className="label">Alamat Lengkap</label>
                  <input className="input-field" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="fullWidth" style={{ gridColumn: '1 / -1' }}>
                  <label className="label">Link Google Maps</label>
                  <input type="url" className="input-field" placeholder="https://goo.gl/maps/..." value={formData.map_url} onChange={e => setFormData({...formData, map_url: e.target.value})} />
                </div>
                <div>
                  <label className="label">Jam Operasional</label>
                  <input className="input-field" placeholder="Contoh: 08:00 - 17:00" value={formData.open_hours} onChange={e => setFormData({...formData, open_hours: e.target.value})} />
                </div>
                <div>
                  <label className="label">Kontak Info</label>
                  <input className="input-field" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
                </div>
                <div className="fullWidth">
                  <label className="label">Fasilitas</label>
                  <input className="input-field" placeholder="Pisahkan dengan koma (Contoh: Toilet, Parkir, Mushola)" value={facilities} onChange={e => setFacilities(e.target.value)} />
                </div>
                <div className="fullWidth">
                  <label className="label">Deskripsi</label>
                  <textarea className="input-field" rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <div className="fullWidth" style={{ marginTop: 'var(--spacing-4)' }}>
                  <label className="label">Galeri Foto</label>
                  <label className="photoUploadArea">
                    <Upload size={32} style={{ color: 'var(--color-tosca-main)', marginBottom: '8px' }} />
                    <div style={{ fontWeight: 500 }}>Klik untuk Mengunggah Foto</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Mendukung multiple files (JPG, PNG)</div>
                    <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} disabled={isSaving} />
                  </label>
                  
                  {photos.length > 0 && (
                    <div className="photoPreviewGrid">
                      {photos.map((p, i) => (
                        <div key={i} className={`photoPreviewCard ${p.is_primary ? 'primary' : ''}`}>
                          <img src={p.image_url} alt="" className="photoPreviewImg" />
                          <div className="photoActions">
                            <button type="button" className="iconBtn success" style={{ background: 'var(--color-card)' }} title="Jadikan Utama" onClick={() => setPrimaryPhoto(i)}><Edit2 size={14}/></button>
                            <button type="button" className="iconBtn delete" style={{ background: 'var(--color-card)' }} title="Hapus" onClick={() => removePhoto(i)}><Trash2 size={14}/></button>
                          </div>
                          {p.is_primary && <div style={{ position:'absolute', top:4, left:4, background:'var(--color-tosca-main)', color:'white', fontSize:'10px', padding:'2px 6px', borderRadius:'4px' }}>Utama</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>
            
            <div className="modalFooter">
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Batal</button>
              <button form="destForm" type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : 'Simpan Destinasi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
