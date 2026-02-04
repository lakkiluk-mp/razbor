import type { Telegraf } from 'telegraf'

export function registerPaymentHandlers(bot: Telegraf | null) {
  if (!bot) return

  bot.on('pre_checkout_query', (ctx) => {
    return ctx.answerPreCheckoutQuery(true)
  })

  bot.on('successful_payment', (ctx) => {
    const payment = ctx.message.successful_payment
    console.log('Successful payment:', {
      currency: payment.currency,
      totalAmount: payment.total_amount,
      invoicePayload: payment.invoice_payload,
      telegramPaymentChargeId: payment.telegram_payment_charge_id,
      providerPaymentChargeId: payment.provider_payment_charge_id,
    })
  })
}
