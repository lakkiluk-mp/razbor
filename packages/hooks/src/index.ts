export { createClient, queries, mutations } from './client'

export interface ConfigOption {
  configGroup: string
  name: string
  price: number
}

export interface GenerationConfigs {
  engines: ConfigOption[]
  transmissions: ConfigOption[]
  drivetrains: ConfigOption[]
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

export interface VinDecodeResult {
  success: boolean
  vin: string
  year: number | null
  brand: { slug: string; name: string } | null
  model: { slug: string; name: string } | null
  generation: { id: string; slug: string; name: string; bodyType: string } | null
  suggestedConfigs: {
    engines: string[]
    transmissions: string[]
    drivetrains: string[]
  }
  availableGenerations: Array<{ id: string; slug: string; name: string }>
  needsSelection: {
    generation: boolean
    engine: boolean
    transmission: boolean
    drivetrain: boolean
  }
  error: string | null
}

export interface DecodeVinResponse {
  decodeVin: VinDecodeResult
}

export { useCalculate } from './use-calculate'
export type {
  CalculateInput,
  CalculationPart,
  CalculationResult,
  CalculateResponse,
} from './use-calculate'

export {
  useMonitorSubscriptions,
  useMonitorSubscription,
  useMonitorCities,
  useCreateMonitorSubscription,
  useDeleteMonitorSubscription,
  usePauseMonitorSubscription,
} from './use-monitor'
export type {
  MonitorSubscription,
  MonitorCity,
  MonitorSubscriptionsResponse,
  MonitorSubscriptionResponse,
  MonitorCitiesResponse,
  CreateMonitorInput,
} from './use-monitor'
