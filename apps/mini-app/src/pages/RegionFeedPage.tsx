import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { MapPin, ChevronDown, Search, AlertCircle } from 'lucide-react'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import { cn } from '@/lib/utils'
import { RegionListingCard } from '@/components/features/region-listing-card'
import { ListingDetailDrawer } from '@/components/features/listing-detail-drawer'
import { DAMAGED_TITLE_RE } from '@razbor/shared'

interface MonitorRegion {
  name: string
  slug: string
}

interface RegionListingItem {
  id: string
  extId: string
  title: string
  brand: string
  model: string
  engineVolume: string
  transmission: string
  price: number
  year: number | null
  url: string
  city: string
  imageUrl: string
  publishedAt: string
  sellerType: string
  mileage: number | null
  isDamaged: boolean
  isActive: boolean
  generationId: string | null
  configGroups: string | null
  estimateMin: number | null
  estimateMax: number | null
  estimateAvg: number | null
  estimateExact: boolean
  profit: number | null
  profitPercent: number | null
  regionSlug: string
}

interface MonitorRegionsResponse {
  monitorRegions: MonitorRegion[]
}

interface RegionListingsResponse {
  regionListings: RegionListingItem[]
}

interface RegionBrandsResponse {
  regionBrands: string[]
}

type DamagedFilter = 'all' | 'hide' | 'only'
type SortOption = 'DATE_DESC' | 'PROFIT_DESC'

const PAGE_SIZE = 20

function SkeletonCard() {
  return (
    <div className="bg-zinc-900 rounded-2xl p-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-zinc-800 rounded w-3/4" />
        <div className="h-3 bg-zinc-800 rounded w-1/2" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-5 bg-zinc-800 rounded w-1/3" />
        <div className="h-3 bg-zinc-800 rounded w-2/3" />
        <div className="h-3 bg-zinc-800 rounded w-1/2" />
      </div>
    </div>
  )
}

const SS_REGION = 'regionFeedRegion'
const SS_SORT = 'regionFeedSort'
const SS_BRAND = 'regionFeedBrand'
const SS_DAMAGED = 'regionFeedDamaged'
const SS_SCROLL = 'regionFeedScroll'

function readSS(key: string, fallback = ''): string {
  try { return sessionStorage.getItem(key) || fallback } catch { return fallback }
}

function writeSS(key: string, value: string): void {
  try { sessionStorage.setItem(key, value) } catch {}
}

