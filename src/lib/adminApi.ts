import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

// Dashboard Summary
export async function getAdminDashboardStats(adminRole: string, regionCityId: string | null) {
  let destQuery = supabase.from('destinations').select('*', { count: 'exact', head: true })
  let reportsQuery = supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  let reviewsQuery = supabase.from('reviews').select('rating')

  if (adminRole === 'regional_admin' && regionCityId) {
    destQuery = destQuery.eq('city_id', regionCityId)
    // To filter reports and reviews by regional admin's city, we need to join destinations.
    // However, exact count with head=true doesn't play well with joins in Supabase directly without custom views.
    // So we fetch them to count.
    const { data: dests } = await supabase.from('destinations').select('id').eq('city_id', regionCityId)
    const destIds = dests?.map(d => d.id) || []
    
    if (destIds.length > 0) {
      reportsQuery = reportsQuery.in('destination_id', destIds)
      reviewsQuery = reviewsQuery.in('destination_id', destIds)
    } else {
      // Return 0 if regional admin has no destinations
      return { totalDestinations: 0, totalUsers: 0, totalReports: 0, totalReviews: 0, avgRating: 0 }
    }
  }

  const [{ count: destCount }, { count: reportsCount }, { data: reviews }] = await Promise.all([
    destQuery,
    reportsQuery,
    reviewsQuery
  ])

  let totalUsers = 0
  if (adminRole === 'super_admin') {
    const { count } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true })
    totalUsers = count || 0
  }

  const totalReviews = reviews?.length || 0
  const avgRating = totalReviews > 0 && reviews ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews : 0

  return {
    totalDestinations: destCount || 0,
    totalUsers,
    totalReports: reportsCount || 0,
    totalReviews,
    avgRating
  }
}

// Destinations
export async function getAdminDestinations(adminRole: string, regionCityId: string | null, page: number, search: string, category: string, city: string) {
  const ITEMS_PER_PAGE = 10
  const offset = (page - 1) * ITEMS_PER_PAGE

  let query = supabase
    .from('destinations')
    .select(`
      id, name, category_id, city_id, avg_rating, created_at,
      category:categories(name),
      city:cities(name),
      photos(image_url, is_primary)
    `, { count: 'exact' })
    .range(offset, offset + ITEMS_PER_PAGE - 1)
    .order('created_at', { ascending: false })

  if (adminRole === 'regional_admin' && regionCityId) {
    query = query.eq('city_id', regionCityId)
  }

  if (search) query = query.ilike('name', `%${search}%`)
  if (category) query = query.eq('category_id', category)
  if (city && adminRole === 'super_admin') query = query.eq('city_id', city)

  const { data, count, error } = await query
  if (error) throw error

  return {
    data: data || [],
    count: count || 0,
    totalPages: count ? Math.ceil(count / ITEMS_PER_PAGE) : 0,
  }
}

export async function deleteDestination(id: string) {
  const { error } = await supabase.from('destinations').delete().eq('id', id)
  if (error) throw error
  return true
}

export async function uploadImageToImgBB(file: File) {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY
  if (!apiKey) throw new Error("ImgBB API key is missing")

  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData
  })

  const data = await res.json()
  if (!data.success) throw new Error(data.error?.message || "Failed to upload image")

  // Replace i.ibb.co with i.ibb.co.com because i.ibb.co is often blocked by Indonesian ISPs
  const url = data.data.url.replace('i.ibb.co/', 'i.ibb.co.com/')

  return url
}

export async function saveDestination(destId: string | null, payload: any, photos: any[], userId: string) {
  let savedDestId = destId

  if (!destId) {
    // Insert
    const { data, error } = await supabase.from('destinations').insert({
      ...payload,
      created_by: userId
    }).select().single()
    
    if (error) throw error
    savedDestId = data.id
  } else {
    // Update
    const { error } = await supabase.from('destinations').update({
      ...payload,
      updated_at: new Date().toISOString()
    }).eq('id', destId)
    
    if (error) throw error
  }

  // Handle Photos: Delete existing photos if they are not in the new photos list
  if (destId) {
    const existingPhotosIds = photos.filter(p => p.id).map(p => p.id)
    if (existingPhotosIds.length > 0) {
      const { error } = await supabase.from('photos').delete().eq('destination_id', destId).not('id', 'in', `(${existingPhotosIds.join(',')})`)
      if (error) throw error
    } else {
      const { error } = await supabase.from('photos').delete().eq('destination_id', destId)
      if (error) throw error
    }
  }

  // Insert or Update photos
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i]
    if (photo.id) {
      // Update existing
      const { error } = await supabase.from('photos').update({ is_primary: photo.is_primary }).eq('id', photo.id)
      if (error) throw error
    } else {
      // Insert new
      const { error } = await supabase.from('photos').insert({
        destination_id: savedDestId,
        image_url: photo.image_url,
        is_primary: photo.is_primary,
        uploaded_by: userId
      })
      if (error) throw error
    }
  }

  return savedDestId
}

