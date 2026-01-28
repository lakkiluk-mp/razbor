import { BodyType, PartCategory } from '@prisma/client'

export interface PartData {
  name: string
  slug: string
  category: PartCategory
  schematicZoneCode: string | null
  searchQueries: string[]
  price: {
    minPrice: number
    maxPrice: number
    median: number
    avgPrice: number
    sampleSize: number
  }
}

export interface GenerationData {
  name: string
  slug: string
  yearStart: number
  yearEnd: number | null
  bodyType: BodyType
  isActive: boolean
  priceMultiplier: number
}

export interface ModelSeed {
  brand: {
    name: string
    slug: string
    logo: string | null
    sortOrder: number
  }
  model: {
    name: string
    slug: string
    isPopular: boolean
    sortOrder: number
  }
  generations: GenerationData[]
  getPartsForGeneration: (generation: GenerationData) => PartData[]
}
