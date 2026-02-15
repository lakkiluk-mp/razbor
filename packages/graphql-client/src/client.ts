export interface GraphQLClientConfig {
  url: string
  headers?: Record<string, string>
  getHeaders?: () => Record<string, string>
  isProduction?: boolean
}

export interface GraphQLError {
  message: string
  locations?: Array<{ line: number; column: number }>
  path?: Array<string | number>
  extensions?: Record<string, unknown>
}

export interface GraphQLResponse<T> {
  data?: T
  errors?: GraphQLError[]
}

export interface FetchOptions {
  cache?: RequestCache
}

export function createGraphQLClient(config: GraphQLClientConfig) {
  const { url, headers = {}, getHeaders, isProduction = false } = config

  async function fetchGraphQL<T>(
    query: string,
    variables?: Record<string, unknown>,
    options?: FetchOptions
  ): Promise<T> {
    const dynamicHeaders = getHeaders ? getHeaders() : {}
    let res: Response
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
          ...dynamicHeaders,
        },
        body: JSON.stringify({ query, variables }),
        cache: options?.cache ?? 'no-store',
      })
    } catch (error) {
      throw new Error(
        `Network error: ${error instanceof Error ? error.message : 'Unknown'}`
      )
    }

    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status} ${res.statusText}`)
    }

    let json: GraphQLResponse<T>
    try {
      json = await res.json()
    } catch {
      throw new Error('Invalid JSON response from server')
    }

    if (json.errors && json.errors.length > 0) {
      const gqlError = json.errors[0]
      const originalMessage = gqlError?.message || 'GraphQL Error'
      const hasBusinessCode = !!gqlError?.extensions?.code
      const errorMessage = isProduction && !hasBusinessCode
        ? 'Произошла ошибка при обработке запроса'
        : originalMessage
      const error = new Error(errorMessage)
      ;(error as Error & { originalMessage: string; code?: string }).originalMessage = originalMessage
      if (hasBusinessCode) {
        ;(error as Error & { code: string }).code = gqlError!.extensions!.code as string
      }
      throw error
    }

    if (!json.data) {
      throw new Error('No data returned from GraphQL')
    }

    return json.data
  }

  return { fetchGraphQL }
}

export type GraphQLClient = ReturnType<typeof createGraphQLClient>
