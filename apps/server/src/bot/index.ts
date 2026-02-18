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
      'Калькулятор маржинальности авторазбора — оценивайте прибыль с разбора автомобиля на основе актуальных рыночных данных по запчастям.\n\n' +
      '⚠️ Данные носят справочный характер и не являются финансовой рекомендацией.\n\n' +
      'Нажимая «Открыть калькулятор», вы принимаете условия:',
    Markup.inlineKeyboard([
      [Markup.button.url('📄 Публичная оферта', `${SITE_URL}/offers`)],
      [Markup.button.url('🔒 Политика конфиденциальности', `${SITE_URL}/privacy`)],
      [Markup.button.webApp('Открыть калькулятор', MINI_APP_URL)],
    ]),
  )
})

bot?.command('help', (ctx) => {
  return ctx.reply(
    '«В разборе» — калькулятор маржинальности авторазбора.\n\n' +
      'Нажмите «Открыть калькулятор», чтобы оценить потенциальную прибыль с разбора автомобиля.\n\n' +
      'Поддержка: @vrazbore_support_bot\n\n' +
      'Команды:\n' +
      '/start — Главное меню\n' +
      '/help — Справка',
  )
})
