import { pluralCredits } from '@razbor/shared'

interface PlanCardProps {
  plan: string
  price: number
  label: string
  credits: number
  isSelected: boolean
  badge?: string
  onSelect: () => void
}

export function PlanCard({
  plan: _plan,
  price,
  label,
  credits,
  isSelected,
  badge,
  onSelect,
}: PlanCardProps) {
  return (
    <div
      className={`relative bg-zinc-900 rounded-2xl p-4 border-2 cursor-pointer transition-colors active:bg-zinc-800 ${
        isSelected ? 'border-amber-500' : 'border-zinc-800'
      }`}
      onClick={onSelect}
    >
      {badge && (
        <span className="absolute -top-2.5 right-3 bg-amber-500 text-zinc-950 text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <div className="flex items-center gap-3">
        <div
          className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
            isSelected ? 'border-amber-500' : 'border-zinc-600'
          }`}
        >
          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
        </div>
        <div className="flex flex-1 items-center justify-between min-w-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-white font-medium">{label}</span>
            <span className="text-zinc-400 text-sm">
              {credits} {pluralCredits(credits)}
            </span>
          </div>
          <span className="text-white font-bold text-lg shrink-0 ml-3">
            {price} ₽
          </span>
        </div>
      </div>
    </div>
  )
}

