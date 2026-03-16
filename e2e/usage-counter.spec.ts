import { test, expect } from './fixtures/auth'
import { mockGraphQL } from './helpers/graphql'
import {
  FREE_USER,
  FREE_USER_ZERO_CREDITS,
  PREMIUM_USER,
} from './fixtures/mock-data'

test.describe('E2E-8: Credits display on profile', () => {
  test('displays trial credits for free user', async ({ page }) => {
    await mockGraphQL(page, {
      GetMe: () => FREE_USER,
    })

    await page.goto('/?web=1#/profile')
    await expect(page.getByRole('heading', { name: 'Test User' })).toBeVisible()
    await expect(page.getByText('1', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Осталось расчётов')).toBeVisible()
  })

  test('displays zero credits for exhausted user', async ({ page }) => {
    await mockGraphQL(page, {
      GetMe: () => FREE_USER_ZERO_CREDITS,
    })

    await page.goto('/?web=1#/profile')
    await expect(page.getByRole('heading', { name: 'Test User' })).toBeVisible()
    await expect(page.getByText('0', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Осталось расчётов')).toBeVisible()
  })

  test('displays subscription credits for premium user', async ({ page }) => {
    await mockGraphQL(page, {
      GetMe: () => PREMIUM_USER,
    })

    await page.goto('/?web=1#/profile')
    await expect(page.getByRole('heading', { name: 'Premium User' })).toBeVisible()
    await expect(page.getByText(/Осталось:.*20.*из 60/)).toBeVisible()
  })
})
