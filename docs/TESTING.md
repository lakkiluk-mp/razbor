# Тестирование модулей подписки и оплаты

Документация покрывает все тестовые сценарии для модулей подписки, оплаты и кредитов.

**Общая статистика:**

| Уровень | Тестов | Файлов | Фреймворк |
|---------|--------|--------|-----------|
| Unit-тесты | 100 | 6 | Vitest |
| Интеграционные (GraphQL) | 46 | 4 | Vitest |
| E2E | 76 | 11 | Playwright |
| **Итого** | **222** | **21** | |

---

## Содержание

- [Запуск тестов](#запуск-тестов)
- [Unit-тесты](#unit-тесты)
  - [Константы и утилиты (shared)](#1-константы-и-утилиты-shared)
  - [Сервис кредитов](#2-сервис-кредитов)
  - [Сервис подписок](#3-сервис-подписок)
  - [Сервис вебхуков ЮKassa](#4-сервис-вебхуков-юkassa)
  - [Сервис использования](#5-сервис-использования)
  - [Cron продления подписок](#6-cron-продления-подписок)
- [Интеграционные тесты (GraphQL)](#интеграционные-тесты-graphql)
  - [Query: subscription](#7-query-subscription)
  - [Query: usage](#8-query-usage)
  - [Query: me](#9-query-me)
  - [Mutation: subscription](#10-mutation-subscription)
  - [Mutation: calculate](#11-mutation-calculate)
- [E2E тесты](#e2e-тесты)
  - [Флоу бесплатного пользователя](#e2e-1-флоу-бесплатного-пользователя)
  - [Страница подписки (без подписки)](#e2e-2-страница-подписки-без-активной-подписки)
  - [Страница подписки (активная)](#e2e-3-страница-подписки-активная-подписка)
  - [Страница оплаты](#e2e-4-страница-оплаты)
  - [Успешная оплата](#e2e-5-страница-успешной-оплаты)
  - [Страница профиля](#e2e-6-страница-профиля)
  - [Страница истории](#e2e-7-страница-истории)
  - [Счётчик кредитов](#e2e-8-отображение-кредитов)
  - [Способы оплаты](#e2e-9-способы-оплаты)
  - [Реальные платёжные тесты](#e2e-10-реальные-платёжные-тесты-staging-без-моков)
- [Исправления безопасности](#исправления-безопасности)
- [Что НЕ покрыто тестами](#что-не-покрыто-тестами)

---

## Запуск тестов

### Unit и интеграционные тесты

```bash
# Все unit-тесты
pnpm test

# По пакетам
pnpm --filter @razbor/shared test
pnpm --filter @razbor/api test
pnpm --filter @razbor/server test
```

### E2E тесты

```bash
# Запуск всех E2E (против staging https://vrazbore.tech)
npx playwright test

# Конкретный файл
npx playwright test e2e/subscribe-page.spec.ts

# С UI
npx playwright test --ui
```

### Конфигурация

| Параметр | Unit (Vitest) | E2E (Playwright) |
|----------|---------------|------------------|
| Окружение | `node` | `chromium` |
| Viewport | -- | 390x844 (iPhone 14) |
| Locale | -- | `ru-RU` |
| baseURL | -- | `https://vrazbore.tech` |
| Timeout | 5s (default) | 30s |
| Retries (CI) | 0 | 2 |

---

## Unit-тесты

### 1. Константы и утилиты (shared)

**Файл:** `packages/shared/src/__tests__/index.test.ts`
**Тестов:** 28

Проверяет корректность всех экспортируемых констант и утилит из `@razbor/shared`.

#### SUBSCRIPTION_PLANS (8 тестов)

| Тест | Ожидаемое значение |
|------|-------------------|
| weekly.price | `249` |
| weekly.days | `7` |
| weekly.credits | `5` |
| monthly.price | `799` |
| monthly.days | `30` |
| monthly.credits | `25` |
| labels (weekly / monthly) | `"1 неделя"` / `"1 месяц"` |
| количество планов | `2` (weekly, monthly) |

#### TRIAL_CREDITS (1 тест)

| Тест | Ожидаемое значение |
|------|-------------------|
| значение | `3` |

#### pluralCredits (10 тестов)

Склонение слова "расчёт" по правилам русского языка:

| Вход | Результат | Форма |
|------|-----------|-------|
| 0 | расчётов | множественное |
| 1 | расчёт | единственное |
| 2, 3, 4 | расчёта | родительный ед. |
| 5, 11, 12 | расчётов | множественное |
| 21 | расчёт | единственное |
| 111 | расчётов | множественное (исключение для -11) |

#### PLAN_LABELS (2 теста)

| Ключ | Значение |
|------|----------|
| `weekly` | `"1 неделя"` |
| `monthly` | `"1 месяц"` |

#### Прочие константы (4 теста)

| Константа | Значение | Назначение |
|-----------|----------|------------|
| `SUBSCRIPTION_MAX_RETRIES` | `3` | Макс. попыток повторного списания |
| `SUBSCRIPTION_PLANS.weekly.graceDays` | `1` | Grace period для недельной подписки |
| `SUBSCRIPTION_PLANS.monthly.graceDays` | `3` | Grace period для месячной подписки |
| `CACHE_TTL.prices` | `14 * 24 * 60 * 60` (14 дней) | TTL кэша цен |
| `ROUTES.home` | `"/"` | Маршруты приложения |

#### formatPrice (1 тест)

| Вход | Проверка |
|------|----------|
| `100000` | Результат содержит `"100"` |

#### ROUTES (3 теста)

| Метод | Вход | Результат |
|-------|------|-----------|
| `home` | -- | `"/"` |
| `brand('toyota')` | `'toyota'` | `"/toyota"` |
| `model('toyota', 'camry')` | `'toyota', 'camry'` | `"/toyota/camry"` |

---

### 2. Сервис кредитов

**Файл:** `packages/api/src/services/__tests__/credits.service.test.ts`
**Тестов:** 21

Тестирует функции `getRemainingCredits`, `useCredit`, `refundCredit`, `hasCredits`. Prisma замокана через `prismaMock`.

#### ACTIVE_STATUSES (1 тест)

| Тест | Ожидание |
|------|----------|
| содержит active и past_due | `['active', 'past_due']` |

#### getRemainingCredits (9 тестов)

| Сценарий | trial | subscription | total |
|----------|-------|--------------|-------|
| Пользователь с trial + подпиской | 3 | 10 | 13 |
| 0 trial + активная подписка | 0 | 5 | 5 |
| Trial без подписки | 3 | 0 | 3 |
| 0 trial и нет подписки | 0 | 0 | 0 |
| Пользователь не найден | 0 | 0 | 0 |
| past_due подписка (кредиты учитываются) | 0 | 7 | 7 |
| Отменённая подписка (не учитывается) | 2 | 0 | 2 |
| Истёкшая подписка (не учитывается) | 1 | 0 | 1 |
| Несколько подписок (берётся последняя) | 0 | 15 | 15 |

#### useCredit (7 тестов)

| Сценарий | Результат |
|----------|-----------|
| Подписка с credits > 0 | `{ type: 'subscription', subscriptionId }`, subscription.credits -= 1 |
| Нет подписки, trial > 0 | `{ type: 'trial' }`, user.trialCredits -= 1 |
| past_due подписка (используются кредиты) | `{ type: 'subscription' }` |
| Нет подписки, trial > 0 | `{ type: 'trial' }` |
| credits=0 и trial=0 | Бросает `"Лимит расчётов исчерпан"` |
| Приоритет: подписка важнее trial | subscription декрементируется, user.updateMany не вызывается |
| Race condition через транзакцию | $transaction вызывается, при count=0 бросает ошибку |

#### refundCredit (2 теста)

| Сценарий | Действие |
|----------|----------|
| source = subscription | `subscription.update({ credits: { increment: 1 } })` |
| source = trial | `user.update({ trialCredits: { increment: 1 } })` |

#### hasCredits (2 теста)

| Сценарий | Результат |
|----------|-----------|
| total > 0 | `true` |
| total = 0 | `false` |

---

### 3. Сервис подписок

**Файл:** `packages/api/src/services/__tests__/subscription.service.test.ts`
**Тестов:** 27

#### getActiveSubscription (4 теста)

| Сценарий | Результат |
|----------|-----------|
| Есть активная подписка | Возвращает объект подписки |
| Нет подписки | `null` |
| past_due подписка | Возвращает объект (past_due входит в ACTIVE_STATUSES) |
| Несколько подписок | Возвращает последнюю (`orderBy: createdAt desc`) |

#### createSubscription (7 тестов)

| Сценарий | Проверка |
|----------|----------|
| Создание weekly | `plan: 'weekly', credits: 5, creditsTotal: 5, status: 'active'` |
| Создание monthly | `credits: 25, creditsTotal: 25` |
| isPremium на пользователе | `user.update({ isPremium: true })` |
| Уже есть подписка | Бросает `"У вас уже есть активная подписка"` |
| Период weekly | `currentPeriodEnd - currentPeriodStart = 7 дней` |
| Период monthly | `currentPeriodEnd - currentPeriodStart = 30 дней` |

#### cancelSubscription (3 теста)

| Сценарий | Результат |
|----------|-----------|
| Успешная отмена | `cancelAtPeriodEnd: true` |
| Подписка не найдена | Бросает `"Подписка не найдена"` |
| Чужая подписка | Бросает `"Подписка не найдена"` |

#### resumeSubscription (4 теста)

| Сценарий | Результат |
|----------|-----------|
| Возобновление | `cancelAtPeriodEnd: false` |
| Подписка не найдена | Бросает `"Подписка не найдена"` |
| Чужая подписка | Бросает `"Подписка не найдена"` |
| Не была отменена | Бросает `"Подписка не была отменена"` |

#### renewSubscription (7 тестов)

| Сценарий | Результат |
|----------|-----------|
| Active weekly | Сброс: `credits: 5, retryCount: 0, status: 'active', cancelAtPeriodEnd: false` |
| past_due monthly | `credits: 25, status: 'active'` |
| Не найдена | Бросает `"Подписка не найдена"` |
| status = canceled | Бросает `"Невозможно продлить подписку в статусе canceled"` |
| status = expired | Бросает `"Невозможно продлить подписку в статусе expired"` |
| Период weekly | `periodEnd - periodStart = 7 дней` |
| Период monthly | `periodEnd - periodStart = 30 дней` |

#### expireSubscription (3 теста)

| Сценарий | Результат |
|----------|-----------|
| Истечение | `status: 'expired', credits: 0` |
| isPremium | `user.update({ isPremium: false })` |
| Не найдена | Бросает `"Подписка не найдена"` |

---

### 4. Сервис вебхуков ЮKassa

**Файл:** `packages/api/src/services/__tests__/yookassa-webhook.service.test.ts`
**Тестов:** 21

Замоканы: `getPaymentInfo`, `createSubscription`, `renewSubscription`.

#### handlePaymentSucceeded (18 тестов)

| Сценарий | Проверка |
|----------|----------|
| Поиск yooPayment с retry | 3 попытки с задержкой 5с, findUnique вызван 3 раза |
| Не найден после retry | console.error("YooPayment not found"), getPaymentInfo не вызван |
| Верификация через API | `getPaymentInfo('yoo-pay-1')` вызван |
| API вернул не succeeded | console.error("API verification failed"), updateMany не вызван |
| **Amount mismatch** | **При amount < plan price: console.error("Amount mismatch"), updateMany не вызван** |
| Идемпотентность (updateMany.count=0) | createSubscription не вызван |
| Сохранение payment method (saved=true) | $transaction: updateMany(isDefault:false) + create(pm) |
| PM уже существует | $transaction не вызван |
| Сброс default PM | `paymentMethod.updateMany({ userId, data: { isDefault: false } })` |
| Создание подписки (type=subscription) | `createSubscription(prisma, userId, 'weekly')` |
| Привязка подписки к yooPayment | `yooPayment.update({ subscriptionId })` |
| Неизвестный план | console.error("Unknown plan"), createSubscription не вызван |
| Продление (type=recurring) | `renewSubscription(prisma, subscriptionId)` |
| Привязка подписки для recurring | `yooPayment.update({ subscriptionId })` |
| Recurring без subscriptionId | console.error("Missing subscriptionId"), renewSubscription не вызван |
| Нет metadata | Ни createSubscription, ни renewSubscription не вызваны |
| PM saved=false | paymentMethod.findUnique не вызван |
| Обновление статуса | `updateMany({ where: { id, status: 'pending' }, data: { status: 'succeeded' } })` |

#### handlePaymentCanceled (3 теста)

| Сценарий | Проверка |
|----------|----------|
| Отмена платежа | `updateMany({ status: 'pending' -> 'canceled' })` |
| Не найден | console.error("YooPayment not found for cancel"), updateMany не вызван |
| Уже обработан (count=0) | console.log("already processed") |

---

### 5. Сервис использования

**Файл:** `packages/api/src/services/__tests__/usage.service.test.ts`
**Тестов:** 3

| Сценарий | Проверка |
|----------|----------|
| Логирование действия | `usageLog.create({ userId, action: 'calculation' })` |
| С метаданными | `metadata: { generationId, totalPrice }` |
| Ошибка БД | Пробрасывает `"DB connection failed"` |

---

### 6. Cron продления подписок

**Файл:** `apps/server/src/cron/__tests__/renewal.test.ts`
**Тестов:** 22

Замоканы: `renewSubscription`, `expireSubscription`, `createRecurringPayment`. Время зафиксировано: `2026-02-15T12:00:00Z`.

| Сценарий | Проверка |
|----------|----------|
| Запрос истёкших подписок | `findMany({ currentPeriodEnd: { lt: now }, status: { in: ACTIVE_STATUSES } })` |
| cancelAtPeriodEnd=true | `$transaction` (отмена), isPremium=false |
| Активная: списание при истечении | `createRecurringPayment({ paymentMethodId, amount: 249 })` |
| Успешное списание | `renewSubscription(prisma, subId)` |
| Неудачное списание (active) | `subscription.update({ status: 'past_due', retryCount: 1 })` |
| Нет PM | `expireSubscription(prisma, subId)` |
| past_due retries >= max (3) | `expireSubscription(prisma, subId)` |
| past_due: retry после задержки | `createRecurringPayment` + `renewSubscription` |
| past_due: delay не прошёл | `createRecurringPayment` не вызван |
| past_due: retry failed | `subscription.update({ retryCount: { increment: 1 } })` |
| past_due: retry throw error | `retryCount: { increment: 1 }` |
| Backoff delay (retryCount=2) | Не вызывает charge (прошло < 2 дней) |
| retryCount=1, прошёл 1 день | Вызывает charge |
| Несколько подписок | Обрабатываются независимо |
| Ошибка одной подписки | Продолжает обработку остальных |
| lastRetryAt=null | `daysSinceLastRetry = Infinity`, charge вызывается |
| Запись yooPayment для recurring | `yooPayment.create({ isRecurring: true, status, amount })` |
| Статус canceled в yooPayment | `yooPayment.create({ status: 'canceled' })` |
| Неизвестный статус -> pending | `yooPayment.create({ status: 'pending' })` |

#### Алгоритм backoff:

| retryCount | Задержка (дней) |
|------------|----------------|
| 0 (первый charge) | 0 (сразу) |
| 1 | 1 день |
| 2 | 2 дня |
| >= 3 | Подписка истекает |

---

## Интеграционные тесты (GraphQL)

Выполняют реальные GraphQL запросы через `executeQuery` / `executeAsAnonymous` с замоканной Prisma.

### 7. Query: subscription

**Файл:** `packages/api/src/schema/queries/__tests__/subscription.test.ts`
**Тестов:** 12

#### mySubscription (7 тестов)

| Сценарий | Результат |
|----------|-----------|
| Активная подписка | Все поля (id, plan, status, credits, daysRemaining >= 6) |
| Нет подписки | `null` |
| Не авторизован | `null`, getActiveSubscription не вызван |
| status=past_due | Данные возвращаются |
| expired (не в ACTIVE_STATUSES) | `null` |
| Период истёк | `daysRemaining: 0` |
| Передаёт userId в сервис | `getActiveSubscription(prisma, 'test-user-id')` |

#### subscriptionPlans (2 теста)

| Сценарий | Результат |
|----------|-----------|
| Возвращает 2 плана | weekly: {249, 7, 5}, monthly: {799, 30, 25} |
| Не требует авторизации | Работает для анонимного пользователя |

#### myPaymentMethods (3 теста)

| Сценарий | Результат |
|----------|-----------|
| Есть методы оплаты | Массив с cardLast4, cardType, isDefault |
| Нет методов | `[]` |
| Не авторизован | `[]`, findMany не вызван |

---

### 8. Query: usage

**Файл:** `packages/api/src/schema/queries/__tests__/usage.test.ts`
**Тестов:** 3

| Сценарий | trialCredits | subscriptionCredits | totalCredits | hasActiveSubscription |
|----------|-------------|--------------------|--------------|-----------------------|
| Trial + подписка | 2 | 10 | 12 | true |
| Trial без подписки | 3 | 0 | 3 | false |
| Не авторизован | 3 | 0 | 3 | false |

---

### 9. Query: me

**Файл:** `packages/api/src/schema/queries/__tests__/me.test.ts`
**Тестов:** 7

| Сценарий | Проверка |
|----------|----------|
| Без подписки | firstName, lastName, username, isPremium=false, totalCalculations=5, subscription=null |
| С подпиской | subscription.plan='monthly', credits=20, creditsTotal=25, isPremium=true |
| Не найден в БД | `null` |
| Не авторизован | `null`, findUnique не вызван |
| isPremium корректен | `true` при наличии подписки |
| totalCalculations | Корректное значение (42) |
| daysRemaining на подписке | 4-5 (для end = now + 5 дней) |

---

### 10. Mutation: subscription

**Файл:** `packages/api/src/schema/mutations/__tests__/subscription.test.ts`
**Тестов:** 20

#### createSubscription (7 тестов)

| Сценарий | Проверка |
|----------|----------|
| Успешное создание | `confirmationToken`, yooPayment.create с userId, yooPaymentId, idempotencyKey, status='pending' |
| Не авторизован | `"Требуется авторизация"` |
| Есть активная подписка | `"У вас уже есть активная подписка"` |
| Недавний платёж (< 1 мин) | `"Подождите минуту перед повторной попыткой"` |
| Удаление pending платежей | `deleteMany({ userId, status: 'pending', isRecurring: { not: true } })` |
| Сумма weekly | `createSubscriptionPayment({ amount: 249, plan: 'weekly' })` |
| Сумма monthly | `createSubscriptionPayment({ amount: 799, plan: 'monthly' })` |

#### cancelSubscription (3 теста)

| Сценарий | Проверка |
|----------|----------|
| Успешная отмена | `cancelAtPeriodEnd: true` |
| Не авторизован | `"Требуется авторизация"` |
| Нет подписки | `"Активная подписка не найдена"` |

#### resumeSubscription (4 теста)

| Сценарий | Проверка |
|----------|----------|
| Успешное возобновление | `cancelAtPeriodEnd: false` |
| Не авторизован | `"Требуется авторизация"` |
| Нет подписки | `"Активная подписка не найдена"` |
| Не отменена | `"Подписка не была отменена"` |

#### removePaymentMethod (6 тестов)

| Сценарий | Проверка |
|----------|----------|
| Удаление своего метода | `delete({ where: { id } })`, `count({ where: { userId } })` |
| Не найден | `"Способ оплаты не найден"` |
| Не авторизован | `"Требуется авторизация"` |
| Последний PM + активная подписка | `subscription.update({ cancelAtPeriodEnd: true })` |
| Не последний PM | `subscription.findFirst` не вызван |
| Последний PM, нет подписки | `subscription.update` не вызван |

---

### 11. Mutation: calculate

**Файл:** `packages/api/src/schema/mutations/__tests__/calculate.test.ts`
**Тестов:** 4

| Сценарий | Проверка |
|----------|----------|
| Успешный расчёт | `totalPrice: 150000`, `parts[0].part.name`, `calculation.create({ userId, generationId, totalPrice })` |
| Нет кредитов | `"Лимит расчётов исчерпан"` |
| Ошибка калькулятора | `refundCredit(prisma, userId, creditSource)`, ошибка пробрасывается |
| Не авторизован | `"Требуется авторизация"`, useCredit не вызван |

---

## E2E тесты

Все E2E тесты работают с мокнутыми GraphQL ответами через `page.route()`. Браузер: Chromium. Viewport: 390x844 (iPhone 14).

### E2E-1: Флоу бесплатного пользователя

**Файл:** `e2e/free-user-flow.spec.ts`
**Тестов:** 7

| Тест | Проверка |
|------|----------|
| Полный расчёт: марка -> модель -> поколение -> калькулятор -> результат | Последовательная навигация, "Расчётная стоимость запчастей" отображается |
| Лимит исчерпан | "Пробные расчёты закончились" при ошибке Calculate |
| Лимит: кнопка Premium -> /subscribe | "Оформить Premium" ведёт на "Premium подписка" |
| Лимит: кнопка домой -> / | "На главную" ведёт на "Калькулятор запчастей" |
| Tab bar навигация | Расчёт -> История -> Профиль -> Расчёт |
| Профиль | Имя, @username, "Расчётов", "Осталось расчётов", "Получите Premium" |
| Профиль: Premium -> /subscribe | "Получите Premium" ведёт на "Premium подписка" |

---

### E2E-2: Страница подписки (без активной подписки)

**Файл:** `e2e/subscribe-page.spec.ts`
**Тестов:** 8

| Тест | Проверка |
|------|----------|
| Заголовок и фичи | "Premium подписка", "До 25 расчётов в месяц", "Доступ к истории расчётов", "Подробная детализация запчастей", "Поддержка всех марок" |
| Оба плана | "1 неделя" / "1 месяц", "249 ₽" / "799 ₽" |
| Weekly по умолчанию | CTA содержит "249" |
| Бейдж "Выгодно" | Отображается на monthly |
| Выбор monthly | CTA обновляется на "799" |
| Кредиты в планах | "5 расчётов", "25 расчётов" |
| CTA -> /payment | "Оформить подписку" ведёт на "Подготовка платежа\|Оплата" |
| Лейбл "Выберите план:" | Отображается |

---

### E2E-3: Страница подписки (активная подписка)

**Файл:** `e2e/subscribe-page-active.spec.ts`
**Тестов:** 10

| Тест | Проверка |
|------|----------|
| Карточка статуса | "Premium . 1 месяц" |
| Прогресс кредитов | "Осталось: 20 из 25", "80%" |
| Автопродление | "Автопродление", "Вкл" |
| Кнопка отмены | Drawer: "Отменить подписку?", "Да, отменить", "Оставить подписку" |
| Подтверждение отмены | Мутация CancelSubscription, UI: "Отключено" |
| Отменённая: кнопки | "Возобновить автопродление", "Сменить план" |
| Resume drawer | "Возобновить подписку?", "Да, возобновить" |
| Подтверждение resume | Мутация ResumeSubscription, UI: "Вкл" |
| Сменить план | "Выберите план:", "1 неделя", "1 месяц" |
| Способы оплаты | "Способ оплаты", "\*\*\*\*4242", "Visa 12/2027" |

---

### E2E-4: Страница оплаты

**Файл:** `e2e/payment-page.spec.ts`
**Тестов:** 5

| Тест | Проверка |
|------|----------|
| Редирект без плана | /payment -> /subscribe ("Premium подписка") |
| Loading state | "Подготовка платежа..." |
| Ошибка мутации | "Ошибка создания платежа", кнопки "Попробовать снова" и "Назад" |
| "Назад" при ошибке | Возврат на /subscribe |
| Карточка плана после токена | "Оплата", "Premium 1 неделя", "5 расчётов" |

---

### E2E-5: Страница успешной оплаты

**Файл:** `e2e/payment-success.spec.ts`
**Тестов:** 6

| Тест | Проверка |
|------|----------|
| Polling spinner | "Активируем подписку..." |
| Успех | "Подписка оформлена!" |
| Детали подписки | "Premium 1 месяц", "План", "Расчёты", "Активна до" |
| CTA "Начать расчёт" | Навигация на главную |
| Timeout (30с) | "Платёж обрабатывается", кнопка "На главную" |
| Timeout CTA | "На главную" ведёт на "Калькулятор запчастей" |

---

### E2E-6: Страница профиля

**Файл:** `e2e/profile-page.spec.ts`
**Тестов:** 10

#### Без подписки (7 тестов)

| Тест | Проверка |
|------|----------|
| Имя и username | "Test User", "@test_user" |
| Аватар | Заголовок с именем |
| Количество расчётов | "2", "Расчётов" |
| Оставшиеся кредиты | "1", "Осталось расчётов" |
| Карточка Premium | "Получите Premium", "Полная история расчётов и дополнительные оценки" |
| Premium -> /subscribe | Навигация на "Premium подписка" |
| Версия приложения | "Razbor v1.0.0" |

#### С подпиской (3 теста)

| Тест | Проверка |
|------|----------|
| Карточка подписки | "Premium . 1 месяц" |
| Кредиты подписки | "Осталось: 20 из 25" |
| Навигация на /subscribe | Клик ведёт на "Premium подписка" |

---

### E2E-7: Страница истории

**Файл:** `e2e/history-page.spec.ts`
**Тестов:** 7

#### Бесплатный пользователь (3 теста)

| Тест | Проверка |
|------|----------|
| Размытые фейковые карточки | "Lada Vesta", "Hyundai Solaris", "Kia Rio" |
| Lock overlay | "История расчётов", "Оформите подписку...", "Разблокировать" |
| Разблокировать -> /subscribe | Навигация на "Premium подписка" |

#### Premium с расчётами (1 тест)

| Тест | Проверка |
|------|----------|
| Реальные карточки | "Lada Vesta", "Hyundai Solaris" |

#### Premium без расчётов (2 теста)

| Тест | Проверка |
|------|----------|
| Пустое состояние | "Пока нет расчётов", ссылка "Начать расчёт" |
| Начать расчёт -> / | Навигация на "Калькулятор запчастей" |

---

### E2E-8: Отображение кредитов

**Файл:** `e2e/usage-counter.spec.ts`
**Тестов:** 3

| Тест | Пользователь | Проверка |
|------|-------------|----------|
| Trial кредиты | Free (1 кредит) | "1", "Осталось расчётов" |
| Нулевые кредиты | Free (0 кредитов) | "0", "Осталось расчётов" |
| Кредиты подписки | Premium | "Осталось: 20 из 25" |

---

### E2E-9: Способы оплаты

**Файл:** `e2e/payment-methods.spec.ts`
**Тестов:** 3

| Тест | Проверка |
|------|----------|
| Карточка с маскированным номером | "Способ оплаты", "\*\*\*\*4242", "Visa 12/2027" |
| Пустой список | "Способ оплаты" не отображается |
| Удаление (trash icon) | Мутация RemovePaymentMethod, секция исчезает |

---

### E2E-10: Реальные платёжные тесты (staging, без моков)

**Файлы:** `e2e/real-payment.spec.ts`, `e2e/helpers/staging-db.ts`
**Тестов:** 17

Реальные платёжные тесты против staging-среды (`vrazbore.tech`) с тестовыми картами ЮKassa. Без моков — все запросы идут к реальному серверу, оплата проходит через реальный виджет ЮKassa в тестовом режиме.

**Предусловия:**
- VPN доступ к staging БД (PostgreSQL)
- `ALLOW_WEB_ACCESS=true` на staging для доступа через `?web=1`
- Тестовый пользователь `Dev User` (`telegramId: 999999999`) в БД

**Тестовая карта:** `4111 1111 1111 1111` (CVC: `000`, срок: любой)

**Флоу:** `test.describe.serial` — тесты выполняются последовательно, каждый зависит от предыдущего.

| # | Тест | Проверка |
|---|------|----------|
| 1 | weekly subscription — full payment flow | Страница подписки -> оплата 249 ₽ -> виджет ЮKassa -> карта -> "Подписка оформлена!", API: plan=weekly, status=active, credits=5 |
| 2 | double purchase blocked — shows management UI | При активной подписке: "Отменить подписку" вместо формы покупки |
| 3 | saved payment method appears after purchase | API: cardLast4 есть, isDefault=true. UI: "Способ оплаты", маскированный номер |
| 4 | cancel subscription | "Отменить подписку" -> drawer -> "Да, отменить" -> "Возобновить автопродление". API: cancelAtPeriodEnd=true |
| 5 | resume subscription after cancel | "Возобновить автопродление" -> drawer -> "Да, возобновить" -> "Отменить подписку". API: cancelAtPeriodEnd=false |
| 6 | profile reflects active subscription | Профиль: "Dev User", "Premium . 1 неделя", "Осталось: N из 5" |
| 7 | remove last payment method auto-cancels subscription | API: удаление PM -> methods=0, cancelAtPeriodEnd=true. UI: "Возобновить автопродление" |
| 8 | cancel subscription then remove payment method | cleanupDevUser() -> нет PM, нет подписки -> "Выберите план:" |
| 9 | monthly subscription — full payment flow | Выбор "1 месяц" -> оплата 799 ₽ -> виджет ЮKassa -> API: plan=monthly, credits=25 |
| 10 | subscription credits verified via API | API: mySubscription.credits=25, me.subscriptionCredits=25, totalCredits>=25 |
| 11 | expire subscription via DB — profile shows no subscription | DB: status=expired -> UI: "Выберите план:", профиль: "Получите Premium" |
| 12 | re-subscribe after expiration works | После истечения -> повторная оплата weekly -> status=active |
| 13 | no duplicate payments — idempotencyKeys are unique | Все idempotencyKey уникальны, succeeded платежи имеют amount > 0 |
| 14 | past_due status — API still returns active subscription with credits | DB: status=past_due, retryCount=1 -> API: status=past_due, credits > 0 |
| 15 | past_due — profile still shows Premium | Профиль: "Dev User", "Premium" отображается |
| 16 | expired after max retries — user loses access | DB: status=expired, retryCount=3, credits=0, isPremium=false -> API: subscription=null, isPremium=false. UI: "Получите Premium", "Выберите план:" |
| 17 | re-subscribe after past_due expiration | Повторная подписка weekly -> status=active, credits=5, общий счёт платежей >= 3 |

#### DB Helper функции (`e2e/helpers/staging-db.ts`)

Прямые SQL-запросы к staging PostgreSQL через `psql` для управления состоянием тестов.

| Функция | Назначение |
|---------|------------|
| `getDevUserId()` | Получить ID пользователя по telegramId=999999999 |
| `cleanupDevUser()` | Удалить все yoo_payments, subscriptions, payment_methods пользователя |
| `expireSubscription()` | Установить status=expired, currentPeriodEnd в прошлое |
| `setSubscriptionEndDate(minutes)` | Установить конец периода через N минут |
| `getSubscriptionStatus()` | Получить текущий status, plan, credits, cancelAtPeriodEnd |
| `getPaymentMethodCount()` | Количество сохранённых PM |
| `getYooPaymentCount()` | Количество yoo_payments |
| `getYooPayments()` | Список платежей (id, status, amount, isRecurring, idempotencyKey) |
| `setSubscriptionPastDue(retryCount)` | Установить status=past_due, retryCount, lastRetryAt=NOW() |
| `setSubscriptionExpiredAfterRetries()` | Установить status=expired, credits=0, retryCount=3, isPremium=false |

---

## Исправления безопасности

Три критических исправления, покрытые тестами:

### 1. Idempotency Key (yookassa.service.ts)

**Проблема:** UUID мог генерироваться после API-вызова, создавая риск дублирования.
**Исправление:** UUID генерируется ДО вызова API и передаётся вторым параметром в SDK.
**Покрытие:** Интеграционные тесты `createSubscription` проверяют наличие `idempotencyKey` в yooPayment.create.

### 2. Верификация суммы (yookassa-webhook.service.ts)

**Проблема:** Webhook не проверял, совпадает ли оплаченная сумма с ценой плана.
**Исправление:** `handlePaymentSucceeded` сверяет `amount.value` из API с ценой плана. При несовпадении -- ранний возврат.
**Покрытие:** Unit-тест "should reject payment when amount is less than plan price" -- `Amount mismatch`, `updateMany` не вызывается.

### 3. IP Whitelist (yookassa-webhook.ts)

**Проблема:** Проверка IP ЮKassa отключалась при `NODE_ENV !== 'production'`, что небезопасно для staging.
**Исправление:** Отдельная переменная окружения `YOOKASSA_SKIP_IP_CHECK` вместо привязки к `NODE_ENV`.
**Покрытие:** Конфигурационное изменение, не покрыто автотестами.

---

## Что НЕ покрыто тестами

| Область | Причина |
|---------|---------|
| ~~Реальная интеграция с ЮKassa API~~ | **ПОКРЫТО** (E2E-10: тестовый режим ЮKassa с реальными картами) |
| ~~Реальный платёжный поток end-to-end~~ | **ПОКРЫТО** (E2E-10: полный цикл оплата -> webhook -> подписка) |
| Race conditions при создании подписки | Конкурентное создание из двух клиентов одновременно |
| Database constraints (FK, unique) | Prisma замокана в unit-тестах. Частично покрыто real-e2e (staging БД) |
| Redis кэш (инвалидация, TTL) | Не покрыт тестами |
| Поведение в Telegram WebView (mobile) | E2E тесты работают в обычном Chromium, а не в WebView |
| IP Whitelist middleware | Только конфигурационное изменение |
| Webhook retry/timeout от ЮKassa | Серверная часть retry не тестируется |
| Смена плана (upgrade/downgrade) | Функционал ещё не реализован |

---

## Карта покрытия по модулям

```
Подписка
 createSubscription     [unit] [integration] [e2e] [real-e2e]
 cancelSubscription     [unit] [integration] [e2e] [real-e2e]
 resumeSubscription     [unit] [integration] [e2e] [real-e2e]
 renewSubscription      [unit] [cron]
 expireSubscription     [unit] [cron] [real-e2e]
 past_due flow          [unit] [cron] [real-e2e]
 re-subscribe           [real-e2e]

Оплата
 createPayment          [integration] [real-e2e]
 handlePaymentSucceeded [unit] [real-e2e]
 handlePaymentCanceled  [unit]
 removePaymentMethod    [integration] [e2e] [real-e2e]
 savePaymentMethod      [unit] [real-e2e]
 idempotencyKey         [integration] [real-e2e]

Кредиты
 getRemainingCredits    [unit] [integration] [real-e2e]
 useCredit              [unit] [integration]
 refundCredit           [unit] [integration]
 hasCredits             [unit]

Cron
 processRenewals        [unit]
```
