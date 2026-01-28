import {
  createGraphQLClient,
  queries,
  mutations,
} from '@razbor/graphql-client'
import type { GraphQLClient } from '@razbor/graphql-client'

export { queries, mutations }

export function createClient(url: string, isProduction = false): GraphQLClient {
  return createGraphQLClient({ url, isProduction })
}
