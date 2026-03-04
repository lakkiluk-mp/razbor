import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import type { GenerationResponse, GenerationConfigs, GenerationWithParts, ConfigOption } from '@razbor/hooks'

const hasPrice = (option: ConfigOption) => option.price > 0

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
  const [searchParams] = useSearchParams()

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
      navigate(`/estimation/${generation.id}`)
      return
    }

    const vinEngines = searchParams.getAll('engine')
    const vinTransmissions = searchParams.getAll('transmission')
    const vinDrivetrains = searchParams.getAll('drivetrain')
    const isVin = vinEngines.length > 0 || vinTransmissions.length > 0 || vinDrivetrains.length > 0

    const availableEngines = new Set(configs.engines.map(e => e.configGroup))
    const availableTransmissions = new Set(configs.transmissions.map(t => t.configGroup))
    const availableDrivetrains = new Set(configs.drivetrains.map(d => d.configGroup))

    const matchWithPrice = (vinValues: string[], options: ConfigOption[], available: Set<string>) =>
      vinValues.find(v => available.has(v) && hasPrice(options.find(o => o.configGroup === v)!))

    const matchedEngine = matchWithPrice(vinEngines, configs.engines, availableEngines)
    const matchedTransmission = matchWithPrice(vinTransmissions, configs.transmissions, availableTransmissions)
    const matchedDrivetrain = matchWithPrice(vinDrivetrains, configs.drivetrains, availableDrivetrains)

    const firstWithPrice = (options: ConfigOption[]) =>
      options.find(o => hasPrice(o))?.configGroup ?? null

    const fallbackEngine = isVin ? null : firstWithPrice(configs.engines)
    const fallbackTransmission = isVin ? null : firstWithPrice(configs.transmissions)
    const fallbackDrivetrain = isVin ? null : firstWithPrice(configs.drivetrains)

    const autoSelectSingle = (options: ConfigOption[]) =>
      options.length === 1 && hasPrice(options[0]) ? options[0].configGroup : null

    setSelectedEngine(
      matchedEngine ?? autoSelectSingle(configs.engines) ?? fallbackEngine
    )
    setSelectedTransmission(
      matchedTransmission ?? autoSelectSingle(configs.transmissions) ?? fallbackTransmission
    )
    setSelectedDrivetrain(
      matchedDrivetrain ?? autoSelectSingle(configs.drivetrains) ?? fallbackDrivetrain
    )
  }, [configs, generation, navigate, searchParams])

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

  const fromVin = searchParams.has('engine') || searchParams.has('transmission') || searchParams.has('drivetrain')

  const allEnginesDisabled = configs.engines.length > 0 && configs.engines.every(e => !hasPrice(e))
  const allTransmissionsDisabled = configs.transmissions.length > 0 && configs.transmissions.every(t => !hasPrice(t))
  const allDrivetrainsDisabled = configs.drivetrains.length > 0 && configs.drivetrains.every(d => !hasPrice(d))

  const missingSelections: string[] = []
  if (configs.engines.length > 0 && !selectedEngine) missingSelections.push('двигатель')
  if (configs.transmissions.length > 0 && !selectedTransmission) missingSelections.push('трансмиссию')
  if (configs.drivetrains.length > 0 && !selectedDrivetrain) missingSelections.push('привод')

  const noPriceSelections: string[] = []
  if (allEnginesDisabled) noPriceSelections.push('двигателей')
  if (allTransmissionsDisabled) noPriceSelections.push('трансмиссий')
  if (allDrivetrainsDisabled) noPriceSelections.push('приводов')

  const isComplete = missingSelections.length === 0 && noPriceSelections.length === 0

  const handleNext = () => {
    if (!isComplete) return
    const params = new URLSearchParams()
    if (selectedEngine) params.set('engine', selectedEngine)
    if (selectedTransmission) params.set('transmission', selectedTransmission)
    if (selectedDrivetrain) params.set('drivetrain', selectedDrivetrain)
    navigate(`/estimation/${generation.id}?${params.toString()}`)
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
              {configs.engines.map((engine) => {
                const disabled = !hasPrice(engine)
                return (
                  <button
                    type="button"
                    key={engine.configGroup}
                    disabled={disabled}
                    onClick={() => setSelectedEngine(engine.configGroup)}
                    className={`w-full rounded-xl px-4 py-4 flex items-center justify-between transition-colors ${
                      disabled
                        ? 'bg-zinc-900 border-2 border-transparent opacity-40 cursor-not-allowed'
                        : selectedEngine === engine.configGroup
                          ? 'bg-amber-500/10 border-2 border-amber-500'
                          : 'bg-zinc-900 border-2 border-transparent hover:bg-zinc-800'
                    }`}
                  >
                    <div className="text-left">
                      <span className="text-zinc-100 font-medium">{engine.name}</span>
                      {disabled && <span className="text-zinc-500 text-xs ml-2">нет данных</span>}
                    </div>
                    {selectedEngine === engine.configGroup && !disabled && (
                      <Check className="w-5 h-5 text-amber-500" />
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {configs.transmissions.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-zinc-300">Трансмиссия</h2>
            <div className="space-y-2">
              {configs.transmissions.map((transmission) => {
                const disabled = !hasPrice(transmission)
                return (
                  <button
                    type="button"
                    key={transmission.configGroup}
                    disabled={disabled}
                    onClick={() => setSelectedTransmission(transmission.configGroup)}
                    className={`w-full rounded-xl px-4 py-4 flex items-center justify-between transition-colors ${
                      disabled
                        ? 'bg-zinc-900 border-2 border-transparent opacity-40 cursor-not-allowed'
                        : selectedTransmission === transmission.configGroup
                          ? 'bg-amber-500/10 border-2 border-amber-500'
                          : 'bg-zinc-900 border-2 border-transparent hover:bg-zinc-800'
                    }`}
                  >
                    <div className="text-left">
                      <span className="text-zinc-100 font-medium">{transmission.name}</span>
                      {disabled && <span className="text-zinc-500 text-xs ml-2">нет данных</span>}
                    </div>
                    {selectedTransmission === transmission.configGroup && !disabled && (
                      <Check className="w-5 h-5 text-amber-500" />
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {configs.drivetrains.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-zinc-300">Привод</h2>
            <div className="space-y-2">
              {configs.drivetrains.map((drivetrain) => {
                const disabled = !hasPrice(drivetrain)
                return (
                  <button
                    type="button"
                    key={drivetrain.configGroup}
                    disabled={disabled}
                    onClick={() => setSelectedDrivetrain(drivetrain.configGroup)}
                    className={`w-full rounded-xl px-4 py-4 flex items-center justify-between transition-colors ${
                      disabled
                        ? 'bg-zinc-900 border-2 border-transparent opacity-40 cursor-not-allowed'
                        : selectedDrivetrain === drivetrain.configGroup
                          ? 'bg-amber-500/10 border-2 border-amber-500'
                          : 'bg-zinc-900 border-2 border-transparent hover:bg-zinc-800'
                    }`}
                  >
                    <div className="text-left">
                      <span className="text-zinc-100 font-medium">{drivetrain.name}</span>
                      {disabled && <span className="text-zinc-500 text-xs ml-2">нет данных</span>}
                    </div>
                    {selectedDrivetrain === drivetrain.configGroup && !disabled && (
                      <Check className="w-5 h-5 text-amber-500" />
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        )}
      </div>

      <div className="px-4 pb-8">
        {noPriceSelections.length > 0 && (
          <p className="text-zinc-500 text-sm text-center mb-2">
            Нет данных о ценах для {noPriceSelections.join(', ')}
          </p>
        )}
        {noPriceSelections.length === 0 && !isComplete && (
          <p className="text-zinc-500 text-sm text-center mb-2">
            {fromVin
              ? `Не удалось определить ${missingSelections.join(', ')} по VIN — выберите вручную`
              : `Выберите ${missingSelections.join(', ')}`}
          </p>
        )}
        <Button
          onClick={handleNext}
          disabled={!isComplete}
          className="w-full h-14 bg-amber-500 hover:bg-amber-500 text-zinc-900 text-base font-semibold rounded-2xl disabled:opacity-40"
        >
          ДАЛЕЕ
        </Button>
      </div>
    </div>
  )
}
