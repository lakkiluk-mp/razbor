import { useEffect, useRef, lazy, Suspense } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { getQueryClient } from '@/lib/query-client'
import { fetchGraphQL, mutations } from '@/lib/graphql-client'
import { AppLayout } from '@/components/layout/app-layout'
import { BrandsPage } from '@/pages/BrandsPage'
import { ModelsPage } from '@/pages/ModelsPage'
import { GenerationsPage } from '@/pages/GenerationsPage'
import { ConfigPage } from '@/pages/ConfigPage'
import { EstimationPage } from '@/pages/EstimationPage'
import { ResultPage } from '@/pages/ResultPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { HistoryDetailPage } from '@/pages/HistoryDetailPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { TelegramRequired } from '@/components/TelegramRequired'
import { MonitorListPage } from '@/pages/MonitorListPage'
import { AdminGuard } from '@/components/admin/admin-guard'
import { AdminLayout } from '@/components/admin/admin-layout'

const LimitReachedPage = lazy(() => import('@/pages/LimitReachedPage').then(m => ({ default: m.LimitReachedPage })))
const SubscribePage = lazy(() => import('@/pages/SubscribePage').then(m => ({ default: m.SubscribePage })))
const PaymentPage = lazy(() => import('@/pages/PaymentPage').then(m => ({ default: m.PaymentPage })))
const PaymentSuccessPage = lazy(() => import('@/pages/PaymentSuccessPage').then(m => ({ default: m.PaymentSuccessPage })))
const MonitorNewPage = lazy(() => import('@/pages/MonitorNewPage').then(m => ({ default: m.MonitorNewPage })))
const MonitorDetailPage = lazy(() => import('@/pages/MonitorDetailPage').then(m => ({ default: m.MonitorDetailPage })))
const RegionFeedPage = lazy(() => import('@/pages/RegionFeedPage').then(m => ({ default: m.RegionFeedPage })))
const OffersPage = lazy(() => import('@/pages/static/OffersPage').then(m => ({ default: m.OffersPage })))
const PrivacyPage = lazy(() => import('@/pages/static/PrivacyPage').then(m => ({ default: m.PrivacyPage })))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })))
const AdminUserDetailPage = lazy(() => import('@/pages/admin/AdminUserDetailPage').then(m => ({ default: m.AdminUserDetailPage })))
const AdminPaymentsPage = lazy(() => import('@/pages/admin/AdminPaymentsPage').then(m => ({ default: m.AdminPaymentsPage })))
const AdminSubscriptionsPage = lazy(() => import('@/pages/admin/AdminSubscriptionsPage').then(m => ({ default: m.AdminSubscriptionsPage })))
const AdminCalculationsPage = lazy(() => import('@/pages/admin/AdminCalculationsPage').then(m => ({ default: m.AdminCalculationsPage })))
const AdminBroadcastsPage = lazy(() => import('@/pages/admin/AdminBroadcastsPage').then(m => ({ default: m.AdminBroadcastsPage })))
const AdminMonitorPage = lazy(() => import('@/pages/admin/AdminMonitorPage').then(m => ({ default: m.AdminMonitorPage })))
const AdminMonitorLogsPage = lazy(() => import('@/pages/admin/AdminMonitorLogsPage').then(m => ({ default: m.AdminMonitorLogsPage })))

const queryClient = getQueryClient()
const isDev = import.meta.env.DEV
const allowWebAccess = import.meta.env.VITE_ALLOW_WEB_ACCESS === 'true'

;(() => {
  const sp = window.Telegram?.WebApp?.initDataUnsafe?.start_param
  if (typeof sp !== 'string' || !sp.startsWith('listing_')) return
  const listingId = sp.slice(8)
  window.location.hash = `/region-feed?listing=${listingId}`
})()

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

function useLogAppOpen() {
  const sent = useRef(false)
  useEffect(() => {
    if (sent.current) return
    sent.current = true
    fetchGraphQL(mutations.logAppOpen).catch(() => {})
  }, [])
}

export function App() {
  useTelegramApp()
  useLogAppOpen()

  const isTelegram = Boolean(window.Telegram?.WebApp?.initData)

  if (allowWebAccess && new URLSearchParams(window.location.search).has('web')) {
    sessionStorage.setItem('web-bypass', '1')
  }
  const webBypass = allowWebAccess && sessionStorage.getItem('web-bypass') === '1'

  const pathname = window.location.pathname
  if (pathname === '/offers') return <Suspense fallback={null}><OffersPage /></Suspense>
  if (pathname === '/privacy') return <Suspense fallback={null}><PrivacyPage /></Suspense>

  if (!isDev && !isTelegram && !webBypass) {
    return <TelegramRequired />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<BrandsPage />} />
              <Route path="/monitor" element={<MonitorListPage />} />
              <Route path="/monitor/new" element={<MonitorNewPage />} />
              <Route path="/monitor/:id" element={<MonitorDetailPage />} />
              <Route path="/region-feed" element={<RegionFeedPage />} />
              <Route path="/:brandSlug" element={<ModelsPage />} />
              <Route path="/:brandSlug/:modelSlug" element={<GenerationsPage />} />
              <Route path="/:brandSlug/:modelSlug/:generationSlug/config" element={<ConfigPage />} />
              <Route path="/estimation/:generationId" element={<EstimationPage />} />
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
              <Route path="broadcasts" element={<AdminBroadcastsPage />} />
              <Route path="monitor" element={<AdminMonitorPage />} />
              <Route path="monitor/logs" element={<AdminMonitorLogsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </QueryClientProvider>
  )
}
