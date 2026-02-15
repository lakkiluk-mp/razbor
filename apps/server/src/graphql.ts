import { createYoga, type Plugin } from 'graphql-yoga'
import { GraphQLError } from 'graphql'
import { schema } from '@razbor/api'
import { prisma } from '@razbor/db'
import { authenticateUser } from './auth.js'
import type { Context } from '@razbor/api'

const isProduction = process.env.NODE_ENV === 'production'
const allowWebAccess = process.env.ALLOW_WEB_ACCESS === 'true'

const recentLogs = new Map<string, number>()
const LOG_DEDUP_MS = 60_000

function useGraphQLLogging(): Plugin {
  return {
    onExecute({ args }) {
      const source = args.document.loc?.source?.body ?? ''
      const isMutation = source.trimStart().startsWith('mutation')
      if (!isMutation) return

      const op = args.operationName ?? 'anonymous'
      const user = (args.contextValue as unknown as Context).user
      const tgId = user?.telegramId?.toString() ?? 'anon'
      const username = user?.username

      const key = `${op}:${tgId}`
      const now = Date.now()
      const lastSeen = recentLogs.get(key)
      if (lastSeen && now - lastSeen < LOG_DEDUP_MS) return
      recentLogs.set(key, now)

      const who = username ? `@${username} (${tgId})` : tgId
      console.log(`[GraphQL] mutation ${op} | user: ${who}`)
    },
  }
}

export const yoga = createYoga({
  schema,
  plugins: [useGraphQLLogging()],
  context: async ({ request }) => {
    const initDataRaw = request.headers.get('x-telegram-init-data')
    let user = initDataRaw ? await authenticateUser(initDataRaw, prisma) : null

    if (!user && (!isProduction || allowWebAccess)) {
      user = await prisma.user.upsert({
        where: { telegramId: BigInt(999999999) },
        create: {
          telegramId: BigInt(999999999),
          firstName: 'Dev',
          lastName: 'User',
          username: 'dev_user',
          isPremium: false,
          trialCredits: 999,
        },
        update: {},
        select: { id: true, telegramId: true },
      })
    }

    if (!user && isProduction && !allowWebAccess) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      })
    }

    return { prisma, user }
  },
  graphqlEndpoint: '/api/graphql',
  graphiql: !isProduction,
})
