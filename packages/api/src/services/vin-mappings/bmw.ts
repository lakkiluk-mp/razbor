import type { VinBrandMapping } from './types'

export const bmwMapping: VinBrandMapping = {
  wmi: ['WBA', 'WBS', 'WBY', 'WBM', 'X4X'],
  brandSlug: 'bmw',
  models: [
    // === 3-Series ===
    {
      modelSlug: '3-series',
      modelCodes: { position: [4, 6], codes: ['AV', 'AW', 'BA', 'BC'] },
      generationCodes: {
        position: [4, 6],
        mapping: {
          AV: { slug: 'e46', bodyType: 'sedan' },
          AW: { slug: 'e46', bodyType: 'sedan' },
          BA: { slug: 'e46', bodyType: 'sedan' },
          BC: { slug: 'e46', bodyType: 'sedan' },
        },
      },
    },
    {
      modelSlug: '3-series',
      modelCodes: { position: [4, 6], codes: ['PG', 'PH', 'VA', 'VC'] },
      generationCodes: {
        position: [4, 6],
        mapping: {
          PG: { slug: 'e90', bodyType: 'sedan' },
          PH: { slug: 'e90', bodyType: 'sedan' },
          VA: { slug: 'e90', bodyType: 'sedan' },
          VC: { slug: 'e90', bodyType: 'sedan' },
        },
      },
    },
    {
      modelSlug: '3-series',
      modelCodes: { position: [4, 6], codes: ['3A', '3B', '8A', '8B'] },
      generationCodes: {
        position: [4, 6],
        mapping: {
          '3A': { slug: 'f30', bodyType: 'sedan' },
          '3B': { slug: 'f30', bodyType: 'sedan' },
          '8A': { slug: 'f30', bodyType: 'sedan' },
          '8B': { slug: 'f30', bodyType: 'sedan' },
        },
      },
    },
    {
      modelSlug: '3-series',
      modelCodes: { position: [4, 6], codes: ['5F', '5G', '5V'] },
      generationCodes: {
        position: [4, 6],
        mapping: {
          '5F': { slug: 'g20', bodyType: 'sedan' },
          '5G': { slug: 'g20', bodyType: 'sedan' },
          '5V': { slug: 'g20', bodyType: 'sedan' },
        },
      },
    },
    // === 5-Series ===
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
