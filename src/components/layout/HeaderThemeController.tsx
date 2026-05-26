'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function HeaderThemeController() {
  const pathname = usePathname()

  useEffect(() => {
    // Always use dark transparent header globally
    document.body.classList.add('dark-header')
    
    // Cleanup on unmount just in case
    return () => {
      document.body.classList.remove('dark-header')
    }
  }, [pathname])

  return null
}
