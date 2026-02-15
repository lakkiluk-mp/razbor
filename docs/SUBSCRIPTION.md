# Система подписок — Razbor

## Обзор

Замена текущей системы дневных лимитов (`dailyLimit = 10/day`, сброс в полночь МСК) на кредитную систему подписок. Оплата через виджет YooKassa с автоматическим продлением.

### Текущее состояние (что уже есть)

| Компонент | Статус |
|-----------|--------|
| Поле `User.isPremium` в БД | Есть, всегда `false` |
| Поле `User.dailyLimit` (по умолчанию 10) | Есть, используется для дневного сброса |
| Модель `Payment` (Telegram Stars) | Есть, не полностью работает |
| Вкладка История (блюр для бесплатных) | Есть, кнопка = `alert('Скоро')` |
| Бейдж Premium в профиле | Есть, кнопка = `alert('Скоро')` |
| LimitReachedPage | Есть, показывает таймер до сброса |
| `usage.service.ts` — проверка дневных кредитов | Работает, сброс в полночь МСК |

### Целевое состояние

Кредитная система без дневных сбросов. Два тарифа подписки через YooKassa.

---

## Модель кредитов

| Тариф | Кредиты | Цена | Поведение |
|-------|---------|------|-----------|
| Бесплатный (пробный) | 3 всего | Бесплатно | Пожизненные, никогда не сбрасываются, только уменьшаются |
| Недельный | 5 за период | 249 ₽ | Сгорают по истечении, сбрасываются при продлении |
| Месячный | 25 за период | 788 ₽ | Сгорают по истечении, сбрасываются при продлении |

### Правила

- Пробные кредиты и кредиты подписки — **отдельные счётчики**
- Доступно пользователю = `trialCredits + subscriptionCredits`
- При расчёте: сначала тратятся **кредиты подписки**, затем пробные
- При покупке плана: `subscriptionCredits = plan.credits` (пробные не трогаются, итого суммируется)
- При смене плана (недельный → месячный): **замена** `subscriptionCredits = 25` (старый остаток стирается)
- При продлении: **сброс** `subscriptionCredits = plan.credits` (без накопления)
- При истечении без продления: `subscriptionCredits = 0`, `isPremium = false`
- Вкладка История: доступна **только** с активной подпиской

### Примеры

| Сценарий | Пробные | Подписка | Итого |
|----------|---------|----------|-------|
| Новый пользователь | 3 | 0 | 3 |
| Использовал 1 пробный расчёт | 2 | 0 | 2 |
| Купил недельный | 2 | 5 | 7 |
| Использовал 3 расчёта (сначала подписка) | 2 | 2 | 4 |
| Недельный истёк, купил месячный | 2 | 25 | 27 |
| Использовал все подписочные + 1 пробный | 1 | 0 | 1 |
| Месячный продлён | 1 | 25 | 26 |
| Месячный истёк, без продления | 1 | 0 | 1 |

в приоритете сжигаем пробный ну успользуем всм 
---

## Этап 1: Система подписок (БД + API + Бизнес-логика + UI)

### 1.1 Схема базы данных

**Файл:** `packages/db/prisma/schema.prisma`

#### Новые перечисления

```prisma
enum SubscriptionPlan {
  weekly
  monthly
}

enum SubscriptionStatus {
  active       // Оплата подтверждена, подписка активна
  past_due     // Списание при продлении не прошло, в окне повторных попыток
  canceled     // Пользователь отменил, период закончился
  expired      // Все попытки списания провалились, подписка завершена
}
```

#### Новая модель: `Subscription`

```prisma
model Subscription {
  id                 String             @id @default(cuid())
  userId             String
  plan               SubscriptionPlan
  status             SubscriptionStatus @default(active)
  credits            Int                // Оставшиеся кредиты подписки за период
  creditsTotal       Int                // Всего кредитов по плану (5 или 25)
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelAtPeriodEnd  Boolean            @default(false)
  retryCount         Int                @default(0)
  lastRetryAt        DateTime?

  user               User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  payments           YooPayment[]

  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  @@index([userId])
  @@index([status])
  @@index([currentPeriodEnd])
}
```

#### Новая модель: `PaymentMethod`

```prisma
model PaymentMethod {
  id                 String   @id @default(cuid())
  userId             String
  yooPaymentMethodId String   @unique   // ID платёжного метода YooKassa
  cardLast4          String             // "4477"
  cardType           String             // "MasterCard", "Visa", "Mir"
  expiryMonth        String             // "01"
  expiryYear         String             // "30"
  isDefault          Boolean  @default(true)

  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt          DateTime @default(now())

  @@index([userId])
}
```

#### Новая модель: `YooPayment`

```prisma
model YooPayment {
  id              String        @id @default(cuid())
  userId          String
  subscriptionId  String?
  yooPaymentId    String        @unique  // ID платежа YooKassa
  idempotencyKey  String        @unique  // Защита от двойных списаний
  amount          Int                    // Сумма в копейках (24900 = 249₽)
  currency        String        @default("RUB")
  status          String        @default("pending")  // pending | succeeded | canceled
  isRecurring     Boolean       @default(false)

  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscription    Subscription? @relation(fields: [subscriptionId], references: [id])

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([userId])
  @@index([subscriptionId])
}
```

#### Изменение модели `User`

```diff
model User {
  id         String   @id @default(cuid())
  telegramId BigInt   @unique
  firstName  String
  lastName   String?
  username   String?
  isPremium  Boolean  @default(false)
- dailyLimit Int      @default(10)
+ trialCredits Int    @default(3)

  calculations Calculation[]
- payments     Payment[]
  usageLogs    UsageLog[]
+ subscriptions   Subscription[]
+ paymentMethods  PaymentMethod[]
+ yooPayments     YooPayment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Старую модель `Payment` (Telegram Stars) можно удалить или пометить как устаревшую.

#### Миграция

```bash
pnpm --filter @razbor/db db:migrate:dev --name add_subscription_system
pnpm db:generate
```

---

### 1.2 Константы

**Файл:** `packages/shared/src/index.ts`

```typescript
// Удалить: export const FREE_CALCULATIONS_LIMIT = 10

