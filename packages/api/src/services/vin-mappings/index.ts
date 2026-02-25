import type { VinBrandMapping } from './types'
import { mazdaMapping } from './mazda'
import { ladaMapping } from './lada'
import { hyundaiRuMapping, hyundaiKrMapping } from './hyundai'
import { kiaMapping, kiaRuMapping, kiaEuMapping } from './kia'
import { renaultMapping } from './renault'
import { fordEuMapping, fordUsMapping } from './ford'
import { toyotaRuMapping, toyotaJpMapping } from './toyota'
import { nissanMapping } from './nissan'
import { vwRuMapping, vwDeMapping } from './volkswagen'
import { skodaMapping } from './skoda'
import { audiEuMapping, audiUsMapping } from './audi'
import { bmwMapping } from './bmw'
import { mercedesOldMapping, mercedesNewMapping } from './mercedes'
import { porscheMapping } from './porsche'
import { opelMapping } from './opel'
import { chevroletKrMapping, chevroletRuMapping } from './chevrolet'
import { mitsubishiMapping } from './mitsubishi'

export type { VinGenCode, VinModelMapping, VinBrandMapping, VinVariantConfig } from './types'

export const VIN_BRAND_MAPPINGS: VinBrandMapping[] = [
  mazdaMapping,
  ladaMapping,
  hyundaiRuMapping,
  hyundaiKrMapping,
  kiaRuMapping,
  kiaMapping,
  kiaEuMapping,
  renaultMapping,
  fordEuMapping,
  fordUsMapping,
  toyotaRuMapping,
  toyotaJpMapping,
  nissanMapping,
  vwRuMapping,
  vwDeMapping,
  skodaMapping,
  audiEuMapping,
  audiUsMapping,
  bmwMapping,
  mercedesOldMapping,
  mercedesNewMapping,
  porscheMapping,
  opelMapping,
  chevroletKrMapping,
  chevroletRuMapping,
  mitsubishiMapping,
]
