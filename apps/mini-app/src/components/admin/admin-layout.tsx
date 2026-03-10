import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Dashboard', to: '/admin', end: true },
  { label: 'Users', to: '/admin/users' },
  { label: 'Payments', to: '/admin/payments' },
  { label: 'Subscriptions', to: '/admin/subscriptions' },
  { label: 'Calculations', to: '/admin/calculations' },
  { label: 'Broadcasts', to: '/admin/broadcasts' },
  { label: 'Monitor', to: '/admin/monitor', end: true },
  { label: 'Monitor Logs', to: '/admin/monitor/logs' },
] as const

export function AdminLayout() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-zinc-400 text-sm active:text-zinc-200 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Назад</span>
          </button>
          <h1 className="text-base font-bold text-amber-500">Admin</h1>
        </div>
        <nav className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 px-4 pb-2 min-w-max">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={'end' in tab ? tab.end : false}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                    isActive
                      ? 'bg-amber-500/15 text-amber-500'
                      : 'text-zinc-400 active:text-zinc-200'
                  )
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>
      <main className="flex-1 px-4 py-4">
        <Outlet />
      </main>
    </div>
  )
}
