import type { VinBrandMapping } from './types'
import { mazdaMapping } from './mazda'
import { ladaMapping } from './lada'
import { hyundaiRuMapping, hyundaiKrMapping } from './hyundai'
import { kiaMapping } from './kia'
import { renaultMapping } from './renault'
import { fordMapping } from './ford'
import { toyotaRuMapping, toyotaJpMapping } from './toyota'
import { nissanMapping } from './nissan'
import { vwRuMapping, vwDeMapping } from './volkswagen'
import { skodaMapping } from './skoda'
import { audiMapping } from './audi'
import { bmwMapping } from './bmw'
import { mercedesMapping } from './mercedes'
import { porscheMapping } from './porsche'
import { opelMapping } from './opel'

export type { VinGenCode, VinModelMapping, VinBrandMapping } from './types'

export const VIN_BRAND_MAPPINGS: VinBrandMapping[] = [
  mazdaMapping,
  ladaMapping,
  hyundaiRuMapping,
  hyundaiKrMapping,
  kiaMapping,
  renaultMapping,
  fordMapping,
  toyotaRuMapping,
  toyotaJpMapping,
  nissanMapping,
  vwRuMapping,
  vwDeMapping,
  skodaMapping,
  audiMapping,
  bmwMapping,
  mercedesMapping,
  porscheMapping,
  opelMapping,
]
