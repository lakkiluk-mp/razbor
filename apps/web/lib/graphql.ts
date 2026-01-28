function getGraphQLUrl() {
  if (typeof window !== 'undefined') {
    return '/api/graphql'
  }
  return process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/api/graphql'
}

export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const url = getGraphQLUrl()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })

  const json = await res.json()
  if (json.errors) {
    console.error('GraphQL errors:', json.errors)
    const errorMessage =
      process.env.NODE_ENV === 'production'
        ? 'Произошла ошибка при обработке запроса'
        : json.errors[0]?.message || 'GraphQL Error'
    throw new Error(errorMessage)
  }
  return json.data
}

export const queries = {
  brands: `
    query GetBrands {
      brands {
        id
        name
        slug
        logo
      }
    }
  `,
  brand: `
    query GetBrand($slug: String!) {
      brand(slug: $slug) {
        id
        name
        slug
        logo
        models {
          id
          name
          slug
        }
      }
    }
  `,
  model: `
    query GetModel($brandSlug: String!, $modelSlug: String!) {
      model(brandSlug: $brandSlug, modelSlug: $modelSlug) {
        id
        name
        slug
        brand {
          id
          name
          slug
        }
        generations {
          id
          name
          slug
          yearStart
          yearEnd
          bodyType
        }
      }
    }
  `,
  generation: `
    query GetGeneration($brandSlug: String!, $modelSlug: String!, $generationSlug: String!) {
      generation(brandSlug: $brandSlug, modelSlug: $modelSlug, generationSlug: $generationSlug) {
        id
        name
        slug
        yearStart
        yearEnd
        bodyType
        model {
          id
          name
          slug
          brand {
            id
            name
            slug
          }
        }
        parts {
          id
          name
          category
          schematicZone {
            id
            code
            name
            type
          }
          price {
            median
            min
            max
            count
          }
        }
      }
    }
  `,
  schematicZones: `
    query GetSchematicZones($bodyType: BodyType!) {
      schematicZones(bodyType: $bodyType) {
        id
        code
        name
        type
      }
    }
  `,
  usageInfo: `
    query GetUsageInfo {
      usageInfo {
        freeEstimatesUsed
        freeEstimatesLimit
        nextResetAt
      }
    }
  `,
}

export const mutations = {
  calculate: `
    mutation Calculate($input: CalculateInput!) {
      calculate(input: $input) {
        totalPrice
        parts {
          part {
            id
            name
            category
            schematicZone {
              id
              code
              name
            }
            price {
              median
            }
          }
          included
          isDamaged
          price
        }
      }
    }
  `,
}
