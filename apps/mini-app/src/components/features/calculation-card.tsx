interface CalculationCardProps {
  totalPrice: number
  damagedZonesCount: number
  createdAt: string
  brandName: string
  modelName: string
  generationName: string
}

export function CalculationCard({
  totalPrice,
  damagedZonesCount,
  createdAt,
  brandName,
  modelName,
  generationName,
}: CalculationCardProps) {
  const formattedPrice = totalPrice.toLocaleString('ru-RU') + ' \u20BD'
  const formattedDate = new Date(createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-zinc-100 font-semibold">
          {brandName} {modelName}
        </span>
        <span className="text-zinc-500 text-xs">{formattedDate}</span>
      </div>
      <span className="text-zinc-400 text-sm">{generationName}</span>
      <div className="flex items-center gap-2">
        <span className="text-amber-400 font-bold text-lg">{formattedPrice}</span>
        {damagedZonesCount > 0 && (
          <span className="bg-red-500/20 text-red-400 text-xs rounded-full px-2 py-0.5">
            {damagedZonesCount} повр.
          </span>
        )}
      </div>
    </div>
  )
}
