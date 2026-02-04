import { createYoga } from 'graphql-yoga'
import { schema } from '@razbor/api'
import { prisma } from '@razbor/db'
import { authenticateUser } from './auth.js'

export const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    const initDataRaw = request.headers.get('x-telegram-init-data')
    const user = initDataRaw ? await authenticateUser(initDataRaw, prisma) : null

    return { prisma, user }
  },
  graphqlEndpoint: '/api/graphql',
  graphiql: process.env.NODE_ENV !== 'production',
})
