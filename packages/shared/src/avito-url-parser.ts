const MULTI_WORD_BRANDS: Record<string, string> = {
  vaz_lada: 'VAZ (LADA)',
  land_rover: 'Land Rover',
  alfa_romeo: 'Alfa Romeo',
  rolls_royce: 'Rolls-Royce',
  aston_martin: 'Aston Martin',
  great_wall: 'Great Wall',
}

export interface AvitoUrlParseResult {
  isValid: boolean
  type: 'listing' | 'search' | null
  location: string
  brandSlug: string
  modelSlug: string
  brandName: string
  modelName: string
  year: number | null
  yearMax: number | null
  mileage: number | null
  mileageMax: number | null
  priceMin: number | null
  priceMax: number | null
  error?: string
}

function invalidResult(error: string): AvitoUrlParseResult {
  return {
    isValid: false,
    type: null,
    location: '',
    brandSlug: '',
    modelSlug: '',
    brandName: '',
    modelName: '',
    year: null,
    yearMax: null,
    mileage: null,
    mileageMax: null,
    priceMin: null,
    priceMax: null,
    error,
  }
}

function capitalize(word: string): string {
  if (!word) return ''
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function toBrandName(slug: string): string {
  if (MULTI_WORD_BRANDS[slug]) return MULTI_WORD_BRANDS[slug]
  return slug.toUpperCase()
}

function toModelName(slug: string): string {
  return slug
    .split('_')
    .map((w) => capitalize(w))
    .join(' ')
}

function splitBrandModel(parts: string[]): { brandSlug: string; modelSlug: string } | null {
  if (parts.length < 2) return null

  const twoWordKey = `${parts[0]}_${parts[1]}`
  if (MULTI_WORD_BRANDS[twoWordKey] && parts.length >= 3) {
    return {
      brandSlug: twoWordKey,
      modelSlug: parts.slice(2).join('_'),
    }
  }

  return {
    brandSlug: parts[0]!,
    modelSlug: parts.slice(1).join('_'),
  }
}

function isNumeric(s: string): boolean {
  return /^\d+$/.test(s)
}

function stripAvitoSuffix(segment: string): string {
  const match = segment.match(/^(.+?)-[A-Z][A-Za-z0-9_]+$/)
  return match ? match[1]! : segment
}

function decodeSearchFilters(fParam: string): {
  yearMin: number | null
  yearMax: number | null
  mileageMax: number | null
} {
  const result = { yearMin: null as number | null, yearMax: null as number | null, mileageMax: null as number | null }
  try {
    const b64 = fParam.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
    const decoded = atob(padded)

    const regex = /\{"from":(null|\d+),"to":(null|\d+)\}/g
    let match
    while ((match = regex.exec(decoded)) !== null) {
      const from = match[1] === 'null' ? null : parseInt(match[1]!, 10)
      const to = match[2] === 'null' ? null : parseInt(match[2]!, 10)
      const sample = from ?? to
      if (sample == null) continue

      if (sample >= 1970 && sample <= 2035) {
        result.yearMin = from
        result.yearMax = to
      } else if (sample > 2035 && to != null) {
        result.mileageMax = to
      }
    }
  } catch {
    // decoding failed
  }
  return result
}

function parseListing(slug: string): Omit<AvitoUrlParseResult, 'priceMin' | 'priceMax'> | string {
  const tokens = slug.split('_')

  if (tokens.length < 7) {
    return 'Не удалось распознать ссылку на объявление'
  }

  const id = tokens.pop()!
  if (!isNumeric(id) || id.length < 7) {
    return 'Не удалось распознать ссылку на объявление'
  }

  const kmLiteral = tokens.pop()
  if (kmLiteral !== 'km') {
    return 'Не удалось распознать ссылку на объявление'
  }

  const mileageParts: string[] = []
  while (tokens.length > 0 && isNumeric(tokens[tokens.length - 1]!)) {
    const candidate = tokens[tokens.length - 1]!
    const num = parseInt(candidate, 10)
    if (candidate.length === 4 && num >= 1990 && num <= 2030) break
    mileageParts.unshift(tokens.pop()!)
  }
  if (mileageParts.length === 0) {
    return 'Не удалось распознать ссылку на объявление'
  }
  const mileage = parseInt(mileageParts.join(''), 10)

  if (tokens.length === 0) return 'Не удалось распознать ссылку на объявление'
  const yearStr = tokens.pop()!
  const year = parseInt(yearStr, 10)
  if (isNaN(year) || year < 1990 || year > 2030) {
    return 'Не удалось распознать ссылку на объявление'
  }

  if (tokens.length === 0) return 'Не удалось распознать ссылку на объявление'
  const transmission = tokens.pop()!
  if (transmission !== 'at' && transmission !== 'mt') {
    return 'Не удалось распознать ссылку на объявление'
  }

  if (tokens.length === 0) return 'Не удалось распознать ссылку на объявление'
  const engine = tokens.pop()!
  if (!engine.includes('.')) {
    return 'Не удалось распознать ссылку на объявление'
  }

  if (tokens.length === 0) return 'Не удалось распознать ссылку на объявление'

  const brandModel = splitBrandModel(tokens)
  if (!brandModel) {
    return 'Не удалось определить марку и модель'
  }

  return {
    isValid: true,
    type: 'listing',
    location: '',
    brandSlug: brandModel.brandSlug,
    modelSlug: brandModel.modelSlug,
    brandName: toBrandName(brandModel.brandSlug),
    modelName: toModelName(brandModel.modelSlug),
    year,
    yearMax: null,
    mileage,
    mileageMax: null,
  }
}

export function parseAvitoUrl(url: string): AvitoUrlParseResult {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return invalidResult('Неверный формат ссылки')
  }

  const hostname = parsed.hostname.replace(/^www\./, '')
  if (hostname !== 'avito.ru') {
    return invalidResult('Ссылка должна быть с avito.ru')
  }

  const pathname = parsed.pathname.replace(/\/+$/, '')
  const segments = pathname.split('/').filter(Boolean)

  const avtomobiliIdx = segments.indexOf('avtomobili')
  if (avtomobiliIdx === -1) {
    return invalidResult('Ссылка должна быть из раздела «Автомобили»')
  }

  if (avtomobiliIdx === 0) {
    return invalidResult('В ссылке отсутствует город или регион')
  }

  const location = segments.slice(0, avtomobiliIdx).join('_')
  const afterAvto = segments.slice(avtomobiliIdx + 1)

  if (afterAvto.length === 0) {
    return invalidResult('В ссылке не указана марка и модель')
  }

  const SKIP_SEGMENTS = new Set(['s_probegom', 'novye', 'novyy'])
  const filteredAfterAvto = afterAvto
    .filter((s) => !SKIP_SEGMENTS.has(s.toLowerCase()))
    .filter((s) => !/^c\d+-/i.test(s))

  if (filteredAfterAvto.length >= 2) {
    const pmin = parsed.searchParams.get('pmin')
    const pmax = parsed.searchParams.get('pmax')

    const rawBrand = stripAvitoSuffix(filteredAfterAvto[0]!).toLowerCase()
    const rawModel = filteredAfterAvto.slice(1)
      .map((s) => stripAvitoSuffix(s)).join('_').toLowerCase()

    const fParam = parsed.searchParams.get('f')
    const filters = fParam ? decodeSearchFilters(fParam) : { yearMin: null, yearMax: null, mileageMax: null }

    return {
      isValid: true,
      type: 'search',
      location,
      brandSlug: rawBrand,
      modelSlug: rawModel,
      brandName: toBrandName(rawBrand),
      modelName: toModelName(rawModel),
      year: filters.yearMin,
      yearMax: filters.yearMax,
      mileage: null,
      mileageMax: filters.mileageMax,
      priceMin: pmin ? parseInt(pmin, 10) : null,
      priceMax: pmax ? parseInt(pmax, 10) : null,
    }
  }

  const listingResult = parseListing(afterAvto[0]!)
  if (typeof listingResult === 'string') {
    return invalidResult(listingResult)
  }

  return {
    ...listingResult,
    location,
    priceMin: null,
    priceMax: null,
  }
}
