import type { PrismaClient } from '@razbor/db'
import { SUBSCRIPTION_PLANS, type SubscriptionPlanKey } from '@razbor/shared'
import { getPaymentInfo } from './yookassa.service'
import { createSubscription, renewSubscription } from './subscription.service'

async function findYooPaymentWithRetry(prisma: PrismaClient, yooPaymentId: string, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    const yooPayment = await prisma.yooPayment.findUnique({
      where: { yooPaymentId },
    })
    if (yooPayment) return yooPayment
    if (i < retries) {
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

  const yooPayment = await findYooPaymentWithRetry(prisma, yooPaymentId)
  if (!yooPayment) {
    console.error(`[YooKassa Webhook] YooPayment not found: ${yooPaymentId}`)
    return
  }

  const verified = await getPaymentInfo(yooPaymentId)
  if (verified.status !== 'succeeded') {
    console.error(`[YooKassa Webhook] API verification failed for ${yooPaymentId}: ${verified.status}`)
    return
  }

  const { count } = await prisma.yooPayment.updateMany({
    where: { id: yooPayment.id, status: 'pending' },
    data: { status: 'succeeded' },
  })
  if (count === 0) return

  const paymentMethod = paymentObject.payment_method as Record<string, unknown> | undefined
  if (paymentMethod?.saved === true) {
    const card = paymentMethod.card as Record<string, unknown> | undefined
    const existingMethod = await prisma.paymentMethod.findUnique({
      where: { yooPaymentMethodId: paymentMethod.id as string },
    })

    if (!existingMethod && card) {
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

  const metadata = paymentObject.metadata as Record<string, string> | undefined
  if (!metadata) return

  if (metadata.type === 'subscription') {
    const plan = metadata.plan as SubscriptionPlanKey
    if (!SUBSCRIPTION_PLANS[plan]) {
      console.error(`[YooKassa Webhook] Unknown plan: ${plan}`)
      return
    }

    const subscription = await createSubscription(prisma, yooPayment.userId, plan)

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

    await renewSubscription(prisma, subscriptionId)

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

  const yooPayment = await findYooPaymentWithRetry(prisma, yooPaymentId)
  if (!yooPayment) {
    console.error(`[YooKassa Webhook] YooPayment not found for cancel: ${yooPaymentId}`)
    return
  }

  const { count } = await prisma.yooPayment.updateMany({
    where: { id: yooPayment.id, status: 'pending' },
    data: { status: 'canceled' },
  })
  if (count === 0) {
    console.log(`[YooKassa Webhook] Payment ${yooPaymentId} already processed, skipping cancel`)
  }
}
