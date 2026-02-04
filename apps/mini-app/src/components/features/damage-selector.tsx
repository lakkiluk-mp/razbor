import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CarView } from '@/lib/types'
import { viewLabels } from '@/lib/types'
import {
  CarFrontSvg,
  CarBackSvg,
  CarLeftSvg,
  CarRightSvg,
  CarFrontThumb,
  CarBackThumb,
  CarLeftThumb,
  CarRightThumb,
} from './car-svg'

interface DamagePoint {
  code: string
  x: number
  y: number
  label: string
}

const damagePointsByView: Record<CarView, DamagePoint[]> = {
  front: [
    { code: 'roof', x: 50, y: 5, label: 'Крыша' },
    { code: 'windshield', x: 50, y: 25, label: 'Лобовое' },
    { code: 'hood', x: 50, y: 44, label: 'Капот' },
    { code: 'bumper_f', x: 50, y: 72, label: 'Бампер П' },
    { code: 'headlight_l', x: 28, y: 58, label: 'Фара Л' },
    { code: 'headlight_r', x: 72, y: 58, label: 'Фара П' },
  ],
  left: [
    { code: 'fender_fl', x: 18, y: 52, label: 'Крыло ПЛ' },
    { code: 'door_fl', x: 38, y: 62, label: 'Дверь ПЛ' },
    { code: 'door_rl', x: 58, y: 62, label: 'Дверь ЗЛ' },
    { code: 'quarter_panel_l', x: 80, y: 52, label: 'Крыло ЗЛ' },
  ],
  back: [
    { code: 'rear_glass', x: 50, y: 22, label: 'Заднее стекло' },
    { code: 'trunk', x: 50, y: 50, label: 'Багажник' },
    { code: 'bumper_r', x: 50, y: 75, label: 'Бампер З' },
    { code: 'taillight_l', x: 22, y: 48, label: 'Фонарь Л' },
    { code: 'taillight_r', x: 77, y: 48, label: 'Фонарь П' },
  ],
  right: [
    { code: 'quarter_panel_r', x: 20, y: 52, label: 'Крыло ЗП' },
    { code: 'door_rr', x: 42, y: 62, label: 'Дверь ЗП' },
    { code: 'door_fr', x: 62, y: 62, label: 'Дверь ПП' },
    { code: 'fender_fr', x: 82, y: 52, label: 'Крыло ПП' },
  ],
}

const allDamageLabels: Record<string, string> = {
  roof: 'Крыша',
  windshield: 'Лобовое',
  hood: 'Капот',
  bumper_f: 'Бампер П',
  headlight_l: 'Фара Л',
  headlight_r: 'Фара П',
  fender_fl: 'Крыло ПЛ',
  door_fl: 'Дверь ПЛ',
  door_rl: 'Дверь ЗЛ',
  quarter_panel_l: 'Крыло ЗЛ',
  rear_glass: 'Заднее стекло',
  trunk: 'Багажник',
  bumper_r: 'Бампер З',
  taillight_l: 'Фонарь Л',
  taillight_r: 'Фонарь П',
  quarter_panel_r: 'Крыло ЗП',
  door_rr: 'Дверь ЗП',
  door_fr: 'Дверь ПП',
  fender_fr: 'Крыло ПП',
  engine: 'Двигатель',
  transmission: 'КПП',
}

const aggregates = [
  { code: 'engine', name: 'Двигатель' },
  { code: 'transmission', name: 'КПП' },
]

interface DamageSelectorProps {
  selectedDamages: Set<string>
  onToggleDamage: (code: string) => void
}

export function DamageSelector({
  selectedDamages,
  onToggleDamage,
}: DamageSelectorProps) {
  const [currentView, setCurrentView] = useState<CarView>('front')

  const views: CarView[] = ['front', 'left', 'back', 'right']

  const selectedLabels = Array.from(selectedDamages)
    .map((code) => allDamageLabels[code])
    .filter(Boolean)

  const renderCarSvgByView = (view: CarView) => {
    const svgClass = 'w-full h-full'
    switch (view) {
      case 'front':
        return <CarFrontSvg className={svgClass} />
      case 'back':
        return <CarBackSvg className={svgClass} />
      case 'left':
        return <CarLeftSvg className={svgClass} />
      case 'right':
        return <CarRightSvg className={svgClass} />
    }
  }

  const renderThumb = (view: CarView) => {
    const thumbClass = 'w-full h-full'
    switch (view) {
      case 'front':
        return <CarFrontThumb className={thumbClass} />
      case 'back':
        return <CarBackThumb className={thumbClass} />
      case 'left':
        return <CarLeftThumb className={thumbClass} />
      case 'right':
        return <CarRightThumb className={thumbClass} />
    }
  }

  return (
    <>
      <div className="flex-1 flex items-center justify-center px-4 relative min-h-[280px]">
        <div className="relative w-full max-w-md h-[220px]">
          {views.map((view) => {
            const isActive = currentView === view
            return (
              <div
                key={view}
                className={cn(
                  'absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out',
                  isActive
                    ? 'opacity-100 z-10'
                    : 'opacity-0 z-0 pointer-events-none'
                )}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  {renderCarSvgByView(view)}
                  {damagePointsByView[view].map((point) => {
                    const isSelected = selectedDamages.has(point.code)
                    return (
                      <button
                        key={point.code}
                        onClick={() => onToggleDamage(point.code)}
                        className={cn(
                          'absolute w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 transform -translate-x-1/2 -translate-y-1/2',
                          isSelected
                            ? 'bg-amber-500 text-zinc-900 scale-110'
                            : 'bg-zinc-800/80 text-zinc-400 border border-zinc-600 hover:bg-zinc-700'
                        )}
                        style={{ left: `${point.x}%`, top: `${point.y}%` }}
                        title={point.label}
                        aria-label={`${isSelected ? 'Убрать' : 'Отметить'} повреждение: ${point.label}`}
                        aria-pressed={isSelected}
                      >
                        {isSelected ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex justify-center gap-2">
          {views.map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all',
                currentView === view
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
              aria-label={`Показать вид ${viewLabels[view]}`}
              aria-pressed={currentView === view}
            >
              <div
                className={cn(
                  'w-14 h-8 flex items-center justify-center',
                  currentView === view ? 'text-zinc-100' : 'text-zinc-500'
                )}
              >
                {renderThumb(view)}
              </div>
              <span className="text-xs font-medium">{viewLabels[view]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-zinc-400 text-sm">Агрегаты</p>
          <span
            className={cn(
              'text-xs px-2 py-1 rounded-lg min-w-[85px] text-center',
              selectedLabels.length > 0
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-zinc-600 bg-zinc-800/50'
            )}
          >
            {selectedLabels.length} поврежд.
          </span>
        </div>
        <div className="flex gap-2">
          {aggregates.map((agg) => {
            const isSelected = selectedDamages.has(agg.code)
            return (
              <button
                key={agg.code}
                onClick={() => onToggleDamage(agg.code)}
                className={cn(
                  'flex-1 py-3 px-4 rounded-xl border transition-all',
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                )}
                aria-label={`${isSelected ? 'Убрать' : 'Отметить'} повреждение: ${agg.name}`}
                aria-pressed={isSelected}
              >
                <span className="text-sm font-medium">{agg.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
