import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import type { GenerationResponse, GenerationConfigs, GenerationWithParts } from '@razbor/hooks'

interface GenerationConfigsResponse {
  generationConfigs: GenerationConfigs
}

export function ConfigPage() {
  const { brandSlug, modelSlug, generationSlug } = useParams<{
    brandSlug: string
    modelSlug: string
    generationSlug: string
  }>()
  const navigate = useNavigate()

  const { data: generationData, isLoading: isLoadingGeneration, isError: isErrorGeneration } = useQuery({
    queryKey: ['generation', brandSlug, modelSlug, generationSlug],
    queryFn: () =>
      fetchGraphQL<GenerationResponse>(queries.generation, {
        brandSlug,
        modelSlug,
        generationSlug,
      }),
    enabled: !!brandSlug && !!modelSlug && !!generationSlug,
  })

  const generation = generationData?.generation as GenerationWithParts | undefined

  const { data: configsData, isLoading: isLoadingConfigs, isError: isErrorConfigs } = useQuery({
    queryKey: ['generationConfigs', generation?.id],
    queryFn: () =>
      fetchGraphQL<GenerationConfigsResponse>(queries.generationConfigs, {
        generationId: generation!.id,
      }),
    enabled: !!generation?.id,
  })

  const configs = configsData?.generationConfigs

  const [selectedEngine, setSelectedEngine] = useState<string | null>(null)
  const [selectedTransmission, setSelectedTransmission] = useState<string | null>(null)
  const [selectedDrivetrain, setSelectedDrivetrain] = useState<string | null>(null)

  useEffect(() => {
    if (!configs || !generation) return

    const hasConfigs =
      configs.engines.length > 0 ||
      configs.transmissions.length > 0 ||
      configs.drivetrains.length > 0

    if (!hasConfigs) {
      navigate(`/calculator/${generation.id}`)
      return
    }

    setSelectedEngine(configs.engines[0]?.configGroup ?? null)
    setSelectedTransmission(configs.transmissions[0]?.configGroup ?? null)
    setSelectedDrivetrain(configs.drivetrains[0]?.configGroup ?? null)
  }, [configs, generation, navigate])

  useEffect(() => {
    if (!isLoadingGeneration && !generation) {
      navigate('/')
    }
  }, [isLoadingGeneration, generation, navigate])

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return
    tg.BackButton.show()
    const handleBack = () => navigate(-1)
    tg.BackButton.onClick(handleBack)
    return () => {
      tg.BackButton.offClick(handleBack)
      tg.BackButton.hide()
    }
  }, [navigate])

  if (isLoadingGeneration || isLoadingConfigs) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Загрузка...</p>
      </div>
    )
  }

  if (isErrorGeneration || isErrorConfigs) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Ошибка загрузки данных</p>
      </div>
    )
  }

  if (!generation || !configs) {
    return null
  }

  const handleNext = () => {
    const params = new URLSearchParams()
    if (selectedEngine) params.set('engine', selectedEngine)
    if (selectedTransmission) params.set('transmission', selectedTransmission)
    if (selectedDrivetrain) params.set('drivetrain', selectedDrivetrain)
    navigate(`/calculator/${generation.id}?${params.toString()}`)
  }

  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold">{generation.name}</h1>
        <p className="text-zinc-500 text-sm">
          {generation.model.brand.name} {generation.model.name}
        </p>
      </div>

      <div className="flex-1 px-4 pb-8 space-y-6 overflow-auto">
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
