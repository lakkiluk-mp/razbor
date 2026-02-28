import type { VinBrandMapping } from './types'

export const citroenMapping: VinBrandMapping = {
  wmi: ['VF7', 'Z8T', 'VR7'],
  brandSlug: 'citroen',
  models: [
    {
      modelSlug: 'c4',
      modelCodes: { position: [3, 4], codes: ['N', 'L'] },
      generationCodes: {
        position: [4, 5],
        mapping: {
          C: { slug: 'b7', bodyType: 'hatchback' },
          D: { slug: 'sedan', bodyType: 'sedan' },
        },
      },
      engineCodesRange: {
        position: [5, 8],
        mapping: {
          NFU: ['engine:1.6-109'],
          '5FS': ['engine:1.6-120'],
          NFP: ['engine:1.6-116'],
          '5FE': ['engine:1.6t-150'],
          '9HP': ['engine:1.6d-115'],
          HNS: ['engine:1.2t-130'],
        },
      },
      transmissionCodes: {
        position: 8,
        mapping: {
          '0': ['transmission:mt'],
          '8': ['transmission:mt'],
          '9': ['transmission:at4'],
          A: ['transmission:at6', 'transmission:at8'],
        },
      },
    },
  ],
}
