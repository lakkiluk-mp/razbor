import { createGraphQLClient, queries, mutations } from '@razbor/graphql-client'

function getTelegramInitData(): string {
  return window.Telegram?.WebApp?.initData ?? ''
}

const graphqlClient = createGraphQLClient({
  url: '/api/graphql',
  isProduction: import.meta.env.PROD,
  getHeaders: (): Record<string, string> => {
    const initData = getTelegramInitData()
    if (initData) {
      return { 'x-telegram-init-data': initData }
    }
    return {}
  },
})

export const fetchGraphQL = graphqlClient.fetchGraphQL

export { queries, mutations }
