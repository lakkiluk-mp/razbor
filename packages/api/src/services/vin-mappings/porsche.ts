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
      engineCodes: {
        position: 7,
        mapping: {
          A: ['engine:3.6-290', 'engine:3.6-300', 'engine:3.2-250'],
          B: ['engine:4.5-340', 'engine:4.8-385', 'engine:4.8-400'],
          C: ['engine:4.5-450', 'engine:4.8-500', 'engine:4.8-500-turbo', 'engine:4.0-460', 'engine:4.0-550'],
          D: ['engine:3.0-340', 'engine:2.9-440'],
          E: ['engine:3.0d-240', 'engine:3.0d-245'],
          F: ['engine:4.1d-382'],
        },
      },
    },
  ],
}
