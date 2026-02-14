import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { getQueryClient } from '@/lib/query-client'
import { AppLayout } from '@/components/layout/app-layout'
import { BrandsPage } from '@/pages/BrandsPage'
import { ModelsPage } from '@/pages/ModelsPage'
import { GenerationsPage } from '@/pages/GenerationsPage'
import { ConfigPage } from '@/pages/ConfigPage'
import { CalculatorPage } from '@/pages/CalculatorPage'
import { ResultPage } from '@/pages/ResultPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { LimitReachedPage } from '@/pages/LimitReachedPage'
import { TelegramRequired } from '@/components/TelegramRequired'

const queryClient = getQueryClient()
const isDev = import.meta.env.DEV

function useTelegramApp() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return
    tg.ready()
    tg.expand()
    try {
      tg.setHeaderColor('#09090b')
    } catch {
    }
    try {
      tg.setBackgroundColor('#09090b')
    } catch {
    }
    tg.disableVerticalSwipes?.()
    const platform = (tg as unknown as Record<string, unknown>).platform as string | undefined
    if (platform && platform !== 'tdesktop' && platform !== 'macos' && platform !== 'web') {
      try {
        tg.requestFullscreen?.()
      } catch {
      }
    }
  }, [])
}

export function App() {
  useTelegramApp()

  const isTelegram = Boolean(window.Telegram?.WebApp?.initData)

  if (!isDev && !isTelegram) {
    return <TelegramRequired />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<BrandsPage />} />
            <Route path="/:brandSlug" element={<ModelsPage />} />
            <Route path="/:brandSlug/:modelSlug" element={<GenerationsPage />} />
            <Route path="/:brandSlug/:modelSlug/:generationSlug/config" element={<ConfigPage />} />
            <Route path="/calculator/:generationId" element={<CalculatorPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="/limit-reached" element={<LimitReachedPage />} />
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  )
}
