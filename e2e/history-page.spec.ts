import { test, expect } from './fixtures/auth'
import { mockGraphQL } from './helpers/graphql'
import {
  FREE_USER,
  PREMIUM_USER,
  MY_CALCULATIONS,
  MY_CALCULATIONS_EMPTY,
  SUBSCRIPTION_PLANS,
  MY_SUBSCRIPTION_NONE,
  MY_SUBSCRIPTION_ACTIVE,
  PAYMENT_METHODS_EMPTY,
  BRANDS,
} from './fixtures/mock-data'

test.describe('E2E-7: History page', () => {
  test.describe('free user (no subscription)', () => {
    test.beforeEach(async ({ page }) => {
      await mockGraphQL(page, {
        GetMe: () => FREE_USER,
      })
      await page.goto('/?web=1#/history')
    })

    test('shows blurred fake calculations', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'История', exact: true })).toBeVisible()
      await expect(page.getByText('Lada Vesta')).toBeVisible()
      await expect(page.getByText('Hyundai Solaris')).toBeVisible()
      await expect(page.getByText('Kia Rio')).toBeVisible()
    })

    test('shows lock overlay with "Разблокировать" button', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'История расчётов' })).toBeVisible()
      await expect(page.getByText('Оформите подписку чтобы просматривать историю всех ваших расчётов')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Разблокировать' })).toBeVisible()
    })

    test('"Разблокировать" navigates to /subscribe', async ({ page }) => {
      await mockGraphQL(page, {
        GetMe: () => FREE_USER,
        GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
        GetMySubscription: () => MY_SUBSCRIPTION_NONE,
        GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
      })

      await page.getByRole('button', { name: 'Разблокировать' }).click()
      await expect(page.getByRole('heading', { name: 'Premium подписка' })).toBeVisible()
    })
  })

  test.describe('premium user with calculations', () => {
    test('shows real calculation cards', async ({ page }) => {
      await mockGraphQL(page, {
        GetMe: () => PREMIUM_USER,
        GetMyCalculations: () => MY_CALCULATIONS,
      })

      await page.goto('/?web=1#/history')

      await expect(page.getByRole('heading', { name: 'История', exact: true })).toBeVisible()
      await expect(page.getByText('Lada Vesta')).toBeVisible()
      await expect(page.getByText('Hyundai Solaris')).toBeVisible()
    })
  })

  test.describe('premium user with no calculations', () => {
    test('shows empty state with "Начать расчёт" link', async ({ page }) => {
      await mockGraphQL(page, {
        GetMe: () => PREMIUM_USER,
        GetMyCalculations: () => MY_CALCULATIONS_EMPTY,
        GetBrands: () => BRANDS,
      })

      await page.goto('/?web=1#/history')

      await expect(page.getByRole('heading', { name: 'История', exact: true })).toBeVisible()
      await expect(page.getByText('Пока нет расчётов')).toBeVisible()
      await expect(page.getByRole('link', { name: 'Начать расчёт' })).toBeVisible()
    })

    test('"Начать расчёт" navigates to home', async ({ page }) => {
      await mockGraphQL(page, {
        GetMe: () => PREMIUM_USER,
        GetMyCalculations: () => MY_CALCULATIONS_EMPTY,
        GetBrands: () => BRANDS,
      })

      await page.goto('/?web=1#/history')
      await page.getByRole('link', { name: 'Начать расчёт' }).click()
      await expect(page.getByRole('heading', { name: 'Оценка авто по запчастям' })).toBeVisible()
    })
  })
})
