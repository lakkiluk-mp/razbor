import { createGraphQLClient, queries, mutations } from '@razbor/graphql-client'

function getTelegramInitData(): string {
  return window.Telegram?.WebApp?.initData ?? ''
}

const graphqlClient = createGraphQLClient({
  url: '/api/graphql',
  isProduction: import.meta.env.PROD,
  getHeaders: (): Record<string, string> => {
    const h: Record<string, string> = { 'ngrok-skip-browser-warning': '1' }
    const initData = getTelegramInitData()
    if (initData) {
      h['x-telegram-init-data'] = initData
    }
    return h
  },
})

export const fetchGraphQL = graphqlClient.fetchGraphQL

export { queries, mutations }
