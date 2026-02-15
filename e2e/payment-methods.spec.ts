import { test, expect } from './fixtures/auth'
import { mockGraphQL } from './helpers/graphql'
import {
  SUBSCRIPTION_PLANS,
  MY_SUBSCRIPTION_ACTIVE,
  PAYMENT_METHODS,
  PAYMENT_METHODS_EMPTY,
} from './fixtures/mock-data'

test.describe('E2E-9: Payment methods', () => {
  test('displays payment method card with masked number', async ({ page }) => {
    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_ACTIVE,
      GetMyPaymentMethods: () => PAYMENT_METHODS,
    })

    await page.goto('/?web=1#/subscribe')

    await expect(page.getByText('Способ оплаты')).toBeVisible()
    await expect(page.getByText(/\*{4}.*4242/)).toBeVisible()
    await expect(page.getByText(/Visa.*12\/2027/)).toBeVisible()
  })

  test('does not show payment methods section when empty', async ({ page }) => {
    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_ACTIVE,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
    })

    await page.goto('/?web=1#/subscribe')

    await expect(page.getByRole('heading', { name: 'Premium подписка' })).toBeVisible()
    await expect(page.getByText('Способ оплаты')).not.toBeVisible()
  })

  test('remove button triggers removal mutation', async ({ page }) => {
    let removed = false

    await page.route('**/api/graphql', async (route) => {
      const body = JSON.parse(route.request().postData() ?? '{}')
      const op = body.query?.match(/(?:query|mutation)\s+(\w+)/)?.[1]

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
          body: JSON.stringify({ data: MY_SUBSCRIPTION_ACTIVE }),
        })
        return
      }

      if (op === 'GetMyPaymentMethods') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: removed ? PAYMENT_METHODS_EMPTY : PAYMENT_METHODS,
          }),
        })
        return
      }

      if (op === 'RemovePaymentMethod') {
        removed = true
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { removePaymentMethod: true },
          }),
        })
        return
      }

      await route.continue()
    })

    await page.goto('/?web=1#/subscribe')

    await expect(page.getByText(/\*{4}.*4242/)).toBeVisible()

    const trashButton = page.locator('button').filter({ has: page.locator('svg.lucide-trash-2') })
    await trashButton.click()

    await expect(page.getByText('Способ оплаты')).not.toBeVisible()
  })
})
