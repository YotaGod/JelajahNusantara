'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react'
import styles from './Header.module.css'

interface UserDropdownProps {
  user: any
  isAdmin: boolean
}

export default function UserDropdown({ user, isAdmin }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={styles.userPill} onClick={() => setIsOpen(!isOpen)} ref={dropdownRef} style={{ cursor: 'pointer' }}>
      <div className={styles.avatar}>
        <User size={16} color="var(--color-bg)" />
      </div>
      <span className={styles.userName}>
        {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
      </span>
      <ChevronDown size={16} color="var(--color-text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      
      {isOpen && (
        <div className={styles.dropdown} style={{ display: 'flex' }}>
          {isAdmin && (
            <Link href="/admin" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          )}
          <Link href="/profile" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
            <User size={16} /> Profil
          </Link>
          <form action="/auth/signout" method="post" style={{ margin: 0 }}>
            <button type="submit" className={styles.dropdownItem} style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}>
              <LogOut size={16} /> Logout
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