export function RegionFeedPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [regionSlug, setRegionSlug] = useState<string>(() => readSS(SS_REGION))
  const [brandFilter, setBrandFilter] = useState<string>(() => readSS(SS_BRAND))
  const [damagedFilter, setDamagedFilter] = useState<DamagedFilter>(
    () => (readSS(SS_DAMAGED) as DamagedFilter) || 'all',
  )
  const [sortBy, setSortBy] = useState<SortOption>(
    () => (readSS(SS_SORT) as SortOption) || 'DATE_DESC',
  )

  const [selectedListing, setSelectedListing] = useState<RegionListingItem | null>(null)

  const observerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollRestoredRef = useRef(false)

  const { data: regionsData } = useQuery({
    queryKey: ['monitorRegions'],
    queryFn: () => fetchGraphQL<MonitorRegionsResponse>(queries.monitorRegions),
    staleTime: Infinity,
  })

  const regions = regionsData?.monitorRegions ?? []

  useEffect(() => {
    const first = regions[0]
    if (regions.length > 0 && first && (!regionSlug || !regions.find((r) => r.slug === regionSlug))) {
      setRegionSlug(first.slug)
      writeSS(SS_REGION, first.slug)
    }
  }, [regions, regionSlug])

  const { data: brandsData } = useQuery({
    queryKey: ['regionBrands', regionSlug],
    queryFn: () =>
      fetchGraphQL<RegionBrandsResponse>(queries.regionBrands, { regionSlug }),
    enabled: !!regionSlug,
    staleTime: 5 * 60 * 1000,
  })

  const brands = brandsData?.regionBrands ?? []

  const {
    data: listingsData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: [
      'regionListings',
      regionSlug,
      brandFilter,
      damagedFilter,
      sortBy,
    ],
    queryFn: ({ pageParam = 0 }) =>
      fetchGraphQL<RegionListingsResponse>(queries.regionListings, {
        regionSlug,
        limit: PAGE_SIZE,
        offset: pageParam,
        brand: brandFilter || null,
        minProfit: null,
        hideDamaged: damagedFilter === 'hide',
        hideInactive: false,
        sortBy,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.regionListings.length < PAGE_SIZE) return undefined
      return (lastPageParam as number) + PAGE_SIZE
    },
    enabled: !!regionSlug,
    staleTime: 60 * 1000,
  })

  const filteredListings = useMemo(() => {
    const all = listingsData?.pages.flatMap((p) => p.regionListings) ?? []
    const unique = [...new Map(all.map((l) => [l.id, l])).values()]
    if (damagedFilter === 'only') {
      return unique.filter((l) => l.isDamaged || DAMAGED_TITLE_RE.test(l.title))
    }
    return unique
  }, [listingsData, damagedFilter])

  const deepLinkHandledRef = useRef(false)
  useEffect(() => {
    if (deepLinkHandledRef.current) return
    const listingId = searchParams.get('listing')
      || (() => {
        const sp = window.Telegram?.WebApp?.initDataUnsafe?.start_param
        if (typeof sp === 'string' && sp.startsWith('listing_')) return sp.slice(8)
        return null
      })()
    if (!listingId) return

    const handledKey = `deepLinkHandled_${listingId}`
    try { if (sessionStorage.getItem(handledKey)) return } catch {}

    deepLinkHandledRef.current = true
    try { sessionStorage.setItem(handledKey, '1') } catch {}
    setSearchParams({}, { replace: true })

    fetchGraphQL<{ regionListing: RegionListingItem | null }>(queries.regionListing, { id: listingId })
      .then((res) => {
        if (res.regionListing) setSelectedListing(res.regionListing)
      })
      .catch(() => {})
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (!filteredListings.length || scrollRestoredRef.current) return
    scrollRestoredRef.current = true
    const saved = parseInt(readSS(SS_SCROLL), 10)
    if (saved > 0 && scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo(0, saved)
      })
    }
  }, [filteredListings.length])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          writeSS(SS_SCROLL, String(el.scrollTop))
          ticking = false
        })
      }
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = observerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleRegionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRegionSlug(e.target.value)
      writeSS(SS_REGION, e.target.value)
      setBrandFilter('')
      setDamagedFilter('all')
      writeSS(SS_BRAND, '')
      writeSS(SS_DAMAGED, 'all')
      writeSS(SS_SCROLL, '0')
      scrollRestoredRef.current = true
    },
    [],
  )

  const handleBrandChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setBrandFilter(e.target.value)
    writeSS(SS_BRAND, e.target.value)
    writeSS(SS_SCROLL, '0')
    scrollRestoredRef.current = true
  }, [])

  const cycleDamagedFilter = useCallback(() => {
    setDamagedFilter((prev) => {
      const next = prev === 'all' ? 'hide' : prev === 'hide' ? 'only' : 'all'
      writeSS(SS_DAMAGED, next)
      writeSS(SS_SCROLL, '0')
      scrollRestoredRef.current = true
      return next
    })
  }, [])

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort)
    writeSS(SS_SORT, sort)
    writeSS(SS_SCROLL, '0')
    scrollRestoredRef.current = true
  }, [])

  const damagedLabel =
    damagedFilter === 'all'
      ? 'Битые: все'
      : damagedFilter === 'hide'
        ? 'Без битых'
        : 'Только битые'

  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="px-4 pt-6 pb-3 flex flex-col gap-3">
        <h1 className="text-2xl font-bold">
          Авто на разбор
          <span className="ml-2 align-middle bg-amber-500/20 text-amber-500 text-xs font-semibold px-2 py-0.5 rounded-full">beta</span>
        </h1>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none" />
          <select
            value={regionSlug}
            onChange={handleRegionChange}
            className="w-full bg-zinc-900 text-zinc-100 rounded-xl pl-9 pr-8 py-3 appearance-none text-sm font-medium border border-zinc-800 focus:outline-none focus:border-zinc-700"
          >
            {regions.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <select
              value={brandFilter}
              onChange={handleBrandChange}
              className={cn(
                'w-full appearance-none rounded-xl pl-3 pr-7 py-2.5 text-sm font-medium border focus:outline-none',
                brandFilter
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400',
              )}
            >
              <option value="">Все марки</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={cycleDamagedFilter}
            className={cn(
              'shrink-0 rounded-xl px-3 py-2.5 text-sm font-medium border',
              damagedFilter !== 'all'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400',
            )}
          >
            {damagedLabel}
          </button>
        </div>

        <div className="flex bg-zinc-900 rounded-xl p-1">
          <button
            type="button"
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
              sortBy === 'DATE_DESC'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-500',
            )}
            onClick={() => handleSortChange('DATE_DESC')}
          >
            Новые
          </button>
          <button
            type="button"
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
              sortBy === 'PROFIT_DESC'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-500',
            )}
            onClick={() => handleSortChange('PROFIT_DESC')}
          >
            Выгодные
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 overflow-auto px-4 pb-4 flex flex-col gap-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : isError ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 py-12">
          <AlertCircle className="w-10 h-10 text-zinc-700" />
          <p className="text-zinc-400 text-sm text-center">
            Не удалось загрузить данные
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-amber-500 text-sm"
          >
            Попробовать снова
          </button>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 py-12">
          <Search className="w-10 h-10 text-zinc-700" />
          <p className="text-zinc-400 text-sm text-center">
            Нет объявлений в этом регионе
          </p>
          <p className="text-zinc-500 text-xs text-center">
            Попробуйте выбрать другой регион или изменить фильтры
          </p>
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-auto px-4 pb-4 flex flex-col gap-2">
          {filteredListings.map((listing) => (
            <RegionListingCard key={listing.id} listing={listing} onSelect={() => setSelectedListing(listing)} />
          ))}

          {isFetchingNextPage && (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          <div ref={observerRef} className="h-10 shrink-0" />
        </div>
      )}

      <ListingDetailDrawer
        listing={selectedListing}
        open={!!selectedListing}
        onOpenChange={(open) => { if (!open) setSelectedListing(null) }}
      />
    </div>
  )
}
