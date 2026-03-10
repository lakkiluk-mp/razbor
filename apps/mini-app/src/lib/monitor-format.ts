export function formatShortPrice(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000
    return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`
  }
  if (value >= 1_000) {
    const k = value / 1_000
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(0)}K`
  }
  return String(value)
}

interface MonitorFilterFields {
  priceMin?: number | null
  priceMax?: number | null
  yearMin?: number | null
  yearMax?: number | null
  mileageMax?: number | null
}

export function formatMonitorFilters(item: MonitorFilterFields): string {
  const parts: string[] = []

  if (item.priceMin != null || item.priceMax != null) {
    const min = item.priceMin != null ? formatShortPrice(item.priceMin) : ''
    const max = item.priceMax != null ? formatShortPrice(item.priceMax) : ''
    if (min && max) {
      parts.push(`${min}-${max} \u20BD`)
    } else if (min) {
      parts.push(`\u2265${min} \u20BD`)
    } else {
      parts.push(`\u2264${max} \u20BD`)
    }
  }

  if (item.yearMin != null) {
    parts.push(`${item.yearMin}+`)
  }

  if (item.mileageMax != null) {
    parts.push(`\u2264${formatShortPrice(item.mileageMax)} \u043A\u043C`)
  }

  return parts.length > 0 ? parts.join(', ') : '\u0411\u0435\u0437 \u0444\u0438\u043B\u044C\u0442\u0440\u043E\u0432'
}
