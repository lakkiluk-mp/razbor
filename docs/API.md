# API Schema — Razbor

> GraphQL API (Pothos + graphql-yoga)

---

## 1. Обзор

### 1.1 Эндпоинты

| Среда | URL |
|-------|-----|
| Development | `http://localhost:4000/graphql` |
| Production | `https://razbor.ru/graphql` |

### 1.2 Технологии

| Компонент | Технология |
|-----------|------------|
| Server | graphql-yoga (standalone HTTP) |
| Schema | Pothos (code-first) |
| Codegen | @graphql-codegen/cli |
| Client | graphql-request + TanStack Query |
| Auth | Telegram initData (X-Telegram-Init-Data header) |

### 1.3 Аутентификация

Все запросы из Telegram Mini App содержат заголовок `X-Telegram-Init-Data` с initData строкой от Telegram WebApp SDK. Сервер валидирует HMAC-подпись и извлекает пользователя.

### 1.4 GraphQL Context

```typescript
type Context = {
  prisma: PrismaClient
  user: User | null  // Telegram-пользователь (null если initData невалиден)
}
```

---

## 2. MVP Schema

### 2.1 Types

```graphql
# === АВТОМОБИЛИ ===

type Brand {
  id: ID!
  name: String!
  slug: String!
  logo: String
  models: [Model!]!
}

type Model {
  id: ID!
  name: String!
  slug: String!
  brand: Brand!
  generations: [Generation!]!
}

type Generation {
  id: ID!
  name: String!
  slug: String!
  yearStart: Int!
  yearEnd: Int
  bodyType: BodyType!
  model: Model!
  parts: [PartWithPrice!]!
}

enum BodyType {
  sedan
  hatchback
  crossover
  wagon
}

# === ЗАПЧАСТИ ===

type Part {
  id: ID!
  name: String!
  slug: String!
  category: PartCategory!
  schematicZone: SchematicZone
}

type PartWithPrice {
  id: ID!
  name: String!
  category: PartCategory!
  schematicZone: SchematicZone
  price: Price
}

enum PartCategory {
  body
  optics
  glass
  interior
  engine
  transmission
  suspension
  electrical
  cooling
  other
}

# === ТРАФАРЕТ ===

type SchematicZone {
  id: ID!
  code: String!
  name: String!
  type: ZoneType!
}

enum ZoneType {
  body      # На SVG (кузовные)
  aggregate # Отдельные иконки (двигатель, КПП)
}

# === ЦЕНЫ ===

type Price {
  median: Int!
  min: Int!
  max: Int!
  count: Int!
  updatedAt: DateTime!
}

# === РАСЧЁТ ===

type CalculationResult {
  totalPrice: Int!
  parts: [CalculationPart!]!
}

type CalculationPart {
  part: PartWithPrice!
  included: Boolean!
  isDamaged: Boolean!
  price: Int!
}

# === ЛИМИТЫ ===

type UsageInfo {
  freeRemaining: Int!
  freeResetAt: DateTime!
}
```

### 2.2 Queries

```graphql
type Query {
  # === Каталог ===

  """
  Список всех марок для главного экрана
  """
  brands: [Brand!]!

  """
  Получить марку по slug (для страницы выбора модели)
  """
  brand(slug: String!): Brand

  """
  Получить модель по slug (для страницы выбора поколения)
  """
  model(brandSlug: String!, modelSlug: String!): Model

  """
  Получить поколение со списком запчастей и ценами
  """
  generation(
    brandSlug: String!
    modelSlug: String!
    generationSlug: String!
  ): Generation

  # === Трафарет ===

  """
  Зоны трафарета для типа кузова
  """
  schematicZones(bodyType: BodyType!): [SchematicZone!]!

  # === Лимиты ===

  """
  Информация об использовании (бесплатные оценки)
  """
  usageInfo: UsageInfo!
}
```

### 2.3 Mutations

```graphql
type Mutation {
  """
  Выполнить расчёт стоимости

  - generationId: ID поколения авто
  - damagedZones: коды повреждённых зон ["hood", "fender_fl"]
  - excludedParts: ID запчастей, исключённых вручную
  """
  calculate(input: CalculateInput!): CalculationResult!
}

input CalculateInput {
  generationId: ID!
  damagedZones: [String!]!
  excludedParts: [ID!]
}
```

---

