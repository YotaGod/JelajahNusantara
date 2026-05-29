import { Medal, Shield, Award, Compass, Gem, Crown, LucideIcon } from 'lucide-react'

export interface BadgeInfo {
  name: string
  color: string
  bg: string
  icon: LucideIcon
}

export function getUserBadge(reviewCount: number): BadgeInfo {
  if (reviewCount >= 50) {
    return { name: "Legenda Penjelajah", color: "#e74c3c", bg: "rgba(231, 76, 60, 0.15)", icon: Crown } // Crown / Merah & Emas
  }
  if (reviewCount >= 40) {
    return { name: "Pemandu Nusantara", color: "#9b59b6", bg: "rgba(155, 89, 182, 0.15)", icon: Gem } // Diamond / Ungu
  }
  if (reviewCount >= 30) {
    return { name: "Ahli Jelajah", color: "#00bcd4", bg: "rgba(0, 188, 212, 0.15)", icon: Compass } // Platinum / Biru Muda
  }
  if (reviewCount >= 20) {
    return { name: "Petualang Handal", color: "#f1c40f", bg: "rgba(241, 196, 15, 0.15)", icon: Award } // Gold / Emas
  }
  if (reviewCount >= 10) {
    return { name: "Sang Pengembara", color: "#bdc3c7", bg: "rgba(189, 195, 199, 0.15)", icon: Shield } // Silver / Perak
  }
  
  return { name: "Langkah Awal", color: "#cd7f32", bg: "rgba(205, 127, 50, 0.15)", icon: Medal } // Bronze / Perunggu
}
