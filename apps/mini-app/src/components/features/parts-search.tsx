import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PartsSearchProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function PartsSearch({ value, onChange, className }: PartsSearchProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Найти запчасть..."
        className="w-full h-11 pl-10 pr-12 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-zinc-700 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Очистить поиск"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
