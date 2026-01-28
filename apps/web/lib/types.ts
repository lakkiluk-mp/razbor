export type BodyType =
  | 'sedan'
  | 'hatchback'
  | 'liftback'
  | 'crossover'
  | 'suv'
  | 'wagon'
  | 'coupe'
  | 'minivan'
  | 'pickup'

export type PartCategory =
  | 'body'
  | 'optics'
  | 'glass'
  | 'interior'
  | 'engine'
  | 'transmission'
  | 'suspension'
  | 'electrical'
  | 'cooling'
  | 'other'

export type ZoneType = 'exterior' | 'interior' | 'mechanical'

export interface Brand {
  id: string
  name: string
  slug: string
  logo: string | null
}

export interface Model {
  id: string
  name: string
  slug: string
  brand?: Brand
  generations?: Generation[]
}

export interface Generation {
  id: string
  name: string
  slug: string
  yearStart: number
  yearEnd: number | null
  bodyType: BodyType
  model?: Model
  parts?: PartWithPrice[]
}

export interface SchematicZone {
  id: string
  code: string
  name: string
  type: ZoneType
}

export interface PriceInfo {
  median: number
  min: number
  max: number
  count: number
}

export interface PartWithPrice {
  id: string
  name: string
  category: PartCategory
  schematicZone: SchematicZone | null
  price: PriceInfo | null
}

export interface CalculationPart {
  part: PartWithPrice
  included: boolean
  isDamaged: boolean
  price: number
}

export interface CalculationResult {
  totalPrice: number
  parts: CalculationPart[]
}

export interface UsageInfo {
  freeEstimatesUsed: number
  freeEstimatesLimit: number
  nextResetAt: string | null
}

export type CarView = 'front' | 'left' | 'back' | 'right'

export const viewLabels: Record<CarView, string> = {
  front: 'спереди',
  left: 'слева',
  back: 'сзади',
  right: 'справа',
}

export const bodyTypeLabels: Record<BodyType, string> = {
  sedan: 'Седан',
  hatchback: 'Хэтчбек',
  liftback: 'Лифтбек',
  crossover: 'Кроссовер',
  suv: 'Внедорожник',
  wagon: 'Универсал',
  coupe: 'Купе',
  minivan: 'Минивэн',
  pickup: 'Пикап',
}
