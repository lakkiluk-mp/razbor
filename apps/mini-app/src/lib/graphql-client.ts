import { createGraphQLClient, queries, mutations } from '@razbor/graphql-client'

const graphqlClient = createGraphQLClient({
  url: '/api/graphql',
  isProduction: import.meta.env.PROD,
})

export const fetchGraphQL = graphqlClient.fetchGraphQL

export { queries, mutations }
