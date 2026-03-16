import { test, expect } from './fixtures/auth'
import { mockGraphQL } from './helpers/graphql'
import {
  SUBSCRIPTION_PLANS,
  MY_SUBSCRIPTION_ACTIVE,
  MY_SUBSCRIPTION_CANCELLING,
  PAYMENT_METHODS,
  PAYMENT_METHODS_EMPTY,
  CANCEL_SUBSCRIPTION_SUCCESS,
  RESUME_SUBSCRIPTION_SUCCESS,
} from './fixtures/mock-data'

test.describe('E2E-3: Subscribe page (active subscription)', () => {
  test('shows subscription status card with plan name', async ({ page }) => {
    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_ACTIVE,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
    })

    await page.goto('/?web=1#/subscribe')

    await expect(page.getByRole('heading', { name: 'Premium подписка' })).toBeVisible()
    await expect(page.getByText(/Premium · 1 месяц/)).toBeVisible()
  })

  test('shows credits progress', async ({ page }) => {
    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_ACTIVE,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
    })

    await page.goto('/?web=1#/subscribe')

    await expect(page.getByText(/Осталось:.*20.*из 60/)).toBeVisible()
    await expect(page.getByText('80%')).toBeVisible()
  })

  test('shows auto-renewal status "Вкл"', async ({ page }) => {
    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_ACTIVE,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
    })

    await page.goto('/?web=1#/subscribe')

    await expect(page.getByText('Автопродление')).toBeVisible()
    await expect(page.getByText('Вкл')).toBeVisible()
  })

  test('cancel button opens confirmation drawer', async ({ page }) => {
    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_ACTIVE,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
    })

    await page.goto('/?web=1#/subscribe')

    await page.getByRole('button', { name: 'Отменить подписку' }).click()
    await expect(page.getByText('Отменить подписку?')).toBeVisible()
    await expect(page.getByText(/Подписка останется активной до конца оплаченного периода/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Да, отменить' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Оставить подписку' })).toBeVisible()
  })

  test('cancel confirmation calls mutation and updates UI', async ({ page }) => {
    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_ACTIVE,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
      CancelSubscription: () => CANCEL_SUBSCRIPTION_SUCCESS,
    })

    await page.goto('/?web=1#/subscribe')
    await page.getByRole('button', { name: 'Отменить подписку' }).click()

    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_CANCELLING,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
      GetMe: () => ({
        me: {
          id: 'test-user-2',
          firstName: 'Premium',
          lastName: 'User',
          username: 'premium_user',
          isPremium: true,
          totalCalculations: 10,
          trialCredits: 0,
          subscriptionCredits: 20,
          totalCredits: 20,
          subscription: { ...MY_SUBSCRIPTION_CANCELLING.mySubscription },
        },
      }),
      CancelSubscription: () => CANCEL_SUBSCRIPTION_SUCCESS,
    })

    await page.getByRole('button', { name: 'Да, отменить' }).click()
    await expect(page.getByText('Отключено')).toBeVisible()
  })

  test('cancelled subscription shows resume and change plan buttons', async ({ page }) => {
    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_CANCELLING,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
    })

    await page.goto('/?web=1#/subscribe')

    await expect(page.getByRole('button', { name: 'Возобновить автопродление' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Сменить план' })).toBeVisible()
  })

  test('resume button opens confirmation drawer', async ({ page }) => {
    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_CANCELLING,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
    })

    await page.goto('/?web=1#/subscribe')
    await page.getByRole('button', { name: 'Возобновить автопродление' }).click()

    await expect(page.getByText('Возобновить подписку?')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Да, возобновить' })).toBeVisible()
  })

  test('resume confirmation calls mutation', async ({ page }) => {
    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_CANCELLING,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
      ResumeSubscription: () => RESUME_SUBSCRIPTION_SUCCESS,
    })

    await page.goto('/?web=1#/subscribe')
    await page.getByRole('button', { name: 'Возобновить автопродление' }).click()

    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_ACTIVE,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
      GetMe: () => ({
        me: {
          id: 'test-user-2',
          firstName: 'Premium',
          lastName: 'User',
          username: 'premium_user',
          isPremium: true,
          totalCalculations: 10,
          trialCredits: 0,
          subscriptionCredits: 20,
          totalCredits: 20,
          subscription: { ...MY_SUBSCRIPTION_ACTIVE.mySubscription },
        },
      }),
      ResumeSubscription: () => RESUME_SUBSCRIPTION_SUCCESS,
    })

    await page.getByRole('button', { name: 'Да, возобновить' }).click()
    await expect(page.getByText('Вкл')).toBeVisible()
  })

  test('"Сменить план" shows plans list', async ({ page }) => {
    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_CANCELLING,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
    })

    await page.goto('/?web=1#/subscribe')
    await page.getByRole('button', { name: 'Сменить план' }).click()

    await expect(page.getByText('Выберите план:')).toBeVisible()
    await expect(page.getByText('1 неделя')).toBeVisible()
    await expect(page.getByText('1 месяц')).toBeVisible()
  })

  test('payment methods are displayed', async ({ page }) => {
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
})
