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
};


export type MutationCalculateArgs = {
  input: CalculateInput;
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
  name: Maybe<Scalars['String']['output']>;
  price: Maybe<Price>;
  schematicZone: Maybe<SchematicZone>;
};

export type Price = {
  __typename?: 'Price';
  count: Maybe<Scalars['Int']['output']>;
  max: Maybe<Scalars['Int']['output']>;
  maxPriceUrl: Maybe<Scalars['String']['output']>;
  median: Maybe<Scalars['Int']['output']>;
  min: Maybe<Scalars['Int']['output']>;
  minPriceUrl: Maybe<Scalars['String']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type Query = {
  __typename?: 'Query';
  brand: Maybe<Brand>;
  brands: Maybe<Array<Brand>>;
  generation: Maybe<Generation>;
  generationById: Maybe<Generation>;
  generationConfigs: Maybe<GenerationConfigs>;
  model: Maybe<Model>;
  schematicZones: Maybe<Array<SchematicZone>>;
  usageInfo: Maybe<UsageInfo>;
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

export type UsageInfo = {
  __typename?: 'UsageInfo';
  freeRemaining: Maybe<Scalars['Int']['output']>;
  freeResetAt: Maybe<Scalars['DateTime']['output']>;
};

export type ZoneType =
  | 'exterior'
  | 'interior'
  | 'mechanical';

export type CalculateMutationVariables = Exact<{
  input: CalculateInput;
}>;


export type CalculateMutation = { __typename?: 'Mutation', calculate: { __typename?: 'CalculationResult', totalPrice: number | null, parts: Array<{ __typename?: 'CalculationPart', included: boolean | null, isDamaged: boolean | null, price: number | null, part: { __typename?: 'PartWithPrice', id: string | null, name: string | null, category: PartCategory | null, schematicZone: { __typename?: 'SchematicZone', id: string | null, code: string | null, name: string | null } | null, price: { __typename?: 'Price', median: number | null } | null } | null }> | null } | null };

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


export type GetUsageInfoQuery = { __typename?: 'Query', usageInfo: { __typename?: 'UsageInfo', freeRemaining: number | null, freeResetAt: string | null } | null };

export type GetGenerationByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetGenerationByIdQuery = { __typename?: 'Query', generation: { __typename?: 'Generation', id: string | null, name: string | null, slug: string | null, yearStart: number | null, yearEnd: number | null, bodyType: BodyType | null, model: { __typename?: 'Model', id: string | null, name: string | null, slug: string | null, brand: { __typename?: 'Brand', id: string | null, name: string | null, slug: string | null } | null } | null, parts: Array<{ __typename?: 'PartWithPrice', id: string | null, name: string | null, category: PartCategory | null, schematicZone: { __typename?: 'SchematicZone', id: string | null, code: string | null, name: string | null, type: ZoneType | null } | null, price: { __typename?: 'Price', median: number | null, min: number | null, max: number | null, count: number | null } | null }> | null } | null };

export type GetGenerationConfigsQueryVariables = Exact<{
  generationId: Scalars['ID']['input'];
}>;


export type GetGenerationConfigsQuery = { __typename?: 'Query', generationConfigs: { __typename?: 'GenerationConfigs', engines: Array<{ __typename?: 'ConfigOption', configGroup: string | null, name: string | null, price: number | null }> | null, transmissions: Array<{ __typename?: 'ConfigOption', configGroup: string | null, name: string | null, price: number | null }> | null, drivetrains: Array<{ __typename?: 'ConfigOption', configGroup: string | null, name: string | null, price: number | null }> | null } | null };
