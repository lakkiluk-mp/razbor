import { createYoga, type Plugin } from 'graphql-yoga'
import { GraphQLError } from 'graphql'
import { schema } from '@razbor/api'
import { prisma } from '@razbor/db'
import { authenticateUser } from './auth.js'
import type { Context } from '@razbor/api'

const isProduction = process.env.NODE_ENV === 'production'

function useGraphQLLogging(): Plugin {
  return {
    onExecute({ args }) {
      const op = args.operationName ?? 'anonymous'
      const user = (args.contextValue as unknown as Context).user
      const tgId = user?.telegramId?.toString() ?? 'anon'
      console.log(`[GraphQL] ${op} | user: ${tgId}`)
    },
  }
}

export const yoga = createYoga({
  schema,
  plugins: [useGraphQLLogging()],
  context: async ({ request }) => {
    const initDataRaw = request.headers.get('x-telegram-init-data')
    const user = initDataRaw ? await authenticateUser(initDataRaw, prisma) : null

    if (!user && isProduction) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      })
    }

    return { prisma, user }
  },
  graphqlEndpoint: '/api/graphql',
  graphiql: !isProduction,
})
