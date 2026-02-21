import { test, expect } from './fixtures/auth'
import { mockGraphQL } from './helpers/graphql'
import {
  SUBSCRIPTION_PLANS,
  MY_SUBSCRIPTION_NONE,
  PAYMENT_METHODS_EMPTY,
  CREATE_SUBSCRIPTION_SUCCESS,
} from './fixtures/mock-data'

test.describe('E2E-2: Subscribe page (no active subscription)', () => {
  test.beforeEach(async ({ page }) => {
    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_NONE,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
    })
    await page.goto('/?web=1#/subscribe')
  })

  test('shows Premium heading and feature list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Premium подписка' })).toBeVisible()
    await expect(page.getByText('До 25 расчётов в месяц')).toBeVisible()
    await expect(page.getByText('Доступ к истории расчётов')).toBeVisible()
    await expect(page.getByText('Подробная детализация запчастей')).toBeVisible()
    await expect(page.getByText('Поддержка всех марок')).toBeVisible()
  })

  test('displays both subscription plans', async ({ page }) => {
    await expect(page.getByText('1 неделя')).toBeVisible()
    await expect(page.getByText('1 месяц')).toBeVisible()
    await expect(page.getByText('249 ₽', { exact: true })).toBeVisible()
    await expect(page.getByText('799 ₽', { exact: true })).toBeVisible()
  })

  test('weekly plan is selected by default', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Оформить подписку 249/ })).toBeVisible()
  })

  test('shows "Выгодно" badge on monthly plan', async ({ page }) => {
    await expect(page.getByText('Выгодно')).toBeVisible()
  })

  test('selecting monthly plan updates CTA button price', async ({ page }) => {
    await page.getByText('1 месяц').click()
    await expect(page.getByRole('button', { name: /Оформить подписку 799/ })).toBeVisible()
  })

  test('shows plan label with credits', async ({ page }) => {
    await expect(page.getByText('5 расчётов', { exact: true })).toBeVisible()
    await expect(page.getByText('25 расчётов', { exact: true })).toBeVisible()
  })

  test('CTA button navigates to /payment', async ({ page }) => {
    await mockGraphQL(page, {
      GetSubscriptionPlans: () => SUBSCRIPTION_PLANS,
      GetMySubscription: () => MY_SUBSCRIPTION_NONE,
      GetMyPaymentMethods: () => PAYMENT_METHODS_EMPTY,
      CreateSubscription: () => CREATE_SUBSCRIPTION_SUCCESS,
    })

    await page.getByRole('button', { name: /Оформить подписку/ }).click()
    await expect(page.getByText(/Подготовка платежа|Оплата/)).toBeVisible()
  })

  test('shows "Выберите план:" label', async ({ page }) => {
    await expect(page.getByText('Выберите план:')).toBeVisible()
  })
})
