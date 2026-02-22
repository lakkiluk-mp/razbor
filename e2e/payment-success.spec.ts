import { test, expect } from './fixtures/auth'
import { mockGraphQL } from './helpers/graphql'
import {
  MY_SUBSCRIPTION_ACTIVE,
  MY_SUBSCRIPTION_NONE,
  BRANDS,
  USAGE_PREMIUM,
} from './fixtures/mock-data'

test.describe('E2E-5: Payment success page', () => {
  test('shows polling spinner while waiting for subscription', async ({ page }) => {
    await mockGraphQL(page, {
      GetMySubscription: () => MY_SUBSCRIPTION_NONE,
    })

    await page.goto('/?web=1#/payment/success')
    await expect(page.getByText('Активируем подписку...')).toBeVisible()
  })

  test('shows success state after subscription activates', async ({ page }) => {
    await mockGraphQL(page, {
      GetMySubscription: () => MY_SUBSCRIPTION_ACTIVE,
    })

    await page.goto('/?web=1#/payment/success')

    await expect(page.getByRole('heading', { name: 'Подписка оформлена!' })).toBeVisible()
  })

  test('displays subscription details on success', async ({ page }) => {
    await mockGraphQL(page, {
      GetMySubscription: () => MY_SUBSCRIPTION_ACTIVE,
    })

    await page.goto('/?web=1#/payment/success')

    await expect(page.getByText(/Premium.*1 месяц/)).toBeVisible()
    await expect(page.getByText('План')).toBeVisible()
    await expect(page.getByText('Расчёты')).toBeVisible()
    await expect(page.getByText('Активна до')).toBeVisible()
  })

  test('CTA button "Начать расчёт" navigates to home', async ({ page }) => {
    await mockGraphQL(page, {
      GetMySubscription: () => MY_SUBSCRIPTION_ACTIVE,
      GetBrands: () => BRANDS,
      GetUsageInfo: () => USAGE_PREMIUM,
    })

    await page.goto('/?web=1#/payment/success')

    await expect(page.getByRole('heading', { name: 'Подписка оформлена!' })).toBeVisible()
    await page.getByRole('button', { name: 'Начать расчёт' }).click()
    await expect(page.getByRole('heading', { name: 'Оценка авто по запчастям' })).toBeVisible()
  })

  test('shows timeout message if subscription does not appear', async ({ page }) => {
    test.setTimeout(60_000)
    await mockGraphQL(page, {
      GetMySubscription: () => MY_SUBSCRIPTION_NONE,
      GetBrands: () => BRANDS,
    })

    await page.goto('/?web=1#/payment/success')
    await expect(page.getByText('Активируем подписку...')).toBeVisible()

    await expect(page.getByRole('heading', { name: 'Платёж обрабатывается' })).toBeVisible({ timeout: 35000 })
    await expect(page.getByRole('button', { name: 'На главную' })).toBeVisible()
  })

  test('timeout CTA navigates to home', async ({ page }) => {
    test.setTimeout(60_000)
    await mockGraphQL(page, {
      GetMySubscription: () => MY_SUBSCRIPTION_NONE,
      GetBrands: () => BRANDS,
      GetUsageInfo: () => USAGE_PREMIUM,
    })

    await page.goto('/?web=1#/payment/success')
    await expect(page.getByRole('heading', { name: 'Платёж обрабатывается' })).toBeVisible({ timeout: 35000 })

    await page.getByRole('button', { name: 'На главную' }).click()
    await expect(page.getByRole('heading', { name: 'Оценка авто по запчастям' })).toBeVisible()
  })
})
