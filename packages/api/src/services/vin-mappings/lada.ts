import type { VinBrandMapping } from './types'

export const ladaMapping: VinBrandMapping = {
  wmi: ['XTA', 'Y6D'],
  brandSlug: 'lada',
  models: [
    {
      modelSlug: 'vesta',
      modelCodes: { position: [3, 5], codes: ['GF'] },
      engineCodes: {
        position: 6,
        mapping: {
          '1': ['engine:1.6-106'],
          '2': ['engine:1.6-90'],
          '3': ['engine:1.8-122'],
          '4': ['engine:1.6-113'],
        },
      },
      transmissionCodes: {
        position: 7,
        mapping: {
          '1': ['transmission:mt'],
          '2': ['transmission:amt'],
          '3': ['transmission:mt'],
          '4': ['transmission:cvt'],
        },
      },
    },
    {
      modelSlug: 'granta',
      modelCodes: { position: [3, 6], codes: ['219', '218'] },
    },
    {
      modelSlug: 'niva',
      modelCodes: { position: [3, 6], codes: ['212', '213'] },
    },
    {
      modelSlug: 'priora',
      modelCodes: { position: [3, 6], codes: ['217'] },
    },
    {
      modelSlug: '2114',
      modelCodes: { position: [3, 7], codes: ['2114'] },
    },
    {
      modelSlug: '2107',
      modelCodes: { position: [3, 7], codes: ['2107'] },
    },
  ],
}