## 3. Примеры запросов

### 3.1 Главный экран (список марок)

```graphql
query GetBrands {
  brands {
    id
    name
    slug
    logo
  }
}
```

**Response:**
```json
{
  "data": {
    "brands": [
      { "id": "1", "name": "Lada", "slug": "lada", "logo": "/brands/lada.svg" },
      { "id": "2", "name": "Hyundai", "slug": "hyundai", "logo": "/brands/hyundai.svg" },
      { "id": "3", "name": "Kia", "slug": "kia", "logo": "/brands/kia.svg" }
    ]
  }
}
```

### 3.2 Выбор модели

```graphql
query GetModels($brandSlug: String!) {
  brand(slug: $brandSlug) {
    id
    name
    models {
      id
      name
      slug
    }
  }
}
```

**Variables:**
```json
{ "brandSlug": "lada" }
```

### 3.3 Выбор поколения

```graphql
query GetGenerations($brandSlug: String!, $modelSlug: String!) {
  model(brandSlug: $brandSlug, modelSlug: $modelSlug) {
    id
    name
    brand {
      name
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
```

### 3.4 Получить запчасти для расчёта

```graphql
query GetParts(
  $brandSlug: String!
  $modelSlug: String!
  $generationSlug: String!
) {
  generation(
    brandSlug: $brandSlug
    modelSlug: $modelSlug
    generationSlug: $generationSlug
  ) {
    id
    name
    bodyType
    model {
      name
      brand {
        name
      }
    }
    parts {
      id
      name
      category
      schematicZone {
        code
        name
        type
      }
      price {
        median
        min
        max
        count
        updatedAt
      }
    }
  }
}
```

### 3.5 Выполнить расчёт

```graphql
mutation Calculate($input: CalculateInput!) {
  calculate(input: $input) {
    totalPrice
    parts {
      part {
        id
        name
        category
        schematicZone {
          code
        }
      }
      included
      isDamaged
      price
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "generationId": "gen_vesta_1",
    "damagedZones": ["hood", "fender_fl"],
    "excludedParts": []
  }
}
```

**Response:**
```json
{
  "data": {
    "calculate": {
      "totalPrice": 487000,
      "parts": [
        {
          "part": {
            "id": "part_1",
            "name": "Двигатель 1.6 106 л.с.",
            "category": "engine",
            "schematicZone": { "code": "engine" }
          },
          "included": true,
          "isDamaged": false,
          "price": 120000
        },
        {
          "part": {
            "id": "part_2",
            "name": "Капот",
            "category": "body",
            "schematicZone": { "code": "hood" }
          },
          "included": false,
          "isDamaged": true,
          "price": 0
        }
      ]
    }
  }
}
```

### 3.6 Проверка лимитов

```graphql
query GetUsageInfo {
  usageInfo {
    freeRemaining
    freeResetAt
  }
}
```

---

## 4. Post-MVP Расширения

### 4.1 Детализация цены (статистика)

```graphql
# Добавляем в Query
type Query {
  """
  Детальная статистика по запчасти (для попапа)
  """
  partPriceDetails(partId: ID!): PartPriceDetails
}

type PartPriceDetails {
  part: Part!
  price: Price!
  samples: [PriceSample!]!
  searchUrl: String! # ссылка на поиск Avito
}

type PriceSample {
  amount: Int!
  city: String
  url: String
  date: DateTime!
}
```

**Пример запроса:**
```graphql
query GetPartDetails($partId: ID!) {
  partPriceDetails(partId: $partId) {
    part {
      name
    }
    price {
      median
      min
      max
      count
      updatedAt
    }
    samples {
      amount
      city
      url
      date
    }
    searchUrl
  }
}
```

### 4.2 Авторизация (Telegram)

Auth реализован через заголовок `X-Telegram-Init-Data`. Пользователь создается автоматически при первом запросе с валидным initData.

```graphql
type Query {
  """
  Текущий пользователь (из Telegram initData)
  """
  me: User
}

type User {
  id: ID!
  telegramId: BigInt!
  firstName: String!
  lastName: String
  username: String
  freeUsed: Int!
  paidBalance: Int!
  createdAt: DateTime!
}
```

### 4.3 История оценок

