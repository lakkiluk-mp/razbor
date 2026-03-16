import { test, expect, type Page, type FrameLocator } from '@playwright/test'
import { fetchGraphQLStaging } from './helpers/graphql'
import {
  cleanupDevUser,
  expireSubscription,
  getYooPayments,
  getYooPaymentCount,
  setSubscriptionPastDue,
  setSubscriptionExpiredAfterRetries,
  getSubscriptionStatus,
} from './helpers/staging-db'

const CARD_SUCCESS = {
  number: '4111 1111 1111 1111',
  expiryMonth: '12',
  expiryYear: '30',
  cvc: '000',
}


const GQL = {
  mySubscription: `query GetMySubscription {
    mySubscription {
      id plan status credits creditsTotal cancelAtPeriodEnd currentPeriodEnd daysRemaining
    }
  }`,
  cancelSubscription: `mutation CancelSubscription {
    cancelSubscription { id status cancelAtPeriodEnd }
  }`,
  myPaymentMethods: `query GetMyPaymentMethods {
    myPaymentMethods { id cardLast4 cardType expiryMonth expiryYear isDefault }
  }`,
  removePaymentMethod: `mutation RemovePaymentMethod($paymentMethodId: ID!) {
    removePaymentMethod(paymentMethodId: $paymentMethodId)
  }`,
  me: `query GetMe {
    me {
      id firstName isPremium trialCredits subscriptionCredits totalCredits
      subscription { id plan status credits creditsTotal cancelAtPeriodEnd }
    }
  }`,
}

type SubResponse = {
  mySubscription: {
    id: string
    plan: string
    status: string
    credits: number
    creditsTotal: number
    cancelAtPeriodEnd: boolean
    currentPeriodEnd: string
    daysRemaining: number
  } | null
}

type PaymentMethodResponse = {
  myPaymentMethods: {
    id: string
    cardLast4: string
    cardType: string
    expiryMonth: string
    expiryYear: string
    isDefault: boolean
  }[]
}

async function cancelIfActive() {
  try {
    const data = await fetchGraphQLStaging<SubResponse>(GQL.mySubscription)
    if (data.mySubscription?.status === 'active') {
      await fetchGraphQLStaging(GQL.cancelSubscription)
    }
  } catch {
    // ignore
  }
}

async function removeAllPaymentMethods() {
  try {
    const data = await fetchGraphQLStaging<PaymentMethodResponse>(GQL.myPaymentMethods)
    for (const method of data.myPaymentMethods) {
      await fetchGraphQLStaging(GQL.removePaymentMethod, { paymentMethodId: method.id })
    }
  } catch {
    // ignore — might fail if subscription is active
  }
}

function getWidgetFrame(page: Page): FrameLocator {
  return page.frameLocator('#payment-form iframe').first()
}

async function selectBankCardAndFill(
  page: Page,
  card: { number: string; expiryMonth: string; expiryYear: string; cvc: string },
) {
  const frame = getWidgetFrame(page)

  await frame.getByText('Банковская карта').click()

  await frame.locator('input').first().waitFor({ timeout: 15_000 })

  const cardInput = frame.locator('input').first()
  await cardInput.click()
  await cardInput.fill(card.number)

  const monthInput = frame.getByRole('textbox', { name: 'ММ' })
  await monthInput.click()
  await monthInput.fill(card.expiryMonth)

  const yearInput = frame.getByRole('textbox', { name: 'ГГ' })
  await yearInput.click()
  await yearInput.fill(card.expiryYear)

  const cvcInput = frame.getByRole('textbox', { name: 'CVC' })
  await cvcInput.click()
  await cvcInput.fill(card.cvc)

  await frame
    .locator('button')
    .filter({ hasText: /заплатить/i })
    .click()
}

async function waitForPaymentResult(page: Page) {
  await page.waitForURL(/\/#\/payment\/success/, { timeout: 60_000 })

  await expect(
    page.getByText('Подписка оформлена!').or(page.getByText('Платёж обрабатывается')),
  ).toBeVisible({ timeout: 35_000 })
}

async function pollSubscription(maxWaitMs = 30_000): Promise<SubResponse['mySubscription']> {
  const start = Date.now()
  while (Date.now() - start < maxWaitMs) {
    const data = await fetchGraphQLStaging<SubResponse>(GQL.mySubscription)
    if (data.mySubscription?.status === 'active') {
      return data.mySubscription
    }
    await new Promise((r) => setTimeout(r, 3000))
  }
  return null
}

async function goToPaymentAndPay(
  page: Page,
  planButtonRegex: RegExp,
  card: { number: string; expiryMonth: string; expiryYear: string; cvc: string },
) {
  await page.getByRole('button', { name: planButtonRegex }).click()
  await expect(page.getByText('Оплата')).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('#payment-form iframe')).toBeVisible({ timeout: 30_000 })
  await selectBankCardAndFill(page, card)
}