// Users
export async function getAdminUsers(page: number, search: string, roleFilter: string) {
  const ITEMS_PER_PAGE = 10
  const offset = (page - 1) * ITEMS_PER_PAGE

  let query = supabase
    .from('user_profiles')
    .select(`
      *,
      city:cities!region_city_id(name)
    `, { count: 'exact' })
    .range(offset, offset + ITEMS_PER_PAGE - 1)
    .order('created_at', { ascending: false })

  if (search) query = query.ilike('full_name', `%${search}%`)
  if (roleFilter) query = query.eq('role', roleFilter)

  const { data, count, error } = await query
  if (error) throw error

  // Get emails from Auth admin API using Edge Functions or Service Role? 
  // We can't access auth.users emails from client without service_role key.
  // We will just show full_name and role from user_profiles.
  
  return {
    data: data || [],
    count: count || 0,
    totalPages: count ? Math.ceil(count / ITEMS_PER_PAGE) : 0,
  }
}

export async function updateUserRole(userId: string, newRole: string, regionCityId: string | null) {
  const { error } = await supabase.from('user_profiles').update({
    role: newRole,
    region_city_id: newRole === 'regional_admin' ? regionCityId : null
  }).eq('id', userId)

  if (error) throw error
  return true
}

// Reports
export async function getAdminReports(adminRole: string, regionCityId: string | null, page: number, status: string) {
  const ITEMS_PER_PAGE = 10
  const offset = (page - 1) * ITEMS_PER_PAGE

  let query = supabase
    .from('reports')
    .select(`
      id, issue_type, description, status, created_at, admin_note, photo_url,
      destination:destinations!inner(id, name, city_id),
      reporter:user_profiles!reports_reporter_id_fkey(full_name),
      resolver:user_profiles!reports_resolved_by_fkey(full_name)
    `, { count: 'exact' })
    .range(offset, offset + ITEMS_PER_PAGE - 1)
    .order('created_at', { ascending: false })

  if (adminRole === 'regional_admin' && regionCityId) {
    query = query.eq('destination.city_id', regionCityId)
  }
  
  if (status) query = query.eq('status', status)

  const { data, count, error } = await query
  if (error) throw error

  return {
    data: data || [],
    count: count || 0,
    totalPages: count ? Math.ceil(count / ITEMS_PER_PAGE) : 0,
  }
}

export async function updateReportStatus(reportId: string, status: string, resolverId: string, adminNote?: string) {
  const { error } = await supabase.from('reports').update({
    status: status,
    resolved_by: resolverId,
    resolved_at: new Date().toISOString(),
    admin_note: adminNote
  }).eq('id', reportId)

  if (error) throw error
  return true
}

