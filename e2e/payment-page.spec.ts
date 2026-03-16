import { test, expect } from './fixtures/auth'
import { mockGraphQL } from './helpers/graphql'
import {
  CREATE_SUBSCRIPTION_SUCCESS,
  SUBSCRIPTION_PLANS,
  MY_SUBSCRIPTION_NONE,
  PAYMENT_METHODS_EMPTY,
} from './fixtures/mock-data'

test.describe('E2E-4: Payment page', () => {
  test('redirects to /subscribe when no plan in state', async ({ page }) => {
    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_NONE,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
    })

    await page.goto('/?web=1#/payment')
    await expect(page.getByRole('heading', { name: 'Premium подписка' })).toBeVisible()
  })

  test('shows loading state while creating subscription', async ({ page }) => {
    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_NONE,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
      CreateSubscription: () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(CREATE_SUBSCRIPTION_SUCCESS), 5000),
        ),
    })

    await page.goto('/?web=1#/subscribe')
    await page.getByRole('button', { name: /Оформить подписку/ }).click()

    await expect(page.getByText('Подготовка платежа...')).toBeVisible()
  })

  test('shows error state on mutation failure', async ({ page }) => {
    await page.route('**/api/graphql', async (route) => {
      const body = JSON.parse(route.request().postData() ?? '{}')
      const op = body.query?.match(/(?:query|mutation)\s+(\w+)/)?.[1]

      if (op === 'CreateSubscription') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: null,
            errors: [{ message: 'Internal error' }],
          }),
        })
        return
      }

      if (op === 'GetSubscriptionPlans') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: SUBSCRIPTION_PLANS }),
        })
        return
      }

      if (op === 'GetMySubscription') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: MY_SUBSCRIPTION_NONE }),
        })
        return
      }

      if (op === 'GetMyPaymentMethods') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: PAYMENT_METHODS_EMPTY }),
        })
        return
      }

      await route.continue()
    })

    await page.goto('/?web=1#/subscribe')
    await page.getByRole('button', { name: /Оформить подписку/ }).click()

    await expect(page.getByText('Ошибка создания платежа')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Попробовать снова' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Назад' })).toBeVisible()
  })

  test('error state: "Назад" navigates to /subscribe', async ({ page }) => {
    await page.route('**/api/graphql', async (route) => {
      const body = JSON.parse(route.request().postData() ?? '{}')
      const op = body.query?.match(/(?:query|mutation)\s+(\w+)/)?.[1]

      if (op === 'CreateSubscription') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: null,
            errors: [{ message: 'Internal error' }],
          }),
        })
        return
      }

      if (op === 'GetSubscriptionPlans') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: SUBSCRIPTION_PLANS }),
        })
        return
      }

      if (op === 'GetMySubscription') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: MY_SUBSCRIPTION_NONE }),
        })
        return
      }

      if (op === 'GetMyPaymentMethods') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: PAYMENT_METHODS_EMPTY }),
        })
        return
      }

      await route.continue()
    })

    await page.goto('/?web=1#/subscribe')
    await page.getByRole('button', { name: /Оформить подписку/ }).click()
    await expect(page.getByText('Ошибка создания платежа')).toBeVisible()

    await page.getByRole('button', { name: 'Назад' }).click()
    await expect(page.getByRole('heading', { name: 'Premium подписка' })).toBeVisible()
  })

  test('shows plan info card after token received', async ({ page }) => {
    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_NONE,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
      CreateSubscription: () => CREATE_SUBSCRIPTION_SUCCESS,
    })

    await page.goto('/?web=1#/subscribe')
    await page.getByRole('button', { name: /Оформить подписку 249/ }).click()

    await expect(page.getByRole('heading', { name: 'Оплата' })).toBeVisible()
    await expect(page.getByText(/Premium.*1 неделя/)).toBeVisible()
    await expect(page.getByText(/15 расчётов/)).toBeVisible()
  })
})
