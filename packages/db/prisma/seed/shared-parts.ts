import { PartCategory } from '@prisma/client'

export interface SharedPartDefinition {
  oemCode: string
  name: string
  category: PartCategory
  searchQueries: string[]
  usedBy: string[]
}

export const SHARED_PARTS_REGISTRY: SharedPartDefinition[] = [
  // ========================================
  // MAZDA ENGINES
  // ========================================
  {
    oemCode: 'L82902300',
    name: 'Двигатель 1.8 L8 (120 л.с.)',
    category: 'engine',
    searchQueries: ['oem:L82902300', 'двигатель 1.8 L8', 'мотор 1.8 L8', 'двигатель L8'],
    usedBy: ['mazda-6'],
  },
  {
    oemCode: 'LF1702300',
    name: 'Двигатель 2.0 LF (141-147 л.с.)',
    category: 'engine',
    searchQueries: ['oem:LF1702300', 'двигатель 2.0 LF', 'мотор 2.0 LF', 'двигатель LF'],
    usedBy: ['mazda-6', 'mazda-3', 'mazda-5'],
  },
  {
    oemCode: 'PEY502300',
    name: 'Двигатель 2.0 SKYACTIV-G (150 л.с.)',
    category: 'engine',
    searchQueries: [
      'oem:PEY502300',
      'двигатель 2.0 SKYACTIV-G',
      'мотор 2.0 SKYACTIV',
      'двигатель PE SKYACTIV',
    ],
    usedBy: ['mazda-6', 'mazda-3', 'mazda-cx-5'],
  },
  {
    oemCode: 'PYZC02300',
    name: 'Двигатель 2.5 SKYACTIV-G (192 л.с.)',
    category: 'engine',
    searchQueries: [
      'oem:PYZC02300',
      'двигатель 2.5 SKYACTIV-G',
      'мотор 2.5 SKYACTIV',
      'двигатель PY SKYACTIV',
    ],
    usedBy: ['mazda-6', 'mazda-cx-5', 'mazda-cx-9'],
  },
  {
    oemCode: 'PYZE02300',
    name: 'Двигатель 2.5T SKYACTIV-G Turbo (231 л.с.)',
    category: 'engine',
    searchQueries: [
      'oem:PYZE02300',
      'двигатель 2.5 турбо SKYACTIV',
      'мотор 2.5T SKYACTIV',
      'двигатель SKYACTIV-G Turbo',
    ],
    usedBy: ['mazda-6', 'mazda-cx-5', 'mazda-cx-9'],
  },

  // ========================================
  // MAZDA TRANSMISSIONS
  // ========================================
  {
    oemCode: 'G61117150',
    name: 'МКПП 5-ступ',
    category: 'transmission',
    searchQueries: ['oem:G61117150', 'мкпп 5 ступ мазда', 'коробка механика мазда'],
    usedBy: ['mazda-6', 'mazda-3'],
  },
  {
    oemCode: 'FS5AEL',
    name: 'АКПП 5-ступ FS5AEL/FNR5',
    category: 'transmission',
    searchQueries: [
      'oem:FS5AEL',
      'oem:FNR5',
      'акпп FS5AEL',
      'акпп FNR5',
      'акпп 5 ступ мазда',
      'коробка автомат мазда',
    ],
    usedBy: ['mazda-6', 'mazda-3', 'mazda-5'],
  },
  {
    oemCode: 'FW6AEL',
    name: 'АКПП 6-ступ',
    category: 'transmission',
    searchQueries: [
      'oem:FW6AEL',
      'акпп FW6AEL',
      'акпп 6 ступ мазда',
      'коробка автомат 6 ступ мазда',
    ],
    usedBy: ['mazda-6', 'mazda-3', 'mazda-cx-5'],
  },

  // ========================================
  // RENAULT ENGINES
  // ========================================
  {
    oemCode: '6001549085',
    name: 'Двигатель 1.4 K7J (75 л.с.)',
    category: 'engine',
    searchQueries: [
      'oem:6001549085',
      'двигатель 1.4 K7J',
      'мотор K7J',
      'двигатель K7J рено',
    ],
    usedBy: ['renault-logan'],
  },
  {
    oemCode: '8201109282',
    name: 'Двигатель 1.6 K7M (82 л.с.)',
    category: 'engine',
    searchQueries: [
      'oem:8201109282',
      'oem:100015193R',
      'двигатель 1.6 K7M',
      'мотор K7M',
      'двигатель K7M рено',
    ],
    usedBy: ['renault-logan', 'renault-sandero'],
  },
  {
    oemCode: '8201315743',
    name: 'Двигатель 1.6 K4M (102 л.с.)',
    category: 'engine',
    searchQueries: [
      'oem:8201315743',
      'oem:6001549002',
      'двигатель 1.6 K4M',
      'мотор K4M',
      'двигатель K4M рено',
    ],
    usedBy: ['renault-logan', 'renault-sandero', 'renault-duster'],
  },
  {
    oemCode: '8201583992',
    name: 'Двигатель 1.6 H4M (113 л.с.)',
    category: 'engine',
    searchQueries: [
      'oem:8201583992',
      'двигатель 1.6 H4M',
      'мотор H4M',
      'двигатель H4M рено',
      'двигатель HR16DE',
    ],
    usedBy: ['renault-logan', 'renault-sandero', 'renault-duster'],
  },

  // ========================================
  // RENAULT TRANSMISSIONS
  // ========================================
  {
    oemCode: '320100676R',
    name: 'МКПП 5-ступ Renault',
    category: 'transmission',
    searchQueries: [
      'oem:320100676R',
      'oem:320103500R',
      'oem:320103334R',
      'мкпп 5 ступ рено',
      'коробка механика рено логан',
      'мкпп JH3 рено',
    ],
    usedBy: ['renault-logan', 'renault-sandero'],
  },
  {
    oemCode: '8201114873',
    name: 'АКПП 4-ступ Renault',
    category: 'transmission',
    searchQueries: [
      'oem:8201114873',
      'акпп 4 ступ рено',
      'коробка автомат рено логан',
      'акпп DP2 рено',
    ],
    usedBy: ['renault-logan'],
  },
]

export function findSharedPart(oemCode: string): SharedPartDefinition | undefined {
  return SHARED_PARTS_REGISTRY.find((p) => p.oemCode === oemCode)
}

export function generateSharedPartSlug(def: SharedPartDefinition): string {
  return `shared-${def.category}-${def.oemCode.toLowerCase()}`
}
