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
            minPriceUrl
            maxPriceUrl
            medianPriceUrl
            sources {
              source
              min
              max
              minPriceUrl
              maxPriceUrl
              sampleSize
            }
          }
        }
      }
    }
  `,
  generationById: `
    query GetGenerationById($id: String!) {
      generation: generationById(id: $id) {
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
            minPriceUrl
            maxPriceUrl
            medianPriceUrl
            sources {
              source
              min
              max
              minPriceUrl
              maxPriceUrl
              sampleSize
            }
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
        freeRemaining
        freeResetAt
        dailyLimit
      }
    }
  `,
  generationConfigs: `
    query GetGenerationConfigs($generationId: ID!) {
      generationConfigs(generationId: $generationId) {
        engines {
          configGroup
          name
          price
        }
        transmissions {
          configGroup
          name
          price
        }
        drivetrains {
          configGroup
          name
          price
        }
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
              min
              max
              count
              minPriceUrl
              maxPriceUrl
              medianPriceUrl
              sources {
                source
                min
                max
                minPriceUrl
                maxPriceUrl
                sampleSize
              }
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
