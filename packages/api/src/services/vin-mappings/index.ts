import type { VinBrandMapping } from './types'
import { mazdaMapping } from './mazda'
import { ladaMapping } from './lada'
import { hyundaiRuMapping, hyundaiKrMapping } from './hyundai'
import { kiaMapping, kiaRuMapping, kiaEuMapping } from './kia'
import { renaultMapping } from './renault'
import { fordEuMapping, fordUsMapping } from './ford'
import { toyotaRuMapping, toyotaJpMapping, toyotaLcMapping } from './toyota'
import { nissanMapping } from './nissan'
import { vwRuMapping, vwDeMapping, vwTiguanMapping } from './volkswagen'
import { skodaMapping } from './skoda'
import { audiEuMapping, audiUsMapping } from './audi'
import { bmwMapping } from './bmw'
import { mercedesOldMapping, mercedesNewMapping } from './mercedes'
import { porscheMapping } from './porsche'
import { opelMapping } from './opel'
import { chevroletKrMapping, chevroletRuMapping, chevroletUaMapping } from './chevrolet'
import { mitsubishiMapping } from './mitsubishi'
import { hondaJpMapping, hondaUsMapping, hondaEuMapping } from './honda'
import { subaruMapping } from './subaru'
import { lexusJpMapping } from './lexus'
import { citroenMapping } from './citroen'

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
  toyotaLcMapping,
  nissanMapping,
  vwRuMapping,
  vwDeMapping,
  vwTiguanMapping,
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
  chevroletUaMapping,
  mitsubishiMapping,
  hondaJpMapping,
  hondaUsMapping,
  hondaEuMapping,
  subaruMapping,
  lexusJpMapping,
  citroenMapping,
]
