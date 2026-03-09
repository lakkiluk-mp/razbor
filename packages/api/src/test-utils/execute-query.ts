import { createYoga } from 'graphql-yoga'
import { schema } from '../schema'
import { prismaMock } from '../__mocks__/prisma'
import type { Context } from '../schema/builder'

const DEFAULT_USER = { id: 'test-user-id', telegramId: 123456n }

function buildContext(overrides?: Partial<Context>): Context {
  return {
    prisma: prismaMock,
    user: DEFAULT_USER,
    telegram: null,
    redis: null,
    ...overrides,
  }
}

function createTestYoga(contextOverrides?: Partial<Context>) {
  return createYoga({
    schema,
    context: () => buildContext(contextOverrides),
    maskedErrors: false,
    logging: false,
  })
}

async function executeRequest<T>(
  yoga: ReturnType<typeof createYoga>,
  query: string,
  variables?: Record<string, unknown>,
) {
  const response = await yoga.fetch('http://localhost/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  return (await response.json()) as { data?: T | null; errors?: readonly { message: string }[] }
}

export async function executeQuery<T = Record<string, unknown>>(
  source: string,
  variables?: Record<string, unknown>,
  contextOverrides?: Partial<Context>,
) {
  const yoga = createTestYoga(contextOverrides)
  return executeRequest<T>(yoga, source, variables)
}

export async function executeAsAnonymous<T = Record<string, unknown>>(
  source: string,
  variables?: Record<string, unknown>,
) {
  return executeQuery<T>(source, variables, { user: null })
}
