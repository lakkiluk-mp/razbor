export const CATEGORY_GROUPS = [
  { key: 'body_exterior', label: 'Кузов и оптика', categories: ['body', 'optics', 'glass'] },
  { key: 'interior', label: 'Салон', categories: ['interior'] },
  { key: 'engine', label: 'Двигатель', categories: ['engine', 'cooling'] },
  { key: 'transmission', label: 'Трансмиссия', categories: ['transmission'] },
  { key: 'suspension', label: 'Подвеска и ходовая', categories: ['suspension'] },
  { key: 'electrical', label: 'Электрика и прочее', categories: ['electrical', 'other'] },
] as const

const FALLBACK_GROUP_KEY = 'electrical'

interface CategoryGroup<T> {
  key: string
  label: string
  parts: T[]
}

export function groupPartsByCategory<T extends { part: { category: string } }>(
  parts: T[]
): CategoryGroup<T>[] {
  const categoryToGroupKey = new Map<string, string>()
  for (const group of CATEGORY_GROUPS) {
    for (const cat of group.categories) {
      categoryToGroupKey.set(cat, group.key)
    }
  }

  const grouped = new Map<string, T[]>()
  for (const group of CATEGORY_GROUPS) {
    grouped.set(group.key, [])
  }

  for (const item of parts) {
    const groupKey = categoryToGroupKey.get(item.part.category) ?? FALLBACK_GROUP_KEY
    const arr = grouped.get(groupKey)
    if (arr) arr.push(item)
  }

  return CATEGORY_GROUPS.reduce<CategoryGroup<T>[]>((acc, group) => {
    const groupParts = grouped.get(group.key) ?? []
    if (groupParts.length > 0) {
      acc.push({ key: group.key, label: group.label, parts: groupParts })
    }
    return acc
  }, [])
}
