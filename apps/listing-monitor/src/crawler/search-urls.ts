export const DEMO_BASE_URL = 'https://demo.razbor.local'

export interface SearchUrlParams {
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

export function buildSearchUrl(params: SearchUrlParams): string {
  const cityPath = params.city || 'rossiya'
  const query = new URLSearchParams()

  if (params.priceMin != null) query.set('pmin', String(params.priceMin))
  if (params.priceMax != null) query.set('pmax', String(params.priceMax))
  if (params.yearMin != null) query.set('ymin', String(params.yearMin))
  if (params.yearMax != null) query.set('ymax', String(params.yearMax))
  if (params.mileageMax != null) query.set('mmax', String(params.mileageMax))
  if (params.searchRadius != null && params.searchRadius > 0) query.set('radius', String(params.searchRadius))

  const qs = query.toString()
  return `${DEMO_BASE_URL}/${cityPath}/avtomobili/${params.brandSlug}/${params.modelSlug}${qs ? `?${qs}` : ''}`
}

function buildRegionUrl(regionSlug: string, damaged: boolean, page?: number): string {
  const query = new URLSearchParams()
  if (damaged) query.set('damaged', '1')
  if (page && page > 1) query.set('p', String(page))

  const qs = query.toString()
  return `${DEMO_BASE_URL}/${regionSlug}/avtomobili${qs ? `?${qs}` : ''}`
}

export function buildRegionUrls(regionSlug: string, page?: number): string[] {
  return [buildRegionUrl(regionSlug, false, page)]
}

export function buildDamagedRegionUrls(regionSlug: string, page?: number): string[] {
  return [buildRegionUrl(regionSlug, true, page)]
}