export const TRIAL_CREDITS = 3

export const SUBSCRIPTION_PLANS = {
  weekly:  { price: 249, label: '1 неделя', days: 7,  credits: 5  },
  monthly: { price: 788, label: '1 месяц',  days: 30, credits: 25 },
} as const

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS

export const SUBSCRIPTION_GRACE_PERIOD_DAYS = 3
export const SUBSCRIPTION_MAX_RETRIES = 3
```

---

### 1.3 Бэкенд-сервисы

#### Сервис кредитов

**Новый файл:** `packages/api/src/services/credits.service.ts`

Заменяет логику `usage.service.ts`.

```typescript
export async function getRemainingCredits(prisma, userId): Promise<{
  trial: number        // User.trialCredits
  subscription: number // Активная Subscription.credits или 0
  total: number        // trial + subscription
}>

export async function useCredit(prisma, userId): Promise<void>
// 1. Найти активную подписку
// 2. Если subscription.credits > 0 → уменьшить subscription.credits
// 3. Иначе если user.trialCredits > 0 → уменьшить user.trialCredits
// 4. Иначе → выбросить ошибку (должно быть проверено до вызова)

export async function hasCredits(prisma, userId): Promise<boolean>
// return (await getRemainingCredits(prisma, userId)).total > 0
```

#### Сервис подписок

**Новый файл:** `packages/api/src/services/subscription.service.ts`

```typescript
export async function getActiveSubscription(prisma, userId): Promise<Subscription | null>
// status IN ('active', 'past_due')

export async function createSubscription(prisma, userId, plan): Promise<Subscription>
// 1. Проверить нет ли существующей активной/past_due подписки
// 2. Создать Subscription со status='active', credits=plan.credits
// 3. Установить currentPeriodStart=now, currentPeriodEnd=now+plan.days
// 4. Обновить User.isPremium=true

export async function cancelSubscription(prisma, subscriptionId): Promise<Subscription>
// Установить cancelAtPeriodEnd=true

export async function renewSubscription(prisma, subscriptionId): Promise<void>
// 1. Сбросить credits = creditsTotal
// 2. currentPeriodStart = now
// 3. currentPeriodEnd = now + plan.days
// 4. retryCount = 0

export async function expireSubscription(prisma, subscriptionId): Promise<void>
// 1. status = 'expired'
// 2. credits = 0
// 3. User.isPremium = false

export async function processRenewals(prisma): Promise<void>
// Крон-задача: находит истёкшие подписки и обрабатывает их
// Подробности в разделе 1.7
```

**Машина состояний подписки:**

```
                    ┌──────────────────┐
                    │  Платёж создан   │
                    └────────┬─────────┘
                             │ payment.succeeded
                             ▼
                    ┌──────────────────┐
         ┌─────────│      ACTIVE      │◄──────────┐
         │         └────────┬─────────┘           │
         │                  │ период закончился     │ списание прошло
         │                  ▼                      │
         │         ┌──────────────────┐           │
         │         │ Проверка продления├───────────┘
         │         └────────┬─────────┘
         │                  │ списание не прошло
         │                  ▼
         │         ┌──────────────────┐
         │         │    PAST_DUE      │───повтор успешен──► ACTIVE
         │         └────────┬─────────┘
         │                  │ 3 попытки провалились (3 дня)
         │                  ▼
         │         ┌──────────────────┐
         │         │     EXPIRED      │
         │         └──────────────────┘
         │
         │ пользователь отменил (cancelAtPeriodEnd=true)
         ▼
┌──────────────────┐
│ ACTIVE (до конца │──── период закончился ──►  CANCELED
│ периода)         │
└──────────────────┘
```

---


### 1.4 Изменение мутации Calculate

**Файл:** `packages/api/src/schema/mutations/calculate.ts`

```typescript
// До (дневной лимит):
// const { remaining } = await getRemainingCredits(ctx.prisma, ctx.user.id)
// if (remaining <= 0) throw new GraphQLError('Лимит расчётов исчерпан')

// После (кредитная система):
import { hasCredits, useCredit } from '../../services/credits.service'

const canCalculate = await hasCredits(ctx.prisma, ctx.user.id)
if (!canCalculate) {
  throw new GraphQLError('Лимит расчётов исчерпан')
}

// ... выполнение расчёта ...

await useCredit(ctx.prisma, ctx.user.id)
```

---

### 1.5 GraphQL схема

#### Новые типы

**Файл:** `packages/api/src/schema/types/subscription.ts`

```typescript
// Pothos тип: SubscriptionInfo
{
  id: String
  plan: SubscriptionPlan        // 'weekly' | 'monthly'
  status: SubscriptionStatus    // 'active' | 'past_due' | 'canceled' | 'expired'
  credits: Int                  // Оставшиеся кредиты подписки
  creditsTotal: Int             // Всего кредитов по плану
  currentPeriodStart: DateTime
  currentPeriodEnd: DateTime
  cancelAtPeriodEnd: Boolean
  daysRemaining: Int            // Вычисляемое: ceil((periodEnd - now) / day)
}
```

**Файл:** `packages/api/src/schema/types/subscription-plan.ts`

```typescript
// Pothos тип: SubscriptionPlanInfo
{
  plan: String         // 'weekly' | 'monthly'
  price: Int           // 249 | 788
  label: String        // '1 неделя' | '1 месяц'
  days: Int            // 7 | 30
  credits: Int         // 5 | 25
}
```

**Файл:** `packages/api/src/schema/types/payment-method.ts`

```typescript
// Pothos тип: PaymentMethodInfo
{
  id: String
  cardLast4: String    // "4477"
  cardType: String     // "MasterCard"
  expiryMonth: String  // "01"
  expiryYear: String   // "30"
  isDefault: Boolean
}
```

#### Новые запросы

**Файл:** `packages/api/src/schema/queries/subscription.ts`

```graphql
type Query {
  # Текущая активная или past_due подписка (null если нет)
  mySubscription: SubscriptionInfo

  # Доступные тарифы подписки с ценами
  subscriptionPlans: [SubscriptionPlanInfo!]!

  # Сохранённые способы оплаты (карты) пользователя
  myPaymentMethods: [PaymentMethodInfo!]!
}
```

#### Новые мутации

**Файл:** `packages/api/src/schema/mutations/subscription.ts`

```graphql
type Mutation {
  # Создать новую подписку, инициировать платёж
  # Возвращает данные для виджета YooKassa
  createSubscription(plan: SubscriptionPlan!): CreateSubscriptionResult!

  # Мягкая отмена: подписка остаётся активной до конца периода
  cancelSubscription: SubscriptionInfo!

  # Удалить сохранённый способ оплаты
  removePaymentMethod(paymentMethodId: ID!): Boolean!
}

