import { getDestinationDetail } from '@/lib/api'
import { createClient } from '@/utils/supabase/server'
import DestinationDetailClient from '@/components/destination/DestinationDetailClient'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const dest = await getDestinationDetail(id)

  if (!dest) {
    return {
      title: 'Destinasi Tidak Ditemukan - Wisata Banten',
    }
  }

  return {
    title: `${dest.name} - Wisata Banten`,
    description: dest.description?.substring(0, 160) || `Kunjungi ${dest.name} di Banten!`,
  }
}

export default async function DestinationPage({ params }: Props) {
  const { id } = await params
  
  // Ambil user session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <DestinationDetailClient destinationId={id} userId={user?.id || null} />
  )
}
