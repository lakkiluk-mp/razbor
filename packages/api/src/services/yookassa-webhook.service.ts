import type { PrismaClient } from '@razbor/db'
import { SUBSCRIPTION_PLANS, FATAL_CANCELLATION_REASONS, type SubscriptionPlanKey } from '@razbor/shared'
import { getPaymentInfo } from './yookassa.service'
import { switchSubscription, renewSubscription, expireSubscription } from './subscription.service'

async function findYooPaymentWithRetry(prisma: PrismaClient, yooPaymentId: string, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    const yooPayment = await prisma.yooPayment.findUnique({
      where: { yooPaymentId },
    })
    if (yooPayment) return yooPayment
    if (i < retries) {
      console.log(`[YooKassa Webhook] Payment ${yooPaymentId} not found in DB, retry ${i + 1}/${retries} in 5s`)
      await new Promise((r) => setTimeout(r, 5000))
    }
  }
  return null
}

export async function handlePaymentSucceeded(
  prisma: PrismaClient,
  paymentObject: Record<string, unknown>,
): Promise<void> {
  const yooPaymentId = paymentObject.id as string
  console.log(`[YooKassa Webhook] Processing payment.succeeded: ${yooPaymentId}`)

  const yooPayment = await findYooPaymentWithRetry(prisma, yooPaymentId)
  if (!yooPayment) {
    console.error(`[YooKassa Webhook] YooPayment not found in DB: ${yooPaymentId}`)
    return
  }
  console.log(`[YooKassa Webhook] Found payment in DB: id=${yooPayment.id}, user=${yooPayment.userId}, amount=${yooPayment.amount}, status=${yooPayment.status}`)

  const verified = await getPaymentInfo(yooPaymentId)
  if (verified.status !== 'succeeded') {
    console.error(`[YooKassa Webhook] API verification failed for ${yooPaymentId}: expected succeeded, got ${verified.status}`)
    return
  }
  console.log(`[YooKassa Webhook] API verification passed: ${yooPaymentId}`)

  const metadata = paymentObject.metadata as Record<string, string> | undefined
  if (metadata?.type === 'subscription' && metadata.plan) {
    const plan = metadata.plan as SubscriptionPlanKey
    const expectedPlan = SUBSCRIPTION_PLANS[plan]
    if (expectedPlan) {
      const paidAmount = parseFloat(verified.amount.value)
      if (paidAmount < expectedPlan.price) {
        console.error(`[YooKassa Webhook] Amount mismatch for ${yooPaymentId}: paid ${paidAmount}, expected ${expectedPlan.price}`)
        return
      }
    }
  }

  const { count } = await prisma.yooPayment.updateMany({
    where: { id: yooPayment.id, status: 'pending' },
    data: { status: 'succeeded' },
  })
  if (count === 0) {
    console.log(`[YooKassa Webhook] Payment ${yooPaymentId} already processed (not pending), skipping`)
    return
  }
  console.log(`[YooKassa Webhook] Payment status updated to succeeded: ${yooPaymentId}`)

  const paymentMethod = paymentObject.payment_method as Record<string, unknown> | undefined
  if (paymentMethod?.saved === true) {
    const card = paymentMethod.card as Record<string, unknown> | undefined
    const existingMethod = await prisma.paymentMethod.findUnique({
      where: { yooPaymentMethodId: paymentMethod.id as string },
    })

    if (!existingMethod && card) {
      console.log(`[YooKassa Webhook] Saving payment method: user=${yooPayment.userId}, card=*${card.last4}, type=${card.card_type}`)
      await prisma.$transaction(async (tx) => {
        await tx.paymentMethod.updateMany({
          where: { userId: yooPayment.userId },
          data: { isDefault: false },
        })

        await tx.paymentMethod.create({
          data: {
            userId: yooPayment.userId,
            yooPaymentMethodId: paymentMethod.id as string,
            cardLast4: (card.last4 as string) || '****',
            cardType: (card.card_type as string) || 'Unknown',
            expiryMonth: String(card?.expiry_month ?? ''),
            expiryYear: String(card?.expiry_year ?? ''),
            isDefault: true,
          },
        })
      })
    }
  }

  if (!metadata) return

  if (metadata.type === 'subscription') {
    const plan = metadata.plan as SubscriptionPlanKey
    if (!SUBSCRIPTION_PLANS[plan]) {
      console.error(`[YooKassa Webhook] Unknown plan: ${plan}`)
      return
    }

    console.log(`[YooKassa Webhook] Activating subscription: user=${yooPayment.userId}, plan=${plan}`)
    const subscription = await switchSubscription(prisma, yooPayment.userId, plan)
    console.log(`[YooKassa Webhook] Subscription activated: id=${subscription.id}, user=${yooPayment.userId}, plan=${plan}`)

    await prisma.yooPayment.update({
      where: { id: yooPayment.id },
      data: { subscriptionId: subscription.id },
    })
  }

  if (metadata.type === 'recurring') {
    const subscriptionId = metadata.subscriptionId
    if (!subscriptionId) {
      console.error(`[YooKassa Webhook] Missing subscriptionId in recurring metadata`)
      return
    }

    console.log(`[YooKassa Webhook] Renewing subscription: id=${subscriptionId}, user=${yooPayment.userId}`)
    await renewSubscription(prisma, subscriptionId)
    console.log(`[YooKassa Webhook] Subscription renewed: id=${subscriptionId}`)

    await prisma.yooPayment.update({
      where: { id: yooPayment.id },
      data: { subscriptionId },
    })
  }
}

