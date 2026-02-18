import type { VinBrandMapping } from './types'

export const fordMapping: VinBrandMapping = {
  wmi: ['WF0'],
  brandSlug: 'ford',
  models: [
    {
      modelSlug: 'focus',
      engineCodes: {
        position: 7,
        mapping: {
          '1': ['engine:1.6-85', 'engine:1.6-100', 'engine:1.6-100z'],
          '5': ['engine:1.6-125', 'engine:1.6-115'],
          '9': ['engine:1.5t-150'],
          P: ['engine:2.0-145', 'engine:2.0-150'],
          N: ['engine:2.0-145', 'engine:2.0-150'],
          U: ['engine:2.0-150'],
          '3': ['engine:1.4-80'],
          '7': ['engine:1.8-125', 'engine:1.8-115'],
          D: ['engine:1.8d-115', 'engine:2.0d-140'],
        },
      },
    },
  ],
}
