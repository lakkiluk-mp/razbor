import { Telegraf, Markup } from 'telegraf'

const BOT_TOKEN = process.env.BOT_TOKEN
const MINI_APP_URL = process.env.MINI_APP_URL || 'http://localhost:3000'

export const bot: Telegraf | null = BOT_TOKEN ? new Telegraf(BOT_TOKEN) : null

if (!bot) {
  console.warn('BOT_TOKEN is not set, bot is disabled')
}

bot?.command('start', (ctx) => {
  return ctx.reply(
    'Привет! Я помогу оценить стоимость разбора автомобиля.',
    Markup.inlineKeyboard([
      Markup.button.webApp('Открыть калькулятор', MINI_APP_URL),
    ]),
  )
})

bot?.command('help', (ctx) => {
  return ctx.reply(
    'Razbor — калькулятор маржинальности авторазбора.\n\n' +
      'Нажмите "Открыть калькулятор", чтобы оценить потенциальную прибыль с разбора автомобиля.\n\n' +
      'Команды:\n' +
      '/start — Главное меню\n' +
      '/help — Справка',
  )
})
