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
              searchUrl
              sampleSize
            }
            liquidity {
              score
              totalListings
              medianAgeDays
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
              searchUrl
              sampleSize
            }
            liquidity {
              score
              totalListings
              medianAgeDays
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
        monitorSlotLimit
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
  adminStats: `
    query AdminStats {
      adminStats {
        totalUsers
        totalCalculations
        totalRevenue
        activeSubscriptions
        newUsersToday
        calculationsToday
      }
    }
  `,
  adminUsers: `
    query AdminUsers($limit: Int, $offset: Int, $search: String, $sortBy: String, $sortOrder: String) {
      adminUsers(limit: $limit, offset: $offset, search: $search, sortBy: $sortBy, sortOrder: $sortOrder) {
        items {
          id
          telegramId
          firstName
          lastName
          username
          isPremium
          trialCredits
          totalCalculations
          totalPayments
          activeSubscription
          activeMonitorCount
          createdAt
        }
        totalCount
      }
    }
  `,
  adminUser: `
    query AdminUser($id: ID!) {
      adminUser(id: $id) {
        id
        telegramId
        firstName
        lastName
        username
        isPremium
        trialCredits
        totalCalculations
        totalPayments
        activeSubscription
        activeMonitorCount
        createdAt
        calculations {
          id
          userId
          totalPrice
          damagedZonesCount
          createdAt
          userName
          userUsername
          brandName
          modelName
          generationName
        }
        yooPayments {
          id
          userId
          yooPaymentId
          amount
          currency
          status
          isRecurring
          createdAt
          userName
          userUsername
        }
        subscriptions {
          id
          userId
          plan
          status
          credits
          creditsTotal
          currentPeriodStart
          currentPeriodEnd
          cancelAtPeriodEnd
          createdAt
          userName
          userUsername
        }
        recentUsageLogs {
          id
          action
          metadata
          createdAt
        }
        monitorSubscriptions {
          id
          label
          brandSlug
          modelSlug
          city
          priceMin
          priceMax
          yearMin
          yearMax
          mileageMax
          searchRadius
          isActive
          notificationsSent
          lastNotifiedAt
          createdAt
          userId
          userFirstName
          userUsername
          userTelegramId
        }
      }
    }
  `,
  adminPayments: `
    query AdminPayments($limit: Int, $offset: Int, $sortBy: String, $sortOrder: String) {
      adminPayments(limit: $limit, offset: $offset, sortBy: $sortBy, sortOrder: $sortOrder) {
        items {
          id
          userId
          yooPaymentId
          amount
          currency
          status
          isRecurring
          createdAt
          userName
          userUsername
        }
        totalCount
      }
    }
  `,
  adminSubscriptions: `
    query AdminSubscriptions($limit: Int, $offset: Int, $status: String, $sortBy: String, $sortOrder: String) {
      adminSubscriptions(limit: $limit, offset: $offset, status: $status, sortBy: $sortBy, sortOrder: $sortOrder) {
        items {
          id
          userId
          plan
          status
          credits
          creditsTotal
          currentPeriodStart
          currentPeriodEnd
          cancelAtPeriodEnd
          createdAt
          userName
          userUsername
        }
        totalCount
      }
    }
  `,
  decodeVin: `
    query DecodeVin($vin: String!) {
      decodeVin(vin: $vin) {
        success
        vin
        year
        brand {
          slug
          name
        }
        model {
          slug
          name
        }
        generation {
          id
          slug
          name
          bodyType
        }
        suggestedConfigs {
          engines
          transmissions
          drivetrains
        }
        availableGenerations {
          id
          slug
          name
        }
        needsSelection {
          generation
          engine
          transmission
          drivetrain
        }
        error
      }
    }
  `,
  adminCalculations: `
    query AdminCalculations($limit: Int, $offset: Int, $userId: ID, $sortBy: String, $sortOrder: String) {
      adminCalculations(limit: $limit, offset: $offset, userId: $userId, sortBy: $sortBy, sortOrder: $sortOrder) {
        items {
          id
          userId
          totalPrice
          damagedZonesCount
          createdAt
          userName
          userUsername
          brandName
          modelName
          generationName
        }
        totalCount
      }
    }
  `,
  adminBroadcasts: `
    query AdminBroadcasts($limit: Int, $offset: Int) {
      adminBroadcasts(limit: $limit, offset: $offset) {
        items {
          id
          message
          imageUrls
          pinMessage
          status
          totalUsers
          sentCount
          failedCount
          createdAt
        }
        totalCount
      }
    }
  `,
  monitorSubscriptions: `
    query MonitorSubscriptions {
      monitorSubscriptions {
        id
        label
        brandSlug
        modelSlug
        city
        priceMin
        priceMax
        yearMin
        yearMax
        mileageMax
        searchRadius
        isActive
        notificationsSent
        lastNotifiedAt
        createdAt
      }
    }
  `,
  monitorSubscription: `
    query MonitorSubscription($id: ID!) {
      monitorSubscription(id: $id) {
        id
        label
        brandSlug
        modelSlug
        city
        priceMin
        priceMax
        yearMin
        yearMax
        mileageMax
        searchRadius
        isActive
        notificationsSent
        lastNotifiedAt
        createdAt
        updatedAt
      }
    }
  `,
  monitorCities: `
    query MonitorCities {
      monitorCities {
        name
        slug
      }
    }
  `,
  adminMonitorStats: `
    query AdminMonitorStats {
      adminMonitorStats {
        totalMonitorUsers
        totalSubscriptions
        activeSubscriptions
        totalNotificationsSent
        uniqueGroups
      }
    }
  `,
  adminMonitorSubscriptions: `
    query AdminMonitorSubscriptions($limit: Int, $offset: Int, $isActive: Boolean, $search: String, $sortBy: String, $sortOrder: String) {
      adminMonitorSubscriptions(limit: $limit, offset: $offset, isActive: $isActive, search: $search, sortBy: $sortBy, sortOrder: $sortOrder) {
        items {
          id
          label
          brandSlug
          modelSlug
          city
          priceMin
          priceMax
          yearMin
          yearMax
          mileageMax
          searchRadius
          isActive
          notificationsSent
          lastNotifiedAt
          createdAt
          userId
          userFirstName
          userUsername
          userTelegramId
        }
        totalCount
      }
    }
  `,
  adminMonitorLogs: `
    query AdminMonitorLogs($limit: Int, $offset: Int, $level: String, $type: String, $sortBy: String, $sortOrder: String) {
      adminMonitorLogs(limit: $limit, offset: $offset, level: $level, type: $type, sortBy: $sortBy, sortOrder: $sortOrder) {
        items {
          id
          type
          level
          brandSlug
          modelSlug
          message
          meta
          createdAt
        }
        totalCount
      }
    }
  `,
  adminMonitorSettings: `
    query AdminMonitorSettings {
      adminMonitorSettings {
        freeSlotsClosed
        freeSlotsBlocked
        regionCrawlPaused
      }
    }
  `,
  adminRegionCrawlStats: `
    query AdminRegionCrawlStats {
      adminRegionCrawlStats {
        regionSlug
        regionName
        totalListings
        activeListings
        lastSeenAt
      }
    }
  `,
  adminUserAnalytics: `
    query AdminUserAnalytics($days: Int) {
      adminUserAnalytics(days: $days) {
        dailyStats {
          date
          newUsers
          calculations
          activeUsers
          calculationsPerUser
          conversionRate
        }
        totals {
          dau
          wau
          mau
          newToday
          newWeek
          newMonth
        }
      }
    }
  `,
  adminRetention: `
    query AdminRetention($cohortDays: Int) {
      adminRetention(cohortDays: $cohortDays) {
        cohorts {
          cohortDate
          cohortSize
          retainedDay1
          retainedDay7
          retainedDay30
          rateDay1
          rateDay7
          rateDay30
        }
        averageDay1
        averageDay7
        averageDay30
      }
    }
  `,
  adminSearchWatches: `
    query AdminSearchWatches {
      adminSearchWatches {
        id
        label
        url
        isActive
        notificationsSent
        lastNotifiedAt
        lastCrawledAt
        createdAt
      }
    }
  `,
  monitorRegions: `
    query MonitorRegions {
      monitorRegions {
        name
        slug
      }
    }
  `,
  regionListings: `
    query RegionListings($regionSlug: String!, $limit: Int, $offset: Int, $brand: String, $minProfit: Int, $hideDamaged: Boolean, $hideInactive: Boolean, $sortBy: RegionListingSortBy) {
      regionListings(regionSlug: $regionSlug, limit: $limit, offset: $offset, brand: $brand, minProfit: $minProfit, hideDamaged: $hideDamaged, hideInactive: $hideInactive, sortBy: $sortBy) {
        id
        extId
        title
        brand
        model
        engineVolume
        transmission
        price
        year
        url
        city
        imageUrl
        publishedAt
        sellerType
        mileage
        isDamaged
        isActive
        generationId
        configGroups
        estimateMin
        estimateMax
        estimateAvg
        estimateExact
        profit
        profitPercent
        regionSlug
      }
    }
  `,
  regionListing: `
    query RegionListing($id: String!) {
      regionListing(id: $id) {
        id
        extId
        title
        brand
        model
        engineVolume
        transmission
        price
        year
        url
        city
        imageUrl
        publishedAt
        sellerType
        mileage
        isDamaged
        isActive
        generationId
        configGroups
        estimateMin
        estimateMax
        estimateAvg
        estimateExact
        profit
        profitPercent
        regionSlug
      }
    }
  `,
  regionBrands: `
    query RegionBrands($regionSlug: String!) {
      regionBrands(regionSlug: $regionSlug)
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
                searchUrl
                sampleSize
              }
              liquidity {
                score
                totalListings
                medianAgeDays
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
  createBroadcast: `
    mutation CreateBroadcast($message: String, $imageUrls: [String!], $pinMessage: Boolean) {
      createBroadcast(message: $message, imageUrls: $imageUrls, pinMessage: $pinMessage) {
        id
        message
        imageUrls
        pinMessage
        status
        totalUsers
        sentCount
        failedCount
        createdAt
      }
    }
  `,
  sendBroadcast: `
    mutation SendBroadcast($id: ID!) {
      sendBroadcast(id: $id) {
        id
        status
        totalUsers
        sentCount
        failedCount
      }
    }
  `,
  cancelBroadcast: `
    mutation CancelBroadcast($id: ID!) {
      cancelBroadcast(id: $id) {
        id
        status
        sentCount
        failedCount
      }
    }
  `,
  createMonitorSubscription: `
    mutation CreateMonitorSubscription($input: CreateMonitorSubscriptionInput!) {
      createMonitorSubscription(input: $input) {
        id
        label
        brandSlug
        modelSlug
        city
        priceMin
        priceMax
        yearMin
        yearMax
        mileageMax
        searchRadius
        isActive
        createdAt
      }
    }
  `,
  updateMonitorSubscription: `
    mutation UpdateMonitorSubscription($id: ID!, $input: UpdateMonitorSubscriptionInput!) {
      updateMonitorSubscription(id: $id, input: $input) {
        id
        label
        brandSlug
        modelSlug
        city
        priceMin
        priceMax
        yearMin
        yearMax
        mileageMax
        searchRadius
        isActive
      }
    }
  `,
  deleteMonitorSubscription: `
    mutation DeleteMonitorSubscription($id: ID!) {
      deleteMonitorSubscription(id: $id)
    }
  `,
  pauseMonitorSubscription: `
    mutation PauseMonitorSubscription($id: ID!) {
      pauseMonitorSubscription(id: $id) {
        id
        isActive
      }
    }
  `,
  adminSetFreeSlotsClosed: `
    mutation AdminSetFreeSlotsClosed($closed: Boolean!) {
      adminSetFreeSlotsClosed(closed: $closed) {
        freeSlotsClosed
        freeSlotsBlocked
      }
    }
  `,
  adminStopFreeSlots: `
    mutation AdminStopFreeSlots {
      adminStopFreeSlots {
        deactivatedCount
        settings {
          freeSlotsClosed
          freeSlotsBlocked
        }
      }
    }
  `,
  adminResumeFreeSlots: `
    mutation AdminResumeFreeSlots {
      adminResumeFreeSlots {
        freeSlotsClosed
        freeSlotsBlocked
      }
    }
  `,
  adminToggleMonitorSubscription: `
    mutation AdminToggleMonitorSubscription($id: ID!) {
      adminToggleMonitorSubscription(id: $id)
    }
  `,
  logAppOpen: `
    mutation LogAppOpen {
      logAppOpen
    }
  `,
  createAdminSearchWatch: `
    mutation CreateAdminSearchWatch($input: CreateAdminSearchWatchInput!) {
      createAdminSearchWatch(input: $input) {
        id
        label
        url
        isActive
        createdAt
      }
    }
  `,
  deleteAdminSearchWatch: `
    mutation DeleteAdminSearchWatch($id: ID!) {
      deleteAdminSearchWatch(id: $id)
    }
  `,
  toggleAdminSearchWatch: `
    mutation ToggleAdminSearchWatch($id: ID!) {
      toggleAdminSearchWatch(id: $id) {
        id
        isActive
      }
    }
  `,
  adminSetRegionCrawlPaused: `
    mutation AdminSetRegionCrawlPaused($paused: Boolean!) {
      adminSetRegionCrawlPaused(paused: $paused) {
        freeSlotsClosed
        freeSlotsBlocked
        regionCrawlPaused
      }
    }
  `,
}
