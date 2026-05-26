'use client'

import { useQuery } from '@tanstack/react-query'
import { CloudRain, CloudSnow, Cloud, Sun, CloudLightning, CloudDrizzle, Loader2 } from 'lucide-react'

type WeatherWidgetProps = {
  latitude: number
  longitude: number
}

type WeatherData = {
  temp: number
  description: string
  icon: string
  city: string
}

async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`)
  if (!res.ok) {
    throw new Error('Gagal mengambil data cuaca')
  }
  return res.json()
}

export default function WeatherWidget({ latitude, longitude }: WeatherWidgetProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['weather', latitude, longitude],
    queryFn: () => fetchWeather(latitude, longitude),
    staleTime: 1000 * 60 * 15, // 15 minutes
  })

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '1rem',
        backgroundColor: 'var(--color-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        marginTop: '1rem',
        color: 'var(--color-text-muted)'
      }}>
        <Loader2 size={20} className="animate-spin" />
        <span style={{ fontSize: '0.875rem' }}>Memuat cuaca...</span>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--color-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-error)',
        marginTop: '1rem',
        color: 'var(--color-error)',
        fontSize: '0.875rem'
      }}>
        Gagal memuat cuaca saat ini.
      </div>
    )
  }

  // Capitalize each word for description
  const desc = data.description.replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      backgroundColor: 'var(--color-card)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)',
      marginTop: '1rem',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Cuaca Saat Ini
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>
            {data.temp}&deg;C
          </span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text)', borderLeft: '1px solid var(--color-border)', paddingLeft: '0.5rem' }}>
            {desc}
          </span>
        </div>
      </div>
      <div>
        <img 
          src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`} 
          alt={data.description}
          style={{ width: '50px', height: '50px', objectFit: 'contain' }}
        />
      </div>
    </div>
  )
}
