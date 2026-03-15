import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight } from 'lucide-react'

export function MonitorPromo() {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/region-feed')}
      className="w-full flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left transition-colors active:scale-[0.98] active:bg-amber-500/20"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
        <Search className="h-5 w-5 text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-100">Лента авто на разбор</span>
          <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold leading-none text-amber-500">beta</span>
        </div>
        <p className="text-xs text-zinc-400 mt-0.5">Авто на продажу по областям России</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
    </button>
  )
}
