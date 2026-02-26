import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Search, Loader2, X, AlertCircle, ChevronRight, Car } from 'lucide-react'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import type { DecodeVinResponse, VinDecodeResult, Brand } from '@razbor/hooks'
import { BrandIcon } from '@/components/ui/brand-icon'

const WMI_BRANDS: Record<string, string> = {
  JMZ: 'Mazda', JM1: 'Mazda',
  WBA: 'BMW', WBS: 'BMW', WBY: 'BMW', WBM: 'BMW',
  WAU: 'Audi', WUA: 'Audi',
  WDB: 'Mercedes-Benz', WDC: 'Mercedes-Benz', WDD: 'Mercedes-Benz', W1K: 'Mercedes-Benz', W1N: 'Mercedes-Benz',
  WP0: 'Porsche', WP1: 'Porsche',
  WVW: 'Volkswagen', WV2: 'Volkswagen', XW8: 'Volkswagen / Skoda',
  TMB: 'Skoda',
  WF0: 'Ford', WFO: 'Ford', X9F: 'Ford',
  KNA: 'Kia', KNC: 'Kia', KNE: 'Kia', U5Y: 'Kia', XWE: 'Kia',
  KMH: 'Hyundai', KMJ: 'Hyundai', TME: 'Hyundai', NLH: 'Hyundai', Z94: 'Hyundai',
  XTA: 'Lada', XTK: 'Lada',
  JTD: 'Toyota', JTE: 'Toyota', SB1: 'Toyota',
  JN1: 'Nissan', SJN: 'Nissan', Z8N: 'Nissan',
  VNK: 'Renault', VF1: 'Renault',
  W0L: 'Opel',
  KL1: 'Chevrolet', KL2: 'Chevrolet', KLA: 'Chevrolet', XUU: 'Chevrolet', Y6D: 'Chevrolet',
  JA3: 'Mitsubishi', JMB: 'Mitsubishi', JMY: 'Mitsubishi',
  JHM: 'Honda', '1HG': 'Honda', '2HG': 'Honda', SHH: 'Honda',
  JF1: 'Subaru', JF2: 'Subaru',
}

const VIN_YEAR_CODES: Record<string, number> = {
  '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
  '6': 2006, '7': 2007, '8': 2008, '9': 2009, A: 2010,
  B: 2011, C: 2012, D: 2013, E: 2014, F: 2015, G: 2016,
  H: 2017, J: 2018, K: 2019, L: 2020, M: 2021, N: 2022,
  P: 2023, R: 2024, S: 2025, T: 2026, V: 2027, W: 2028,
  X: 2029, Y: 2030,
}

const BRAND_ALIASES: Record<string, string[]> = {
  mazda: ['мазда', 'масда', 'мазду'],
  bmw: ['бмв', 'бэха', 'бмв', 'бээмвэ'],
  audi: ['ауди', 'ауді'],
  'mercedes-benz': ['мерседес', 'мерс', 'mercedes', 'мерин', 'мэрс'],
  porsche: ['порше', 'порш', 'поршэ'],
  volkswagen: ['фольксваген', 'фольц', 'vw', 'фолькс', 'фольцваген'],
  skoda: ['шкода', 'škoda', 'скода'],
  ford: ['форд'],
  kia: ['киа', 'кия', 'кіа'],
  hyundai: ['хендай', 'хёндай', 'хундай', 'хюндай', 'хенде', 'хэндай'],
  lada: ['лада', 'ваз', 'жигули', 'лады'],
  toyota: ['тойота', 'тоёта', 'тайота'],
  nissan: ['ниссан', 'нисан', 'нисcан'],
  renault: ['рено', 'ренаулт', 'реноулт'],
  opel: ['опель', 'опэль'],
  chevrolet: ['шевроле', 'шеврале', 'шевролет', 'шевро'],
  mitsubishi: ['митсубиси', 'мицубиси', 'митсубиши', 'мицубиши'],
  honda: ['хонда', 'хонду', 'хонды'],
  subaru: ['субару', 'субара', 'субарик'],
}

const RU_TO_LAT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e',
  ж: 'zh', з: 'z', и: 'i', й: 'j', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ы: 'y', э: 'e', ю: 'yu', я: 'ya', ъ: '', ь: '',
}

function transliterate(text: string): string {
  return text.toLowerCase().split('').map((c) => RU_TO_LAT[c] ?? c).join('')
}

function fuzzyMatch(text: string, query: string): boolean {
  if (text.includes(query)) return true
  if (query.length < 2) return false
  let ti = 0
  let qi = 0
  let misses = 0
  while (qi < query.length && ti < text.length) {
    if (text[ti] === query[qi]) {
      ti++
      qi++
    } else {
      ti++
      misses++
      if (misses > Math.max(1, Math.floor(query.length / 3))) return false
    }
  }
  return qi >= query.length || (qi >= query.length - 1 && query.length >= 4)
}

interface PartialHint {
  brand: string | null
  year: number | null
}

const FORD_EU_WMI = ['WF0', 'X9F']

