import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
  }

  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    console.error('OPENWEATHER_API_KEY is not set')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  try {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&lang=id&appid=${apiKey}`
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&lang=id&appid=${apiKey}`
    
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl)
    ])
    
    if (!currentRes.ok || !forecastRes.ok) {
      console.error('OpenWeatherMap API Error')
      return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
    }

    const currentData = await currentRes.json()
    const forecastDataRaw = await forecastRes.json()
    
    const current = {
      temp: Math.round(currentData.main.temp),
      description: currentData.weather[0].description,
      icon: currentData.weather[0].icon,
      city: currentData.name
    }

    // Process forecast data to get one reading per day (e.g. at 12:00:00 or closest)
    const dailyForecastsMap = new Map<string, any>()
    
    // The API returns data every 3 hours. We will pick the reading closest to midday,
    // or simply the first reading we encounter for a new day.
    for (const item of forecastDataRaw.list) {
      const dateText = item.dt_txt.split(' ')[0] // "2026-05-26"
      const timeText = item.dt_txt.split(' ')[1] // "12:00:00"
      
      // If we don't have this date yet, or if this time is exactly 12:00:00, we store it.
      // 12:00:00 is a good representative of the day's weather.
      if (!dailyForecastsMap.has(dateText) || timeText === '12:00:00') {
        dailyForecastsMap.set(dateText, {
          date: dateText,
          temp: Math.round(item.main.temp),
          description: item.weather[0].description,
          icon: item.weather[0].icon
        })
      }
    }

    // Convert map to array and take next 5 days
    // Exclude today if it's the first element and we already have 5 other days, 
    // but usually OpenWeatherMap returns 5 days. We'll just take the values.
    const forecast = Array.from(dailyForecastsMap.values()).slice(0, 5)

    return NextResponse.json({ current, forecast })
  } catch (error) {
    console.error('Weather route error:', error)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}
