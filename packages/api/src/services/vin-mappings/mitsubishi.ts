import type { VinBrandMapping } from './types'

export const mitsubishiMapping: VinBrandMapping = {
  wmi: ['JA3', 'JMB', 'JMY'],
  brandSlug: 'mitsubishi',
  models: [
    {
      modelSlug: 'lancer',
      modelCodes: { position: [3, 5], codes: ['LS', 'LT', 'LX', 'LZ'] },
      generationCodes: {
        position: [6, 8],
        mapping: {
          CY: { slug: 'cy', bodyType: 'sedan' },
          CS: { slug: 'cs', bodyType: 'sedan' },
          CK: { slug: 'ck', bodyType: 'sedan' },
        },
      },
    },
    {
      modelSlug: 'outlander',
      modelCodes: { position: [3, 5], codes: ['CW', 'GF', 'GG', 'GN'] },
      generationCodes: {
        position: [6, 8],
        mapping: {
          CW: { slug: 'cw', bodyType: 'crossover' },
          GF: { slug: 'gf', bodyType: 'crossover' },
          GG: { slug: 'gf', bodyType: 'crossover' },
        },
      },
    },
  ],
}
