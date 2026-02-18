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
import { HistoryDetailPage } from '@/pages/HistoryDetailPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { LimitReachedPage } from '@/pages/LimitReachedPage'
import { SubscribePage } from '@/pages/SubscribePage'
import { PaymentPage } from '@/pages/PaymentPage'
import { PaymentSuccessPage } from '@/pages/PaymentSuccessPage'
import { TelegramRequired } from '@/components/TelegramRequired'
import { OffersPage } from '@/pages/static/OffersPage'
import { PrivacyPage } from '@/pages/static/PrivacyPage'
import { AdminGuard } from '@/components/admin/admin-guard'
import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminUserDetailPage } from '@/pages/admin/AdminUserDetailPage'
import { AdminPaymentsPage } from '@/pages/admin/AdminPaymentsPage'
import { AdminSubscriptionsPage } from '@/pages/admin/AdminSubscriptionsPage'
import { AdminCalculationsPage } from '@/pages/admin/AdminCalculationsPage'

const queryClient = getQueryClient()
const isDev = import.meta.env.DEV
const allowWebAccess = import.meta.env.VITE_ALLOW_WEB_ACCESS === 'true'

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

  if (allowWebAccess && new URLSearchParams(window.location.search).has('web')) {
    sessionStorage.setItem('web-bypass', '1')
  }
  const webBypass = allowWebAccess && sessionStorage.getItem('web-bypass') === '1'

  const pathname = window.location.pathname
  if (pathname === '/offers') return <OffersPage />
  if (pathname === '/privacy') return <PrivacyPage />

  if (!isDev && !isTelegram && !webBypass) {
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
            <Route path="/history/:id" element={<HistoryDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/subscribe" element={<SubscribePage />} />
          </Route>
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/limit-reached" element={<LimitReachedPage />} />
          <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="users/:id" element={<AdminUserDetailPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
            <Route path="calculations" element={<AdminCalculationsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  )
}
