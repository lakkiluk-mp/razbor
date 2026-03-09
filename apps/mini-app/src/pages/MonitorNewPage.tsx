import { useState, useCallback, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Link as LinkIcon } from 'lucide-react'
import { fetchGraphQL, mutations } from '@/lib/graphql-client'
import { parseAvitoUrl } from '@razbor/shared'
import type { AvitoUrlParseResult } from '@razbor/shared'

interface CreateMonitorInput {
  label: string
  brandSlug: string
  modelSlug: string
  city: string
  priceMin?: number | null
  priceMax?: number | null
  yearMin?: number | null
  yearMax?: number | null
  mileageMax?: number | null
}

function formatLocation(slug: string): string {
  return slug
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function parseIntOrNull(value: string): number | null {
  const digits = value.replace(/\s/g, '')
  if (!digits) return null
  const parsed = parseInt(digits, 10)
  return Number.isNaN(parsed) ? null : parsed
}

function formatNumber(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return parseInt(digits, 10).toLocaleString('ru-RU')
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function isValidYear(value: string): boolean {
  if (!value) return true
  const year = parseInt(value, 10)
  return !Number.isNaN(year) && year >= 1990 && year <= 2030
}

export function MonitorNewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [step, setStep] = useState<1 | 2>(1)
  const [url, setUrl] = useState('')
  const [parseError, setParseError] = useState('')
  const [parsed, setParsed] = useState<AvitoUrlParseResult | null>(null)

  const [label, setLabel] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [yearMin, setYearMin] = useState('')
  const [yearMax, setYearMax] = useState('')
  const [mileageMax, setMileageMax] = useState('')
  const [formError, setFormError] = useState('')

  const handleBack = useCallback(() => {
    if (step === 2) {
      setStep(1)
      setParsed(null)
      setParseError('')
    } else {
      navigate('/monitor')
    }
  }, [step, navigate])

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return
    tg.BackButton.show()
    tg.BackButton.onClick(handleBack)
    return () => {
      tg.BackButton.offClick(handleBack)
      tg.BackButton.hide()
    }
  }, [handleBack])

  const handleParseUrl = () => {
    const trimmed = url.trim()
    if (!trimmed) {
      setParseError('Вставьте ссылку')
      return
    }

    const result = parseAvitoUrl(trimmed)
    if (!result.isValid) {
      setParseError(result.error || 'Не удалось распознать ссылку')
      return
    }

    if (result.location === 'rossiya') {
      setParseError('Выберите поиск с конкретным городом или регионом')
      return
    }

    setParsed(result)
    setParseError('')
    setLabel(`${result.brandName} ${result.modelName}`)
    setPriceMin(result.priceMin ? String(result.priceMin) : '')
    setPriceMax(result.priceMax ? String(result.priceMax) : '')
    setYearMin(result.year ? String(result.year) : '')
    setYearMax(result.yearMax ? String(result.yearMax) : '')
    setMileageMax(result.mileageMax ? String(result.mileageMax) : '')
    setStep(2)
  }

  const createMutation = useMutation({
    mutationFn: (input: CreateMonitorInput) =>
      fetchGraphQL(mutations.createMonitorSubscription, { input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitorSubscriptions'] })
      navigate('/monitor')
    },
  })

  const handleSubmit = () => {
    if (!parsed) return
    setFormError('')

    if (yearMin && !isValidYear(yearMin)) {
      setFormError('Год «от» должен быть от 1990 до 2030')
      return
    }
    if (yearMax && !isValidYear(yearMax)) {
      setFormError('Год «до» должен быть от 1990 до 2030')
      return
    }
    const yMin = parseIntOrNull(yearMin)
    const yMax = parseIntOrNull(yearMax)
    if (yMin && yMax && yMin > yMax) {
      setFormError('Год «от» не может быть больше года «до»')
      return
    }

    const pMin = parseIntOrNull(priceMin)
    const pMax = parseIntOrNull(priceMax)
    if (pMin && pMax && pMin > pMax) {
      setFormError('Цена «от» не может быть больше цены «до»')
      return
    }

    const input: CreateMonitorInput = {
      label: label || `${parsed.brandName} ${parsed.modelName}`,
      brandSlug: parsed.brandSlug,
      modelSlug: parsed.modelSlug,
      city: parsed.location,
      priceMin: pMin,
      priceMax: pMax,
      yearMin: yMin,
      yearMax: yMax,
      mileageMax: parseIntOrNull(mileageMax),
    }

    createMutation.mutate(input)
  }

  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      {step === 1 && (
        <div className="flex-1 flex flex-col px-4 pt-6">
          <h1 className="text-2xl font-bold mb-2">Новая подписка</h1>
          <p className="text-zinc-400 text-sm mb-6">
            Вставьте ссылку на объявление или поиск с Авито
          </p>

          <div className="flex flex-col gap-4">
            <div className="relative">
              <LinkIcon className="absolute left-4 top-4 w-5 h-5 text-zinc-500" />
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  if (parseError) setParseError('')
                }}
                placeholder="https://www.avito.ru/..."
                className="bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-100 w-full focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
              />
            </div>

            {parseError && (
              <p className="text-red-400 text-sm">{parseError}</p>
            )}

            <button
              type="button"
              onClick={handleParseUrl}
              className="bg-amber-500 text-zinc-950 rounded-xl px-6 py-3 font-semibold text-sm w-full active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              Далее
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && parsed && (
        <div className="flex-1 overflow-auto px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold mb-6">Настройка подписки</h1>

          <div className="bg-zinc-900 rounded-xl p-4 mb-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-zinc-400 text-xs uppercase tracking-wider">
                Название
              </span>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 w-full focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-zinc-400 text-xs uppercase tracking-wider">
                Регион
              </span>
              <span className="text-zinc-100 text-sm">
                {formatLocation(parsed.location)}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-zinc-400 text-xs uppercase tracking-wider">
                Марка и модель
              </span>
              <span className="text-zinc-100 text-sm">
                {parsed.brandName} {parsed.modelName}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-zinc-400 text-xs uppercase tracking-wider">
                Цена, ₽
              </span>
              <div className="flex gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="от"
                  value={formatNumber(priceMin)}
                  onChange={(e) => setPriceMin(onlyDigits(e.target.value))}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 w-full focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="до"
                  value={formatNumber(priceMax)}
                  onChange={(e) => setPriceMax(onlyDigits(e.target.value))}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 w-full focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-zinc-400 text-xs uppercase tracking-wider">
                Год выпуска
              </span>
              <div className="flex gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="от"
                  maxLength={4}
                  value={yearMin}
                  onChange={(e) => {
                    setYearMin(onlyDigits(e.target.value).slice(0, 4))
                    if (formError) setFormError('')
                  }}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 w-full focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="до"
                  maxLength={4}
                  value={yearMax}
                  onChange={(e) => {
                    setYearMax(onlyDigits(e.target.value).slice(0, 4))
                    if (formError) setFormError('')
                  }}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 w-full focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-zinc-400 text-xs uppercase tracking-wider">
                Максимальный пробег, км
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="150 000"
                value={formatNumber(mileageMax)}
                onChange={(e) => setMileageMax(onlyDigits(e.target.value))}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 w-full focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
              />
            </div>

            {formError && (
              <p className="text-red-400 text-sm text-center">{formError}</p>
            )}

            {createMutation.isError && !formError && (
              <p className="text-red-400 text-sm text-center">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : 'Ошибка создания подписки. Попробуйте ещё раз.'}
              </p>
            )}

            <p className="text-zinc-500 text-xs text-center">
              Уведомления о новых объявлениях будут приходить в Telegram-бот
            </p>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="bg-amber-500 text-zinc-950 rounded-xl px-6 py-3 font-semibold text-sm w-full active:scale-95 transition-transform disabled:opacity-50 mt-2"
            >
              {createMutation.isPending ? 'Создание...' : 'Создать подписку'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
