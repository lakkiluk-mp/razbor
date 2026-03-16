import { test, expect } from './fixtures/auth'
import { mockGraphQL } from './helpers/graphql'
import {
  FREE_USER,
  PREMIUM_USER,
  SUBSCRIPTION_PLANS,
  MY_SUBSCRIPTION_ACTIVE,
  MY_SUBSCRIPTION_NONE,
  PAYMENT_METHODS_EMPTY,
} from './fixtures/mock-data'

test.describe('E2E-6: Profile page', () => {
  test.describe('without subscription', () => {
    test.beforeEach(async ({ page }) => {
      await mockGraphQL(page, {
        GetMe: () => FREE_USER,
      })
      await page.goto('/?web=1#/profile')
    })

    test('shows user name and username', async ({ page }) => {
      await expect(page.getByText('Test User')).toBeVisible()
      await expect(page.getByText('@test_user')).toBeVisible()
    })

    test('shows user avatar initial', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Test User' })).toBeVisible()
    })

    test('shows calculation count', async ({ page }) => {
      await expect(page.getByText('2', { exact: true }).first()).toBeVisible()
      await expect(page.getByText('Расчётов', { exact: true })).toBeVisible()
    })

    test('shows remaining credits', async ({ page }) => {
      await expect(page.getByText('1', { exact: true }).first()).toBeVisible()
      await expect(page.getByText('Осталось расчётов')).toBeVisible()
    })

    test('shows "Получите Premium" card', async ({ page }) => {
      await expect(page.getByText('Получите Premium')).toBeVisible()
      await expect(page.getByText('Полная история расчётов и дополнительные оценки')).toBeVisible()
    })

    test('"Получите Premium" navigates to subscribe', async ({ page }) => {
      await mockGraphQL(page, {
        GetMe: () => FREE_USER,
        GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
        GetMySubscription: () => MY_SUBSCRIPTION_NONE,
        GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
      })

      await page.getByText('Получите Premium').click()
      await expect(page.getByRole('heading', { name: 'Premium подписка' })).toBeVisible()
    })

    test('shows app version', async ({ page }) => {
      await expect(page.getByText('Razbor v1.0.0')).toBeVisible()
    })
  })

  test.describe('with subscription', () => {
    test.beforeEach(async ({ page }) => {
      await mockGraphQL(page, {
        GetMe: () => PREMIUM_USER,
      })
      await page.goto('/?web=1#/profile')
    })

    test('shows premium subscription card with plan', async ({ page }) => {
      await expect(page.getByText(/Premium.*1 месяц/)).toBeVisible()
    })

    test('shows subscription credits info', async ({ page }) => {
      await expect(page.getByText(/Осталось:.*20.*из 60/)).toBeVisible()
    })

    test('premium card navigates to subscribe page', async ({ page }) => {
      await mockGraphQL(page, {
        GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
        GetMySubscription: () => MY_SUBSCRIPTION_ACTIVE,
        GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
      })

      await page.getByText(/Premium.*1 месяц/).click()
      await expect(page.getByRole('heading', { name: 'Premium подписка' })).toBeVisible()
    })
  })
})
