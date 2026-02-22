import { test, expect } from './fixtures/auth'
import { mockGraphQL } from './helpers/graphql'
import {
  BRANDS,
  BRAND_LADA,
  MODEL_VESTA,
  GENERATION_BY_ID,
  GENERATION_CONFIGS_EMPTY,
  CALCULATION_RESULT,
  USAGE_FREE_WITH_CREDITS,
  USAGE_FREE_NO_CREDITS,
  FREE_USER,
  FREE_USER_ZERO_CREDITS,
  MY_SUBSCRIPTION_NONE,
  PAYMENT_METHODS_EMPTY,
  SUBSCRIPTION_PLANS,
  MY_CALCULATIONS_EMPTY,
} from './fixtures/mock-data'

test.describe('E2E-1: Free user flow', () => {
  test('full calculation flow: brand -> model -> generation -> estimation -> result', async ({ page }) => {
    let usageCredits = 2

    await mockGraphQL(page, {
      GetBrands: () => BRANDS,
      GetBrand: () => BRAND_LADA,
      GetModel: () => MODEL_VESTA,
      GetGeneration: () => GENERATION_BY_ID,
      GetGenerationById: () => GENERATION_BY_ID,
      GetGenerationConfigs: () => GENERATION_CONFIGS_EMPTY,
      GetUsageInfo: () => ({
        usageInfo: {
          trialCredits: usageCredits,
          subscriptionCredits: 0,
          totalCredits: usageCredits,
          hasActiveSubscription: false,
        },
      }),
      GetMe: () => FREE_USER,
      Calculate: () => {
        usageCredits = Math.max(0, usageCredits - 1)
        return CALCULATION_RESULT
      },
    })

    await page.goto('/?web=1')
    await expect(page.getByRole('heading', { name: 'Оценка авто по запчастям' })).toBeVisible()

    await page.getByRole('link', { name: 'Lada' }).click()
    await expect(page.getByText('Выберите модель')).toBeVisible()

    await page.getByRole('link', { name: 'Vesta' }).click()
    await expect(page.getByText('Выберите поколение')).toBeVisible()

    await page.getByRole('link', { name: /I \(2015-2023\)/ }).click()

    await expect(page.getByText('Отметьте повреждения на автомобиле')).toBeVisible()
    await expect(page.getByText('Lada Vesta')).toBeVisible()

    await page.getByRole('button', { name: 'РАССЧИТАТЬ' }).click()

    await expect(page.getByText('Расчётная стоимость запчастей')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Новый расчёт' })).toBeVisible()
  })

  test('limit-reached page appears when no credits remain', async ({ page }) => {
    await page.route('**/api/graphql', async (route) => {
      const body = JSON.parse(route.request().postData() ?? '{}')
      const op = body.query?.match(/(?:query|mutation)\s+(\w+)/)?.[1]

      const handlers: Record<string, () => unknown> = {
        GetBrands: () => BRANDS,
        GetBrand: () => BRAND_LADA,
        GetModel: () => MODEL_VESTA,
        GetGeneration: () => GENERATION_BY_ID,
        GetGenerationById: () => GENERATION_BY_ID,
        GetGenerationConfigs: () => GENERATION_CONFIGS_EMPTY,
        GetUsageInfo: () => USAGE_FREE_NO_CREDITS,
        GetMe: () => FREE_USER_ZERO_CREDITS,
      }

      if (op === 'Calculate') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: null,
            errors: [{ message: 'Лимит расчётов исчерпан' }],
          }),
        })
        return
      }

      if (op && handlers[op]) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: handlers[op]() }),
        })
        return
      }

      await route.continue()
    })

    await page.goto('/?web=1')
    await page.getByRole('link', { name: 'Lada' }).click()
    await page.getByRole('link', { name: 'Vesta' }).click()
    await page.getByRole('link', { name: /I \(2015-2023\)/ }).click()
    await expect(page.getByText('Отметьте повреждения на автомобиле')).toBeVisible()
    await page.getByRole('button', { name: 'РАССЧИТАТЬ' }).click()

    await expect(page.getByRole('heading', { name: 'Пробные расчёты закончились' })).toBeVisible()
  })

  test('limit-reached: Premium button navigates to /subscribe', async ({ page }) => {
    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_NONE,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
    })

    await page.goto('/?web=1#/limit-reached')

    await expect(page.getByRole('button', { name: 'Оформить Premium' })).toBeVisible()
    await page.getByRole('button', { name: 'Оформить Premium' }).click()

    await expect(page.getByRole('heading', { name: 'Premium подписка' })).toBeVisible()
  })

  test('limit-reached: home button navigates to /', async ({ page }) => {
    await mockGraphQL(page, {
      GetBrands: () => BRANDS,
      GetUsageInfo: () => USAGE_FREE_NO_CREDITS,
    })

    await page.goto('/?web=1#/limit-reached')
    await page.getByRole('link', { name: 'На главную' }).click()
    await expect(page.getByRole('heading', { name: 'Оценка авто по запчастям' })).toBeVisible()
  })

  test('tab bar navigation works', async ({ page }) => {
    await mockGraphQL(page, {
      GetBrands: () => BRANDS,
      GetUsageInfo: () => USAGE_FREE_WITH_CREDITS,
      GetMe: () => FREE_USER,
      GetMyCalculations: () => MY_CALCULATIONS_EMPTY,
    })

    await page.goto('/?web=1')
    await expect(page.getByRole('heading', { name: 'Оценка авто по запчастям' })).toBeVisible()

    await page.getByRole('link', { name: 'История' }).click()
    await expect(page.getByRole('heading', { name: 'История', exact: true })).toBeVisible()

    await page.getByRole('link', { name: 'Профиль' }).click()
    await expect(page.getByRole('heading', { name: 'Test User' })).toBeVisible()

    await page.getByRole('link', { name: 'Расчёт' }).click()
    await expect(page.getByRole('heading', { name: 'Оценка авто по запчастям' })).toBeVisible()
  })

  test('profile page shows correct data for free user', async ({ page }) => {
    await mockGraphQL(page, {
      GetMe: () => FREE_USER,
    })

    await page.goto('/?web=1#/profile')

    await expect(page.getByRole('heading', { name: 'Test User' })).toBeVisible()
    await expect(page.getByText('@test_user')).toBeVisible()
    await expect(page.getByText('Расчётов', { exact: true })).toBeVisible()
    await expect(page.getByText('Осталось расчётов')).toBeVisible()
    await expect(page.getByText('Получите Premium')).toBeVisible()
  })

  test('profile page: Get Premium navigates to /subscribe', async ({ page }) => {
    await mockGraphQL(page, {
      GetMe: () => FREE_USER,
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_NONE,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
    })

    await page.goto('/?web=1#/profile')
    await expect(page.getByText('Получите Premium')).toBeVisible()
    await page.getByText('Получите Premium').click()

    await expect(page.getByRole('heading', { name: 'Premium подписка' })).toBeVisible()
  })
})