type CreateSubscriptionResult {
  confirmationToken: String!    # Для виджета YooKassa
  subscriptionId: String!
  paymentId: String!
}
```

#### Изменение запроса `me`

**Файл:** `packages/api/src/schema/queries/me.ts`

```graphql
type Query {
  me: UserProfile
}

type UserProfile {
  id: String!
  firstName: String!
  lastName: String
  username: String
  isPremium: Boolean!
  totalCalculations: Int!

  # НОВОЕ: заменяет freeRemaining/dailyLimit/freeResetAt
  trialCredits: Int!           # Оставшиеся пробные кредиты
  subscriptionCredits: Int!    # Оставшиеся кредиты подписки (0 если нет активной)
  totalCredits: Int!           # пробные + подписочные

  # НОВОЕ: информация об активной подписке
  subscription: SubscriptionInfo
}
```

#### Изменение запроса `usageInfo`

**Файл:** `packages/api/src/schema/queries/usage.ts`

```graphql
type Query {
  usageInfo: UsageInfo!
}

type UsageInfo {
  trialCredits: Int!
  subscriptionCredits: Int!
  totalCredits: Int!
  hasActiveSubscription: Boolean!
}
```

Заменяет старые `freeRemaining`, `freeResetAt`, `dailyLimit`.

#### GraphQL клиент — документы

**Файл:** `packages/graphql-client/src/documents.ts`

Добавить:
```typescript
export const queries = {
  // ... существующие ...

  subscriptionPlans: `query GetSubscriptionPlans {
    subscriptionPlans { plan price label days credits }
  }`,

  mySubscription: `query GetMySubscription {
    mySubscription {
      id plan status credits creditsTotal
      currentPeriodStart currentPeriodEnd
      cancelAtPeriodEnd daysRemaining
    }
  }`,

  myPaymentMethods: `query GetMyPaymentMethods {
    myPaymentMethods { id cardLast4 cardType expiryMonth expiryYear isDefault }
  }`,
}

export const mutations = {
  // ... существующие ...

  createSubscription: `mutation CreateSubscription($plan: SubscriptionPlan!) {
    createSubscription(plan: $plan) {
      confirmationToken subscriptionId paymentId
    }
  }`,

  cancelSubscription: `mutation CancelSubscription {
    cancelSubscription { id status cancelAtPeriodEnd currentPeriodEnd daysRemaining }
  }`,

  removePaymentMethod: `mutation RemovePaymentMethod($paymentMethodId: ID!) {
    removePaymentMethod(paymentMethodId: $paymentMethodId)
  }`,
}
```

Обновить запрос `me`:
```graphql
query GetMe {
  me {
    id firstName lastName username isPremium
    totalCalculations trialCredits subscriptionCredits totalCredits
    subscription {
      id plan status credits creditsTotal
      currentPeriodEnd cancelAtPeriodEnd daysRemaining
    }
  }
}
```

Обновить запрос `usageInfo`:
```graphql
query GetUsageInfo {
  usageInfo {
    trialCredits subscriptionCredits totalCredits hasActiveSubscription
  }
}
```

После всех изменений: `pnpm codegen`

---

### 1.6 Фронтенд — Страницы и компоненты

#### Новый маршрут: `/subscribe` — SubscribePage

**Файл:** `apps/mini-app/src/pages/SubscribePage.tsx`

**Пользовательский путь:** ProfilePage «Получите Premium» / HistoryPage «Разблокировать» / LimitReachedPage «Оформить Premium» → SubscribePage

**Макет (без активной подписки):**

```
┌─────────────────────────────────────┐
│ ← Назад                            │
│                                     │
│         Premium подписка            │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Больше расчётов             │    │
│  │ Полная история расчётов     │    │
│  └─────────────────────────────┘    │
│                                     │
│  Выберите план:                     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ● 1 неделя                  │    │  ← amber рамка при выборе
│  │   5 расчётов        249 ₽  │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ○ 1 месяц          Выгодно │    │  ← бейдж
│  │   25 расчётов       788 ₽  │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │    Оформить подписку 249 ₽  │    │  ← amber CTA кнопка
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Макет (есть активная подписка — режим управления):**

