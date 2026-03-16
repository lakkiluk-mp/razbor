export const FREE_USER = {
  me: {
    id: 'test-user-1',
    firstName: 'Test',
    lastName: 'User',
    username: 'test_user',
    isPremium: false,
    totalCalculations: 2,
    trialCredits: 1,
    subscriptionCredits: 0,
    totalCredits: 1,
    subscription: null,
  },
}

export const FREE_USER_ZERO_CREDITS = {
  me: {
    id: 'test-user-1',
    firstName: 'Test',
    lastName: 'User',
    username: 'test_user',
    isPremium: false,
    totalCalculations: 3,
    trialCredits: 0,
    subscriptionCredits: 0,
    totalCredits: 0,
    subscription: null,
  },
}

export const PREMIUM_USER = {
  me: {
    id: 'test-user-2',
    firstName: 'Premium',
    lastName: 'User',
    username: 'premium_user',
    isPremium: true,
    totalCalculations: 10,
    trialCredits: 0,
    subscriptionCredits: 20,
    totalCredits: 20,
    subscription: {
      id: 'sub-1',
      plan: 'monthly',
      status: 'active',
      credits: 20,
      creditsTotal: 60,
      currentPeriodEnd: new Date(Date.now() + 25 * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
      daysRemaining: 25,
    },
  },
}

export const PREMIUM_USER_CANCELLING = {
  me: {
    ...PREMIUM_USER.me,
    subscription: {
      ...PREMIUM_USER.me.subscription,
      cancelAtPeriodEnd: true,
    },
  },
}

export const USAGE_FREE_WITH_CREDITS = {
  usageInfo: {
    trialCredits: 2,
    subscriptionCredits: 0,
    totalCredits: 2,
    hasActiveSubscription: false,
  },
}

export const USAGE_FREE_NO_CREDITS = {
  usageInfo: {
    trialCredits: 0,
    subscriptionCredits: 0,
    totalCredits: 0,
    hasActiveSubscription: false,
  },
}

export const USAGE_PREMIUM = {
  usageInfo: {
    trialCredits: 0,
    subscriptionCredits: 20,
    totalCredits: 20,
    hasActiveSubscription: true,
  },
}

export const SUBSCRIPTION_PLANS = {
  subscriptionPlans: [
    {
      plan: 'weekly',
      price: 249,
      label: '1 неделя',
      days: 7,
      credits: 15,
    },
    {
      plan: 'monthly',
      price: 799,
      label: '1 месяц',
      days: 30,
      credits: 60,
    },
  ],
}

export const MY_SUBSCRIPTION_ACTIVE = {
  mySubscription: {
    id: 'sub-1',
    plan: 'monthly',
    status: 'active',
    credits: 20,
    creditsTotal: 60,
    currentPeriodStart: new Date(Date.now() - 5 * 86400000).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 25 * 86400000).toISOString(),
    cancelAtPeriodEnd: false,
    daysRemaining: 25,
  },
}

export const MY_SUBSCRIPTION_CANCELLING = {
  mySubscription: {
    ...MY_SUBSCRIPTION_ACTIVE.mySubscription,
    cancelAtPeriodEnd: true,
  },
}

export const MY_SUBSCRIPTION_NONE = {
  mySubscription: null,
}

export const PAYMENT_METHODS = {
  myPaymentMethods: [
    {
      id: 'pm-1',
      cardLast4: '4242',
      cardType: 'Visa',
      expiryMonth: '12',
      expiryYear: '2027',
      isDefault: true,
    },
  ],
}

export const PAYMENT_METHODS_EMPTY = {
  myPaymentMethods: [],
}

export const BRANDS = {
  brands: [
    { id: '1', name: 'Lada', slug: 'lada', logo: null },
    { id: '2', name: 'Hyundai', slug: 'hyundai', logo: null },
    { id: '3', name: 'Kia', slug: 'kia', logo: null },
  ],
}

export const BRAND_LADA = {
  brand: {
    id: '1',
    name: 'Lada',
    slug: 'lada',
    logo: null,
    models: [
      { id: 'm1', name: 'Vesta', slug: 'vesta' },
      { id: 'm2', name: 'Granta', slug: 'granta' },
    ],
  },
}

