import { vi } from 'vitest'

const createMockDelegate = () => ({
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  upsert: vi.fn(),
  count: vi.fn(),
})

export const prismaMock = {
  user: createMockDelegate(),
  subscription: createMockDelegate(),
  payment: createMockDelegate(),
  paymentMethod: createMockDelegate(),
  yooPayment: createMockDelegate(),
  usageLog: createMockDelegate(),
  calculation: createMockDelegate(),
  $transaction: vi.fn(),
} as unknown as import('@razbor/db').PrismaClient & {
  user: ReturnType<typeof createMockDelegate>
  subscription: ReturnType<typeof createMockDelegate>
  payment: ReturnType<typeof createMockDelegate>
  paymentMethod: ReturnType<typeof createMockDelegate>
  yooPayment: ReturnType<typeof createMockDelegate>
  usageLog: ReturnType<typeof createMockDelegate>
  calculation: ReturnType<typeof createMockDelegate>
  $transaction: ReturnType<typeof vi.fn>
}
