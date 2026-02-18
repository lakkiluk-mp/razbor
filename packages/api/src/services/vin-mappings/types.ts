export interface VinGenCode {
  slug: string
  bodyType: string
}

export interface VinModelMapping {
  modelSlug: string
  modelCodes?: { position: [number, number]; codes: string[] }
  generationCodes?: { position: [number, number]; mapping: Record<string, VinGenCode> }
  engineCodes?: { position: number; mapping: Record<string, string[]> }
  engineCodesRange?: { position: [number, number]; mapping: Record<string, string[]> }
  transmissionCodes?: { position: number; mapping: Record<string, string[]> }
}

export interface VinBrandMapping {
  wmi: string[]
  brandSlug: string
  models: VinModelMapping[]
}
