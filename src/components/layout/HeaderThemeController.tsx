'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function HeaderThemeController() {
  const pathname = usePathname()

  useEffect(() => {
    // Check if the current page should have a dark, transparent header
    if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/destinations/')) {
      document.body.classList.add('dark-header')
    } else {
      document.body.classList.remove('dark-header')
    }
    
    // Cleanup on unmount just in case
    return () => {
      document.body.classList.remove('dark-header')
    }
  }, [pathname])

  return null
}
