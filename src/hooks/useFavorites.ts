'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserFavoriteIds, toggleUserFavorite } from '@/lib/api'
import { useToast } from '@/components/ui/ToastProvider'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export function useFavorites() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUserId(data.session.user.id)
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user.id || null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const queryKey = ['favorites', userId]

  const { data: favoriteIds = [], isLoading } = useQuery({
    queryKey,
    queryFn: getUserFavoriteIds,
    enabled: !!userId, // Hanya fetch jika user login
    staleTime: 1000 * 60 * 5, // 5 menit
  })

  const { mutate: toggleFavorite, isPending } = useMutation({
    mutationFn: async ({ destinationId, isFavorited }: { destinationId: string, isFavorited: boolean }) => {
      if (!userId) throw new Error('not_logged_in')
      return await toggleUserFavorite(destinationId, isFavorited)
    },
    // Optimistic Update
    onMutate: async ({ destinationId, isFavorited }) => {
      if (!userId) return

      await queryClient.cancelQueries({ queryKey })

      const previousFavorites = queryClient.getQueryData<string[]>(queryKey) || []

      queryClient.setQueryData<string[]>(queryKey, (old = []) => {
        if (isFavorited) {
          return old.filter(id => id !== destinationId) // Remove
        } else {
          return [...old, destinationId] // Add
        }
      })

      return { previousFavorites }
    },
    onError: (err, variables, context) => {
      if (err.message === 'not_logged_in') {
        addToast('Silakan login untuk menambahkan favorit', 'error')
        // Bisa juga arahkan ke /login di sini, tapi kita handle di komponen saja
      } else {
        addToast('Gagal mengubah favorit. Coba lagi.', 'error')
        if (context?.previousFavorites) {
          queryClient.setQueryData(queryKey, context.previousFavorites)
        }
      }
    },
    onSuccess: (isNowFavorited) => {
      if (isNowFavorited) {
        addToast('Ditambahkan ke favorit', 'success')
      } else {
        addToast('Dihapus dari favorit', 'info')
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  })

  const isFavorite = (destinationId: string) => {
    return favoriteIds.includes(destinationId)
  }

  return {
    favoriteIds,
    isLoading,
    isFavorite,
    toggleFavorite,
    isPending,
    isLoggedIn: !!userId
  }
}
