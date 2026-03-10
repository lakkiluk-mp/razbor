export type SortOrder = 'asc' | 'desc'

export function parseSortOrder(sortOrder: string | null | undefined): SortOrder {
  return sortOrder === 'asc' ? 'asc' : 'desc'
}

export function validateSortField(
  whitelist: readonly string[],
  sortBy: string | null | undefined,
): string {
  return sortBy && whitelist.includes(sortBy) ? sortBy : 'createdAt'
}