```
┌─────────────────────────────────────┐
│ ← Назад                            │
│                                     │
│         Premium подписка            │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Текущий план                │    │
│  │ 1 месяц · Premium          │    │
│  │                             │    │
│  │ Осталось: 18 из 25 расч.   │    │  ← прогресс-бар
│  │ Действует до: 14 марта     │    │
│  │                             │    │
│  │ Автопродление: Вкл         │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Способ оплаты               │    │
│  │ **** 4477 MasterCard 01/30 │    │
│  │                    [Удалить]│    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │    Отменить подписку        │    │  ← красная outline кнопка
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Состояния:**
- Загрузка: скелетон-карточки
- Ошибка: сообщение об ошибке + повторить
- Нет подписки: режим выбора плана
- Активная подписка: режим управления
- Отменена (cancelAtPeriodEnd): показать «Активна до {дата}» + опция переподписки

---

#### Новый маршрут: `/payment` — PaymentPage

**Файл:** `apps/mini-app/src/pages/PaymentPage.tsx`

Получает `plan` через `useLocation().state.plan`.

**Макет:**

```
┌─────────────────────────────────────┐
│ ← Назад                            │
│                                     │
│  Оплата                            │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Premium · 1 месяц           │    │
│  │ 25 расчётов         788 ₽  │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │   [Виджет YooKassa тут]     │    │  ← min-h-[400px]
│  │                             │    │  ← Этап 2: настоящий виджет
│  │                             │    │  ← Этап 1: заглушка
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

**Состояния:**
- Загрузка: спиннер + «Подготовка платежа...»
- Виджет активен: форма YooKassa видна
- Ошибка: «Ошибка создания платежа» + кнопка «Попробовать снова»
- Обработка: «Обработка платежа...» (после успеха виджета, ожидание вебхука)

**Поток:**
1. Монтирование → вызвать мутацию `createSubscription(plan)`
2. Получить `confirmationToken` из ответа
3. Инициализировать виджет YooKassa с токеном (Этап 2)
4. Виджет `on('success')` → инвалидировать запросы `['me']`, `['mySubscription']` → перейти на `/payment/success`
5. Виджет `on('fail')` → показать ошибку + кнопку повтора

---

#### Новый маршрут: `/payment/success` — PaymentSuccessPage

**Файл:** `apps/mini-app/src/pages/PaymentSuccessPage.tsx`

```
┌─────────────────────────────────────┐
│                                     │
│            ✓                        │  ← анимированная галочка (зелёная)
│                                     │
│     Подписка оформлена!             │
│                                     │
│     Premium · 1 месяц              │
│     25 расчётов                    │
│     Активна до 14 марта 2026       │
│                                     │
│  ┌─────────────────────────────┐    │
│  │     Начать расчёт           │    │  ← amber CTA → navigate('/')
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

---

#### Изменение: ProfilePage

**Файл:** `apps/mini-app/src/pages/ProfilePage.tsx`

Изменения:
- Заменить отображение `freeRemaining / dailyLimit` → `totalCredits` («Осталось расчётов: 7»)
- Заменить кнопку Premium `alert('Скоро')` → `navigate('/subscribe')`
- Если активная подписка: показать мини-карточку подписки (план, кредиты, срок)
- Если есть сохранённые карты: показать информацию о карте со ссылкой на управление

---

#### Изменение: HistoryPage

**Файл:** `apps/mini-app/src/pages/HistoryPage.tsx`

Изменения:
- Заменить кнопку «Разблокировать» `alert('Скоро')` → `navigate('/subscribe')`

---

#### Изменение: LimitReachedPage

**Файл:** `apps/mini-app/src/pages/LimitReachedPage.tsx`

Изменения:
- Убрать таймер дневного сброса (больше нет дневных сбросов)
- Заменить на кнопку «Оформить Premium» → `navigate('/subscribe')`
- Если подписка истекла: текст «Продлить подписку»
- Если пробные исчерпаны: «Пробные расчёты закончились» + CTA подписки

---

#### Изменение: UsageCounter

**Файл:** `apps/mini-app/src/components/features/usage-counter.tsx`

Изменения:
- Показывать `totalCredits` вместо дневного остатка
- Подпись: «Осталось расчётов: {N}» (пробные + подписочные)
- Если подписка активна: «Premium · {subscriptionCredits} расч.»

---

#### Изменение: App.tsx

**Файл:** `apps/mini-app/src/App.tsx`

Добавить маршруты:
```tsx
<Route path="/subscribe" element={<SubscribePage />} />
<Route path="/payment" element={<PaymentPage />} />
<Route path="/payment/success" element={<PaymentSuccessPage />} />
```

---

#### Новые компоненты

**`apps/mini-app/src/components/features/plan-card.tsx`**

Карточка выбора плана со стилем радио-кнопки.
Пропсы: `plan`, `price`, `label`, `credits`, `isSelected`, `badge?`, `onSelect`
Дизайн: `bg-zinc-900 rounded-2xl p-4 border-2 border-amber-500` (выбран) / `border-zinc-800` (не выбран)

**`apps/mini-app/src/components/features/subscription-status.tsx`**

Отображает информацию об активной подписке (план, прогресс кредитов, срок, отмена).
Пропсы: `subscription`, `onCancel`, `onManage`

**`apps/mini-app/src/components/features/payment-method-card.tsx`**

Отображает сохранённую карту с действием удаления.
Пропсы: `cardLast4`, `cardType`, `expiryMonth`, `expiryYear`, `onRemove`
Дизайн: `bg-zinc-900 rounded-xl p-3` с иконкой карты и маскированным номером.

---

### 1.7 Крон автопродления

**Файл:** `apps/server/src/cron/renewal.ts`

Запускается как `setInterval` (каждый час) внутри процесса сервера.

```typescript
export function startRenewalCron(prisma: PrismaClient): void
```

Логика:
1. Найти подписки где `currentPeriodEnd < now` И `status IN ('active', 'past_due')`
2. Для каждой:
   - Если `cancelAtPeriodEnd = true` → установить `status = 'canceled'`, `User.isPremium = false`, `credits = 0`
   - Если `status = 'active'` → попытка списания через сохранённый способ оплаты (Этап 2 добавляет реальное списание)
     - Успех → `renewSubscription()` (сброс кредитов, продление периода)
     - Неудача → `status = 'past_due'`, `retryCount = 1`, `lastRetryAt = now`
   - Если `status = 'past_due'`:
     - Если `retryCount < 3` И достаточно времени с последней попытки (прогрессивно: 0, +1 день, +2 дня):
       - Попытка списания → успех → `renewSubscription()` / неудача → увеличить retryCount
     - Если `retryCount >= 3` → `expireSubscription()` (status='expired', isPremium=false, credits=0)

Вызывается из `apps/server/src/index.ts` при запуске.

**Расписание повторных попыток:**

| Попытка | Когда | Дней после окончания периода |
|---------|-------|------------------------------|
| 1 | Сразу при окончании периода | День 0 |
| 2 | +1 день после первой неудачи | День 1 |
| 3 | +2 дня после второй неудачи | День 3 |
| Истечение | После 3-й неудачи | День 3 |

только дату меняем ничего не начисляя
---


### 1.8 Диаграмма пользовательского пути

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Профиль   │     │ История  │     │ Лимит    │
│           │     │          │     │ исчерпан │
│ "Premium" │     │"Разблок."│     │"Premium" │
└────┬──────┘     └────┬─────┘     └────┬─────┘
     │                 │                │
     └────────┬────────┘                │
              │                         │
              ▼                         ▼
     ┌────────────────────────────────────┐
     │         /subscribe                 │
     │   Выбор плана: неделя / месяц      │
     │   [Оформить подписку]              │
     └──────────────┬─────────────────────┘
                    │
                    ▼
     ┌────────────────────────────────────┐
     │         /payment                   │
     │   мутация createSubscription       │
     │   → confirmationToken              │
     │   → виджет YooKassa (Этап 2)       │
     └──────────────┬─────────────────────┘
                    │ payment.succeeded (вебхук)
                    ▼
     ┌────────────────────────────────────┐
     │      /payment/success              │
     │   «Подписка оформлена!»            │
     │   [Начать расчёт]                  │
     └──────────────┬─────────────────────┘
                    │
                    ▼
     ┌────────────────────────────────────┐
     │      / (Главная)                   │
     │   Бейдж Premium активен            │
     │   Кредиты: 5 или 25               │
     │   Вкладка История: разблокирована  │
     └────────────────────────────────────┘
```