```graphql
type Query {
  """
  История расчётов пользователя
  """
  myCalculations(limit: Int = 20, offset: Int = 0): [SavedCalculation!]!
}

type Mutation {
  """
  Сохранить расчёт в историю
  """
  saveCalculation(input: SaveCalculationInput!): SavedCalculation!
}

type SavedCalculation {
  id: ID!
  generation: Generation!
  totalPrice: Int!
  partsCount: Int!
  damagedZones: [String!]!
  createdAt: DateTime!
}

input SaveCalculationInput {
  generationId: ID!
  damagedZones: [String!]!
  excludedParts: [ID!]
}
```

### 4.4 Платежи (Telegram Stars)

```graphql
type Query {
  """
  Доступные пакеты оценок
  """
  packages: [Package!]!

  """
  Мои платежи
  """
  myPayments: [Payment!]!
}

type Mutation {
  """
  Создать invoice для оплаты через Telegram Stars
  Возвращает ссылку для открытия через Telegram.WebApp.openInvoice()
  """
  createInvoiceLink(packageId: ID!): CreateInvoiceLinkResult!
}

type Package {
  id: ID!
  name: String!
  credits: Int!
  price: Int!       # Цена в Telegram Stars
}

type Payment {
  id: ID!
  package: Package!
  amount: Int!       # Сумма в Stars
  status: PaymentStatus!
  createdAt: DateTime!
}

enum PaymentStatus {
  pending
  succeeded
  canceled
  refunded
}

type CreateInvoiceLinkResult {
  invoiceLink: String!  # URL для Telegram.WebApp.openInvoice()
}
```

---

## 5. Pothos Implementation

### 5.1 Структура файлов

```
packages/api/src/
├── schema/
│   ├── index.ts          # Сборка схемы
│   ├── builder.ts        # Pothos builder
│   ├── types/
│   │   ├── brand.ts
│   │   ├── model.ts
│   │   ├── generation.ts
│   │   ├── part.ts
│   │   ├── price.ts
│   │   └── schematic-zone.ts
│   ├── queries/
│   │   ├── brands.ts
│   │   ├── generation.ts
│   │   └── usage.ts
│   └── mutations/
│       └── calculate.ts
├── services/
│   ├── brand.service.ts
│   ├── part.service.ts
│   ├── price.service.ts
│   └── calculator.service.ts
└── index.ts
```

### 5.2 Builder

```typescript
// packages/api/src/schema/builder.ts
import SchemaBuilder from '@pothos/core'
import PrismaPlugin from '@pothos/plugin-prisma'
import { prisma } from '@razbor/db'
import type PrismaTypes from '@pothos/plugin-prisma/generated'

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes
  Context: {
    prisma: typeof prisma
    user: User | null  // Telegram user из initData
  }
  Scalars: {
    DateTime: {
      Input: Date
      Output: Date
    }
  }
}>({
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma,
  },
})

// Scalar types
builder.scalarType('DateTime', {
  serialize: (value) => value.toISOString(),
  parseValue: (value) => new Date(value as string),
})
```

### 5.3 Пример типа (Brand)

```typescript
// packages/api/src/schema/types/brand.ts
import { builder } from '../builder'

builder.prismaObject('Brand', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    slug: t.exposeString('slug'),
    logo: t.exposeString('logo', { nullable: true }),
    models: t.relation('models', {
      query: {
        orderBy: { name: 'asc' },
      },
    }),
  }),
})
```

### 5.4 Пример Query

```typescript
// packages/api/src/schema/queries/brands.ts
import { builder } from '../builder'

builder.queryField('brands', (t) =>
  t.prismaField({
    type: ['Brand'],
    resolve: (query, _root, _args, ctx) =>
      ctx.prisma.brand.findMany({
        ...query,
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
  })
)

builder.queryField('brand', (t) =>
  t.prismaField({
    type: 'Brand',
    nullable: true,
    args: {
      slug: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.brand.findUnique({
        ...query,
        where: { slug: args.slug },
      }),
  })
)
```

### 5.5 Mutation Calculate

```typescript
// packages/api/src/schema/mutations/calculate.ts
import { builder } from '../builder'
import { calculatorService } from '../../services/calculator.service'

const CalculateInput = builder.inputType('CalculateInput', {
  fields: (t) => ({
    generationId: t.id({ required: true }),
    damagedZones: t.stringList({ required: true }),
    excludedParts: t.idList({ required: false }),
  }),
})

builder.mutationField('calculate', (t) =>
  t.field({
    type: CalculationResult,
    args: {
      input: t.arg({ type: CalculateInput, required: true }),
    },
    resolve: async (_root, { input }, ctx) => {
      return calculatorService.calculate({
        generationId: input.generationId,
        damagedZones: input.damagedZones,
        excludedParts: input.excludedParts ?? [],
        prisma: ctx.prisma,
      })
    },
  })
)
```