// Dashboard Charts
export async function getAdminChartData(adminRole: string, regionCityId: string | null, startDate: Date, endDate: Date) {
  const startIso = startDate.toISOString()
  const endIso = endDate.toISOString()

  let reportsQuery = supabase.from('reports').select('id, created_at, status, destination:destinations!inner(city:cities(name))').gte('created_at', startIso).lte('created_at', endIso)
  let destQuery = supabase.from('destinations').select('id, category:categories(name)')

  let destCityQuery = supabase.from('destinations').select('id, city:cities(name)')
  let usersCityQuery = supabase.from('user_profiles').select('id, home_city_id')
  let citiesQuery = supabase.from('cities').select('id, name')

  if (adminRole === 'regional_admin' && regionCityId) {
    reportsQuery = reportsQuery.eq('destination.city_id', regionCityId)
    destQuery = destQuery.eq('city_id', regionCityId)
    destCityQuery = destCityQuery.eq('city_id', regionCityId)
    usersCityQuery = usersCityQuery.eq('home_city_id', regionCityId)
  }

  const [{ data: reports }, { data: destinations }, { data: destCity }, { data: usersCity }, { data: citiesData }] = await Promise.all([
    reportsQuery,
    destQuery,
    destCityQuery,
    usersCityQuery,
    citiesQuery
  ])

  // 1. Process Reports by Date and City
  const reportsByDate: Record<string, Record<string, number>> = {}
  const cityNames = new Set<string>()

  // Pre-fill days between start and end date to ensure continuous line chart
  let curr = new Date(startDate)
  curr.setHours(0,0,0,0)
  const end = new Date(endDate)
  end.setHours(23,59,59,999)
  
  while (curr <= end) {
    const dateStr = curr.toISOString().split('T')[0]
    reportsByDate[dateStr] = { date: dateStr as any }
    curr.setDate(curr.getDate() + 1)
  }

  reports?.forEach((r: any) => {
    const dateStr = new Date(r.created_at).toISOString().split('T')[0]
    const cityName = r.destination?.city?.name || 'Unknown'
    cityNames.add(cityName)
    if (reportsByDate[dateStr]) {
      reportsByDate[dateStr][cityName] = (reportsByDate[dateStr][cityName] || 0) + 1
    }
  })

  const reportsChartData = Object.values(reportsByDate).sort((a, b) => String(a.date).localeCompare(String(b.date)))

  // 2. Process Report Statuses
  const statusCounts: Record<string, number> = { pending: 0, investigasi: 0, selesai: 0, ditolak: 0 }
  reports?.forEach((r: any) => {
    const stat = r.status || 'pending'
    statusCounts[stat] = (statusCounts[stat] || 0) + 1
  })
  const statusChartData = Object.keys(statusCounts).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: statusCounts[key]
  })).filter(item => item.value > 0)

  // 3. Process Destinations by Category
  const categoryCounts: Record<string, number> = {}
  destinations?.forEach((d: any) => {
    const catName = d.category?.name || 'Lainnya'
    categoryCounts[catName] = (categoryCounts[catName] || 0) + 1
  })
  const categoryChartData = Object.keys(categoryCounts).map(key => ({
    name: key,
    value: categoryCounts[key]
  }))

  // 4. Process Users by Home City
  const cityMap = new Map((citiesData || []).map((c: any) => [c.id, c.name]))
  const userCityCounts: Record<string, number> = {}
  usersCity?.forEach((u: any) => {
    if (u.home_city_id) {
      const cName = cityMap.get(u.home_city_id) || 'Unknown'
      userCityCounts[cName] = (userCityCounts[cName] || 0) + 1
    }
  })
  const usersByCityData = Object.keys(userCityCounts).map(key => ({
    name: key,
    users: userCityCounts[key]
  })).sort((a, b) => b.users - a.users) // Sort descending

  // 5. Process Destinations by City
  const destCityCounts: Record<string, number> = {}
  destCity?.forEach((d: any) => {
    const cName = d.city?.name || 'Unknown'
    destCityCounts[cName] = (destCityCounts[cName] || 0) + 1
  })
  const destsByCityData = Object.keys(destCityCounts).map(key => ({
    name: key,
    destinations: destCityCounts[key]
  })).sort((a, b) => b.destinations - a.destinations) // Sort descending

  return {
    reportsChartData,
    cities: Array.from(cityNames),
    statusChartData,
    categoryChartData,
    usersByCityData,
    destsByCityData
  }
}

// === Proposals API ===

export async function getAdminCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw error
  return data
}

export async function getAdminCities() {
  const { data, error } = await supabase.from('cities').select('*, island:islands(name)').order('name')
  if (error) throw error
  return data
}

export async function addCategory(name: string, status: string) {
  const { data, error } = await supabase.from('categories').insert({ name, status }).select().single()
  if (error) throw error
  return data
}

export async function addCity(name: string, province: string, islandId: string | null, status: string) {
  const { data, error } = await supabase.from('cities').insert({ name, province, island_id: islandId, status }).select().single()
  if (error) throw error
  return data
}

export async function updateProposalStatus(type: 'category' | 'city', id: string, status: string) {
  const table = type === 'category' ? 'categories' : 'cities'
  const { error } = await supabase.from(table).update({ status }).eq('id', id)
  if (error) throw error
  return true
}


