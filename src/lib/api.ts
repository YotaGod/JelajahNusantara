import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export type DestinationParams = {
  page: number
  search: string
  category: string
  city: string
  price: string
}

export async function getCategories() {
  const { data, error } = await supabase.from('categories').select('id, name').order('name')
  if (error) throw error
  return data
}

export async function getCities() {
  const { data, error } = await supabase.from('cities').select('id, name').eq('province', 'Banten').order('name')
  if (error) throw error
  return data
}

export async function getDestinations({ page, search, category, city, price }: DestinationParams) {
  const ITEMS_PER_PAGE = 9
  const offset = (page - 1) * ITEMS_PER_PAGE

  let query = supabase
    .from('destinations')
    .select(`
      id, 
      name, 
      category_id, 
      city_id, 
      description, 
      price, 
      avg_rating,
      category:categories(id, name),
      city:cities(id, name),
      photos(image_url, is_primary)
    `, { count: 'exact' })
    .range(offset, offset + ITEMS_PER_PAGE - 1)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (category) {
    query = query.eq('category_id', category)
  }

  if (city) {
    query = query.eq('city_id', city)
  }

  if (price) {
    if (price === 'free') {
      query = query.is('price', null)
    } else if (price === '0-25') {
      query = query.gte('price', 0).lte('price', 25000)
    } else if (price === '25-50') {
      query = query.gt('price', 25000).lte('price', 50000)
    } else if (price === '50-100') {
      query = query.gt('price', 50000).lte('price', 100000)
    } else if (price === '100+') {
      query = query.gt('price', 100000)
    }
  }

  const { data, error, count } = await query

  if (error) throw error

  const formattedData = data?.map((dest: any) => {
    let primaryPhoto = null
    if (dest.photos && dest.photos.length > 0) {
      primaryPhoto = dest.photos.find((p: any) => p.is_primary)?.image_url || dest.photos[0].image_url
    }
    return {
      ...dest,
      primaryPhoto,
      categoryName: dest.category?.name,
      cityName: dest.city?.name,
    }
  })

  return {
    data: formattedData || [],
    count: count || 0,
    totalPages: count ? Math.ceil(count / ITEMS_PER_PAGE) : 0,
  }
}

export async function getDestinationsMap() {
  const { data, error } = await supabase
    .from('destinations')
    .select(`
      id, name, latitude, longitude, category_id, avg_rating,
      category:categories(name),
      city:cities(name),
      photos(image_url, is_primary)
    `)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)

  if (error) {
    console.error('Error fetching map destinations:', error)
    return []
  }
  return data || []
}

export async function getDestinationDetail(id: string) {
  const { data, error } = await supabase
    .from('destinations')
    .select(`
      *,
      category:categories(id, name),
      city:cities(id, name),
      photos(id, image_url, is_primary),
      reviews(
        id,
        user_id,
        rating, 
        comment, 
        created_at,
        user:user_profiles(id, full_name, avatar_url)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  if (data.reviews) {
    data.reviews.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  return data
}

export async function checkFavorite(destinationId: string, userId: string) {
  if (!userId) return false
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('destination_id', destinationId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

export async function toggleFavorite(destinationId: string, userId: string, isCurrentlyFavorite: boolean) {
  if (!userId) throw new Error("User must be logged in")

  if (isCurrentlyFavorite) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('destination_id', destinationId)
      .eq('user_id', userId)
    if (error) throw error
    return false
  } else {
    const { error } = await supabase
      .from('favorites')
      .insert({ destination_id: destinationId, user_id: userId })
    if (error) throw error
    return true
  }
}

export async function submitReport(destinationId: string, reporterId: string, issueType: string, description: string) {
  if (!reporterId) throw new Error("User must be logged in")
  
  const { data, error } = await supabase
    .from('reports')
    .insert({
      destination_id: destinationId,
      reporter_id: reporterId,
      issue_type: issueType,
      description: description,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Phase 5 Functions

export async function submitReview(destinationId: string, userId: string, rating: number, comment: string) {
  if (!userId) throw new Error("User must be logged in")
  
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      destination_id: destinationId,
      user_id: userId,
      rating: rating,
      comment: comment
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateReview(reviewId: string, rating: number, comment: string) {
  const { data, error } = await supabase
    .from('reviews')
    .update({
      rating: rating,
      comment: comment,
      updated_at: new Date().toISOString()
    })
    .eq('id', reviewId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteReview(reviewId: string) {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)

  if (error) throw error
  return true
}

// Phase 4 Functions

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getUserStats(userId: string) {
  const [{ count: reviewsCount }, { count: favoritesCount }, { count: reportsCount }] = await Promise.all([
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('reporter_id', userId)
  ])

  return {
    reviews: reviewsCount || 0,
    favorites: favoritesCount || 0,
    reports: reportsCount || 0
  }
}

export async function getUserFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      id,
      destination_id,
      destination:destinations(
        id,
        name,
        price,
        avg_rating,
        category:categories(name),
        city:cities(name),
        photos(image_url, is_primary)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) throw error

  return data?.map((fav: any) => {
    const dest = fav.destination
    let primaryPhoto = null
    if (dest.photos && dest.photos.length > 0) {
      primaryPhoto = dest.photos.find((p: any) => p.is_primary)?.image_url || dest.photos[0].image_url
    }
    return {
      id: dest.id,
      name: dest.name,
      categoryName: dest.category?.name,
      cityName: dest.city?.name,
      avg_rating: dest.avg_rating,
      price: dest.price,
      primaryPhoto
    }
  }) || []
}
