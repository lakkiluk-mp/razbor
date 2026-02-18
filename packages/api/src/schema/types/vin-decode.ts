import { builder } from '../builder'

export interface VinBrandData {
  slug: string
  name: string
}

export interface VinModelData {
  slug: string
  name: string
}

export interface VinGenerationData {
  id: string
  slug: string
  name: string
  bodyType: string
}

export interface VinSuggestedConfigsData {
  engines: string[]
  transmissions: string[]
  drivetrains: string[]
}

export interface VinNeedsSelectionData {
  generation: boolean
  engine: boolean
  transmission: boolean
  drivetrain: boolean
}

export interface VinAvailableGenerationData {
  id: string
  slug: string
  name: string
}

export interface VinDecodeResultData {
  success: boolean
  vin: string
  year: number | null
  brand: VinBrandData | null
  model: VinModelData | null
  generation: VinGenerationData | null
  suggestedConfigs: VinSuggestedConfigsData
  availableGenerations: VinAvailableGenerationData[]
  needsSelection: VinNeedsSelectionData
  error: string | null
}

const VinBrandType = builder.objectRef<VinBrandData>('VinBrand')
builder.objectType(VinBrandType, {
  fields: (t) => ({
    slug: t.exposeString('slug'),
    name: t.exposeString('name'),
  }),
})

const VinModelType = builder.objectRef<VinModelData>('VinModel')
builder.objectType(VinModelType, {
  fields: (t) => ({
    slug: t.exposeString('slug'),
    name: t.exposeString('name'),
  }),
})

const VinGenerationType = builder.objectRef<VinGenerationData>('VinGeneration')
builder.objectType(VinGenerationType, {
  fields: (t) => ({
    id: t.exposeString('id'),
    slug: t.exposeString('slug'),
    name: t.exposeString('name'),
    bodyType: t.exposeString('bodyType'),
  }),
})

const VinAvailableGenerationType = builder.objectRef<VinAvailableGenerationData>('VinAvailableGeneration')
builder.objectType(VinAvailableGenerationType, {
  fields: (t) => ({
    id: t.exposeString('id'),
    slug: t.exposeString('slug'),
    name: t.exposeString('name'),
  }),
})

const VinSuggestedConfigsType = builder.objectRef<VinSuggestedConfigsData>('VinSuggestedConfigs')
builder.objectType(VinSuggestedConfigsType, {
  fields: (t) => ({
    engines: t.exposeStringList('engines'),
    transmissions: t.exposeStringList('transmissions'),
    drivetrains: t.exposeStringList('drivetrains'),
  }),
})

const VinNeedsSelectionType = builder.objectRef<VinNeedsSelectionData>('VinNeedsSelection')
builder.objectType(VinNeedsSelectionType, {
  fields: (t) => ({
    generation: t.exposeBoolean('generation'),
    engine: t.exposeBoolean('engine'),
    transmission: t.exposeBoolean('transmission'),
    drivetrain: t.exposeBoolean('drivetrain'),
  }),
})

export const VinDecodeResultType = builder.objectRef<VinDecodeResultData>('VinDecodeResult')
builder.objectType(VinDecodeResultType, {
  fields: (t) => ({
    success: t.exposeBoolean('success'),
    vin: t.exposeString('vin'),
    year: t.exposeInt('year', { nullable: true }),
    brand: t.field({
      type: VinBrandType,
      nullable: true,
      resolve: (parent) => parent.brand,
    }),
    model: t.field({
      type: VinModelType,
      nullable: true,
      resolve: (parent) => parent.model,
    }),
    generation: t.field({
      type: VinGenerationType,
      nullable: true,
      resolve: (parent) => parent.generation,
    }),
    suggestedConfigs: t.field({
      type: VinSuggestedConfigsType,
      resolve: (parent) => parent.suggestedConfigs,
    }),
    availableGenerations: t.field({
      type: [VinAvailableGenerationType],
      resolve: (parent) => parent.availableGenerations,
    }),
    needsSelection: t.field({
      type: VinNeedsSelectionType,
      resolve: (parent) => parent.needsSelection,
    }),
    error: t.exposeString('error', { nullable: true }),
  }),
})
