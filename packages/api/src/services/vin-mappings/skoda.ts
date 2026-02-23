import type { VinBrandMapping } from './types'

export const skodaMapping: VinBrandMapping = {
  wmi: ['TMB'],
  brandSlug: 'skoda',
  models: [
    {
      modelSlug: 'rapid',
      modelCodes: { position: [6, 8], codes: ['NH', 'NA'] },
      generationCodes: {
        position: [6, 8],
        mapping: {
          NH: { slug: 'nh3', bodyType: 'sedan' },
          NA: { slug: 'rapid2', bodyType: 'sedan' },
        },
      },
    },
    {
      modelSlug: 'octavia',
      modelCodes: { position: [6, 8], codes: ['1Z', '5E', 'NX'] },
      generationCodes: {
        position: [6, 8],
        mapping: {
          '1Z': { slug: 'a5', bodyType: 'liftback' },
          '5E': { slug: 'a7', bodyType: 'liftback' },
          NX: { slug: 'a8', bodyType: 'liftback' },
        },
      },
    },
  ],
}
