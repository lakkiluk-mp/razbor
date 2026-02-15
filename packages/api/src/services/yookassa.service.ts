import { YooKassa, type YooKassaSdk, CurrencyEnum } from '@webzaytsev/yookassa-ts-sdk'

let sdk: YooKassaSdk | null = null

function getSdk(): YooKassaSdk {
  if (!sdk) {
    const shopId = process.env.YOOKASSA_SHOP_ID
    const secretKey = process.env.YOOKASSA_SECRET_KEY
    if (!shopId || !secretKey) {
      throw new Error('YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY must be set')
    }
    sdk = YooKassa({ shop_id: shopId, secret_key: secretKey })
  }
  return sdk
}

interface CreateSubscriptionPaymentParams {
  userId: string
  plan: string
  amount: number
  description: string
}

interface CreateRecurringPaymentParams {
  userId: string
  subscriptionId: string
  paymentMethodId: string
  amount: number
  description: string
}

export async function createSubscriptionPayment(params: CreateSubscriptionPaymentParams) {
  const payment = await getSdk().payments.create({
    amount: {
      value: params.amount.toFixed(2),
      currency: CurrencyEnum.RUB,
    },
    capture: true,
    save_payment_method: true,
    confirmation: {
      type: 'embedded',
    },
    description: params.description,
    metadata: {
      userId: params.userId,
      plan: params.plan,
      type: 'subscription',
    },
  })

  return {
    confirmationToken: (payment.confirmation as { confirmation_token: string }).confirmation_token,
    yooPaymentId: payment.id,
    idempotencyKey: '',
  }
}

export async function createRecurringPayment(params: CreateRecurringPaymentParams) {
  const payment = await getSdk().payments.create({
    amount: {
      value: params.amount.toFixed(2),
      currency: CurrencyEnum.RUB,
    },
    capture: true,
    payment_method_id: params.paymentMethodId,
    description: params.description,
    metadata: {
      userId: params.userId,
      subscriptionId: params.subscriptionId,
      type: 'recurring',
    },
  })

  return {
    yooPaymentId: payment.id,
    status: payment.status,
    idempotencyKey: '',
  }
}

export async function getPaymentInfo(yooPaymentId: string) {
  return getSdk().payments.load(yooPaymentId)
}
