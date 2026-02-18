import type { VinBrandMapping } from './types'

export const porscheMapping: VinBrandMapping = {
  wmi: ['WP0', 'WP1'],
  brandSlug: 'porsche',
  models: [
    {
      modelSlug: 'cayenne',
      modelCodes: { position: [4, 6], codes: ['AA', 'AB', 'AC', 'AD', 'AE', 'ZA', 'ZB', 'ZC'] },
      generationCodes: {
        position: [4, 6],
        mapping: {
          AA: { slug: '9pa', bodyType: 'crossover' },
          AB: { slug: '9pa', bodyType: 'crossover' },
          AC: { slug: '9pa', bodyType: 'crossover' },
          AD: { slug: '92a', bodyType: 'crossover' },
          AE: { slug: '92a', bodyType: 'crossover' },
          ZA: { slug: 'po536', bodyType: 'crossover' },
          ZB: { slug: 'po536', bodyType: 'crossover' },
          ZC: { slug: 'po536', bodyType: 'crossover' },
        },
      },
      engineCodesRange: {
        position: [4, 6],
        mapping: {
          AA: ['engine:3.2-250', 'engine:3.6-290'],
          AB: ['engine:4.5-340', 'engine:4.8-385'],
          AC: ['engine:4.5-450', 'engine:4.8-500'],
          AD: ['engine:3.6-300'],
          AE: ['engine:4.8-400', 'engine:4.8-500-turbo'],
          ZA: ['engine:3.0-340'],
          ZB: ['engine:2.9-440'],
          ZC: ['engine:4.0-460', 'engine:4.0-550'],
        },
      },
    },
  ],
}
