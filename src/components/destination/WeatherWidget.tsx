'use client'

import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

type WeatherWidgetProps = {
  latitude: number
  longitude: number
}

type DailyForecast = {
  date: string
  temp: number
  description: string
  icon: string
}

type WeatherResponse = {
  current: {
    temp: number
    description: string
    icon: string
    city: string
  }
  forecast: DailyForecast[]
}

async function fetchWeather(lat: number, lng: number): Promise<WeatherResponse> {
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
        padding: '1.5rem',
        color: '#cbd5e1'
      }}>
        <Loader2 size={20} className="animate-spin" />
        <span style={{ fontSize: '0.875rem' }}>Memuat cuaca...</span>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div style={{
        padding: '1.5rem',
        color: '#fca5a5',
        fontSize: '0.875rem'
      }}>
        Gagal memuat cuaca saat ini.
      </div>
    )
  }

  // Helper to format date "YYYY-MM-DD" to "Sen", "Sel", etc.
  const formatDay = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { weekday: 'short' })
  }

  const currentDesc = data.current.description.replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem',
      gap: '1.25rem',
      width: '100%'
    }}>
      {/* Current Weather Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>
          Cuaca Langsung
        </span>
      </div>

      {/* Current Weather Data */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div>
          <img 
            src={`https://openweathermap.org/img/wn/${data.current.icon}@2x.png`} 
            alt={data.current.description}
            style={{ width: '64px', height: '64px', objectFit: 'contain' }}
            title={currentDesc}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
            {data.current.temp}&deg;C
          </span>
          <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
            {currentDesc}
          </span>
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', width: '100%' }} />

      {/* 5-Day Forecast */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', overflowX: 'auto' }}>
        {data.forecast.map((day, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', minWidth: '40px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
              {idx === 0 ? 'Hari ini' : formatDay(day.date)}
            </span>
            <img 
              src={`https://openweathermap.org/img/wn/${day.icon}.png`} 
              alt={day.description}
              style={{ width: '32px', height: '32px', objectFit: 'contain' }}
              title={day.description.replace(/\b\w/g, l => l.toUpperCase())}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
              {day.temp}&deg;
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
