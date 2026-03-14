import {
  AVITO_BRAND_MAP,
  mapAvitoBrand,
  mapAvitoModel,
} from '@razbor/shared'

export interface ListingData {
  brand: string | null
  model: string | null
  engineVolume: string | null
  transmission: string | null
  year: number | null
  mileage: number | null
}

const BRAND_NAMES_SORTED = Object.keys(AVITO_BRAND_MAP).sort(
  (a, b) => b.length - a.length,
)

const TRANSMISSION_MAP: Record<string, string> = {
  AT: 'AT',
  MT: 'MT',
  AMT: 'AMT',
  CVT: 'CVT',
  DSG: 'DSG',
  АКПП: 'AT',
  МКПП: 'MT',
  робот: 'AMT',
}

const TRANSMISSION_PATTERN = new RegExp(
  `(?<=^|[\\s,])(${Object.keys(TRANSMISSION_MAP).join('|')})(?=[\\s,]|$)`,
  'i',
)

export function extractListingData(title: string): ListingData {
  const result: ListingData = {
    brand: null,
    model: null,
    engineVolume: null,
    transmission: null,
    year: null,
    mileage: null,
  }

  let remaining = title

  let matchedBrandName: string | null = null
  for (const brandName of BRAND_NAMES_SORTED) {
    if (remaining.startsWith(brandName)) {
      matchedBrandName = brandName
      result.brand = mapAvitoBrand(brandName)
      remaining = remaining.slice(brandName.length).trimStart()
      break
    }
  }

  if (!matchedBrandName) return result

  const engineMatch = remaining.match(/(\d+\.\d+[a-zA-Zа-яА-Я]?)\s/)
  if (engineMatch && engineMatch.index != null) {
    const modelRaw = remaining.slice(0, engineMatch.index).trim()
    result.engineVolume = engineMatch[1]
    remaining = remaining.slice(engineMatch.index + engineMatch[0].length)

    if (result.brand && modelRaw) {
      result.model = mapAvitoModel(result.brand, modelRaw)
    }
  } else {
    const commaIdx = remaining.indexOf(',')
    if (commaIdx !== -1) {
      const beforeComma = remaining.slice(0, commaIdx).trim()
      const parts = beforeComma.split(/\s+/)
      const lastPart = parts[parts.length - 1]
      const transmissionDirect = TRANSMISSION_MAP[lastPart.toUpperCase()] || TRANSMISSION_MAP[lastPart.toLowerCase()]
      if (transmissionDirect) {
        const modelRaw = parts.slice(0, -1).join(' ').trim()
        result.transmission = transmissionDirect
        if (result.brand && modelRaw) {
          result.model = mapAvitoModel(result.brand, modelRaw)
        }
      } else {
        const modelRaw = beforeComma
        if (result.brand && modelRaw) {
          result.model = mapAvitoModel(result.brand, modelRaw)
        }
      }
      remaining = remaining.slice(commaIdx)
    } else if (remaining) {
      const parts = remaining.split(/\s+/)
      const lastPart = parts[parts.length - 1]
      const transmissionDirect =
        TRANSMISSION_MAP[lastPart.toUpperCase()] || TRANSMISSION_MAP[lastPart.toLowerCase()]
      let modelRaw: string
      if (transmissionDirect) {
        modelRaw = parts.slice(0, -1).join(' ').trim()
        result.transmission = transmissionDirect
      } else {
        modelRaw = remaining.trim()
      }
      if (result.brand && modelRaw) {
        result.model = mapAvitoModel(result.brand, modelRaw)
      }
    }
  }

  if (!result.transmission) {
    const transMatch = remaining.match(TRANSMISSION_PATTERN)
    if (transMatch) {
      const key = transMatch[1]
      result.transmission =
        TRANSMISSION_MAP[key.toUpperCase()] || TRANSMISSION_MAP[key.toLowerCase()] || key.toUpperCase()
    }
  }

  const yearMatch = remaining.match(/\b(19[89]\d|20[0-3]\d)\b/)
  if (yearMatch) {
    result.year = parseInt(yearMatch[1], 10)
  }

  const mileageMatch = remaining.match(/([\d\s]+)\s*км/i)
  if (mileageMatch) {
    result.mileage = parseInt(mileageMatch[1].replace(/\s/g, ''), 10)
  }

  return result
}
