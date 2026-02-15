import { beforeEach } from 'vitest'
import { prismaMock } from '../__mocks__/prisma'

beforeEach(() => {
  Object.values(prismaMock).forEach((value) => {
    if (typeof value === 'object' && value !== null) {
      Object.values(value).forEach((fn) => {
        if (typeof fn === 'function' && 'mockClear' in fn) {
          ;(fn as { mockClear: () => void }).mockClear()
        }
      })
    }
    if (typeof value === 'function' && 'mockClear' in value) {
      ;(value as { mockClear: () => void }).mockClear()
    }
  })
})
