import type { VinBrandMapping } from './types'

export const lexusJpMapping: VinBrandMapping = {
  wmi: ['JTJ', 'JTH'],
  brandSlug: 'lexus',
  models: [
    {
      modelSlug: 'rx300',
      engineCodes: {
        position: 4,
        mapping: {
          F: ['engine:3.0-200'],
          D: ['engine:2.0t-238'],
        },
      },
    },
  ],
}
