import type { VinBrandMapping } from './types'

export const mercedesMapping: VinBrandMapping = {
  wmi: ['WDB', 'WDD', 'WDC', 'W1K', 'W1N'],
  brandSlug: 'mercedes-benz',
  models: [
    {
      modelSlug: 'c-class',
      modelCodes: { position: [4, 6], codes: ['HA', 'RF', 'GF', 'WF', 'AF', 'HF'] },
      generationCodes: {
        position: [4, 6],
        mapping: {
          HA: { slug: 'w202', bodyType: 'sedan' },
          RF: { slug: 'w203', bodyType: 'sedan' },
          GF: { slug: 'w204', bodyType: 'sedan' },
          HF: { slug: 'w204', bodyType: 'wagon' },
          WF: { slug: 'w205', bodyType: 'sedan' },
          AF: { slug: 'w206', bodyType: 'sedan' },
        },
      },
      transmissionCodes: {
        position: 7,
        mapping: {
          '0': ['transmission:mt'],
          '1': ['transmission:at'],
          '2': ['transmission:at'],
        },
      },
    },
    {
      modelSlug: 's-class',
      modelCodes: { position: [4, 6], codes: ['GA', 'NG', 'BG'] },
      generationCodes: {
        position: [4, 6],
        mapping: {
          GA: { slug: 'w140', bodyType: 'sedan' },
          NG: { slug: 'w220', bodyType: 'sedan' },
          BG: { slug: 'w221', bodyType: 'sedan' },
        },
      },
      transmissionCodes: {
        position: 7,
        mapping: {
          '0': ['transmission:mt'],
          '1': ['transmission:at'],
          '2': ['transmission:at'],
        },
      },
    },
  ],
}