---

## Этап 2: Интеграция YooKassa (Обработка платежей)

### 2.1 YooKassa SDK

**Зависимость:** `@a2seven/yoo-checkout` (или прямой HTTP к YooKassa REST API)

```bash
pnpm --filter @razbor/api add @a2seven/yoo-checkout
```

**Новый файл:** `packages/api/src/services/yookassa.service.ts`

```typescript
import { YooCheckout } from '@a2seven/yoo-checkout'

const checkout = new YooCheckout({
  shopId: process.env.YOOKASSA_SHOP_ID!,
  secretKey: process.env.YOOKASSA_SECRET_KEY!,
})

// Создать начальный платёж (поток через виджет)
export async function createSubscriptionPayment(params: {
  amount: number          // в рублях (249 или 788)
  userId: string
  plan: 'weekly' | 'monthly'
  idempotencyKey: string
  description: string
}): Promise<{
  confirmationToken: string
  yooPaymentId: string
}>
// Использует confirmation.type = 'embedded' для виджета
// Устанавливает save_payment_method = true для рекуррентных платежей
// Возвращает confirmation.confirmation_token

// Создать рекуррентный платёж (автопродление, без UI)
export async function createRecurringPayment(params: {
  amount: number
  paymentMethodId: string   // сохранённый ID платёжного метода YooKassa
  userId: string
  subscriptionId: string
  idempotencyKey: string
  description: string
}): Promise<{
  yooPaymentId: string
  status: string
}>
// Использует payment_method_id вместо confirmation
// Не требует взаимодействия пользователя

// Получить детали платежа (запасной вариант через поллинг)
export async function getPaymentInfo(paymentId: string): Promise<PaymentObject>
```

**Переменные окружения:**

```bash
# .env / .env.example / .env.production.example
YOOKASSA_SHOP_ID=123456
YOOKASSA_SECRET_KEY=test_...
```

---

### 2.2 Обработчик вебхуков

**Новый файл:** `apps/server/src/payments/yookassa-webhook.ts`

**Маршрут:** `POST /api/yookassa/webhook`

Добавить в `apps/server/src/index.ts`:
```typescript
server.route({
  url: '/api/yookassa/webhook',
  method: 'POST',
  handler: handleYooKassaWebhook,
})
```

**Логика обработчика:**

```typescript
export async function handleYooKassaWebhook(body: WebhookEvent): Promise<void> {
  // 1. Проверить IP источника (белый список YooKassa)
  //    185.71.76.0/27, 185.71.77.0/27, 77.75.153.0/25,
  //    77.75.156.11, 77.75.156.35, 77.75.154.128/25
  //
  // 2. Распарсить тип события
  //
  // 3. Обработать payment.succeeded:
  //    a. Найти YooPayment по yooPaymentId
  //    b. Обновить YooPayment.status = 'succeeded'
  //    c. Если использовался save_payment_method → сохранить PaymentMethod
  //    d. Если начальный платёж → activateSubscription()
  //    e. Если рекуррентный платёж → renewSubscription()
  //
  // 4. Обработать payment.canceled:
  //    a. Найти YooPayment по yooPaymentId
  //    b. Обновить YooPayment.status = 'canceled'
  //    c. Если рекуррентный → оставить подписку в past_due (повтор обработает)
  //
  // 5. Вернуть 200 немедленно (YooKassa требует быстрый ответ)
}
```

**Безопасность: проверка белого списка IP**

```typescript
const YOOKASSA_IPS = [
  '185.71.76.0/27',
  '185.71.77.0/27',
  '77.75.153.0/25',
  '77.75.156.11',
  '77.75.156.35',
  '77.75.154.128/25',
]
```

---

### 2.3 Фронтенд: Виджет YooKassa

