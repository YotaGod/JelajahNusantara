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
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&lang=id&appid=${apiKey}`
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenWeatherMap API Error:', errorData)
      return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: response.status })
    }

    const data = await response.json()
    
    const weatherData = {
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name
    }

    return NextResponse.json(weatherData)
  } catch (error) {
    console.error('Weather route error:', error)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}