function getPartialHint(vin: string): PartialHint {
  const hint: PartialHint = { brand: null, year: null }
  if (vin.length >= 3) {
    const wmi = vin.substring(0, 3)
    hint.brand = WMI_BRANDS[wmi] ?? null
    const yearIdx = FORD_EU_WMI.includes(wmi) ? 10 : 9
    if (vin.length > yearIdx) {
      const yearChar = vin[yearIdx]
      if (yearChar) hint.year = VIN_YEAR_CODES[yearChar] ?? null
    }
  }
  return hint
}

const emptyResult = (vinValue: string, error: string): VinDecodeResult => ({
  success: false,
  vin: vinValue,
  year: null,
  brand: null,
  model: null,
  generation: null,
  suggestedConfigs: { engines: [], transmissions: [], drivetrains: [] },
  availableGenerations: [],
  needsSelection: { generation: false, engine: false, transmission: false, drivetrain: false },
  error,
})

function isVinLike(value: string): boolean {
  return /^[A-HJ-NPR-Z0-9]+$/.test(value) && value.length >= 3
}

function filterBrands(brands: Brand[], query: string): Brand[] {
  const q = query.toLowerCase().trim()
  if (!q || q.length < 2) return []
  const qLat = transliterate(q)
  return brands.filter((brand) => {
    const name = brand.name.toLowerCase()
    if (fuzzyMatch(name, q)) return true
    if (fuzzyMatch(brand.slug, q)) return true
    if (qLat !== q && fuzzyMatch(brand.slug, qLat)) return true
    if (qLat !== q && fuzzyMatch(name, qLat)) return true
    const aliases = BRAND_ALIASES[brand.slug] ?? []
    return aliases.some((a) => fuzzyMatch(a, q))
  })
}

interface VinInputProps {
  brands?: Brand[]
}

