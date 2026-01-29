export { createClient, queries, mutations } from './client'

export interface ConfigOption {
  configGroup: string
  name: string
  price: number
}

export interface GenerationConfigs {
  engines: ConfigOption[]
  transmissions: ConfigOption[]
}

export { useBrands } from './use-brands'
export type { Brand, BrandsResponse } from './use-brands'

export { useBrand } from './use-brand'
export type { Model, BrandWithModels, BrandResponse } from './use-brand'

export { useModel } from './use-model'
export type {
  BrandInfo,
  Generation,
  ModelWithGenerations,
  ModelResponse,
} from './use-model'

export { useGeneration } from './use-generation'
export type {
  SchematicZone,
  Price,
  Part,
  ModelInfo,
  GenerationWithParts,
  GenerationResponse,
} from './use-generation'

export { useUsageInfo } from './use-usage-info'
export type { UsageInfo, UsageInfoResponse } from './use-usage-info'

export { useCalculate } from './use-calculate'
export type {
  CalculateInput,
  CalculationPart,
  CalculationResult,
  CalculateResponse,
} from './use-calculate'
