const DAMAGED_CONDITION_VALUES = new Set([
  'битый',
  'битая',
  'битое',
  'damaged',
  'аварийный',
  'аварийная',
  'аварийное',
])

const CONDITION_LABELS = new Set([
  'состояние',
  'condition',
  'техническое состояние',
])

const DAMAGED_PARAM_ID = 697
const DAMAGED_PARAM_VALUE = 17714

const TITLE_PATTERNS = [
  /(?<!\p{L})бит(?:ый|ая|ое|\.)(?!\p{L})/iu,
  /(?<!\p{L})не на ходу(?!\p{L})/iu,
  /(?<!\p{L})неисправн/iu,
  /(?<!\p{L})аварийн/iu,
  /(?<!\p{L})после\s*дтп(?!\p{L})/iu,
  /(?<!\p{L})треб(?:\.|ует)\s*ремонт/iu,
  /(?<!\p{L})на\s+запчасти(?!\p{L})/iu,
  /(?<!\p{L})поврежд[её]н/iu,
  /(?<!\p{L})под\s+разбор(?!\p{L})/iu,
  /(?<!\p{L})в\s+разбор(?!\p{L})/iu,
  /(?<!\p{L})тотал(?:ь|ьн)?(?!\p{L})/iu,
  /(?<!\p{L})утопленник/iu,
]

function checkParams(params: unknown): boolean {
  if (!Array.isArray(params)) return false

  for (const p of params) {
    if (typeof p !== 'object' || p === null) continue
    const param = p as Record<string, unknown>

    const paramId = param.id ?? param.paramId
    if ((typeof paramId === 'number' || typeof paramId === 'string') && Number(paramId) === DAMAGED_PARAM_ID) {
      const val = param.value ?? param.flatValuesStr ?? param.valueId
      if ((typeof val === 'number' || typeof val === 'string') && Number(val) === DAMAGED_PARAM_VALUE) return true
      if (typeof val === 'string' && DAMAGED_CONDITION_VALUES.has(val.toLowerCase().trim())) return true
    }

    const label = String(param.label ?? param.name ?? '').toLowerCase().trim()
    if (CONDITION_LABELS.has(label)) {
      const val = String(param.value ?? param.text ?? '').toLowerCase().trim()
      if (DAMAGED_CONDITION_VALUES.has(val)) return true
    }
  }

  return false
}

function checkJsonFields(item: Record<string, unknown>): boolean {
  if (typeof item.condition === 'string') {
    const val = item.condition.toLowerCase()
    if (DAMAGED_CONDITION_VALUES.has(val) || val.includes('битый') || val.includes('аварийн')) return true
  }

  if (item.damaged === true || item.isDamaged === true) return true

  const iva = typeof item.iva === 'object' && item.iva !== null ? (item.iva as Record<string, unknown>) : undefined
  if (checkParams(item.params)) return true
  if (iva && checkParams(iva.params)) return true

  const badges = item.badges ?? iva?.badges
  if (Array.isArray(badges)) {
    for (const badge of badges) {
      if (typeof badge === 'object' && badge !== null) {
        const b = badge as Record<string, unknown>
        const text = String(b.text ?? b.title ?? b.value ?? '').toLowerCase()
        if (text.includes('битый') || text.includes('аварийн')) return true
      }
      if (typeof badge === 'string' && (badge.toLowerCase().includes('битый') || badge.toLowerCase().includes('аварийн'))) return true
    }
  }

  return false
}

function checkTitle(title: string): boolean {
  for (const pattern of TITLE_PATTERNS) {
    if (pattern.test(title)) return true
  }
  return false
}

export function detectDamaged(item: Record<string, unknown>, title: string): boolean {
  if (checkJsonFields(item)) return true
  if (checkTitle(title)) return true
  return false
}
