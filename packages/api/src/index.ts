import { createYoga } from 'graphql-yoga'
import { schema } from './schema'
import { prisma } from '@razbor/db'

export const yoga = createYoga({
  schema,
  context: () => ({
    prisma,
  }),
  graphqlEndpoint: '/api/graphql',
  graphiql: process.env.NODE_ENV !== 'production',
})

export { schema } from './schema'
export { prisma } from '@razbor/db'
