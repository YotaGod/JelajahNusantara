import type { Metadata } from 'next'
import './globals.css'
import QueryProvider from '@/providers/QueryProvider'
import { ToastProvider } from '@/components/ui/ToastProvider'
import Header from '@/components/layout/Header'

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
    <html lang="id">
      <body>
        <QueryProvider>
          <ToastProvider>
            <Header />
            <main>{children}</main>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