#### Подключение скрипта

**Файл:** `apps/mini-app/index.html`

```html
<script src="https://yookassa.ru/checkout-widget/v1/checkout-widget.js"></script>
```

#### TypeScript декларации

**Новый файл:** `apps/mini-app/src/types/yookassa.d.ts`

```typescript
declare global {
  interface Window {
    YooMoneyCheckoutWidget: new (config: {
      confirmation_token: string
      return_url?: string
      customization?: {
        colors?: {
          control_primary?: string    // Цвет CTA кнопки
          background?: string         // Фон виджета
        }
      }
      error_callback?: (error: unknown) => void
    }) => {
      render: (containerId: string) => Promise<void>
      destroy: () => void
      on: (event: 'success' | 'fail', callback: () => void) => void
    }
  }
}
export {}
```

#### React хук

**Новый файл:** `apps/mini-app/src/hooks/use-yookassa-widget.ts`

```typescript
export function useYooKassaWidget(params: {
  confirmationToken: string | null
  containerId: string
  onSuccess: () => void
  onFail: () => void
}): {
  isReady: boolean
  error: string | null
}
```

Логика:
1. Ждать пока `confirmationToken` станет не null
2. Создать `new window.YooMoneyCheckoutWidget({...})`
3. Кастомизировать цвета для тёмной темы: `control_primary: '#F59E0B'`, `background: '#18181b'`
4. Установить `return_url` как запасной вариант: `${location.origin}/#/payment/success`
5. Зарегистрировать обработчики `on('success')` и `on('fail')`
6. Вызвать `widget.render(containerId)`
7. Очистка: `widget.destroy()` при размонтировании

#### Интеграция с PaymentPage

**Файл:** `apps/mini-app/src/pages/PaymentPage.tsx`

Полный поток:
1. Получить `plan` из `useLocation().state`
2. Вызвать мутацию `createSubscription({ plan })`
3. Во время загрузки: спиннер + «Подготовка платежа...»
4. При успехе мутации: получить `confirmationToken`
5. Передать в хук `useYooKassaWidget`
6. Виджет рендерится в `<div id="payment-form" className="min-h-[400px]" />`
7. `onSuccess`: инвалидировать запросы `['me']`, `['mySubscription']`, перейти на `/payment/success`
8. `onFail`: показать ошибку + «Попробовать снова» (перегенерирует ключ идемпотентности, повторно вызовет мутацию)

#### Запасной вариант с поллингом

После `on('success')` виджета подписка может быть ещё не активирована (задержка вебхука). Добавить поллинг:
```typescript
// После успеха виджета:
// 1. Перейти на /payment/success
// 2. PaymentSuccessPage запрашивает 'mySubscription'
// 3. Если ещё не активна: поллинг каждые 3с максимум 30с
// 4. Показывать «Обработка платежа...» во время поллинга
```

---

### 2.4 Подключение крона к YooKassa

**Файл:** `apps/server/src/cron/renewal.ts`

Заменить заглушку логики списания на реальный вызов `createRecurringPayment()`:
```typescript
// В processRenewals():
const paymentMethod = await prisma.paymentMethod.findFirst({
  where: { userId: subscription.userId, isDefault: true }
})

if (!paymentMethod) {
  // Нет сохранённой карты → завершить подписку
  await expireSubscription(prisma, subscription.id)
  return
}

const result = await createRecurringPayment({
  amount: SUBSCRIPTION_PLANS[subscription.plan].price,
  paymentMethodId: paymentMethod.yooPaymentMethodId,
  userId: subscription.userId,
  subscriptionId: subscription.id,
  idempotencyKey: cuid(),
  description: `Продление подписки ${subscription.plan}`,
})
```

---

### 2.5 Управление картами

**Поток удаления карты:**
1. Пользователь переходит на `/subscribe` (режим управления)
2. Нажимает «Удалить» на сохранённой карте
3. Фронтенд вызывает мутацию `removePaymentMethod(paymentMethodId)`
4. Бэкенд:
   - Если у пользователя активная подписка → показать предупреждение «Автопродление будет отключено»
   - Если пользователь подтверждает → удалить PaymentMethod + установить `subscription.cancelAtPeriodEnd = true`
   - Если нет активной подписки → просто удалить PaymentMethod

---

## Инвентарь файлов

### Новые файлы (18 всего)

| # | Файл | Этап | Назначение |
|---|------|------|------------|
| 1 | `packages/api/src/services/credits.service.ts` | 1 | Логика баланса кредитов |
| 2 | `packages/api/src/services/subscription.service.ts` | 1 | Жизненный цикл подписки |
| 3 | `packages/api/src/schema/types/subscription.ts` | 1 | GraphQL тип подписки |
| 4 | `packages/api/src/schema/types/subscription-plan.ts` | 1 | GraphQL тип плана подписки |
| 5 | `packages/api/src/schema/types/payment-method.ts` | 1 | GraphQL тип способа оплаты |
| 6 | `packages/api/src/schema/queries/subscription.ts` | 1 | Запросы подписки |
| 7 | `packages/api/src/schema/mutations/subscription.ts` | 1 | Мутации подписки |
| 8 | `apps/mini-app/src/pages/SubscribePage.tsx` | 1 | Выбор плана + управление |
| 9 | `apps/mini-app/src/pages/PaymentPage.tsx` | 1 | Страница оплаты (виджет в Этапе 2) |
| 10 | `apps/mini-app/src/pages/PaymentSuccessPage.tsx` | 1 | Успешная оплата |
| 11 | `apps/mini-app/src/components/features/plan-card.tsx` | 1 | Компонент карточки плана |
| 12 | `apps/mini-app/src/components/features/subscription-status.tsx` | 1 | Карточка статуса подписки |
| 13 | `apps/mini-app/src/components/features/payment-method-card.tsx` | 1 | Компонент сохранённой карты |
| 14 | `packages/api/src/services/yookassa.service.ts` | 2 | Обёртка над YooKassa SDK |
| 15 | `apps/server/src/payments/yookassa-webhook.ts` | 2 | Обработчик вебхуков |
| 16 | `apps/server/src/cron/renewal.ts` | 2 | Крон автопродления |
| 17 | `apps/mini-app/src/hooks/use-yookassa-widget.ts` | 2 | React хук виджета |
| 18 | `apps/mini-app/src/types/yookassa.d.ts` | 2 | TS декларации |

