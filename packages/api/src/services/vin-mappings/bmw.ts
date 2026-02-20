import type { VinBrandMapping } from './types'

export const bmwMapping: VinBrandMapping = {
  wmi: ['WBA', 'WBS', 'WBY', 'WBM', 'X4X'],
  brandSlug: 'bmw',
  models: [
    {
      modelSlug: '5-series',
      modelCodes: { position: [4, 6], codes: ['DD', 'DG', 'DT'] },
      generationCodes: {
        position: [4, 6],
        mapping: {
          DD: { slug: 'e39', bodyType: 'sedan' },
          DG: { slug: 'e39', bodyType: 'sedan' },
          DT: { slug: 'e39', bodyType: 'wagon' },
        },
      },
    },
    {
      modelSlug: '5-series',
      modelCodes: { position: [4, 6], codes: ['DX', 'HN'] },
      generationCodes: {
        position: [4, 6],
        mapping: {
          DX: { slug: 'e60', bodyType: 'sedan' },
          HN: { slug: 'e60', bodyType: 'sedan' },
        },
      },
    },
    {
      modelSlug: '5-series',
      modelCodes: { position: [4, 6], codes: ['HD', 'HJ'] },
      generationCodes: {
        position: [4, 6],
        mapping: {
          HD: { slug: 'f10', bodyType: 'sedan' },
          HJ: { slug: 'f10', bodyType: 'sedan' },
        },
      },
      variantCodes: {
        position: [4, 6],
        mapping: {
          HD: { transmissions: ['transmission:at8'] },
          HJ: { engines: ['engine:4.4t-407'], transmissions: ['transmission:at8'] },
        },
      },
    },
  ],
}
