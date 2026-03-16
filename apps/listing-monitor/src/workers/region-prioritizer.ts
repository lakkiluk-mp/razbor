import { MONITOR_REGIONS } from '@razbor/shared'
import { createLogger } from '../logger/index.js'

const logger = createLogger('region-prioritizer')

interface RegionState {
  lastSuccessAt: number
  consecutiveFailures: number
  recentNewCards: number
}

export class RegionPrioritizer {
  private states = new Map<string, RegionState>()
  private quickCrawlIntervalMs: number
  private isFirstCycle = true

  constructor(quickCrawlIntervalMs: number) {
    this.quickCrawlIntervalMs = quickCrawlIntervalMs

    for (const region of MONITOR_REGIONS) {
      this.states.set(region.slug, {
        lastSuccessAt: 0,
        consecutiveFailures: 0,
        recentNewCards: 0,
      })
    }
  }

  getOrderedRegions(): string[] {
    if (this.isFirstCycle) {
      this.isFirstCycle = false
      const slugs = MONITOR_REGIONS.map((r) => r.slug)
      for (let i = slugs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[slugs[i], slugs[j]] = [slugs[j], slugs[i]]
      }
      logger.info(
        { order: slugs },
        'First cycle: shuffled region order',
      )
      return slugs
    }

    const maxNewCards = Math.max(
      1,
      ...Array.from(this.states.values()).map((s) => s.recentNewCards),
    )

    const scored = MONITOR_REGIONS.map((r) => {
      const state = this.states.get(r.slug)!
      const score = this.calculateScore(state, maxNewCards)
      return { slug: r.slug, score }
    })

    scored.sort((a, b) => b.score - a.score)

    logger.info(
      {
        order: scored.map(
          (s) => `${s.slug}(${s.score.toFixed(1)})`,
        ),
      },
      'Region crawl order',
    )

    return scored.map((s) => s.slug)
  }

  recordSuccess(slug: string, newCards: number): void {
    const state = this.states.get(slug)
    if (!state) return
    state.lastSuccessAt = Date.now()
    state.consecutiveFailures = 0
    state.recentNewCards = newCards
  }

  recordFailure(slug: string): void {
    const state = this.states.get(slug)
    if (!state) return
    state.consecutiveFailures = Math.min(state.consecutiveFailures + 1, 3)
  }

  private calculateScore(state: RegionState, maxNewCards: number): number {
    const staleness =
      state.lastSuccessAt === 0
        ? MONITOR_REGIONS.length
        : (Date.now() - state.lastSuccessAt) / this.quickCrawlIntervalMs

    const failurePenalty = state.consecutiveFailures * 1.5
    const activityBonus = state.recentNewCards / maxNewCards

    return 10 * staleness + 5 * failurePenalty + 1 * activityBonus
  }
}
