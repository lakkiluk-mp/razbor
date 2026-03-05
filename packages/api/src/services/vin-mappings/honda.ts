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
    {
      modelSlug: 'civic',
      variantCodes: {
        position: [3, 6],
        mapping: {
          FD1: { engines: ['engine:1.8-140'] },
          FD7: { engines: ['engine:1.8-140'] },
          FB6: { engines: ['engine:1.8-142'] },
          FB8: { engines: ['engine:1.8-142'] },
          FC1: { engines: ['engine:1.5t-182'] },
          FC2: { engines: ['engine:2.0-158'] },
        },
      },
      generationCodes: {
        position: [3, 6],
        mapping: {
          FD1: { slug: 'fd', bodyType: 'sedan' },
          FD7: { slug: 'fd', bodyType: 'sedan' },
          FB6: { slug: 'fb', bodyType: 'sedan' },
          FB8: { slug: 'fb', bodyType: 'sedan' },
          FC1: { slug: 'fc', bodyType: 'sedan' },
          FC2: { slug: 'fc', bodyType: 'sedan' },
        },
      },
      transmissionCodes: {
        position: 6,
        mapping: {
          5: ['transmission:mt5', 'transmission:mt6'],
          6: ['transmission:at5', 'transmission:cvt', 'transmission:at-diesel'],
        },
      },
    },
    {
      modelSlug: 'cr-v',
      variantCodes: {
        position: [3, 6],
        mapping: {
          RD1: { engines: ['engine:2.0-128'] },
          RD3: { engines: ['engine:2.0-147'] },
          RD5: { engines: ['engine:2.0-150-k20a'] },
          RD8: { engines: ['engine:2.0-150-k20a'] },
          RE5: { engines: ['engine:2.0-150'] },
          RE7: { engines: ['engine:2.4-166'] },
          RM4: { engines: ['engine:2.4-190', 'engine:2.4-188'] },
          RW1: { engines: ['engine:2.0-150'] },
          RW2: { engines: ['engine:2.4-186'] },
        },
      },
      generationCodes: {
        position: [3, 6],
        mapping: {
          RD1: { slug: 'rd', bodyType: 'crossover' },
          RD3: { slug: 'rd', bodyType: 'crossover' },
          RD5: { slug: 'rd5', bodyType: 'crossover' },
          RD8: { slug: 'rd5', bodyType: 'crossover' },
          RE5: { slug: 're', bodyType: 'crossover' },
          RE7: { slug: 're', bodyType: 'crossover' },
          RM4: { slug: 'rm', bodyType: 'crossover' },
          RW1: { slug: 'rw', bodyType: 'crossover' },
          RW2: { slug: 'rw', bodyType: 'crossover' },
        },
      },
      transmissionCodes: {
        position: 6,
        mapping: {
          5: ['transmission:mt', 'transmission:mt5', 'transmission:mt6'],
          6: ['transmission:at4', 'transmission:at5', 'transmission:cvt'],
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
    {
      modelSlug: 'civic',
      variantCodes: {
        position: [3, 6],
        mapping: {
          FA1: { engines: ['engine:1.8-140'] },
          FA5: { engines: ['engine:1.8-140'] },
          FB2: { engines: ['engine:1.8-142'] },
          FB4: { engines: ['engine:1.8-142'] },
          FC1: { engines: ['engine:1.5t-182'] },
          FC2: { engines: ['engine:2.0-158'] },
        },
      },
      generationCodes: {
        position: [3, 6],
        mapping: {
          FA1: { slug: 'fd', bodyType: 'sedan' },
          FA5: { slug: 'fd', bodyType: 'sedan' },
          FB2: { slug: 'fb', bodyType: 'sedan' },
          FB4: { slug: 'fb', bodyType: 'sedan' },
          FC1: { slug: 'fc', bodyType: 'sedan' },
          FC2: { slug: 'fc', bodyType: 'sedan' },
        },
      },
      transmissionCodes: {
        position: 6,
        mapping: {
          5: ['transmission:mt5', 'transmission:mt6'],
          6: ['transmission:at5', 'transmission:cvt'],
        },
      },
    },
    {
      modelSlug: 'cr-v',
      variantCodes: {
        position: [3, 6],
        mapping: {
          RD1: { engines: ['engine:2.0-128'] },
          RD3: { engines: ['engine:2.0-147'] },
          RD5: { engines: ['engine:2.0-150-k20a'] },
          RD8: { engines: ['engine:2.0-150-k20a'] },
          RE5: { engines: ['engine:2.0-150'] },
          RE7: { engines: ['engine:2.4-166'] },
          RM4: { engines: ['engine:2.4-190', 'engine:2.4-188'] },
          RW1: { engines: ['engine:2.0-150'] },
          RW2: { engines: ['engine:2.4-186'] },
        },
      },
      generationCodes: {
        position: [3, 6],
        mapping: {
          RD1: { slug: 'rd', bodyType: 'crossover' },
          RD3: { slug: 'rd', bodyType: 'crossover' },
          RD5: { slug: 'rd5', bodyType: 'crossover' },
          RD8: { slug: 'rd5', bodyType: 'crossover' },
          RE5: { slug: 're', bodyType: 'crossover' },
          RE7: { slug: 're', bodyType: 'crossover' },
          RM4: { slug: 'rm', bodyType: 'crossover' },
          RW1: { slug: 'rw', bodyType: 'crossover' },
          RW2: { slug: 'rw', bodyType: 'crossover' },
        },
      },
      transmissionCodes: {
        position: 6,
        mapping: {
          5: ['transmission:mt', 'transmission:mt5', 'transmission:mt6'],
          6: ['transmission:at4', 'transmission:at5', 'transmission:cvt'],
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
    {
      modelSlug: 'civic',
      variantCodes: {
        position: [3, 6],
        mapping: {
          FD1: { engines: ['engine:1.8-140'] },
          FK2: { engines: ['engine:1.5t-182'] },
          FC1: { engines: ['engine:1.0t-126'] },
          FC2: { engines: ['engine:1.5t-182'] },
          FC3: { engines: ['engine:1.6d-120'] },
        },
      },
      generationCodes: {
        position: [3, 6],
        mapping: {
          FD1: { slug: 'fd', bodyType: 'sedan' },
          FK2: { slug: 'fc', bodyType: 'sedan' },
          FC1: { slug: 'fc', bodyType: 'sedan' },
          FC2: { slug: 'fc', bodyType: 'sedan' },
          FC3: { slug: 'fc', bodyType: 'sedan' },
        },
      },
      transmissionCodes: {
        position: 6,
        mapping: {
          5: ['transmission:mt5', 'transmission:mt6'],
          6: ['transmission:at5', 'transmission:cvt', 'transmission:at-diesel'],
        },
      },
    },
    {
      modelSlug: 'cr-v',
      variantCodes: {
        position: [3, 6],
        mapping: {
          RD1: { engines: ['engine:2.0-128'] },
          RD3: { engines: ['engine:2.0-147'] },
          RD5: { engines: ['engine:2.0-150-k20a'] },
          RD8: { engines: ['engine:2.0-150-k20a'] },
          RE5: { engines: ['engine:2.0-150'] },
          RE7: { engines: ['engine:2.4-166'] },
          RM4: { engines: ['engine:2.4-190', 'engine:2.4-188'] },
          RW1: { engines: ['engine:2.0-150'] },
          RW2: { engines: ['engine:2.4-186'] },
        },
      },
      generationCodes: {
        position: [3, 6],
        mapping: {
          RD1: { slug: 'rd', bodyType: 'crossover' },
          RD3: { slug: 'rd', bodyType: 'crossover' },
          RD5: { slug: 'rd5', bodyType: 'crossover' },
          RD8: { slug: 'rd5', bodyType: 'crossover' },
          RE5: { slug: 're', bodyType: 'crossover' },
          RE7: { slug: 're', bodyType: 'crossover' },
          RM4: { slug: 'rm', bodyType: 'crossover' },
          RW1: { slug: 'rw', bodyType: 'crossover' },
          RW2: { slug: 'rw', bodyType: 'crossover' },
        },
      },
      transmissionCodes: {
        position: 6,
        mapping: {
          5: ['transmission:mt', 'transmission:mt5', 'transmission:mt6'],
          6: ['transmission:at4', 'transmission:at5', 'transmission:cvt'],
        },
      },
    },
  ],
}