### Изменяемые файлы (17 всего)

| # | Файл | Этап | Изменение |
|---|------|------|-----------|
| 1 | `packages/db/prisma/schema.prisma` | 1 | +2 enum, +3 модели, изменение User |
| 2 | `packages/shared/src/index.ts` | 1 | Константы подписок, убрать FREE_CALCULATIONS_LIMIT |
| 3 | `packages/api/src/schema/types/user.ts` | 1 | Добавить поля кредитов + подписки |
| 4 | `packages/api/src/schema/types/index.ts` | 1 | Импорт новых типов |
| 5 | `packages/api/src/schema/queries/me.ts` | 1 | Кредиты + подписка в ответе |
| 6 | `packages/api/src/schema/queries/usage.ts` | 1 | usageInfo на основе кредитов |
| 7 | `packages/api/src/schema/queries/index.ts` | 1 | Импорт запросов подписки |
| 8 | `packages/api/src/schema/mutations/calculate.ts` | 1 | Проверка лимита на основе кредитов |
| 9 | `packages/api/src/schema/mutations/index.ts` | 1 | Импорт мутаций подписки |
| 10 | `packages/graphql-client/src/documents.ts` | 1 | Новые запросы/мутации, обновление me/usageInfo |
| 11 | `apps/mini-app/src/App.tsx` | 1 | +3 маршрута |
| 12 | `apps/mini-app/src/pages/ProfilePage.tsx` | 1 | UI кредитов + переход на /subscribe |
| 13 | `apps/mini-app/src/pages/HistoryPage.tsx` | 1 | Переход на /subscribe |
| 14 | `apps/mini-app/src/pages/LimitReachedPage.tsx` | 1 | CTA Premium, убрать таймер |
| 15 | `apps/mini-app/index.html` | 2 | Скрипт виджета YooKassa |
| 16 | `apps/server/src/index.ts` | 2 | Маршрут вебхука + запуск крона |
| 17 | `.env.example` | 2 | Переменные окружения YooKassa |

---

## Тест-кейсы

### Этап 1: Логика подписок

#### TC-1.1: Пробные кредиты (бесплатный пользователь)

| # | Сценарий | Шаги | Ожидаемый результат |
|---|----------|------|---------------------|
| 1 | Новый пользователь имеет 3 пробных | Регистрация через Telegram | `trialCredits=3`, `totalCredits=3` |
| 2 | Использование 1 пробного кредита | Выполнить расчёт | `trialCredits=2`, `totalCredits=2` |
| 3 | Использование всех 3 пробных | Выполнить 3 расчёта | `trialCredits=0`, `totalCredits=0` |
| 4 | Лимит исчерпан | Попытка 4-го расчёта | Ошибка «Лимит расчётов исчерпан», редирект на `/limit-reached` |
| 5 | Пробные никогда не сбрасываются | Подождать любое время, проверить снова | `trialCredits=0` (по-прежнему 0) |

#### TC-1.2: Покупка подписки

| # | Сценарий | Шаги | Ожидаемый результат |
|---|----------|------|---------------------|
| 1 | Покупка недельной (все пробные) | Пользователь с 3 пробными покупает недельную | `trialCredits=3`, `subscriptionCredits=5`, `total=8` |
| 2 | Покупка недельной (частично пробные) | Пользователь с 1 пробным покупает недельную | `trialCredits=1`, `subscriptionCredits=5`, `total=6` |
| 3 | Покупка недельной (без пробных) | Пользователь с 0 пробными покупает недельную | `trialCredits=0`, `subscriptionCredits=5`, `total=5` |
| 4 | Покупка месячной | Любой пользователь покупает месячную | `subscriptionCredits=25`, `isPremium=true` |
| 5 | Уже подписан | Попытка купить при активной подписке | Ошибка «Подписка уже активна» |

#### TC-1.3: Использование кредитов с подпиской

| # | Сценарий | Шаги | Ожидаемый результат |
|---|----------|------|---------------------|
| 1 | Кредиты подписки тратятся первыми | trial=2, sub=5. Расчёт | `trial=2`, `sub=4` (подписка уменьшена) |
| 2 | Кредиты подписки исчерпаны | trial=2, sub=0. Расчёт | `trial=1`, `sub=0` (пробные уменьшены) |
| 3 | Все кредиты исчерпаны | trial=0, sub=0. Расчёт | Ошибка «Лимит расчётов исчерпан» |
| 4 | Доступ к истории | Активная подписка, открыть /history | Полная история видна |
| 5 | История заблокирована | Нет активной подписки, открыть /history | Блюр + «Разблокировать» |

#### TC-1.4: Смена плана

| # | Сценарий | Шаги | Ожидаемый результат |
|---|----------|------|---------------------|
| 1 | Недельный → Месячный | Активная недельная (2/5 осталось), купить месячную | `subscriptionCredits=25` (замена, не 27) |
| 2 | Месячный → Недельный | Активная месячная (10/25 осталось), купить недельную | `subscriptionCredits=5` (замена) |

#### TC-1.5: Отмена подписки

