import type { VinBrandMapping } from './types'

export const renaultMapping: VinBrandMapping = {
  wmi: ['X7L', 'VF1', 'VF6'],
  brandSlug: 'renault',
  models: [
    {
      modelSlug: 'logan',
      modelCodes: { position: [3, 4], codes: ['L', '4'] },
      engineCodesRange: {
        position: [5, 7],
        mapping: {
          RA: ['engine:1.6-k7m'],
          RB: ['engine:1.6-k4m'],
          RH: ['engine:1.6-113'],
          R4: ['engine:2.0-143'],
        },
      },
      transmissionCodes: {
        position: 8,
        mapping: {
          '4': ['transmission:mt'],
          '5': ['transmission:mt'],
          '6': ['transmission:mt'],
          '1': ['transmission:at'],
          '2': ['transmission:at'],
          C: ['transmission:amt'],
        },
      },
    },
    {
      modelSlug: 'duster',
      modelCodes: { position: [3, 4], codes: ['H', 'U'] },
      engineCodesRange: {
        position: [5, 7],
        mapping: {
          RB: ['engine:1.6-k4m'],
          RD: ['engine:1.5-109'],
          RE: ['engine:1.5-109'],
          RH: ['engine:1.6-113'],
          R4: ['engine:2.0-143'],
          R9: ['engine:1.3-149'],
        },
      },
      transmissionCodes: {
        position: 8,
        mapping: {
          '4': ['transmission:mt'],
          '5': ['transmission:mt'],
          '6': ['transmission:mt6'],
          '1': ['transmission:at'],
          C: ['transmission:cvt'],
        },
      },
    },
  ],
}
