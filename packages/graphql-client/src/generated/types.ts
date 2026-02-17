export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
};

export type AdminCalculation = {
  __typename?: 'AdminCalculation';
  brandName: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  damagedZonesCount: Maybe<Scalars['Int']['output']>;
  generationName: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  modelName: Maybe<Scalars['String']['output']>;
  totalPrice: Maybe<Scalars['Int']['output']>;
  userId: Maybe<Scalars['String']['output']>;
  userName: Maybe<Scalars['String']['output']>;
  userUsername: Maybe<Scalars['String']['output']>;
};

export type AdminCalculationsList = {
  __typename?: 'AdminCalculationsList';
  items: Maybe<Array<AdminCalculation>>;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type AdminPayment = {
  __typename?: 'AdminPayment';
  amount: Maybe<Scalars['Int']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  currency: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  isRecurring: Maybe<Scalars['Boolean']['output']>;
  status: Maybe<Scalars['String']['output']>;
  userId: Maybe<Scalars['String']['output']>;
  userName: Maybe<Scalars['String']['output']>;
  userUsername: Maybe<Scalars['String']['output']>;
  yooPaymentId: Maybe<Scalars['String']['output']>;
};

export type AdminPaymentsList = {
  __typename?: 'AdminPaymentsList';
  items: Maybe<Array<AdminPayment>>;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type AdminStats = {
  __typename?: 'AdminStats';
  activeSubscriptions: Maybe<Scalars['Int']['output']>;
  calculationsToday: Maybe<Scalars['Int']['output']>;
  newUsersToday: Maybe<Scalars['Int']['output']>;
  totalCalculations: Maybe<Scalars['Int']['output']>;
  totalRevenue: Maybe<Scalars['Int']['output']>;
  totalUsers: Maybe<Scalars['Int']['output']>;
};

export type AdminSubscription = {
  __typename?: 'AdminSubscription';
  cancelAtPeriodEnd: Maybe<Scalars['Boolean']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  credits: Maybe<Scalars['Int']['output']>;
  creditsTotal: Maybe<Scalars['Int']['output']>;
  currentPeriodEnd: Maybe<Scalars['DateTime']['output']>;
  currentPeriodStart: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  plan: Maybe<SubscriptionPlan>;
  status: Maybe<SubscriptionStatus>;
  userId: Maybe<Scalars['String']['output']>;
  userName: Maybe<Scalars['String']['output']>;
  userUsername: Maybe<Scalars['String']['output']>;
};

export type AdminSubscriptionsList = {
  __typename?: 'AdminSubscriptionsList';
  items: Maybe<Array<AdminSubscription>>;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type AdminTelegramPayment = {
  __typename?: 'AdminTelegramPayment';
  amount: Maybe<Scalars['Int']['output']>;
  calculationsCount: Maybe<Scalars['Int']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  telegramPaymentId: Maybe<Scalars['String']['output']>;
  userId: Maybe<Scalars['String']['output']>;
  userName: Maybe<Scalars['String']['output']>;
  userUsername: Maybe<Scalars['String']['output']>;
};

export type AdminTelegramPaymentsList = {
  __typename?: 'AdminTelegramPaymentsList';
  items: Maybe<Array<AdminTelegramPayment>>;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type AdminUsageLog = {
  __typename?: 'AdminUsageLog';
  action: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  metadata: Maybe<Scalars['String']['output']>;
};

export type AdminUser = {
  __typename?: 'AdminUser';
  activeSubscription: Maybe<Scalars['Boolean']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  firstName: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  isPremium: Maybe<Scalars['Boolean']['output']>;
  lastName: Maybe<Scalars['String']['output']>;
  telegramId: Maybe<Scalars['String']['output']>;
  totalCalculations: Maybe<Scalars['Int']['output']>;
  totalPayments: Maybe<Scalars['Int']['output']>;
  trialCredits: Maybe<Scalars['Int']['output']>;
  username: Maybe<Scalars['String']['output']>;
};

export type AdminUserDetail = {
  __typename?: 'AdminUserDetail';
  activeSubscription: Maybe<Scalars['Boolean']['output']>;
  calculations: Maybe<Array<AdminCalculation>>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  firstName: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  isPremium: Maybe<Scalars['Boolean']['output']>;
  lastName: Maybe<Scalars['String']['output']>;
  recentUsageLogs: Maybe<Array<AdminUsageLog>>;
  subscriptions: Maybe<Array<AdminSubscription>>;
  telegramId: Maybe<Scalars['String']['output']>;
  telegramPayments: Maybe<Array<AdminTelegramPayment>>;
  totalCalculations: Maybe<Scalars['Int']['output']>;
  totalPayments: Maybe<Scalars['Int']['output']>;
  trialCredits: Maybe<Scalars['Int']['output']>;
  username: Maybe<Scalars['String']['output']>;
  yooPayments: Maybe<Array<AdminPayment>>;
};

export type AdminUsersList = {
  __typename?: 'AdminUsersList';
  items: Maybe<Array<AdminUser>>;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type BodyType =
  | 'coupe'
  | 'crossover'
  | 'hatchback'
  | 'liftback'
  | 'minivan'
  | 'pickup'
  | 'sedan'
  | 'suv'
  | 'wagon';

export type Brand = {
  __typename?: 'Brand';
  id: Maybe<Scalars['ID']['output']>;
  logo: Maybe<Scalars['String']['output']>;
  models: Maybe<Array<Model>>;
  name: Maybe<Scalars['String']['output']>;
  slug: Maybe<Scalars['String']['output']>;
};

export type CalculateInput = {
  damagedZones: Array<Scalars['String']['input']>;
  excludedParts?: InputMaybe<Array<Scalars['ID']['input']>>;
  generationId: Scalars['ID']['input'];
  selectedDrivetrain?: InputMaybe<Scalars['String']['input']>;
  selectedEngine?: InputMaybe<Scalars['String']['input']>;
  selectedTransmission?: InputMaybe<Scalars['String']['input']>;
};

export type CalculationDetailPart = {
  __typename?: 'CalculationDetailPart';
  category: Maybe<Scalars['String']['output']>;
  included: Maybe<Scalars['Boolean']['output']>;
  isDamaged: Maybe<Scalars['Boolean']['output']>;
  name: Maybe<Scalars['String']['output']>;
  price: Maybe<Scalars['Int']['output']>;
};

export type CalculationDetails = {
  __typename?: 'CalculationDetails';
  parts: Maybe<Array<CalculationDetailPart>>;
};

export type CalculationHistoryItem = {
  __typename?: 'CalculationHistoryItem';
  bodyType: Maybe<BodyType>;
  brandName: Maybe<Scalars['String']['output']>;
  brandSlug: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  damagedZonesCount: Maybe<Scalars['Int']['output']>;
  details: Maybe<CalculationDetails>;
  generationName: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  modelName: Maybe<Scalars['String']['output']>;
  totalPrice: Maybe<Scalars['Int']['output']>;
};

export type CalculationPart = {
  __typename?: 'CalculationPart';
  included: Maybe<Scalars['Boolean']['output']>;
  isDamaged: Maybe<Scalars['Boolean']['output']>;
  part: Maybe<PartWithPrice>;
  price: Maybe<Scalars['Int']['output']>;
};

export type CalculationResult = {
  __typename?: 'CalculationResult';
  parts: Maybe<Array<CalculationPart>>;
  totalPrice: Maybe<Scalars['Int']['output']>;
};

export type ConfigOption = {
  __typename?: 'ConfigOption';
  configGroup: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  price: Maybe<Scalars['Int']['output']>;
};

export type CreateSubscriptionResult = {
  __typename?: 'CreateSubscriptionResult';
  confirmationToken: Maybe<Scalars['String']['output']>;
  paymentId: Maybe<Scalars['String']['output']>;
  subscriptionId: Maybe<Scalars['String']['output']>;
};

export type Generation = {
  __typename?: 'Generation';
  bodyType: Maybe<BodyType>;
  id: Maybe<Scalars['ID']['output']>;
  model: Maybe<Model>;
  name: Maybe<Scalars['String']['output']>;
  parts: Maybe<Array<PartWithPrice>>;
  slug: Maybe<Scalars['String']['output']>;
  yearEnd: Maybe<Scalars['Int']['output']>;
  yearStart: Maybe<Scalars['Int']['output']>;
};

export type GenerationConfigs = {
  __typename?: 'GenerationConfigs';
  drivetrains: Maybe<Array<ConfigOption>>;
  engines: Maybe<Array<ConfigOption>>;
  transmissions: Maybe<Array<ConfigOption>>;
};

export type Model = {
  __typename?: 'Model';
  brand: Maybe<Brand>;
  generations: Maybe<Array<Generation>>;
  id: Maybe<Scalars['ID']['output']>;
  name: Maybe<Scalars['String']['output']>;
  slug: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  calculate: Maybe<CalculationResult>;
  cancelSubscription: Maybe<SubscriptionInfo>;
  createSubscription: Maybe<CreateSubscriptionResult>;
  removePaymentMethod: Maybe<Scalars['Boolean']['output']>;
  resumeSubscription: Maybe<SubscriptionInfo>;
};


export type MutationCalculateArgs = {
  input: CalculateInput;
};


export type MutationCreateSubscriptionArgs = {
  plan: SubscriptionPlan;
};


export type MutationRemovePaymentMethodArgs = {
  paymentMethodId: Scalars['ID']['input'];
};

export type Part = {
  __typename?: 'Part';
  category: Maybe<PartCategory>;
  configGroup: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  name: Maybe<Scalars['String']['output']>;
  schematicZone: Maybe<SchematicZone>;
  slug: Maybe<Scalars['String']['output']>;
};

export type PartCategory =
  | 'body'
  | 'cooling'
  | 'electrical'
  | 'engine'
  | 'glass'
  | 'interior'
  | 'optics'
  | 'other'
  | 'suspension'
  | 'transmission';

export type PartWithPrice = {
  __typename?: 'PartWithPrice';
  category: Maybe<PartCategory>;
  configGroup: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  isShared: Maybe<Scalars['Boolean']['output']>;
  name: Maybe<Scalars['String']['output']>;
  oemCode: Maybe<Scalars['String']['output']>;
  price: Maybe<Price>;
  schematicZone: Maybe<SchematicZone>;
};

export type PaymentMethodInfo = {
  __typename?: 'PaymentMethodInfo';
  cardLast4: Maybe<Scalars['String']['output']>;
  cardType: Maybe<Scalars['String']['output']>;
  expiryMonth: Maybe<Scalars['String']['output']>;
  expiryYear: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  isDefault: Maybe<Scalars['Boolean']['output']>;
};

export type Price = {
  __typename?: 'Price';
  count: Maybe<Scalars['Int']['output']>;
  max: Maybe<Scalars['Int']['output']>;
  maxPriceUrl: Maybe<Scalars['String']['output']>;
  median: Maybe<Scalars['Int']['output']>;
  medianPriceUrl: Maybe<Scalars['String']['output']>;
  min: Maybe<Scalars['Int']['output']>;
  minPriceUrl: Maybe<Scalars['String']['output']>;
  sources: Maybe<Array<SourcePrice>>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type Query = {
  __typename?: 'Query';
  adminCalculations: Maybe<AdminCalculationsList>;
  adminPayments: Maybe<AdminPaymentsList>;
  adminStats: Maybe<AdminStats>;
  adminSubscriptions: Maybe<AdminSubscriptionsList>;
  adminTelegramPayments: Maybe<AdminTelegramPaymentsList>;
  adminUser: Maybe<AdminUserDetail>;
  adminUsers: Maybe<AdminUsersList>;
  brand: Maybe<Brand>;
  brands: Maybe<Array<Brand>>;
  generation: Maybe<Generation>;
  generationById: Maybe<Generation>;
  generationConfigs: Maybe<GenerationConfigs>;
  me: Maybe<UserProfile>;
  model: Maybe<Model>;
  myCalculations: Maybe<Array<CalculationHistoryItem>>;
  myPaymentMethods: Maybe<Array<PaymentMethodInfo>>;
  mySubscription: Maybe<SubscriptionInfo>;
  schematicZones: Maybe<Array<SchematicZone>>;
  subscriptionPlans: Maybe<Array<SubscriptionPlanInfo>>;
  usageInfo: Maybe<UsageInfo>;
};


export type QueryAdminCalculationsArgs = {
  limit: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  userId: InputMaybe<Scalars['ID']['input']>;
};


export type QueryAdminPaymentsArgs = {
  limit: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAdminSubscriptionsArgs = {
  limit: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  status: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminTelegramPaymentsArgs = {
  limit: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAdminUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAdminUsersArgs = {
  limit: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
};


export type QueryBrandArgs = {
  slug: Scalars['String']['input'];
};


export type QueryGenerationArgs = {
  brandSlug: Scalars['String']['input'];
  generationSlug: Scalars['String']['input'];
  modelSlug: Scalars['String']['input'];
};


export type QueryGenerationByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGenerationConfigsArgs = {
  generationId: Scalars['ID']['input'];
};


export type QueryModelArgs = {
  brandSlug: Scalars['String']['input'];
  modelSlug: Scalars['String']['input'];
};


export type QueryMyCalculationsArgs = {
  limit: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySchematicZonesArgs = {
  bodyType: BodyType;
};

export type SchematicZone = {
  __typename?: 'SchematicZone';
  code: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  name: Maybe<Scalars['String']['output']>;
  type: Maybe<ZoneType>;
};

export type SourcePrice = {
  __typename?: 'SourcePrice';
  max: Maybe<Scalars['Int']['output']>;
  maxPriceUrl: Maybe<Scalars['String']['output']>;
  min: Maybe<Scalars['Int']['output']>;
  minPriceUrl: Maybe<Scalars['String']['output']>;
  sampleSize: Maybe<Scalars['Int']['output']>;
  searchUrl: Maybe<Scalars['String']['output']>;
  source: Maybe<Scalars['String']['output']>;
};

export type SubscriptionInfo = {
  __typename?: 'SubscriptionInfo';
  cancelAtPeriodEnd: Maybe<Scalars['Boolean']['output']>;
  credits: Maybe<Scalars['Int']['output']>;
  creditsTotal: Maybe<Scalars['Int']['output']>;
  currentPeriodEnd: Maybe<Scalars['DateTime']['output']>;
  currentPeriodStart: Maybe<Scalars['DateTime']['output']>;
  daysRemaining: Maybe<Scalars['Int']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  plan: Maybe<SubscriptionPlan>;
  status: Maybe<SubscriptionStatus>;
};

export type SubscriptionPlan =
  | 'monthly'
  | 'weekly';

export type SubscriptionPlanInfo = {
  __typename?: 'SubscriptionPlanInfo';
  credits: Maybe<Scalars['Int']['output']>;
  days: Maybe<Scalars['Int']['output']>;
  label: Maybe<Scalars['String']['output']>;
  plan: Maybe<Scalars['String']['output']>;
  price: Maybe<Scalars['Int']['output']>;
};

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'expired'
  | 'past_due';

export type UsageInfo = {
  __typename?: 'UsageInfo';
  hasActiveSubscription: Maybe<Scalars['Boolean']['output']>;
  subscriptionCredits: Maybe<Scalars['Int']['output']>;
  totalCredits: Maybe<Scalars['Int']['output']>;
  trialCredits: Maybe<Scalars['Int']['output']>;
};

export type UserProfile = {
  __typename?: 'UserProfile';
  firstName: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  isPremium: Maybe<Scalars['Boolean']['output']>;
  lastName: Maybe<Scalars['String']['output']>;
  subscription: Maybe<SubscriptionInfo>;
  subscriptionCredits: Maybe<Scalars['Int']['output']>;
  totalCalculations: Maybe<Scalars['Int']['output']>;
  totalCredits: Maybe<Scalars['Int']['output']>;
  trialCredits: Maybe<Scalars['Int']['output']>;
  username: Maybe<Scalars['String']['output']>;
};

export type ZoneType =
  | 'exterior'
  | 'interior'
  | 'mechanical';

export type CalculateMutationVariables = Exact<{
  input: CalculateInput;
}>;


export type CalculateMutation = { __typename?: 'Mutation', calculate: { __typename?: 'CalculationResult', totalPrice: number | null, parts: Array<{ __typename?: 'CalculationPart', included: boolean | null, isDamaged: boolean | null, price: number | null, part: { __typename?: 'PartWithPrice', id: string | null, name: string | null, category: PartCategory | null, schematicZone: { __typename?: 'SchematicZone', id: string | null, code: string | null, name: string | null } | null, price: { __typename?: 'Price', median: number | null } | null } | null }> | null } | null };

export type CreateSubscriptionMutationVariables = Exact<{
  plan: SubscriptionPlan;
}>;


export type CreateSubscriptionMutation = { __typename?: 'Mutation', createSubscription: { __typename?: 'CreateSubscriptionResult', confirmationToken: string | null, subscriptionId: string | null, paymentId: string | null } | null };

export type CancelSubscriptionMutationVariables = Exact<{ [key: string]: never; }>;


export type CancelSubscriptionMutation = { __typename?: 'Mutation', cancelSubscription: { __typename?: 'SubscriptionInfo', id: string | null, status: SubscriptionStatus | null, cancelAtPeriodEnd: boolean | null, currentPeriodEnd: string | null, daysRemaining: number | null } | null };

export type ResumeSubscriptionMutationVariables = Exact<{ [key: string]: never; }>;


export type ResumeSubscriptionMutation = { __typename?: 'Mutation', resumeSubscription: { __typename?: 'SubscriptionInfo', id: string | null, status: SubscriptionStatus | null, cancelAtPeriodEnd: boolean | null, currentPeriodEnd: string | null, daysRemaining: number | null } | null };

export type RemovePaymentMethodMutationVariables = Exact<{
  paymentMethodId: Scalars['ID']['input'];
}>;


export type RemovePaymentMethodMutation = { __typename?: 'Mutation', removePaymentMethod: boolean | null };

export type GetBrandsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBrandsQuery = { __typename?: 'Query', brands: Array<{ __typename?: 'Brand', id: string | null, name: string | null, slug: string | null, logo: string | null }> | null };

export type GetBrandQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type GetBrandQuery = { __typename?: 'Query', brand: { __typename?: 'Brand', id: string | null, name: string | null, slug: string | null, logo: string | null, models: Array<{ __typename?: 'Model', id: string | null, name: string | null, slug: string | null }> | null } | null };

export type GetModelQueryVariables = Exact<{
  brandSlug: Scalars['String']['input'];
  modelSlug: Scalars['String']['input'];
}>;


export type GetModelQuery = { __typename?: 'Query', model: { __typename?: 'Model', id: string | null, name: string | null, slug: string | null, brand: { __typename?: 'Brand', id: string | null, name: string | null, slug: string | null } | null, generations: Array<{ __typename?: 'Generation', id: string | null, name: string | null, slug: string | null, yearStart: number | null, yearEnd: number | null, bodyType: BodyType | null }> | null } | null };

export type GetGenerationQueryVariables = Exact<{
  brandSlug: Scalars['String']['input'];
  modelSlug: Scalars['String']['input'];
  generationSlug: Scalars['String']['input'];
}>;


export type GetGenerationQuery = { __typename?: 'Query', generation: { __typename?: 'Generation', id: string | null, name: string | null, slug: string | null, yearStart: number | null, yearEnd: number | null, bodyType: BodyType | null, model: { __typename?: 'Model', id: string | null, name: string | null, slug: string | null, brand: { __typename?: 'Brand', id: string | null, name: string | null, slug: string | null } | null } | null, parts: Array<{ __typename?: 'PartWithPrice', id: string | null, name: string | null, category: PartCategory | null, schematicZone: { __typename?: 'SchematicZone', id: string | null, code: string | null, name: string | null, type: ZoneType | null } | null, price: { __typename?: 'Price', median: number | null, min: number | null, max: number | null, count: number | null } | null }> | null } | null };

export type GetSchematicZonesQueryVariables = Exact<{
  bodyType: BodyType;
}>;


export type GetSchematicZonesQuery = { __typename?: 'Query', schematicZones: Array<{ __typename?: 'SchematicZone', id: string | null, code: string | null, name: string | null, type: ZoneType | null }> | null };

export type GetUsageInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUsageInfoQuery = { __typename?: 'Query', usageInfo: { __typename?: 'UsageInfo', trialCredits: number | null, subscriptionCredits: number | null, totalCredits: number | null, hasActiveSubscription: boolean | null } | null };

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { __typename?: 'Query', me: { __typename?: 'UserProfile', id: string | null, firstName: string | null, lastName: string | null, username: string | null, isPremium: boolean | null, totalCalculations: number | null, trialCredits: number | null, subscriptionCredits: number | null, totalCredits: number | null, subscription: { __typename?: 'SubscriptionInfo', id: string | null, plan: SubscriptionPlan | null, status: SubscriptionStatus | null, credits: number | null, creditsTotal: number | null, currentPeriodEnd: string | null, cancelAtPeriodEnd: boolean | null, daysRemaining: number | null } | null } | null };

export type GetSubscriptionPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSubscriptionPlansQuery = { __typename?: 'Query', subscriptionPlans: Array<{ __typename?: 'SubscriptionPlanInfo', plan: string | null, price: number | null, label: string | null, days: number | null, credits: number | null }> | null };

export type GetMySubscriptionQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMySubscriptionQuery = { __typename?: 'Query', mySubscription: { __typename?: 'SubscriptionInfo', id: string | null, plan: SubscriptionPlan | null, status: SubscriptionStatus | null, credits: number | null, creditsTotal: number | null, currentPeriodStart: string | null, currentPeriodEnd: string | null, cancelAtPeriodEnd: boolean | null, daysRemaining: number | null } | null };

export type GetMyPaymentMethodsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyPaymentMethodsQuery = { __typename?: 'Query', myPaymentMethods: Array<{ __typename?: 'PaymentMethodInfo', id: string | null, cardLast4: string | null, cardType: string | null, expiryMonth: string | null, expiryYear: string | null, isDefault: boolean | null }> | null };

export type GetGenerationByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetGenerationByIdQuery = { __typename?: 'Query', generation: { __typename?: 'Generation', id: string | null, name: string | null, slug: string | null, yearStart: number | null, yearEnd: number | null, bodyType: BodyType | null, model: { __typename?: 'Model', id: string | null, name: string | null, slug: string | null, brand: { __typename?: 'Brand', id: string | null, name: string | null, slug: string | null } | null } | null, parts: Array<{ __typename?: 'PartWithPrice', id: string | null, name: string | null, category: PartCategory | null, schematicZone: { __typename?: 'SchematicZone', id: string | null, code: string | null, name: string | null, type: ZoneType | null } | null, price: { __typename?: 'Price', median: number | null, min: number | null, max: number | null, count: number | null } | null }> | null } | null };

export type GetGenerationConfigsQueryVariables = Exact<{
  generationId: Scalars['ID']['input'];
}>;


export type GetGenerationConfigsQuery = { __typename?: 'Query', generationConfigs: { __typename?: 'GenerationConfigs', engines: Array<{ __typename?: 'ConfigOption', configGroup: string | null, name: string | null, price: number | null }> | null, transmissions: Array<{ __typename?: 'ConfigOption', configGroup: string | null, name: string | null, price: number | null }> | null, drivetrains: Array<{ __typename?: 'ConfigOption', configGroup: string | null, name: string | null, price: number | null }> | null } | null };
