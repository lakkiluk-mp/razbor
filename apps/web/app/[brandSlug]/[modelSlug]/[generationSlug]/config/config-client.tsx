'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import NProgress from 'nprogress'
import { Button } from '@/components/ui/button'
import type { GenerationWithParts, GenerationConfigs } from '@razbor/hooks'

interface ConfigClientProps {
  generation: GenerationWithParts
  configs: GenerationConfigs
  brandSlug: string
  modelSlug: string
}

export function ConfigClient({
  generation,
  configs,
  brandSlug,
  modelSlug,
}: ConfigClientProps) {
  const router = useRouter()
  const [selectedEngine, setSelectedEngine] = useState<string | null>(
    configs.engines[0]?.configGroup ?? null
  )
  const [selectedTransmission, setSelectedTransmission] = useState<string | null>(
    configs.transmissions[0]?.configGroup ?? null
  )
  const [selectedDrivetrain, setSelectedDrivetrain] = useState<string | null>(
    configs.drivetrains[0]?.configGroup ?? null
  )

  const handleNext = () => {
    NProgress.start()
    const params = new URLSearchParams({
      brand: brandSlug,
      model: modelSlug,
    })
    if (selectedEngine) {
      params.set('engine', selectedEngine)
    }
    if (selectedTransmission) {
      params.set('transmission', selectedTransmission)
    }
    if (selectedDrivetrain) {
      params.set('drivetrain', selectedDrivetrain)
    }
    router.push(`/calculator/${generation.id}?${params.toString()}`)
  }

  const backHref = `/${brandSlug}/${modelSlug}`

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-4 pb-4">
        <Link
          href={backHref}
          aria-label="Назад"
          className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">{generation.name}</h1>
          <p className="text-zinc-500 text-sm">
            {generation.model.brand.name} {generation.model.name}
          </p>
        </div>
      </header>

      <div className="flex-1 px-4 pb-8 space-y-6">
        {configs.engines.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-zinc-300">Двигатель</h2>
            <div className="space-y-2">
              {configs.engines.map((engine) => (
                <button
                  type="button"
                  key={engine.configGroup}
                  onClick={() => setSelectedEngine(engine.configGroup)}
                  className={`w-full rounded-xl px-4 py-4 flex items-center justify-between transition-colors ${
                    selectedEngine === engine.configGroup
                      ? 'bg-amber-500/10 border-2 border-amber-500'
                      : 'bg-zinc-900 border-2 border-transparent hover:bg-zinc-800'
                  }`}
                >
                  <div className="text-left">
                    <span className="text-zinc-100 font-medium">{engine.name}</span>
                  </div>
                  {selectedEngine === engine.configGroup && (
                    <Check className="w-5 h-5 text-amber-500" />
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {configs.transmissions.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-zinc-300">Трансмиссия</h2>
            <div className="space-y-2">
              {configs.transmissions.map((transmission) => (
                <button
                  type="button"
                  key={transmission.configGroup}
                  onClick={() => setSelectedTransmission(transmission.configGroup)}
                  className={`w-full rounded-xl px-4 py-4 flex items-center justify-between transition-colors ${
                    selectedTransmission === transmission.configGroup
                      ? 'bg-amber-500/10 border-2 border-amber-500'
                      : 'bg-zinc-900 border-2 border-transparent hover:bg-zinc-800'
                  }`}
                >
                  <div className="text-left">
                    <span className="text-zinc-100 font-medium">{transmission.name}</span>
                  </div>
                  {selectedTransmission === transmission.configGroup && (
                    <Check className="w-5 h-5 text-amber-500" />
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {configs.drivetrains.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-zinc-300">Привод</h2>
            <div className="space-y-2">
              {configs.drivetrains.map((drivetrain) => (
                <button
                  type="button"
                  key={drivetrain.configGroup}
                  onClick={() => setSelectedDrivetrain(drivetrain.configGroup)}
                  className={`w-full rounded-xl px-4 py-4 flex items-center justify-between transition-colors ${
                    selectedDrivetrain === drivetrain.configGroup
                      ? 'bg-amber-500/10 border-2 border-amber-500'
                      : 'bg-zinc-900 border-2 border-transparent hover:bg-zinc-800'
                  }`}
                >
                  <div className="text-left">
                    <span className="text-zinc-100 font-medium">{drivetrain.name}</span>
                  </div>
                  {selectedDrivetrain === drivetrain.configGroup && (
                    <Check className="w-5 h-5 text-amber-500" />
                  )}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="px-4 pb-8">
        <Button
          onClick={handleNext}
          className="w-full h-14 bg-amber-500 hover:bg-amber-400 text-zinc-900 text-base font-semibold rounded-2xl"
        >
          ДАЛЕЕ
        </Button>
      </div>
    </div>
  )
}
