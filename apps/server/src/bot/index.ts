import { Telegraf, Markup } from 'telegraf'

const BOT_TOKEN = process.env.BOT_TOKEN
const MINI_APP_URL = process.env.MINI_APP_URL || 'http://localhost:3000'
const SITE_URL = process.env.SITE_URL || 'https://vrazbore.tech'
const SUPPORT_BOT = 'https://t.me/vrazbore_support_bot'

export const bot: Telegraf | null = BOT_TOKEN ? new Telegraf(BOT_TOKEN) : null

if (!bot) {
  console.warn('BOT_TOKEN is not set, bot is disabled')
}

bot?.command('start', (ctx) => {
  return ctx.reply(
    'Добро пожаловать в «В разборе»!\n\n' +
      'Оценка авто по запчастям — узнайте стоимость запчастей вашего автомобиля на основе актуальных рыночных данных.\n\n' +
      '⚠️ Данные носят справочный характер и не являются финансовой рекомендацией.\n\n' +
      `Нажимая «Открыть оценку», вы принимаете условия <a href="${SITE_URL}/offers">публичной оферты</a> и <a href="${SITE_URL}/privacy">политики конфиденциальности</a>.`,
    {
      parse_mode: 'HTML',
      link_preview_is_disabled: true,
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('Открыть оценку', MINI_APP_URL)],
      ]),
    },
  )
})

bot?.command('help', (ctx) => {
  return ctx.reply(
    '«В разборе» — оценка авто по запчастям.\n\n' +
      'Нажмите «Открыть оценку», чтобы узнать стоимость запчастей вашего автомобиля.\n\n' +
      'Поддержка: @vrazbore_support_bot\n\n' +
      'Команды:\n' +
      '/start — Главное меню\n' +
      '/help — Справка',
  )
})