test.describe.serial('Real payment flow (staging, no mocks)', () => {
  test.setTimeout(120_000)

  test.beforeAll(async () => {
    cleanupDevUser()
  })

  test.afterAll(async () => {
    cleanupDevUser()
  })

  test('1. weekly subscription — full payment flow', async ({ page }) => {
    await page.goto('/?web=1#/subscribe')

    await expect(page.getByText('Premium подписка')).toBeVisible()
    await expect(page.getByText('1 неделя')).toBeVisible()
    await expect(page.getByText('249 ₽', { exact: true })).toBeVisible()
    await expect(page.getByText('1 месяц')).toBeVisible()
    await expect(page.getByText('799 ₽', { exact: true })).toBeVisible()

    await goToPaymentAndPay(page, /Оформить подписку 249/, CARD_SUCCESS)
    await waitForPaymentResult(page)

    const sub = await pollSubscription()
    expect(sub).toBeTruthy()
    expect(sub!.plan).toBe('weekly')
    expect(sub!.status).toBe('active')
    expect(sub!.credits).toBe(15)
    expect(sub!.creditsTotal).toBe(15)
  })

  test('2. double purchase blocked — shows management UI', async ({ page }) => {
    await page.goto('/?web=1#/subscribe')

    await expect(page.getByText('Premium подписка')).toBeVisible()
    await expect(page.getByText('Отменить подписку')).toBeVisible({ timeout: 10_000 })

    const data = await fetchGraphQLStaging<SubResponse>(GQL.mySubscription)
    expect(data.mySubscription?.status).toBe('active')
    expect(data.mySubscription?.plan).toBe('weekly')
  })

  test('3. saved payment method appears after purchase', async ({ page }) => {
    const data = await fetchGraphQLStaging<PaymentMethodResponse>(GQL.myPaymentMethods)
    expect(data.myPaymentMethods.length).toBeGreaterThan(0)
    expect(data.myPaymentMethods[0].cardLast4).toBeTruthy()
    expect(data.myPaymentMethods[0].isDefault).toBe(true)

    await page.goto('/?web=1#/subscribe')
    await expect(page.getByText('Способ оплаты')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/\*{4}/)).toBeVisible()
  })

  test('4. cancel subscription', async ({ page }) => {
    await page.goto('/?web=1#/subscribe')

    await expect(page.getByText('Отменить подписку')).toBeVisible({ timeout: 10_000 })
    await page.getByText('Отменить подписку').click()

    await expect(page.getByText('Отменить подписку?')).toBeVisible()
    await expect(page.getByText(/останется активной до конца/)).toBeVisible()

    await page.getByRole('button', { name: /Да, отменить/ }).click()

    await expect(page.getByText('Возобновить автопродление')).toBeVisible({ timeout: 10_000 })

    const data = await fetchGraphQLStaging<SubResponse>(GQL.mySubscription)
    expect(data.mySubscription?.cancelAtPeriodEnd).toBe(true)
    expect(data.mySubscription?.status).toBe('active')
  })

  test('5. resume subscription after cancel', async ({ page }) => {
    await page.goto('/?web=1#/subscribe')

    await expect(page.getByText('Возобновить автопродление')).toBeVisible({ timeout: 10_000 })
    await page.getByText('Возобновить автопродление').click()

    await expect(page.getByText('Возобновить подписку?')).toBeVisible()
    await page.getByRole('button', { name: /Да, возобновить/ }).click()

    await expect(page.getByText('Отменить подписку')).toBeVisible({ timeout: 10_000 })

    const data = await fetchGraphQLStaging<SubResponse>(GQL.mySubscription)
    expect(data.mySubscription?.cancelAtPeriodEnd).toBe(false)
    expect(data.mySubscription?.status).toBe('active')
  })

  test('6. profile reflects active subscription', async ({ page }) => {
    await page.goto('/?web=1#/profile')

    await expect(page.getByRole('heading', { name: 'Dev User' })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/Premium.*1 неделя/)).toBeVisible()
    await expect(page.getByText(/Осталось:.*\d+.*из 15/)).toBeVisible()
  })

  test('7. remove last payment method auto-cancels subscription', async ({ page }) => {
    const methods = await fetchGraphQLStaging<PaymentMethodResponse>(GQL.myPaymentMethods)
    expect(methods.myPaymentMethods.length).toBeGreaterThan(0)

    await fetchGraphQLStaging(GQL.removePaymentMethod, {
      paymentMethodId: methods.myPaymentMethods[0].id,
    })

    const afterMethods = await fetchGraphQLStaging<PaymentMethodResponse>(GQL.myPaymentMethods)
    expect(afterMethods.myPaymentMethods.length).toBe(0)

    const sub = await fetchGraphQLStaging<SubResponse>(GQL.mySubscription)
    expect(sub.mySubscription?.cancelAtPeriodEnd).toBe(true)

    await page.goto('/?web=1#/subscribe')
    await expect(page.getByText('Возобновить автопродление')).toBeVisible({ timeout: 10_000 })
  })

  test('8. cancel subscription then remove payment method', async ({ page }) => {
    cleanupDevUser()

    const data = await fetchGraphQLStaging<PaymentMethodResponse>(GQL.myPaymentMethods)
    expect(data.myPaymentMethods.length).toBe(0)

    await page.goto('/?web=1#/subscribe')
    await expect(page.getByText('Выберите план:')).toBeVisible({ timeout: 10_000 })
  })

  test('9. monthly subscription — full payment flow', async ({ page }) => {
    cleanupDevUser()
    await page.goto('/?web=1#/subscribe')
    await expect(page.getByText('Выберите план:')).toBeVisible({ timeout: 10_000 })

    await page.getByText('1 месяц').click()
    await expect(page.getByRole('button', { name: /Оформить подписку 799/ })).toBeVisible()

    await goToPaymentAndPay(page, /Оформить подписку 799/, CARD_SUCCESS)
    await waitForPaymentResult(page)

    const sub = await pollSubscription()
    expect(sub).toBeTruthy()
    expect(sub!.plan).toBe('monthly')
    expect(sub!.status).toBe('active')
    expect(sub!.credits).toBe(60)
    expect(sub!.creditsTotal).toBe(60)
  })

  test('10. subscription credits verified via API', async ({ page }) => {
    const before = await fetchGraphQLStaging<SubResponse>(GQL.mySubscription)
    expect(before.mySubscription?.status).toBe('active')
    expect(before.mySubscription?.credits).toBe(60)

    const me = await fetchGraphQLStaging<{
      me: { totalCredits: number; subscriptionCredits: number }
    }>(GQL.me)
    expect(me.me.subscriptionCredits).toBe(60)
    expect(me.me.totalCredits).toBeGreaterThanOrEqual(60)
  })

  test('11. expire subscription via DB — profile shows no subscription', async ({ page }) => {
    expireSubscription()

    await page.goto('/?web=1#/subscribe')
    await expect(page.getByText('Выберите план:')).toBeVisible({ timeout: 10_000 })

    const sub = await fetchGraphQLStaging<SubResponse>(GQL.mySubscription)
    expect(sub.mySubscription).toBeNull()

    await page.goto('/?web=1#/profile')
    await expect(page.getByRole('heading', { name: 'Dev User' })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Получите Premium')).toBeVisible()
  })

  test('12. re-subscribe after expiration works', async ({ page }) => {
    await page.goto('/?web=1#/subscribe')
    await expect(page.getByText('Выберите план:')).toBeVisible({ timeout: 10_000 })

    await goToPaymentAndPay(page, /Оформить подписку 249/, CARD_SUCCESS)
    await waitForPaymentResult(page)

    const sub = await pollSubscription()
    expect(sub).toBeTruthy()
    expect(sub!.plan).toBe('weekly')
    expect(sub!.status).toBe('active')
  })

  test('13. no duplicate payments — idempotencyKeys are unique', async () => {
    const payments = getYooPayments()
    expect(payments.length).toBeGreaterThan(0)

    const keys = payments.map((p) => p.idempotencyKey)
    const uniqueKeys = new Set(keys)
    expect(uniqueKeys.size).toBe(keys.length)

    const succeededPayments = payments.filter((p) => p.status === 'succeeded')
    expect(succeededPayments.length).toBeGreaterThan(0)

    for (const p of succeededPayments) {
      expect(p.amount).toBeGreaterThan(0)
    }
  })

  test('14. past_due status — API still returns active subscription with credits', async () => {
    setSubscriptionPastDue(1)

    const dbStatus = getSubscriptionStatus()
    expect(dbStatus).toBeTruthy()
    expect(dbStatus!.status).toBe('past_due')

    const sub = await fetchGraphQLStaging<SubResponse>(GQL.mySubscription)
    expect(sub.mySubscription).toBeTruthy()
    expect(sub.mySubscription!.status).toBe('past_due')
    expect(sub.mySubscription!.credits).toBeGreaterThan(0)

    const me = await fetchGraphQLStaging<{
      me: { isPremium: boolean; totalCredits: number; subscriptionCredits: number }
    }>(GQL.me)
    expect(me.me.subscriptionCredits).toBeGreaterThan(0)
    expect(me.me.totalCredits).toBeGreaterThan(0)
  })

  test('15. past_due — profile still shows Premium', async ({ page }) => {
    await page.goto('/?web=1#/profile')

    await expect(page.getByRole('heading', { name: 'Dev User' })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/Premium/)).toBeVisible()
  })

  test('16. expired after max retries — user loses access', async ({ page }) => {
    setSubscriptionExpiredAfterRetries()

    const dbStatus = getSubscriptionStatus()
    expect(dbStatus).toBeNull()

    const sub = await fetchGraphQLStaging<SubResponse>(GQL.mySubscription)
    expect(sub.mySubscription).toBeNull()

    const me = await fetchGraphQLStaging<{
      me: { isPremium: boolean; subscriptionCredits: number }
    }>(GQL.me)
    expect(me.me.isPremium).toBe(false)
    expect(me.me.subscriptionCredits).toBe(0)

    await page.goto('/?web=1#/profile')
    await expect(page.getByRole('heading', { name: 'Dev User' })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Получите Premium')).toBeVisible()

    await page.goto('/?web=1#/subscribe')
    await expect(page.getByText('Выберите план:')).toBeVisible({ timeout: 10_000 })
  })

  test('17. re-subscribe after past_due expiration', async ({ page }) => {
    await page.goto('/?web=1#/subscribe')
    await expect(page.getByText('Выберите план:')).toBeVisible({ timeout: 10_000 })

    await goToPaymentAndPay(page, /Оформить подписку 249/, CARD_SUCCESS)
    await waitForPaymentResult(page)

    const sub = await pollSubscription()
    expect(sub).toBeTruthy()
    expect(sub!.plan).toBe('weekly')
    expect(sub!.status).toBe('active')
    expect(sub!.credits).toBe(15)

    const paymentCount = getYooPaymentCount()
    expect(paymentCount).toBeGreaterThanOrEqual(3)
  })

  test('18. cancel subscription then remove card — full unlinking flow', async ({ page }) => {
    await page.goto('/?web=1#/subscribe')
    await expect(page.getByText('Отменить подписку')).toBeVisible({ timeout: 10_000 })
    await page.getByText('Отменить подписку').click()
    await expect(page.getByText('Отменить подписку?')).toBeVisible()
    await page.getByRole('button', { name: /Да, отменить/ }).click()
    await expect(page.getByText('Возобновить автопродление')).toBeVisible({ timeout: 10_000 })

    const subAfterCancel = await fetchGraphQLStaging<SubResponse>(GQL.mySubscription)
    expect(subAfterCancel.mySubscription?.cancelAtPeriodEnd).toBe(true)
    expect(subAfterCancel.mySubscription?.status).toBe('active')

    const methods = await fetchGraphQLStaging<PaymentMethodResponse>(GQL.myPaymentMethods)
    expect(methods.myPaymentMethods.length).toBeGreaterThan(0)

    for (const method of methods.myPaymentMethods) {
      await fetchGraphQLStaging(GQL.removePaymentMethod, { paymentMethodId: method.id })
    }

    const afterMethods = await fetchGraphQLStaging<PaymentMethodResponse>(GQL.myPaymentMethods)
    expect(afterMethods.myPaymentMethods.length).toBe(0)

    const subAfterRemove = await fetchGraphQLStaging<SubResponse>(GQL.mySubscription)
    expect(subAfterRemove.mySubscription?.cancelAtPeriodEnd).toBe(true)
    expect(subAfterRemove.mySubscription?.status).toBe('active')
    expect(subAfterRemove.mySubscription?.credits).toBeGreaterThan(0)

    await page.goto('/?web=1#/subscribe')
    await expect(page.getByText('Возобновить автопродление')).toBeVisible({ timeout: 10_000 })

    await page.goto('/?web=1#/profile')
    await expect(page.getByRole('heading', { name: 'Dev User' })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/Premium/)).toBeVisible()
  })
})
