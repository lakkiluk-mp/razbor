import { useMutation } from '@tanstack/react-query'
import { mutations } from '@razbor/graphql-client'

export interface CalculateInput {
  generationId: string
  damagedZones: string[]
  excludedParts: string[]
  selectedEngine?: string | null
  selectedTransmission?: string | null
  selectedDrivetrain?: string | null
}

export interface CalculationPart {
  part: {
    id: string
    name: string
    category: string
    schematicZone: {
      id: string
      code: string
      name: string
    } | null
    price: {
      median: number
      min: number
      max: number
      count: number
      minPriceUrl?: string | null
      maxPriceUrl?: string | null
    } | null
  }
  included: boolean
  isDamaged: boolean
  price: number
}

export interface CalculationResult {
  totalPrice: number
  parts: CalculationPart[]
}

export interface CalculateResponse {
  calculate: CalculationResult
}

export function useCalculate(
  fetchFn: (query: string, variables?: unknown) => Promise<unknown>
) {
  return useMutation({
    mutationFn: (input: CalculateInput) =>
      fetchFn(mutations.calculate, { input }) as Promise<CalculateResponse>,
  })
}
