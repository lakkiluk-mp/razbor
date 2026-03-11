import { useNavigate } from 'react-router-dom'
import { Bell, ChevronRight } from 'lucide-react'

export function MonitorPromo() {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/monitor')}
      className="w-full flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left transition-colors active:scale-[0.98] active:bg-amber-500/20"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
        <Bell className="h-5 w-5 text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-100">Мониторинг объявлений</span>
          <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-black">new</span>
        </div>
        <p className="text-xs text-zinc-400 mt-0.5">Следите за новыми авто на Avito</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
    </button>
  )
}