| # | Сценарий | Шаги | Ожидаемый результат |
|---|----------|------|---------------------|
| 1 | Отмена подписки | Активная подписка, нажать «Отменить» | `cancelAtPeriodEnd=true`, всё ещё активна |
| 2 | Отменённая подписка работает | Использовать кредиты после отмены | Кредиты работают до конца периода |
| 3 | Период заканчивается после отмены | Дождаться окончания periodEnd | `status='canceled'`, `isPremium=false`, `credits=0` |
| 4 | История заблокирована после истечения | Открыть /history после отмены | Блюр + заблокировано |
| 5 | Переподписка | Купить новый план после отмены | Создана новая подписка |

#### TC-1.6: Истечение подписки

| # | Сценарий | Шаги | Ожидаемый результат |
|---|----------|------|---------------------|
| 1 | Подписка истекает | Период закончился, нет продления | `status='expired'`, `isPremium=false` |
| 2 | Кредиты сгорают | Было 10 кредитов, истекла | `subscriptionCredits=0` |
| 3 | Пробные кредиты сохраняются | Было trial=1 до подписки | После истечения: `trial=1`, `sub=0`, `total=1` |
| 4 | Можно считать с пробными | Истёкшая подписка но trial=1 | Расчёт выполняется успешно |

#### TC-1.7: Состояния UI

| # | Сценарий | Страница | Ожидаемый UI |
|---|----------|----------|--------------|
| 1 | Бесплатный пользователь | ProfilePage | Кнопка «Получите Premium», «Осталось расчётов: 3» |
| 2 | Premium пользователь | ProfilePage | Бейдж с короной, инфо о плане, кредиты, срок |
| 3 | Бесплатный пользователь | HistoryPage | Блюр-оверлей, иконка замка, «Разблокировать» → /subscribe |
| 4 | Premium пользователь | HistoryPage | Полная история расчётов |
| 5 | Лимит исчерпан (бесплатный) | LimitReachedPage | «Пробные расчёты закончились», «Оформить Premium» |
| 6 | Лимит исчерпан (истёкший) | LimitReachedPage | «Продлить подписку» |
| 7 | Нет подписки | SubscribePage | Карточки планов, CTA кнопка |
| 8 | Активная подписка | SubscribePage | Карточка статуса, кредиты, кнопка отмены |

---

### Этап 2: Интеграция YooKassa

#### TC-2.1: Поток оплаты

| # | Сценарий | Шаги | Ожидаемый результат |
|---|----------|------|---------------------|
| 1 | Успешная оплата | Выбрать план → оплатить тестовой картой `4111 1111 1111 1111` | Виджет показывает успех, редирект на /payment/success |
| 2 | Виджет рендерится | Перейти на /payment | Виджет YooKassa виден с тёмной темой |
| 3 | Неудачная оплата | Ввести отклонённую карту `5555 5555 5555 4444` | Виджет показывает ошибку, кнопка «Попробовать снова» |
| 4 | Отмена оплаты | Закрыть виджет / перейти назад | Платёж остаётся «pending», подписка не меняется |
| 5 | Карта сохранена | Завершить оплату | Создан PaymentMethod с данными карты |

#### TC-2.2: Обработка вебхуков

| # | Сценарий | Шаги | Ожидаемый результат |
|---|----------|------|---------------------|
| 1 | payment.succeeded | YooKassa отправляет вебхук | Подписка активирована, карта сохранена |
| 2 | payment.canceled | YooKassa отправляет отмену | Статус YooPayment обновлён |
| 3 | Дублирующий вебхук | Одно и то же событие отправлено дважды | Идемпотентно, без двойной активации |
| 4 | Невалидный IP | Вебхук с неизвестного IP | Отклонено (403) |
| 5 | Вебхук раньше фронтенда | Вебхук приходит мгновенно | Подписка активна до того как фронтенд опросит |

#### TC-2.3: Рекуррентные платежи

| # | Сценарий | Шаги | Ожидаемый результат |
|---|----------|------|---------------------|
| 1 | Успешное автопродление | Период закончился, карта валидна | Новый период, кредиты сброшены |
| 2 | Карта автопродления истекла | Период закончился, карта истекла | `status='past_due'`, повтор запланирован |
| 3 | Повтор 1 успешен | Повтор через 1 день | `status='active'`, кредиты сброшены |
| 4 | Все повторы провалились | 3 повтора за 3 дня | `status='expired'`, `isPremium=false` |
| 5 | Нет сохранённой карты | Период закончился, нет PaymentMethod | Подписка истекает немедленно |

#### TC-2.4: Управление картами

| # | Сценарий | Шаги | Ожидаемый результат |
|---|----------|------|---------------------|
| 1 | Просмотр сохранённой карты | Открыть /subscribe (управление) | Карта показана: `**** 4477 MasterCard 01/30` |
| 2 | Удаление карты (без подписки) | Удалить карту без активной подписки | Карта удалена |
| 3 | Удаление карты (с подпиской) | Удалить карту с активной подпиской | Предупреждение «Автопродление будет отключено», `cancelAtPeriodEnd=true` |

#### TC-2.5: Граничные случаи

| # | Сценарий | Шаги | Ожидаемый результат |
|---|----------|------|---------------------|
| 1 | Идемпотентный платёж | Вызвать createSubscription дважды быстро | Возвращается тот же ID платежа |
| 2 | Приложение закрыто во время оплаты | Закрыть Telegram во время виджета | `return_url` перенаправляет обратно, проверка статуса подписки |
| 3 | Ошибка сети при мутации | Нет интернета при вызове createSubscription | Ошибка + кнопка повтора |
| 4 | Подписка во время past_due | Купить новый план пока past_due | Новый платёж, старая подписка заменена |
| 5 | Параллельные расчёты | 2 расчёта одновременно, 1 кредит остался | Один успешен, один проваливается (транзакция БД) |
| 6 | Виджет в Telegram WebView | Открыть оплату на iOS/Android Telegram | Виджет рендерится корректно в iframe |
| 7 | Крон запускается при перезагрузке сервера | Сервер перезагружается в середине крона | Нет двойных списаний (ключ идемпотентности) |
