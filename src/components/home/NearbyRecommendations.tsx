'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { getUserProfile, getNearbyDestinations } from '@/lib/api'
import DestinationCard from './DestinationCard'
import { MapPin } from 'lucide-react'

export default function NearbyRecommendations() {
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id)
      }
    })
  }, [])

  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId,
  })

  const { data: nearbyDestinations, isLoading } = useQuery({
    queryKey: ['nearby-destinations', profile?.home_city_id],
    queryFn: () => getNearbyDestinations(profile!.home_city_id!),
    enabled: !!profile?.home_city_id,
  })

  if (!profile?.home_city_id || isLoading || !nearbyDestinations || nearbyDestinations.length === 0) {
    return null
  }

  return (
    <div className="container" style={{ marginTop: 'var(--spacing-8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-4)' }}>
        <MapPin color="var(--color-primary)" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Rekomendasi di Dekat Anda</h2>
      </div>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-6)' }}>
        Destinasi dengan rating terbaik di wilayah {nearbyDestinations[0]?.city?.name}
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--spacing-6)' }}>
        {nearbyDestinations.map(dest => (
          <DestinationCard key={dest.id} dest={dest} />
        ))}
      </div>
    </div>
  )
}
