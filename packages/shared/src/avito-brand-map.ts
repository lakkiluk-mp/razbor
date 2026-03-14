export const AVITO_BRAND_MAP: Record<string, string> = {
  'Audi': 'audi',
  'BMW': 'bmw',
  'Chevrolet': 'chevrolet',
  'Citroen': 'citroen',
  'Ford': 'ford',
  'Honda': 'honda',
  'Hyundai': 'hyundai',
  'Kia': 'kia',
  'KIA': 'kia',
  'LADA': 'lada',
  'Lada': 'lada',
  'ВАЗ (LADA)': 'lada',
  'ВАЗ': 'lada',
  'VAZ': 'lada',
  'Lexus': 'lexus',
  'Mazda': 'mazda',
  'Mercedes-Benz': 'mercedes-benz',
  'Mercedes': 'mercedes-benz',
  'Mitsubishi': 'mitsubishi',
  'Nissan': 'nissan',
  'Opel': 'opel',
  'Porsche': 'porsche',
  'Renault': 'renault',
  'Skoda': 'skoda',
  'Škoda': 'skoda',
  'Subaru': 'subaru',
  'Toyota': 'toyota',
  'Volkswagen': 'volkswagen',
  'VW': 'volkswagen',
}

const BRAND_MAP_LOWER = new Map<string, string>(
  Object.entries(AVITO_BRAND_MAP).map(([k, v]) => [k.toLowerCase(), v]),
)

export function mapAvitoBrand(titleBrand: string): string | null {
  const direct = AVITO_BRAND_MAP[titleBrand]
  if (direct) return direct

  return BRAND_MAP_LOWER.get(titleBrand.toLowerCase()) ?? null
}
