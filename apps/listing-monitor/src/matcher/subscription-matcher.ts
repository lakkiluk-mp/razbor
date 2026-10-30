import { prisma } from '../storage/prisma.js'
import { type ListingCard } from '../crawler/listing-card.js'
import { createLogger } from '../logger/index.js'

export interface CrawlGroup {
  brandSlug: string
  modelSlug: string
  city?: string
  priceMin?: number
  priceMax?: number
  yearMin?: number
  yearMax?: number
  mileageMax?: number
  searchRadius?: number
}

export interface MatchResult {
  subscriptionId: string
  telegramId: string
  label: string
  createdAt: Date
}

interface CachedSubscription {
  id: string
  userId: string
  telegramId: string
  label: string
  city: string | null
  priceMin: number | null
  priceMax: number | null
  yearMin: number | null
  yearMax: number | null
  mileageMax: number | null
  searchRadius: number | null
  createdAt: Date
}

export class SubscriptionMatcher {
  private cache = new Map<string, CachedSubscription[]>()
  private lastCacheUpdate = 0
  private logger = createLogger('matcher')
  private readonly CACHE_TTL = 60_000

  async loadSubscriptions(): Promise<void> {
    const subs = await prisma.monitorSubscription.findMany({
      where: { isActive: true },
      include: { user: { select: { telegramId: true } } },
    })

    this.cache.clear()
    for (const sub of subs) {
      const key = `${sub.brandSlug}:${sub.modelSlug}`
      const entry: CachedSubscription = {
        id: sub.id,
        userId: sub.userId,
        telegramId: String(sub.user.telegramId),
        label: sub.label,
        city: sub.city,
        priceMin: sub.priceMin,
        priceMax: sub.priceMax,
        yearMin: sub.yearMin,
        yearMax: sub.yearMax,
        mileageMax: sub.mileageMax,
        searchRadius: sub.searchRadius,
        createdAt: sub.createdAt,
      }
      const existing = this.cache.get(key) || []
      existing.push(entry)
      this.cache.set(key, existing)
    }

    this.lastCacheUpdate = Date.now()
    this.logger.info(
      { subscriptions: subs.length, groups: this.cache.size },
      'Subscriptions loaded',
    )
  }

  async ensureFresh(): Promise<void> {
    if (Date.now() - this.lastCacheUpdate > this.CACHE_TTL) {
      await this.loadSubscriptions()
    }
  }

  match(
    card: ListingCard,
    brandSlug: string,
    modelSlug: string,
  ): MatchResult[] {
    const key = `${brandSlug}:${modelSlug}`
    const subs = this.cache.get(key) || []
    const results: MatchResult[] = []

    if (subs.length === 0) {
      this.logger.warn({ key, cacheKeys: [...this.cache.keys()] }, 'No subscriptions in cache for key')
    }

    for (const sub of subs) {
      if (sub.priceMin != null && card.price < sub.priceMin) continue
      if (sub.priceMax != null && card.price > sub.priceMax) continue
      if (sub.yearMin != null && card.year != null && card.year < sub.yearMin)
        continue
      if (sub.yearMax != null && card.year != null && card.year > sub.yearMax)
        continue
      if (
        sub.mileageMax != null &&
        card.mileage != null &&
        card.mileage > sub.mileageMax
      )
        continue

      results.push({
        subscriptionId: sub.id,
        telegramId: sub.telegramId,
        label: sub.label,
        createdAt: sub.createdAt,
      })
    }

    return results
  }

  getUniqueGroups(): CrawlGroup[] {
    const groups: CrawlGroup[] = []

    for (const [key, subs] of this.cache) {
      const [brandSlug, modelSlug] = key.split(':')

      const cities = new Set<string | null>()
      for (const sub of subs) cities.add(sub.city)

      const hasWideSearch = cities.has(null)

      if (hasWideSearch) {
        groups.push(this.mergeFilters(brandSlug, modelSlug, undefined, subs))
      }

      for (const city of cities) {
        if (city === null) continue
        const citySubs = subs.filter((s) => s.city === city)
        groups.push(this.mergeFilters(brandSlug, modelSlug, city, citySubs))
      }
    }

    return groups
  }

  private mergeFilters(
    brandSlug: string,
    modelSlug: string,
    city: string | undefined,
    subs: CachedSubscription[],
  ): CrawlGroup {
    let priceMin: number | undefined
    let priceMax: number | undefined
    let yearMin: number | undefined
    let yearMax: number | undefined
    let mileageMax: number | undefined

    for (const sub of subs) {
      if (sub.priceMin != null)
        priceMin =
          priceMin != null ? Math.min(priceMin, sub.priceMin) : sub.priceMin
      if (sub.priceMax != null)
        priceMax =
          priceMax != null ? Math.max(priceMax, sub.priceMax) : sub.priceMax
      if (sub.yearMin != null)
        yearMin =
          yearMin != null ? Math.min(yearMin, sub.yearMin) : sub.yearMin
      if (sub.yearMax != null)
        yearMax =
          yearMax != null ? Math.max(yearMax, sub.yearMax) : sub.yearMax
      if (sub.mileageMax != null)
        mileageMax =
          mileageMax != null
            ? Math.max(mileageMax, sub.mileageMax)
            : sub.mileageMax
    }

    const hasNoPrice = subs.some(
      (s) => s.priceMin == null && s.priceMax == null,
    )
    const hasNoYear = subs.some(
      (s) => s.yearMin == null && s.yearMax == null,
    )
    const hasNoMileage = subs.some((s) => s.mileageMax == null)

    let searchRadius: number | undefined
    for (const sub of subs) {
      if (sub.searchRadius != null)
        searchRadius =
          searchRadius != null
            ? Math.max(searchRadius, sub.searchRadius)
            : sub.searchRadius
    }

    return {
      brandSlug,
      modelSlug,
      city,
      priceMin: hasNoPrice ? undefined : priceMin,
      priceMax: hasNoPrice ? undefined : priceMax,
      yearMin: hasNoYear ? undefined : yearMin,
      yearMax: hasNoYear ? undefined : yearMax,
      mileageMax: hasNoMileage ? undefined : mileageMax,
      searchRadius,
    }
  }
}
