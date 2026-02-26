import type { VinBrandMapping } from './types'

export const hondaJpMapping: VinBrandMapping = {
  wmi: ['JHM'],
  brandSlug: 'honda',
  models: [
    {
      modelSlug: 'accord',
      variantCodes: {
        position: [3, 6],
        mapping: {
          CL7: { engines: ['engine:2.0-155'] },
          CL9: { engines: ['engine:2.4-190'] },
          CU1: { engines: ['engine:2.0-156'] },
          CU2: { engines: ['engine:2.4-200'] },
          CR2: { engines: ['engine:2.0-150'] },
          CR3: { engines: ['engine:2.4-188'] },
          CR6: { engines: ['engine:3.5-278'] },
          CV1: { engines: ['engine:1.5t-192'] },
          CV2: { engines: ['engine:2.0t-252'] },
        },
      },
      generationCodes: {
        position: [3, 6],
        mapping: {
          CL7: { slug: 'cl', bodyType: 'sedan' },
          CL9: { slug: 'cl', bodyType: 'sedan' },
          CU1: { slug: 'cu', bodyType: 'sedan' },
          CU2: { slug: 'cu', bodyType: 'sedan' },
          CR2: { slug: 'cr', bodyType: 'sedan' },
          CR3: { slug: 'cr', bodyType: 'sedan' },
          CR6: { slug: 'cr', bodyType: 'sedan' },
          CV1: { slug: 'cv', bodyType: 'sedan' },
          CV2: { slug: 'cv', bodyType: 'sedan' },
        },
      },
      transmissionCodes: {
        position: 6,
        mapping: {
          5: ['transmission:mt5', 'transmission:mt6'],
          6: ['transmission:at5-mcta', 'transmission:at5', 'transmission:cvt', 'transmission:at6', 'transmission:at10'],
        },
      },
    },
  ],
}

export const hondaUsMapping: VinBrandMapping = {
  wmi: ['1HG', '2HG'],
  brandSlug: 'honda',
  models: [
    {
      modelSlug: 'accord',
      variantCodes: {
        position: [3, 6],
        mapping: {
          CP2: { engines: ['engine:2.4-200'] },
          CP3: { engines: ['engine:3.5-278'] },
          CR2: { engines: ['engine:2.0-150'] },
          CR3: { engines: ['engine:2.4-188'] },
          CV1: { engines: ['engine:1.5t-192'] },
          CV2: { engines: ['engine:2.0t-252'] },
        },
      },
      generationCodes: {
        position: [3, 6],
        mapping: {
          CP2: { slug: 'cu', bodyType: 'sedan' },
          CP3: { slug: 'cu', bodyType: 'sedan' },
          CR2: { slug: 'cr', bodyType: 'sedan' },
          CR3: { slug: 'cr', bodyType: 'sedan' },
          CV1: { slug: 'cv', bodyType: 'sedan' },
          CV2: { slug: 'cv', bodyType: 'sedan' },
        },
      },
      transmissionCodes: {
        position: 6,
        mapping: {
          5: ['transmission:mt5', 'transmission:mt6'],
          6: ['transmission:at5', 'transmission:cvt', 'transmission:at10'],
        },
      },
    },
  ],
}

export const hondaEuMapping: VinBrandMapping = {
  wmi: ['SHH'],
  brandSlug: 'honda',
  models: [
    {
      modelSlug: 'accord',
      variantCodes: {
        position: [3, 6],
        mapping: {
          CL7: { engines: ['engine:2.0-155'] },
          CL9: { engines: ['engine:2.4-190'] },
          CU1: { engines: ['engine:2.0-156'] },
          CU2: { engines: ['engine:2.4-200'] },
          CR2: { engines: ['engine:2.0-150'] },
          CR3: { engines: ['engine:2.4-188'] },
        },
      },
      generationCodes: {
        position: [3, 6],
        mapping: {
          CL7: { slug: 'cl', bodyType: 'sedan' },
          CL9: { slug: 'cl', bodyType: 'sedan' },
          CU1: { slug: 'cu', bodyType: 'sedan' },
          CU2: { slug: 'cu', bodyType: 'sedan' },
          CR2: { slug: 'cr', bodyType: 'sedan' },
          CR3: { slug: 'cr', bodyType: 'sedan' },
        },
      },
      transmissionCodes: {
        position: 6,
        mapping: {
          5: ['transmission:mt5', 'transmission:mt6'],
          6: ['transmission:at5-mcta', 'transmission:at5', 'transmission:cvt', 'transmission:at6'],
        },
      },
    },
  ],
}
