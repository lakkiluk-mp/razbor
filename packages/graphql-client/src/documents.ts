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
          oemCode
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
          oemCode
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
        trialCredits
        subscriptionCredits
        totalCredits
        hasActiveSubscription
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
  me: `
    query GetMe {
      me {
        id
        firstName
        lastName
        username
        isPremium
        totalCalculations
        trialCredits
        subscriptionCredits
        totalCredits
        subscription {
          id
          plan
          status
          credits
          creditsTotal
          currentPeriodEnd
          cancelAtPeriodEnd
          daysRemaining
        }
      }
    }
  `,
  myCalculations: `
    query GetMyCalculations($limit: Int, $offset: Int) {
      myCalculations(limit: $limit, offset: $offset) {
        id
        totalPrice
        damagedZonesCount
        createdAt
        brandName
        modelName
        generationName
        details {
          parts {
            name
            category
            included
            isDamaged
            price
          }
        }
      }
    }
  `,
  subscriptionPlans: `
    query GetSubscriptionPlans {
      subscriptionPlans {
        plan
        price
        label
        days
        credits
      }
    }
  `,
  mySubscription: `
    query GetMySubscription {
      mySubscription {
        id
        plan
        status
        credits
        creditsTotal
        currentPeriodStart
        currentPeriodEnd
        cancelAtPeriodEnd
        daysRemaining
      }
    }
  `,
  myPaymentMethods: `
    query GetMyPaymentMethods {
      myPaymentMethods {
        id
        cardLast4
        cardType
        expiryMonth
        expiryYear
        isDefault
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
            oemCode
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
  createSubscription: `
    mutation CreateSubscription($plan: SubscriptionPlan!) {
      createSubscription(plan: $plan) {
        confirmationToken
        subscriptionId
        paymentId
      }
    }
  `,
  cancelSubscription: `
    mutation CancelSubscription {
      cancelSubscription {
        id
        status
        cancelAtPeriodEnd
        currentPeriodEnd
        daysRemaining
      }
    }
  `,
  resumeSubscription: `
    mutation ResumeSubscription {
      resumeSubscription {
        id
        status
        cancelAtPeriodEnd
        currentPeriodEnd
        daysRemaining
      }
    }
  `,
  removePaymentMethod: `
    mutation RemovePaymentMethod($paymentMethodId: ID!) {
      removePaymentMethod(paymentMethodId: $paymentMethodId)
    }
  `,
}
