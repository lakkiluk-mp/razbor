import { type ListingCard } from '../crawler/listing-card.js'
import { DEMO_BASE_URL } from '../crawler/search-urls.js'
import { createLogger } from '../logger/index.js'

export type Strategy = 'demo'

export interface FetchResult {
  cards: ListingCard[]
  blocked: boolean
  notFound: boolean
  strategy: Strategy
  duration: number
}

interface DemoModel {
  brand: string
  brandSlug: string
  model: string
  modelSlug: string
  engines: string[]
  yearFrom: number
  yearTo: number
  priceFrom: number
  priceTo: number
}

const DEMO_MODELS: DemoModel[] = [
  { brand: 'Toyota', brandSlug: 'toyota', model: 'Camry', modelSlug: 'camry', engines: ['2.4', '2.5', '3.5'], yearFrom: 2006, yearTo: 2018, priceFrom: 550_000, priceTo: 2_100_000 },
  { brand: 'Kia', brandSlug: 'kia', model: 'Rio', modelSlug: 'rio', engines: ['1.4', '1.6'], yearFrom: 2011, yearTo: 2020, priceFrom: 380_000, priceTo: 1_350_000 },
  { brand: 'Hyundai', brandSlug: 'hyundai', model: 'Solaris', modelSlug: 'solaris', engines: ['1.4', '1.6'], yearFrom: 2011, yearTo: 2020, priceFrom: 360_000, priceTo: 1_300_000 },
  { brand: 'Volkswagen', brandSlug: 'volkswagen', model: 'Polo', modelSlug: 'polo', engines: ['1.6'], yearFrom: 2010, yearTo: 2020, priceFrom: 350_000, priceTo: 1_250_000 },
  { brand: 'Ford', brandSlug: 'ford', model: 'Focus', modelSlug: 'focus', engines: ['1.6', '1.8', '2.0'], yearFrom: 2005, yearTo: 2018, priceFrom: 250_000, priceTo: 1_100_000 },
  { brand: 'Skoda', brandSlug: 'skoda', model: 'Octavia', modelSlug: 'octavia', engines: ['1.4', '1.6', '1.8'], yearFrom: 2008, yearTo: 2020, priceFrom: 420_000, priceTo: 1_900_000 },
  { brand: 'Nissan', brandSlug: 'nissan', model: 'X-Trail', modelSlug: 'x-trail', engines: ['2.0', '2.5'], yearFrom: 2007, yearTo: 2019, priceFrom: 600_000, priceTo: 2_200_000 },
]

const TRANSMISSIONS = ['AT', 'MT', 'CVT']
const SELLER_TYPES = ['private', 'private', 'private', 'company']
const CARDS_PER_BUCKET = 8
const BUCKETS_WINDOW = 3
const BUCKET_MS = 5 * 60 * 1000

const logger = createLogger('demo-fetcher')

function hashString(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function createRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]
}

function between(from: number, to: number, random: () => number): number {
  return Math.round(from + random() * (to - from))
}

function readNumber(params: URLSearchParams, key: string): number | null {
  const raw = params.get(key)
  if (raw == null) return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

interface SearchQuery {
  city: string
  brandSlug: string | null
  modelSlug: string | null
  damaged: boolean
  page: number
  priceMin: number | null
  priceMax: number | null
  yearMin: number | null
  yearMax: number | null
  mileageMax: number | null
}

function parseSearchUrl(url: string): SearchQuery {
  const parsed = new URL(url, DEMO_BASE_URL)
  const [city = 'rossiya', , brandSlug = null, modelSlug = null] = parsed.pathname.split('/').filter(Boolean)
  const params = parsed.searchParams

  return {
    city,
    brandSlug,
    modelSlug,
    damaged: params.get('damaged') === '1',
    page: readNumber(params, 'p') ?? 1,
    priceMin: readNumber(params, 'pmin'),
    priceMax: readNumber(params, 'pmax'),
    yearMin: readNumber(params, 'ymin'),
    yearMax: readNumber(params, 'ymax'),
    mileageMax: readNumber(params, 'mmax'),
  }
}

function buildCard(query: SearchQuery, models: DemoModel[], seed: string, bucketStart: number): ListingCard {
  const random = createRandom(hashString(seed))
  const model = pick(models, random)
  const year = between(model.yearFrom, model.yearTo, random)
  const engine = pick(model.engines, random)
  const transmission = pick(TRANSMISSIONS, random)
  const mileage = between(15, 320, random) * 1000
  const age = (model.yearTo - year) / (model.yearTo - model.yearFrom || 1)
  const basePrice = model.priceTo - age * (model.priceTo - model.priceFrom)
  const isDamaged = query.damaged || random() < 0.15
  const price = Math.round((isDamaged ? basePrice * 0.45 : basePrice) / 5000) * 5000
  const extId = String(hashString(`${seed}:id`))
  const city = query.city === 'rossiya' ? 'moskva' : query.city
  const mileageLabel = mileage.toLocaleString('ru-RU').replace(/ /g, ' ')

  return {
    extId,
    title: `${model.brand} ${model.model} ${engine} ${transmission}, ${year}, ${mileageLabel} км`,
    price,
    year,
    url: `${DEMO_BASE_URL}/${city}/avtomobili/${model.brandSlug}_${model.modelSlug}_${extId}`,
    city,
    imageUrl: '',
    publishedAt: new Date(bucketStart + Math.floor(random() * BUCKET_MS)).toISOString(),
    sellerType: pick(SELLER_TYPES, random),
    mileage,
    rawItem: isDamaged ? { condition: 'битый' } : {},
  }
}

function matchesQuery(card: ListingCard, query: SearchQuery): boolean {
  if (query.priceMin != null && card.price < query.priceMin) return false
  if (query.priceMax != null && card.price > query.priceMax) return false
  if (query.yearMin != null && card.year != null && card.year < query.yearMin) return false
  if (query.yearMax != null && card.year != null && card.year > query.yearMax) return false
  if (query.mileageMax != null && card.mileage != null && card.mileage > query.mileageMax) return false
  return true
}

export class DemoListingsFetcher {
  async fetch(url: string): Promise<FetchResult> {
    const startTime = Date.now()
    const query = parseSearchUrl(url)

    const models = DEMO_MODELS.filter(
      (m) =>
        (!query.brandSlug || m.brandSlug === query.brandSlug) &&
        (!query.modelSlug || m.modelSlug === query.modelSlug),
    )

    if (models.length === 0) {
      return { cards: [], blocked: false, notFound: true, strategy: 'demo', duration: Date.now() - startTime }
    }

    const currentBucket = Math.floor(startTime / BUCKET_MS)
    const cards: ListingCard[] = []

    for (let bucket = currentBucket - BUCKETS_WINDOW + 1; bucket <= currentBucket; bucket++) {
      for (let i = 0; i < CARDS_PER_BUCKET; i++) {
        const seed = `${url}:${bucket}:${i}`
        cards.push(buildCard(query, models, seed, bucket * BUCKET_MS))
      }
    }

    const result = cards
      .filter((card) => matchesQuery(card, query))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

    logger.debug({ url, cards: result.length }, 'Generated demo listings')

    return { cards: result, blocked: false, notFound: false, strategy: 'demo', duration: Date.now() - startTime }
  }

  resetLimits(): void {}

  async destroy(): Promise<void> {}
}
