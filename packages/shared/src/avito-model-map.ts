export const AVITO_MODEL_MAP: Record<string, Record<string, string>> = {
  'lada': {
    '4x4 (Нива)': 'niva',
    'Нива': 'niva',
    '4x4': 'niva',
    'Niva': 'niva',
    'Niva Travel': 'niva',
    'Niva Legend': 'niva',
    'Niva Legend Bronto': 'niva',
    'Granta': 'granta',
    'Гранта': 'granta',
    'Vesta': 'vesta',
    'Веста': 'vesta',
    'Vesta Cross': 'vesta',
    'Priora': 'priora',
    'Приора': 'priora',
  },
  'mercedes-benz': {
    'C-класс': 'c-class',
    'C-Класс': 'c-class',
    'C-Class': 'c-class',
    'С-класс': 'c-class',
    'С-Класс': 'c-class',
    'E-класс': 'e-class',
    'E-Класс': 'e-class',
    'E-Class': 'e-class',
    'Е-класс': 'e-class',
    'Е-Класс': 'e-class',
    'S-класс': 's-class',
    'S-Класс': 's-class',
    'S-Class': 's-class',
    'G-класс': 'g-class',
    'G-Класс': 'g-class',
    'G-Class': 'g-class',
    'M-класс': 'm-class',
    'M-Класс': 'm-class',
    'M-Class': 'm-class',
    'М-класс': 'm-class',
    'М-Класс': 'm-class',
    'ML-класс': 'm-class',
    'ML-Класс': 'm-class',
  },
  'toyota': {
    'Land Cruiser Prado': 'land-cruiser-prado',
    'Land Cruiser': 'land-cruiser',
    'Camry': 'camry',
    'Corolla': 'corolla',
  },
  'volkswagen': {
    'Polo': 'polo',
    'Golf': 'golf',
    'Passat': 'passat',
    'Tiguan': 'tiguan',
  },
  'bmw': {
    '3 серия': '3-series',
    '3 Series': '3-series',
    '5 серия': '5-series',
    '5 Series': '5-series',
    'X5': 'x5',
  },
  'mazda': {
    'Mazda3': 'mazda3',
    '3': 'mazda3',
    'Mazda6': 'mazda6',
    '6': 'mazda6',
    'CX-5': 'cx-5',
  },
  'lexus': {
    'RX': 'rx300',
    'RX 300': 'rx300',
    'RX300': 'rx300',
  },
  'chevrolet': {
    'Lacetti': 'lacetti',
    'Lanos': 'lanos',
    'Cruze': 'cruze',
  },
  'honda': {
    'CR-V': 'cr-v',
    'Civic': 'civic',
    'Accord': 'accord',
  },
  'nissan': {
    'X-Trail': 'x-trail',
    'Qashqai': 'qashqai',
    'Almera': 'almera',
  },
  'kia': {
    'Rio': 'rio',
    'Ceed': 'ceed',
    "Cee'd": 'ceed',
    'Optima': 'optima',
    'K5': 'optima',
    'Sportage': 'sportage',
  },
  'hyundai': {
    'Solaris': 'solaris',
    'Creta': 'creta',
    'Elantra': 'elantra',
  },
  'renault': {
    'Duster': 'duster',
    'Logan': 'logan',
    'Megane': 'megane',
    'Mégane': 'megane',
  },
  'skoda': {
    'Octavia': 'octavia',
    'Rapid': 'rapid',
    'Fabia': 'fabia',
  },
  'ford': {
    'Focus': 'focus',
    'Mondeo': 'mondeo',
  },
  'audi': {
    'A3': 'a3',
    'A4': 'a4',
    'A6': 'a6',
    'Q5': 'q5',
  },
  'mitsubishi': {
    'Lancer': 'lancer',
    'Outlander': 'outlander',
  },
  'subaru': {
    'Forester': 'forester',
    'Impreza': 'impreza',
  },
  'opel': {
    'Astra': 'astra',
  },
  'citroen': {
    'C4': 'c4',
  },
  'porsche': {
    'Cayenne': 'cayenne',
  },
}

const MODEL_MAP_LOWER = new Map<string, Map<string, string>>(
  Object.entries(AVITO_MODEL_MAP).map(([brand, models]) => [
    brand,
    new Map(Object.entries(models).map(([k, v]) => [k.toLowerCase(), v])),
  ]),
)

export function mapAvitoModel(brandSlug: string, titleModel: string): string | null {
  const brandMap = AVITO_MODEL_MAP[brandSlug]
  if (brandMap) {
    const direct = brandMap[titleModel]
    if (direct) return direct
  }

  const lowerMap = MODEL_MAP_LOWER.get(brandSlug)
  if (lowerMap) {
    const lower = lowerMap.get(titleModel.toLowerCase())
    if (lower) return lower
  }

  return null
}
