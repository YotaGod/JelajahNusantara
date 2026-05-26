import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/providers/QueryProvider'
import { ToastProvider } from '@/components/ui/ToastProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeaderThemeController from '@/components/layout/HeaderThemeController'

const outfit = Outfit({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: 'Wisata Banten',
  description: 'Jelajahi keindahan pantai, gunung, budaya, dan kuliner di Banten',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={outfit.variable}>
      <body className={outfit.className}>
        <QueryProvider>
          <ToastProvider>
            <HeaderThemeController />
            <Header />
            <main>{children}</main>
            <Footer />
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
