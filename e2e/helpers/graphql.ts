import type { Page, Route } from '@playwright/test'

const GRAPHQL_URL = '**/api/graphql'

interface GraphQLBody {
  query: string
  variables?: Record<string, unknown>
}

type OperationHandler = (variables: Record<string, unknown>) => unknown | Promise<unknown>

const pageHandlers = new WeakMap<Page, Record<string, OperationHandler>>()
const pageRouted = new WeakSet<Page>()

export async function mockGraphQL(
  page: Page,
  handlers: Record<string, OperationHandler>,
) {
  let current = pageHandlers.get(page)
  if (current) {
    Object.assign(current, handlers)
  } else {
    current = { ...handlers }
    pageHandlers.set(page, current)
  }

  if (!pageRouted.has(page)) {
    pageRouted.add(page)
    await page.route(GRAPHQL_URL, async (route: Route) => {
      const request = route.request()
      let body: GraphQLBody

      try {
        body = JSON.parse(request.postData() ?? '{}') as GraphQLBody
      } catch {
        await route.continue()
        return
      }

      const operationMatch = body.query.match(
        /(?:query|mutation)\s+(\w+)/,
      )
      const operationName = operationMatch?.[1]
      const activeHandlers = pageHandlers.get(page)

      if (operationName && activeHandlers?.[operationName]) {
        const data = await activeHandlers[operationName](body.variables ?? {})
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data }),
        })
        return
      }

      await route.continue()
    })
  }
}

export async function fetchGraphQLStaging<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch('https://vrazbore.tech/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  const json = (await response.json()) as { data: T }
  return json.data
}
