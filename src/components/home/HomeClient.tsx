'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { getDestinations, getCategories, getCities } from '@/lib/api'
import Hero from './Hero'
import NearbyRecommendations from './NearbyRecommendations'
import SearchFilter from './SearchFilter'
import DestinationCard from './DestinationCard'
import Pagination from './Pagination'
import { useCallback } from 'react'

export default function HomeClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const page = Number(searchParams.get('page')) || 1
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const city = searchParams.get('city') || ''
  const price = searchParams.get('price') || ''

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: getCities,
  })

  const { data: destinationsData, isLoading, isError } = useQuery({
    queryKey: ['destinations', page, search, category, city, price],
    queryFn: () => getDestinations({ page, search, category, city, price }),
    placeholderData: (previousData) => previousData, // keep previous data while fetching
  })

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      
      // Reset page to 1 when filters change
      if (name !== 'page') {
        params.set('page', '1')
      }
      
      return params.toString()
    },
    [searchParams]
  )

  const handleFilterChange = (key: string, value: string) => {
    router.push('?' + createQueryString(key, value), { scroll: false })
  }

  const handleReset = () => {
    router.push('/')
  }

  const handlePageChange = (newPage: number) => {
    router.push('?' + createQueryString('page', newPage.toString()))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Hero />
      <NearbyRecommendations />
      <div className="container">
        <SearchFilter
          categories={categories}
          cities={cities}
          initialSearch={search}
          initialCategory={category}
          initialCity={city}
          initialPrice={price}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />

        {isError && (
          <div className="grid" style={{ placeItems: 'center', minHeight: '200px', color: 'var(--color-error)' }}>
            <h3>Terjadi kesalahan saat memuat data.</h3>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '300px' }} />
            ))}
          </div>
        ) : (
          <>
            {destinationsData?.data.length === 0 ? (
              <div className="grid" style={{ placeItems: 'center', minHeight: '300px', color: 'var(--color-text-muted)' }}>
                <h2>Tidak ada destinasi yang sesuai dengan filter.</h2>
                <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={handleReset}>
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {destinationsData?.data.map((dest: any) => (
                  <DestinationCard key={dest.id} dest={dest} />
                ))}
              </div>
            )}
            
            <Pagination
              currentPage={page}
              totalPages={destinationsData?.totalPages || 0}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </>
  )
}
