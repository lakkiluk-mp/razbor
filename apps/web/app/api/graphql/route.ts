import { createYoga } from 'graphql-yoga'
import { schema } from '@razbor/api'
import { prisma } from '@razbor/db'

const yoga = createYoga({
  schema,
  context: () => ({
    prisma,
    user: null,
  }),
  graphqlEndpoint: '/api/graphql',
  graphiql: process.env.NODE_ENV !== 'production',
})

export async function GET(request: Request) {
  return yoga.handleRequest(request, {})
}

export async function POST(request: Request) {
  return yoga.handleRequest(request, {})
}