export const MODEL_VESTA = {
  model: {
    id: 'm1',
    name: 'Vesta',
    slug: 'vesta',
    brand: { id: '1', name: 'Lada', slug: 'lada' },
    generations: [
      {
        id: 'g1',
        name: 'I (2015-2023)',
        slug: 'i-2015-2023-sedan',
        yearStart: 2015,
        yearEnd: 2023,
        bodyType: 'sedan',
      },
    ],
  },
}

export const GENERATION_CONFIGS_EMPTY = {
  generationConfigs: {
    engines: [],
    transmissions: [],
    drivetrains: [],
  },
}

export const GENERATION_BY_ID = {
  generation: {
    id: 'g1',
    name: 'I (2015-2023)',
    slug: 'i-2015-2023-sedan',
    yearStart: 2015,
    yearEnd: 2023,
    bodyType: 'sedan',
    model: {
      id: 'm1',
      name: 'Vesta',
      slug: 'vesta',
      brand: { id: '1', name: 'Lada', slug: 'lada' },
    },
    parts: [
      {
        id: 'p1',
        name: 'Бампер передний',
        category: 'body',
        oemCode: null,
        schematicZone: { id: 'sz1', code: 'front-bumper', name: 'Бампер передний', type: 'body' },
        price: { median: 5000, min: 3000, max: 8000, count: 15 },
      },
      {
        id: 'p2',
        name: 'Капот',
        category: 'body',
        oemCode: null,
        schematicZone: { id: 'sz2', code: 'hood', name: 'Капот', type: 'body' },
        price: { median: 7000, min: 4000, max: 12000, count: 10 },
      },
    ],
  },
}

export const CALCULATION_RESULT = {
  calculate: {
    totalPrice: 450000,
    parts: [
      {
        part: {
          id: 'p1',
          name: 'Бампер передний',
          category: 'body',
          oemCode: null,
          schematicZone: { id: 'sz1', code: 'front-bumper', name: 'Бампер передний' },
          price: { median: 5000, min: 3000, max: 8000, count: 15 },
        },
        included: true,
        isDamaged: false,
        price: 5000,
      },
      {
        part: {
          id: 'p2',
          name: 'Капот',
          category: 'body',
          oemCode: null,
          schematicZone: { id: 'sz2', code: 'hood', name: 'Капот' },
          price: { median: 7000, min: 4000, max: 12000, count: 10 },
        },
        included: true,
        isDamaged: false,
        price: 7000,
      },
    ],
  },
}

export const MY_CALCULATIONS = {
  myCalculations: [
    {
      id: 'calc-1',
      totalPrice: 487000,
      damagedZonesCount: 2,
      createdAt: '2026-02-12T10:00:00Z',
      brandName: 'Lada',
      modelName: 'Vesta',
      generationName: 'I (2015-2023) Sedan',
      details: {
        parts: [
          { name: 'Бампер передний', category: 'body', included: true, isDamaged: false, price: 5000 },
        ],
      },
    },
    {
      id: 'calc-2',
      totalPrice: 362000,
      damagedZonesCount: 1,
      createdAt: '2026-02-10T10:00:00Z',
      brandName: 'Hyundai',
      modelName: 'Solaris',
      generationName: 'II (2017-2023) Sedan',
      details: null,
    },
  ],
}

export const MY_CALCULATIONS_EMPTY = {
  myCalculations: [],
}

export const CREATE_SUBSCRIPTION_SUCCESS = {
  createSubscription: {
    confirmationToken: 'test-token-123',
    subscriptionId: 'sub-new-1',
    paymentId: 'pay-1',
  },
}

export const CANCEL_SUBSCRIPTION_SUCCESS = {
  cancelSubscription: {
    id: 'sub-1',
    status: 'active',
    cancelAtPeriodEnd: true,
    currentPeriodEnd: new Date(Date.now() + 25 * 86400000).toISOString(),
    daysRemaining: 25,
  },
}

export const RESUME_SUBSCRIPTION_SUCCESS = {
  resumeSubscription: {
    id: 'sub-1',
    status: 'active',
    cancelAtPeriodEnd: false,
    currentPeriodEnd: new Date(Date.now() + 25 * 86400000).toISOString(),
    daysRemaining: 25,
  },
}
