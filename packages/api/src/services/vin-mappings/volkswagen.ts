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
    {
      modelSlug: 'passat',
      modelCodes: { position: [6, 8], codes: ['3C', '36', '3G'] },
      generationCodes: {
        position: [6, 8],
        mapping: {
          '3C': { slug: 'b6', bodyType: 'sedan' },
          '36': { slug: 'b7', bodyType: 'sedan' },
          '3G': { slug: 'b8', bodyType: 'sedan' },
        },
      },
    },
  ],
}
