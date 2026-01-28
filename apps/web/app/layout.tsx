import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { NavigationProgress } from '@/components/features/navigation-progress'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Razbor — Калькулятор маржинальности',
  description: 'Оцени прибыль с разбора автомобиля на основе рыночных данных',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#09090b',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <NavigationProgress />
          {children}
        </Providers>
      </body>
    </html>
  )
}
