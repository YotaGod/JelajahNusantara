import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ReportsHistoryClient from './ReportsHistoryClient'

export const metadata = {
  title: 'Riwayat Laporan Saya | Wisata Banten',
  description: 'Daftar laporan error yang pernah Anda buat di Wisata Banten.',
}

export default async function ReportsHistoryPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return <ReportsHistoryClient />
}
