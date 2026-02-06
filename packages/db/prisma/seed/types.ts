import { BodyType, PartCategory } from '@prisma/client'

export interface PartData {
  name: string
  slug: string
  category: PartCategory
  schematicZoneCode: string | null
  searchQueries: string[]
  configGroup?: string | null
}

export interface GenerationData {
  name: string
  slug: string
  yearStart: number
  yearEnd: number | null
  bodyType: BodyType
  isActive: boolean
  availableConfigs?: string[]
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
  getPartsForGeneration: (generation: GenerationData) => (PartData | SharedPartRef)[]
}

export interface SharedPartRef {
  type: 'shared'
  oemCode: string
  configGroup?: string | null
}

export function isSharedPartRef(part: PartData | SharedPartRef): part is SharedPartRef {
  return (part as SharedPartRef).type === 'shared'
}
