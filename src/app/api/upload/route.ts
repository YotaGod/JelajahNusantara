import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  // Check if user is authenticated before allowing upload
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // Handle cookie setting error in route handlers
          }
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const image = formData.get('image')

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Gunakan IMGBB_API_KEY agar lebih aman (fallback ke NEXT_PUBLIC_IMGBB_API_KEY jika belum diatur)
    const apiKey = process.env.IMGBB_API_KEY || process.env.NEXT_PUBLIC_IMGBB_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ImgBB API key is missing on server' }, { status: 500 })
    }

    const imgbbFormData = new FormData()
    imgbbFormData.append('image', image)

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: imgbbFormData
    })

    const data = await res.json()
    if (!data.success) {
      return NextResponse.json({ error: data.error?.message || 'Failed to upload image to ImgBB' }, { status: 500 })
    }

    // Replace i.ibb.co with i.ibb.co.com
    const url = data.data.url.replace('i.ibb.co/', 'i.ibb.co.com/')

    return NextResponse.json({ url })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error during upload' }, { status: 500 })
  }
}
