import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import KontakClient from '@/components/kontak/KontakClient'

export const metadata = {
  title: 'Hubungi Kami - Jelajah Nusantara',
  description: 'Hubungi kami dan berikan masukan atau saran untuk admin pusat maupun admin regional.',
}

export default async function KontakPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/kontak')
  }

  return <KontakClient userId={user.id} />
}
