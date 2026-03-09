import { Link, useLocation } from 'react-router-dom'
import { Calculator, Clock, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { key: 'calc', label: 'Расчёт', icon: Calculator, to: '/' },
  { key: 'history', label: 'История', icon: Clock, to: '/history' },
  { key: 'monitor', label: 'Мониторинг', icon: Bell, to: '/monitor' },
  { key: 'profile', label: 'Профиль', icon: User, to: '/profile' },
] as const

function getActiveTab(pathname: string) {
  if (pathname.startsWith('/history')) return 'history'
  if (pathname.startsWith('/monitor')) return 'monitor'
  if (pathname.startsWith('/profile') || pathname.startsWith('/subscribe')) return 'profile'
  if (pathname === '/' || pathname.startsWith('/brand') || pathname.startsWith('/estimation') || pathname.startsWith('/result')) return 'calc'
  return null
}

export function TabBar() {
  const { pathname } = useLocation()
  const activeTab = getActiveTab(pathname)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-zinc-800/50">
      <div
        className="flex items-center justify-around h-16"
        style={{ paddingBottom: 'var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <Link
              key={tab.key}
              to={tab.to}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] transition-colors',
                isActive ? 'text-amber-500' : 'text-zinc-500'
              )}
            >
              <tab.icon className="w-6 h-6" strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="text-[10px] leading-tight">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
