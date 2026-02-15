import { execSync } from 'child_process'

const DB_URL = 'postgresql://razbor:166fa912b78743529960d474a602d7df@100.124.164.80:5432/razbor'

function sql(query: string): string {
  try {
    return execSync(`psql "${DB_URL}" -t -A -c "${query.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      timeout: 10_000,
    }).trim()
  } catch (e) {
    console.error('[staging-db] SQL error:', (e as Error).message)
    return ''
  }
}

export function getDevUserId(): string {
  return sql(`SELECT id FROM users WHERE "telegramId" = 999999999 LIMIT 1`)
}

export function cleanupDevUser() {
  const userId = getDevUserId()
  if (!userId) return

  sql(`DELETE FROM yoo_payments WHERE "userId" = '${userId}'`)
  sql(`DELETE FROM subscriptions WHERE "userId" = '${userId}'`)
  sql(`DELETE FROM payment_methods WHERE "userId" = '${userId}'`)
}

export function expireSubscription() {
  const userId = getDevUserId()
  if (!userId) return

  sql(`UPDATE subscriptions SET "currentPeriodEnd" = NOW() - INTERVAL '1 hour', status = 'expired' WHERE "userId" = '${userId}' AND status = 'active'`)
}

export function setSubscriptionEndDate(minutesFromNow: number) {
  const userId = getDevUserId()
  if (!userId) return

  sql(`UPDATE subscriptions SET "currentPeriodEnd" = NOW() + INTERVAL '${minutesFromNow} minutes' WHERE "userId" = '${userId}' AND status = 'active'`)
}

export function getSubscriptionStatus(): { status: string; plan: string; credits: number; cancelAtPeriodEnd: boolean } | null {
  const userId = getDevUserId()
  if (!userId) return null

  const row = sql(`SELECT status, plan, credits, "cancelAtPeriodEnd" FROM subscriptions WHERE "userId" = '${userId}' AND status IN ('active', 'past_due') ORDER BY "createdAt" DESC LIMIT 1`)
  if (!row) return null

  const [status, plan, credits, cancelAtPeriodEnd] = row.split('|')
  return {
    status,
    plan,
    credits: parseInt(credits, 10),
    cancelAtPeriodEnd: cancelAtPeriodEnd === 't',
  }
}

export function getPaymentMethodCount(): number {
  const userId = getDevUserId()
  if (!userId) return 0

  const count = sql(`SELECT COUNT(*) FROM payment_methods WHERE "userId" = '${userId}'`)
  return parseInt(count, 10) || 0
}

export function getYooPaymentCount(): number {
  const userId = getDevUserId()
  if (!userId) return 0

  const count = sql(`SELECT COUNT(*) FROM yoo_payments WHERE "userId" = '${userId}'`)
  return parseInt(count, 10) || 0
}

export function getYooPayments(): { id: string; status: string; amount: number; isRecurring: boolean; idempotencyKey: string }[] {
  const userId = getDevUserId()
  if (!userId) return []

  const rows = sql(`SELECT id, status, amount, "isRecurring", "idempotencyKey" FROM yoo_payments WHERE "userId" = '${userId}' ORDER BY "createdAt" DESC`)
  if (!rows) return []

  return rows.split('\n').map((row) => {
    const [id, status, amount, isRecurring, idempotencyKey] = row.split('|')
    return {
      id,
      status,
      amount: parseInt(amount, 10),
      isRecurring: isRecurring === 't',
      idempotencyKey,
    }
  })
}

export function setSubscriptionPastDue(retryCount = 1) {
  const userId = getDevUserId()
  if (!userId) return

  sql(`UPDATE subscriptions SET status = 'past_due', "retryCount" = ${retryCount}, "lastRetryAt" = NOW() WHERE "userId" = '${userId}' AND status = 'active'`)
}

export function setSubscriptionExpiredAfterRetries() {
  const userId = getDevUserId()
  if (!userId) return

  sql(`UPDATE subscriptions SET status = 'expired', credits = 0, "retryCount" = 3 WHERE "userId" = '${userId}' AND status IN ('active', 'past_due')`)
  sql(`UPDATE users SET "isPremium" = false WHERE id = '${userId}'`)
}
