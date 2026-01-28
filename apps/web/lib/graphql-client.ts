import { createGraphQLClient, queries, mutations } from '@razbor/graphql-client'

function getGraphQLUrl() {
  if (typeof window !== 'undefined') {
    return '/api/graphql'
  }
  return process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/api/graphql'
}

const isProduction = process.env.NODE_ENV === 'production'

export const graphqlClient = createGraphQLClient({
  url: getGraphQLUrl(),
  isProduction,
})

export const fetchGraphQL = graphqlClient.fetchGraphQL

export { queries, mutations }
