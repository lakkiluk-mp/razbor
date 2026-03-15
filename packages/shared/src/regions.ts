export const MONITOR_REGIONS = [
  { name: 'Москва', slug: 'moskva' },
  { name: 'Санкт-Петербург', slug: 'sankt-peterburg' },
  { name: 'Белгородская область', slug: 'belgorodskaya_oblast' },
  { name: 'Воронежская область', slug: 'voronezhskaya_oblast' },
  { name: 'Курская область', slug: 'kurskaya_oblast' },
  { name: 'Липецкая область', slug: 'lipetskaya_oblast' },
  { name: 'Тамбовская область', slug: 'tambovskaya_oblast' },
  { name: 'Орловская область', slug: 'orlovskaya_oblast' },
  { name: 'Тульская область', slug: 'tulskaya_oblast' },
  { name: 'Брянская область', slug: 'bryanskaya_oblast' },
  { name: 'Ростовская область', slug: 'rostovskaya_oblast' },
  { name: 'Краснодарский край', slug: 'krasnodarskiy_kray' },
] as const

export type MonitorRegion = (typeof MONITOR_REGIONS)[number]
export type RegionSlug = MonitorRegion['slug']
