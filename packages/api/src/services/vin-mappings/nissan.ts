import type { VinBrandMapping } from './types'

export const nissanMapping: VinBrandMapping = {
  wmi: ['Z8N', 'SJN', 'JN1'],
  brandSlug: 'nissan',
  models: [
    {
      modelSlug: 'qashqai',
      modelCodes: { position: [3, 4], codes: ['F'] },
    },
  ],
}
