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
      padding: '1rem',
      backgroundColor: 'var(--color-card)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)',
      marginTop: '1rem',
      gap: '1rem'
    }}>
      {/* Current Weather */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Cuaca Saat Ini
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>
              {data.current.temp}&deg;C
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text)', borderLeft: '1px solid var(--color-border)', paddingLeft: '0.5rem' }}>
              {currentDesc}
            </span>
          </div>
        </div>
        <div>
          <img 
            src={`https://openweathermap.org/img/wn/${data.current.icon}@2x.png`} 
            alt={data.current.description}
            style={{ width: '50px', height: '50px', objectFit: 'contain' }}
            title={currentDesc}
          />
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--color-border)', width: '100%' }} />

      {/* 5-Day Forecast */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Prakiraan Kedepan
        </span>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {data.forecast.map((day, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', minWidth: '40px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                {idx === 0 ? 'Hari ini' : formatDay(day.date)}
              </span>
              <img 
                src={`https://openweathermap.org/img/wn/${day.icon}.png`} 
                alt={day.description}
                style={{ width: '30px', height: '30px', objectFit: 'contain' }}
                title={day.description.replace(/\b\w/g, l => l.toUpperCase())}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
                {day.temp}&deg;
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
