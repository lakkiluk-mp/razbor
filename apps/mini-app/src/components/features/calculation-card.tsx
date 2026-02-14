import { ChevronRight } from 'lucide-react'

interface CalculationCardProps {
  createdAt: string
  brandName: string
  modelName: string
  generationName: string
  onClick?: () => void
}

export function CalculationCard({
  createdAt,
  brandName,
  modelName,
  generationName,
  onClick,
}: CalculationCardProps) {
  const date = new Date(createdAt)
  const formattedDate =
    date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) +
    ', ' +
    date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className="bg-zinc-900 rounded-2xl p-4 flex items-center gap-3 cursor-pointer active:bg-zinc-800 transition-colors"
      onClick={onClick}
    >
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="text-zinc-100 font-semibold truncate">
          {brandName} {modelName}
        </span>
        <span className="text-zinc-400 text-sm truncate">{generationName}</span>
        <span className="text-zinc-500 text-xs">{formattedDate}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0" />
    </div>
  )
}
