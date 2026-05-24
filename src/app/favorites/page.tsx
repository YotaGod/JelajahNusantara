import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import FavoritesClient from './FavoritesClient'

export const metadata = {
  title: 'Favorit Saya | Wisata Banten',
  description: 'Daftar destinasi wisata favorit Anda di Provinsi Banten.',
}

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return <FavoritesClient userId={session.user.id} />
}
