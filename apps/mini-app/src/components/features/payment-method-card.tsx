import { CreditCard, Trash2 } from 'lucide-react'

interface PaymentMethodCardProps {
  cardLast4: string
  cardType: string
  expiryMonth: string
  expiryYear: string
  onRemove: () => void
}

export function PaymentMethodCard({
  cardLast4,
  cardType,
  expiryMonth,
  expiryYear,
  onRemove,
}: PaymentMethodCardProps) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <CreditCard className="w-6 h-6 text-zinc-400 shrink-0" />
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-white font-mono text-sm tracking-wider">
            **** **** **** {cardLast4}
          </span>
          <span className="text-zinc-400 text-sm">
            {cardType} · {expiryMonth}/{expiryYear}
          </span>
        </div>
        <button
          type="button"
          className="text-red-500 hover:text-red-400 active:text-red-400 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 -mr-2"
          onClick={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