export async function handlePaymentCanceled(
  prisma: PrismaClient,
  paymentObject: Record<string, unknown>,
): Promise<void> {
  const yooPaymentId = paymentObject.id as string
  const cancellationDetails = paymentObject.cancellation_details as Record<string, string> | undefined
  console.log(`[YooKassa Webhook] Processing payment.canceled: ${yooPaymentId}, reason=${cancellationDetails?.reason || 'unknown'}, party=${cancellationDetails?.party || 'unknown'}`)
  if (cancellationDetails) {
    console.error(`[YooKassa Webhook] Cancellation details for ${yooPaymentId}: ${JSON.stringify(cancellationDetails)}`)
  }

  const yooPayment = await findYooPaymentWithRetry(prisma, yooPaymentId)
  if (!yooPayment) {
    console.error(`[YooKassa Webhook] YooPayment not found in DB for cancel: ${yooPaymentId}`)
    return
  }
  console.log(`[YooKassa Webhook] Found payment for cancel: id=${yooPayment.id}, user=${yooPayment.userId}, status=${yooPayment.status}`)

  const { count } = await prisma.yooPayment.updateMany({
    where: { id: yooPayment.id, status: 'pending' },
    data: { status: 'canceled' },
  })
  if (count === 0) {
    console.log(`[YooKassa Webhook] Payment ${yooPaymentId} already processed (not pending), skipping cancel`)
  } else {
    console.log(`[YooKassa Webhook] Payment canceled: ${yooPaymentId}, user=${yooPayment.userId}`)
  }

  if (yooPayment.isRecurring && cancellationDetails?.reason) {
    const reason = cancellationDetails.reason
    if ((FATAL_CANCELLATION_REASONS as readonly string[]).includes(reason)) {
      console.log(`[YooKassa Webhook] Fatal reason "${reason}" for ${yooPaymentId}, expiring subscription immediately`)
      if (yooPayment.subscriptionId) {
        await expireSubscription(prisma, yooPayment.subscriptionId)
      } else {
        console.error(`[YooKassa Webhook] Fatal cancel but no subscriptionId on yooPayment ${yooPaymentId}, userId=${yooPayment.userId}`)
      }
    }
  }
}
