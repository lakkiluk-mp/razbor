import type { VinBrandMapping } from './types'

export const bmwMapping: VinBrandMapping = {
  wmi: ['WBA', 'WBS', 'WBY', 'WBM'],
  brandSlug: 'bmw',
  models: [
    {
      modelSlug: '5-series',
      modelCodes: { position: [4, 6], codes: ['DD', 'DG', 'DT', 'DX', 'HD', 'HN', 'HJ'] },
      generationCodes: {
        position: [4, 6],
        mapping: {
          DD: { slug: 'e39', bodyType: 'sedan' },
          DG: { slug: 'e39', bodyType: 'sedan' },
          DT: { slug: 'e39', bodyType: 'wagon' },
          DX: { slug: 'e60', bodyType: 'sedan' },
          HN: { slug: 'e60', bodyType: 'sedan' },
          HD: { slug: 'f10', bodyType: 'sedan' },
          HJ: { slug: 'f10', bodyType: 'sedan' },
        },
      },
    },
  ],
}
