import { buildSearchUrl, type SearchUrlParams } from './search-urls.js'
import { DemoListingsFetcher, type FetchResult, type Strategy } from '../providers/demo-listings-fetcher.js'
import { type ListingCard } from './listing-card.js'
import { createLogger } from '../logger/index.js'

export type CrawlParams = SearchUrlParams

export interface CrawlResult {
  cards: ListingCard[]
  url: string
  blocked: boolean
  notFound: boolean
  strategy: Strategy
  duration: number
}

const logger = createLogger('crawler')

let fetcher: DemoListingsFetcher | null = null

function getFetcher(): DemoListingsFetcher {
  if (!fetcher) fetcher = new DemoListingsFetcher()
  return fetcher
}

export async function crawlListings(params: CrawlParams): Promise<CrawlResult> {
  const startTime = Date.now()

  const url = buildSearchUrl(params)
  logger.info({ brand: params.brandSlug, model: params.modelSlug, city: params.city, url }, 'Starting crawl')

  const result: FetchResult = await getFetcher().fetch(url)

  const duration = Date.now() - startTime
  logger.info(
    {
      brand: params.brandSlug,
      model: params.modelSlug,
      listingsTotal: result.cards.length,
      blocked: result.blocked,
      strategy: result.strategy,
      duration,
    },
    `Parsed ${result.cards.length} listings`,
  )

  return {
    cards: result.cards,
    url,
    blocked: result.blocked,
    notFound: result.notFound,
    strategy: result.strategy,
    duration,
  }
}

export function resetFetcher(): void {
  getFetcher().resetLimits()
}

export async function destroyFetcher(): Promise<void> {
  if (fetcher) {
    await fetcher.destroy()
    fetcher = null
  }
}
