import { describe, expect, it } from 'vitest'
import { DemoListingsFetcher } from '../demo-listings-fetcher.js'
import { buildDamagedRegionUrls, buildRegionUrls, buildSearchUrl } from '../../crawler/search-urls.js'
import { isFromRegion } from '../../crawler/listing-card.js'
import { extractListingData } from '../../matcher/title-parser.js'
import { detectDamaged } from '../../matcher/damage-detector.js'

describe('DemoListingsFetcher', () => {
  const fetcher = new DemoListingsFetcher()

  it('returns stable listings for the same search', async () => {
    const url = buildSearchUrl({ brandSlug: 'toyota', modelSlug: 'camry', city: 'krasnodar' })
    const first = await fetcher.fetch(url)
    const second = await fetcher.fetch(url)

    expect(first.cards.length).toBeGreaterThan(0)
    expect(first.cards.map((c) => c.extId)).toEqual(second.cards.map((c) => c.extId))
  })

  it('generates titles the title parser understands', async () => {
    const { cards } = await fetcher.fetch(buildSearchUrl({ brandSlug: 'toyota', modelSlug: 'camry' }))

    for (const card of cards) {
      const parsed = extractListingData(card.title)
      expect(parsed.brand).toBe('toyota')
      expect(parsed.model).toBe('camry')
      expect(parsed.year).toBe(card.year)
      expect(parsed.mileage).toBe(card.mileage)
    }
  })

  it('applies price, year and mileage filters', async () => {
    const { cards } = await fetcher.fetch(
      buildSearchUrl({ brandSlug: 'kia', modelSlug: 'rio', yearMin: 2015, priceMax: 1_000_000, mileageMax: 200_000 }),
    )

    for (const card of cards) {
      expect(card.year).toBeGreaterThanOrEqual(2015)
      expect(card.price).toBeLessThanOrEqual(1_000_000)
      expect(card.mileage).toBeLessThanOrEqual(200_000)
    }
  })

  it('marks every listing from a damaged region search as damaged', async () => {
    const [url] = buildDamagedRegionUrls('rostovskaya_oblast')
    const { cards } = await fetcher.fetch(url)

    expect(cards.length).toBeGreaterThan(0)
    for (const card of cards) {
      expect(detectDamaged(card.rawItem ?? {}, card.title)).toBe(true)
      expect(isFromRegion(card.url, 'rostovskaya_oblast')).toBe(true)
    }
  })

  it('keeps region listings inside the requested region', async () => {
    const [url] = buildRegionUrls('krasnodarskiy_kray')
    const { cards } = await fetcher.fetch(url)

    expect(cards.every((c) => isFromRegion(c.url, 'krasnodarskiy_kray'))).toBe(true)
  })

  it('reports not found for models outside the demo catalog', async () => {
    const result = await fetcher.fetch(buildSearchUrl({ brandSlug: 'lada', modelSlug: 'vesta' }))

    expect(result.notFound).toBe(true)
    expect(result.cards).toHaveLength(0)
  })
})
