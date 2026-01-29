import { useMutation } from '@tanstack/react-query'
import { mutations } from '@razbor/graphql-client'

export interface CalculateInput {
  generationId: string
  damagedZones: string[]
  excludedParts: string[]
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
