import type { VinBrandMapping } from './types'

const cruzeModel = {
  modelSlug: 'cruze',
  modelCodes: { position: [3, 4] as [number, number], codes: ['J'] },
  generationCodes: {
    position: [5, 7] as [number, number],
    mapping: {
      F69: { slug: 'j300', bodyType: 'sedan' as const },
      A69: { slug: 'j300', bodyType: 'sedan' as const },
      F19: { slug: 'j300', bodyType: 'sedan' as const },
      A19: { slug: 'j300', bodyType: 'sedan' as const },
      F48: { slug: 'j300', bodyType: 'sedan' as const },
      A48: { slug: 'j300', bodyType: 'sedan' as const },
      F68: { slug: 'j300', bodyType: 'sedan' as const },
      A68: { slug: 'j300', bodyType: 'sedan' as const },
    },
  },
  engineCodes: {
    position: 7,
    mapping: {
      '6': ['engine:1.6-109'],
      B: ['engine:1.8-141'],
      '9': ['engine:1.8-141'],
      A: ['engine:1.4t-140'],
    },
  },
  transmissionCodes: {
    position: 4,
    mapping: {
      F: ['transmission:mt5'],
      A: ['transmission:at4', 'transmission:at6'],
    },
  },
}

const lanosModel = {
  modelSlug: 'lanos',
  modelCodes: { position: [3, 4], codes: ['T'] },
  generationCodes: {
    position: [5, 7],
    mapping: {
      F69: { slug: 't100', bodyType: 'sedan' as const },
      A69: { slug: 't100', bodyType: 'sedan' as const },
    },
  },
  engineCodes: {
    position: 7,
    mapping: {
      Y: ['engine:1.5-86'],
    },
  },
  transmissionCodes: {
    position: 4,
    mapping: {
      F: ['transmission:mt5'],
    },
  },
}

export const chevroletKrMapping: VinBrandMapping = {
  wmi: ['KL1', 'KL2', 'KLA'],
  brandSlug: 'chevrolet',
  models: [
    {
      modelSlug: 'lacetti',
      modelCodes: { position: [3, 4], codes: ['N'] },
      generationCodes: {
        position: [5, 7],
        mapping: {
          F19: { slug: 'j200', bodyType: 'sedan' },
          F69: { slug: 'j200', bodyType: 'sedan' },
          A19: { slug: 'j200', bodyType: 'sedan' },
          A69: { slug: 'j200', bodyType: 'sedan' },
          F48: { slug: 'j200', bodyType: 'sedan' },
          F68: { slug: 'j200', bodyType: 'sedan' },
          A48: { slug: 'j200', bodyType: 'sedan' },
          A68: { slug: 'j200', bodyType: 'sedan' },
          F35: { slug: 'j200', bodyType: 'sedan' },
          A35: { slug: 'j200', bodyType: 'sedan' },
        },
      },
      engineCodes: {
        position: 7,
        mapping: {
          '7': ['engine:1.4-95'],
          '6': ['engine:1.6-109'],
          '3': ['engine:1.8-122'],
          B: ['engine:1.8-122'],
        },
      },
      transmissionCodes: {
        position: 4,
        mapping: {
          F: ['transmission:mt5'],
          A: ['transmission:at4'],
        },
      },
    },
    cruzeModel,
    lanosModel,
  ],
}

export const chevroletRuMapping: VinBrandMapping = {
  wmi: ['XUU'],
  brandSlug: 'chevrolet',
  models: [
    {
      modelSlug: 'lacetti',
      modelCodes: { position: [3, 4], codes: ['N'] },
      generationCodes: {
        position: [5, 7],
        mapping: {
          F19: { slug: 'j200', bodyType: 'sedan' },
          F69: { slug: 'j200', bodyType: 'sedan' },
          A19: { slug: 'j200', bodyType: 'sedan' },
          A69: { slug: 'j200', bodyType: 'sedan' },
          F48: { slug: 'j200', bodyType: 'sedan' },
          F68: { slug: 'j200', bodyType: 'sedan' },
          A48: { slug: 'j200', bodyType: 'sedan' },
          A68: { slug: 'j200', bodyType: 'sedan' },
          F35: { slug: 'j200', bodyType: 'sedan' },
          A35: { slug: 'j200', bodyType: 'sedan' },
        },
      },
      engineCodes: {
        position: 7,
        mapping: {
          '7': ['engine:1.4-95'],
          '6': ['engine:1.6-109'],
          '3': ['engine:1.8-122'],
          B: ['engine:1.8-122'],
        },
      },
      transmissionCodes: {
        position: 4,
        mapping: {
          F: ['transmission:mt5'],
          A: ['transmission:at4'],
        },
      },
    },
    cruzeModel,
    lanosModel,
  ],
}

export const chevroletUaMapping: VinBrandMapping = {
  wmi: ['Y6D'],
  brandSlug: 'chevrolet',
  models: [lanosModel],
}