export function VinInput({ brands = [] }: VinInputProps) {
  const navigate = useNavigate()
  const [rawInput, setRawInput] = useState('')
  const [result, setResult] = useState<VinDecodeResult | null>(null)

  const hasRussian = /[а-яёА-ЯЁ]/.test(rawInput)
  const vin = useMemo(() => rawInput.replace(/[^A-Za-z0-9]/g, '').toUpperCase(), [rawInput])
  const isVinMode = !hasRussian && isVinLike(vin) && vin.length >= 3
  const matchedBrands = useMemo(
    () => (!isVinMode && rawInput.length >= 2 ? filterBrands(brands, rawInput) : []),
    [isVinMode, rawInput, brands]
  )

  const { mutate: decode, isPending, isError, error } = useMutation({
    mutationFn: (vinValue: string) =>
      fetchGraphQL<DecodeVinResponse>(queries.decodeVin, { vin: vinValue }),
    onSuccess: (data) => {
      setResult(data.decodeVin)
    },
    onError: (err) => {
      setResult(emptyResult(vin, err instanceof Error ? err.message : 'Ошибка декодирования VIN'))
    },
  })

  const partialHint = useMemo(() => (isVinMode ? getPartialHint(vin) : { brand: null, year: null }), [vin, isVinMode])

  const handleNavigate = () => {
    if (!result?.success || !result.brand || !result.model || !result.generation) return

    const params = new URLSearchParams()
    for (const e of result.suggestedConfigs.engines) {
      params.append('engine', e)
    }
    for (const t of result.suggestedConfigs.transmissions) {
      params.append('transmission', t)
    }
    for (const d of result.suggestedConfigs.drivetrains) {
      params.append('drivetrain', d)
    }

    const needsConfig =
      result.needsSelection.engine ||
      result.needsSelection.transmission ||
      result.needsSelection.drivetrain

    if (needsConfig) {
      navigate(
        `/${result.brand.slug}/${result.model.slug}/${result.generation.slug}/config?${params.toString()}`
      )
    } else {
      navigate(`/estimation/${result.generation.id}?${params.toString()}`)
    }
  }

  const handleChange = (value: string) => {
    setRawInput(value)
    setResult(null)
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    if (isVinLike(cleaned) && cleaned.length === 17) {
      decode(cleaned)
    }
  }

  const handleSubmit = () => {
    if (vin.length !== 17) return
    setResult(null)
    decode(vin)
  }

  const handleClear = () => {
    setRawInput('')
    setResult(null)
  }

  const handleNavigateGeneration = (genSlug: string) => {
    if (!result?.brand || !result?.model) return
    const params = new URLSearchParams()
    for (const e of result.suggestedConfigs.engines) {
      params.append('engine', e)
    }
    for (const t of result.suggestedConfigs.transmissions) {
      params.append('transmission', t)
    }
    for (const d of result.suggestedConfigs.drivetrains) {
      params.append('drivetrain', d)
    }
    const qs = params.toString()
    navigate(`/${result.brand.slug}/${result.model.slug}/${genSlug}/config${qs ? `?${qs}` : ''}`)
  }

  const isValid = vin.length === 17
  const showInfo = result?.success && result.brand
  const showError = result && !result.success && result.error
  const showGenPicker = showInfo && result.needsSelection.generation && result.availableGenerations.length > 0
  const showMutationError = isError && !result
  const canNavigate = showInfo && result.generation && !showGenPicker
  const showPartialHint = isVinMode && !result && vin.length >= 3 && vin.length < 17 && partialHint.brand

  const engines = result?.suggestedConfigs.engines
  const engineLabel = engines?.length === 1
    ? (engines[0]?.replace('engine:', '') ?? null)
    : engines?.length
      ? `${engines.length} вар.`
      : null

  const transmissions = result?.suggestedConfigs.transmissions
  const transLabel = transmissions?.length === 1
    ? (transmissions[0]?.replace('transmission:', '') ?? null)
    : transmissions?.length
      ? `${transmissions.length} вар.`
      : null

  const drivetrains = result?.suggestedConfigs.drivetrains
  const driveLabel = drivetrains?.length === 1
    ? (drivetrains[0]?.replace('drivetrain:', '') ?? null)
    : drivetrains?.length
      ? `${drivetrains.length} вар.`
      : null

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={rawInput}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isValid) handleSubmit()
          }}
          placeholder="VIN или название марки"
          maxLength={isVinMode ? 17 : 50}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className={`w-full h-12 bg-zinc-900 border-2 border-zinc-800 rounded-2xl pl-4 pr-20 text-zinc-100 text-sm placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none transition-colors ${isVinMode ? 'tracking-wider font-mono' : ''}`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {rawInput && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Очистить"
              className="p-2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isVinMode && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || isPending}
              aria-label="Поиск по VIN"
              className="p-2 rounded-xl bg-amber-500 text-zinc-900 disabled:opacity-30 disabled:bg-zinc-700"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {matchedBrands.length > 0 && (
        <div className="space-y-1">
          {matchedBrands.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => navigate(`/${brand.slug}`)}
              className="w-full flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] rounded-xl px-3 py-2.5 transition-all"
            >
              <BrandIcon logo={brand.logo} name={brand.name} size={20} />
              <span className="text-sm text-zinc-200">{brand.name}</span>
              <ChevronRight className="w-4 h-4 text-zinc-500 ml-auto" />
            </button>
          ))}
        </div>
      )}

      {isPending && (
        <div className="flex items-center gap-2.5 bg-zinc-900 rounded-xl px-3 py-3 animate-pulse">
          <Loader2 className="w-5 h-5 text-amber-500 animate-spin shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-zinc-300">Декодирование VIN...</span>
            </div>
            {partialHint.brand && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] text-zinc-500">{partialHint.brand}</span>
                {partialHint.year && (
                  <span className="text-[10px] text-zinc-600">{partialHint.year} г.</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showPartialHint && (
        <div className="flex items-center gap-2 bg-zinc-900/70 rounded-xl px-3 py-2">
          <Car className="w-4 h-4 text-zinc-500 shrink-0" />
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-zinc-400">{partialHint.brand}</span>
            {partialHint.year && (
              <span className="text-xs text-zinc-500">{partialHint.year} г.</span>
            )}
            <span className="text-[10px] text-zinc-600">{vin.length}/17</span>
          </div>
        </div>
      )}

      {showError && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400">{result!.error}</p>
        </div>
      )}

      {showMutationError && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400">
            {error instanceof Error ? error.message : 'Ошибка запроса'}
          </p>
        </div>
      )}

      {showInfo && (
        <div className="space-y-2">
          {canNavigate ? (
            <button
              type="button"
              onClick={handleNavigate}
              className="w-full flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] rounded-xl px-3 py-2.5 transition-all"
            >
              <Car className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-medium text-zinc-100">
                    {result!.brand!.name} {result!.model!.name}
                  </span>
                  {result!.year && (
                    <span className="text-xs text-zinc-500">{result!.year} г.</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  {result!.generation && (
                    <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      {result!.generation.name}
                    </span>
                  )}
                  {engineLabel && (
                    <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                      {engineLabel}
                    </span>
                  )}
                  {transLabel && (
                    <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                      {transLabel}
                    </span>
                  )}
                  {driveLabel && (
                    <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                      {driveLabel}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate(`/${result!.brand!.slug}`)}
              className="w-full flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] rounded-xl px-3 py-2.5 transition-all"
            >
              <Car className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-zinc-100">
                    {result!.brand!.name}
                  </span>
                  {result!.model && (
                    <span className="text-xs font-medium text-zinc-100">
                      {result!.model.name}
                    </span>
                  )}
                  {result!.year && (
                    <span className="text-xs text-zinc-500">{result!.year} г.</span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5">Не удалось определить поколение — выберите вручную</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
            </button>
          )}

          {showGenPicker && (
            <div className="space-y-1.5">
              <p className="text-xs text-zinc-500 px-1">Выберите поколение:</p>
              {result!.availableGenerations.map((gen) => (
                <button
                  key={gen.id}
                  type="button"
                  onClick={() => handleNavigateGeneration(gen.slug)}
                  className="w-full flex items-center justify-between bg-zinc-900 hover:bg-zinc-800 rounded-xl px-3 py-3 transition-colors"
                >
                  <span className="text-sm text-zinc-200">{gen.name}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </button>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
