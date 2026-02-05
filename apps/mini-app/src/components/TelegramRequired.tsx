const BOT_URL = 'https://t.me/razbor_s_bot'

export function TelegramRequired() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center">
      <div className="mb-6 text-6xl">📱</div>
      <h1 className="mb-3 text-xl font-semibold text-white">
        Откройте в Telegram
      </h1>
      <p className="mb-6 text-sm text-zinc-400">
        Это приложение работает только внутри Telegram
      </p>
      <a
        href={BOT_URL}
        className="rounded-lg bg-[#2AABEE] px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
      >
        Открыть в Telegram
      </a>
    </div>
  )
}