---

## 6. Client (React Hooks)

### 6.1 GraphQL Codegen

```typescript
// packages/graphql-client/codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '../api/src/schema/index.ts',
  documents: ['src/**/*.graphql'],
  generates: {
    './generated/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
}

export default config
```

### 6.2 Hooks

```typescript
// packages/hooks/src/useBrands.ts
import { useQuery } from '@tanstack/react-query'
import { gqlClient } from '@razbor/graphql-client'
import { GetBrandsDocument } from '@razbor/graphql-client/generated'

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => gqlClient.request(GetBrandsDocument),
    staleTime: 1000 * 60 * 60, // 1 час (марки меняются редко)
  })
}
```

```typescript
// packages/hooks/src/useGeneration.ts
import { useQuery } from '@tanstack/react-query'
import { gqlClient } from '@razbor/graphql-client'
import { GetPartsDocument } from '@razbor/graphql-client/generated'

export function useGeneration(
  brandSlug: string,
  modelSlug: string,
  generationSlug: string
) {
  return useQuery({
    queryKey: ['generation', brandSlug, modelSlug, generationSlug],
    queryFn: () =>
      gqlClient.request(GetPartsDocument, {
        brandSlug,
        modelSlug,
        generationSlug,
      }),
    enabled: !!brandSlug && !!modelSlug && !!generationSlug,
  })
}
```

```typescript
// packages/hooks/src/useCalculate.ts
import { useMutation } from '@tanstack/react-query'
import { gqlClient } from '@razbor/graphql-client'
import { CalculateDocument } from '@razbor/graphql-client/generated'

export function useCalculate() {
  return useMutation({
    mutationFn: (input: {
      generationId: string
      damagedZones: string[]
      excludedParts?: string[]
    }) => gqlClient.request(CalculateDocument, { input }),
  })
}
```

---

## 7. Error Handling

### 7.1 Коды ошибок

```typescript
// packages/api/src/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message)
  }
}

export const ErrorCodes = {
  // Каталог
  BRAND_NOT_FOUND: 'BRAND_NOT_FOUND',
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  GENERATION_NOT_FOUND: 'GENERATION_NOT_FOUND',

  // Расчёт
  INVALID_ZONE: 'INVALID_ZONE',

  // Лимиты
  FREE_LIMIT_EXCEEDED: 'FREE_LIMIT_EXCEEDED',

  // Auth (Post-MVP)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
} as const
```

### 7.2 Формат ошибки

```json
{
  "errors": [
    {
      "message": "Лимит бесплатных оценок исчерпан",
      "extensions": {
        "code": "FREE_LIMIT_EXCEEDED",
        "resetAt": "2024-01-28T00:00:00Z"
      }
    }
  ]
}
```

---

## 8. Безопасность

### 8.1 Rate Limiting

```typescript
// MVP: простой rate limit по IP
const rateLimiter = {
  windowMs: 60 * 1000, // 1 минута
  max: 60, // 60 запросов в минуту
}
```

### 8.2 Валидация Input

```typescript
// Все inputs валидируются через Pothos
// + дополнительная валидация в services
import { z } from 'zod'

const calculateInputSchema = z.object({
  generationId: z.string().cuid(),
  damagedZones: z.array(z.string().max(50)).max(30),
  excludedParts: z.array(z.string().cuid()).max(100).optional(),
})
```

### 8.3 Query Depth Limit

```typescript
// Ограничение глубины запросов
import { createYoga } from 'graphql-yoga'
import { useDepthLimit } from '@envelop/depth-limit'

const yoga = createYoga({
  plugins: [
    useDepthLimit({ maxDepth: 5 }),
  ],
})
```

---

## 9. Следующие шаги

1. **Инициализация проекта** — Turborepo structure
2. **Docker setup** — PostgreSQL, Redis
3. **Prisma schema** — миграции, seed
4. **API implementation** — Pothos types, resolvers
5. **UI** — Next.js pages
