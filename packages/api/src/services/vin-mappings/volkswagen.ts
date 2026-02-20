import type { VinBrandMapping } from './types'

export const vwRuMapping: VinBrandMapping = {
  wmi: ['XW8'],
  brandSlug: 'volkswagen',
  models: [
    {
      modelSlug: 'polo',
      modelCodes: { position: [6, 8], codes: ['6R', '61', 'AW', 'BZ'] },
    },
  ],
}

export const vwDeMapping: VinBrandMapping = {
  wmi: ['WVW'],
  brandSlug: 'volkswagen',
  models: [
    {
      modelSlug: 'polo',
      modelCodes: { position: [6, 8], codes: ['6R', '61', 'AW', 'BZ'] },
    },
  ],
}
