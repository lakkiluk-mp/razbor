const BOT_URL = 'https://t.me/vrazbore_support_bot'
const SITE_URL = 'https://vrazbore.tech'
const EMAIL = 'mf.postika@gmail.com'

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-slate-300">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-10">
          <a
            href="/"
            className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
          >
            &larr; На главную
          </a>
          <h1 className="mt-4 text-3xl font-bold text-white font-rimma">
            Политика конфиденциальности
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Последнее обновление: январь 2026
          </p>
        </header>

        <div className="mb-8 text-sm leading-relaxed text-slate-400">
          <p>
            Настоящая Политика применяется ко всей информации, которую мы можем
            получить о посетителях веб-сайта{' '}
            <a
              href={SITE_URL}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              vrazbore.tech
            </a>
            , о пользователях Сервиса «В разборе», а также о пользователях
            Telegram-бота, расположенного по адресу{' '}
            <a
              href={BOT_URL}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              @vrazbore_bot
            </a>
            .
          </p>
        </div>

        <article className="space-y-8 text-sm leading-relaxed text-slate-400">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-200">
              1. Общие положения
            </h2>
            <p>
              Настоящая политика конфиденциальности (далее — Политика)
              регулирует обработку персональных данных пользователей сервиса «В
              разборе» (далее — Сервис).
            </p>
            <p className="mt-2">
              Пользователь, начиная использование Сервиса, соглашается с
              условиями данной Политики.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-200">
              2. Собираемые данные
            </h2>
            <p>
              Мы собираем следующие данные при использовании Сервиса:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-slate-300">Данные Telegram:</strong>{' '}
                имя пользователя, Telegram ID — передаются
                автоматически при открытии Mini App.
              </li>
              <li>
                <strong className="text-slate-300">Данные расчётов:</strong>{' '}
                выбранные марки, модели, запчасти и параметры повреждений для
                формирования расчёта маржинальности.
              </li>
              <li>
                <strong className="text-slate-300">Данные об оплате:</strong>{' '}
                информация о транзакциях обрабатывается платёжными системами
                (ЮKassa); мы не храним данные банковских карт.
              </li>
                        </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-200">
              3. Цели обработки данных
            </h2>
            <p>
              Мы используем персональные данные для следующих целей:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Предоставление услуг по расчёту маржинальности авторазбора.
              </li>
              <li>Обработка платежей и управление подпиской.</li>
              <li>Поддержка и улучшение качества Сервиса.</li>
              <li>
                Связь с пользователями для решения вопросов по предоставляемым
                услугам.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-200">
              4. Передача данных третьим лицам
            </h2>
            <p>
              Мы не передаем ваши персональные данные третьим лицам, за
              исключением случаев:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                обработка платежей через платёжные системы (ЮKassa);
              </li>
              <li>
                запрос данных от государственных органов в рамках закона.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-200">
              5. Защита данных
            </h2>
            <p>
              Мы принимаем меры для обеспечения безопасности ваших данных,
              включая:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Использование протоколов шифрования (SSL/TLS) для передачи
                данных.
              </li>
              <li>
                Валидацию подписи Telegram initData для аутентификации
                пользователей.
              </li>
              <li>
                Регулярное обновление программного обеспечения для защиты от
                уязвимостей.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-200">
              6. Хранение данных
            </h2>
            <p>
              Данные хранятся на защищённых серверах на территории Российской
              Федерации в течение срока, необходимого для выполнения услуг, но
              не более 1 года с момента последнего взаимодействия пользователя с
              Сервисом, за исключением случаев, предусмотренных
              законодательством.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-200">
              7. Cookies и аналитика
            </h2>
            <p>
              Сервис работает как Telegram Mini App и не использует cookies.
              Аналитические данные собираются в обезличенном виде для улучшения
              работы Сервиса.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-200">
              8. Права пользователей
            </h2>
            <p>Пользователи имеют право:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Получать информацию о своих персональных данных,
                обрабатываемых нами.
              </li>
              <li>
                Требовать обновления, блокировки или удаления своих данных.
              </li>
              <li>Отозвать согласие на обработку данных.</li>
              <li>
                Удалить свою учетную запись и все связанные с ней данные.
              </li>
            </ul>
            <p className="mt-3">
              Для реализации прав обратитесь через Telegram-бот{' '}
              <a
                href={BOT_URL}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                @vrazbore_bot
              </a>{' '}
              или по email{' '}
              <a
                href={`mailto:${EMAIL}`}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-200">
              9. Изменения в политике
            </h2>
            <p>
              Мы оставляем за собой право вносить изменения в Политику.
              Актуальная версия всегда доступна по адресу{' '}
              <a
                href="/privacy"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                vrazbore.tech/privacy
              </a>
              .
            </p>
            <p className="mt-2">
              Рекомендуем регулярно проверять обновления.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-200">
              10. Контактная информация
            </h2>
            <p>
              Если у вас возникли вопросы по политике конфиденциальности,
              свяжитесь с нами через Telegram-бот{' '}
              <a
                href={BOT_URL}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                @vrazbore_bot
              </a>{' '}
              или по email{' '}
              <a
                href={`mailto:${EMAIL}`}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {EMAIL}
              </a>
              .
            </p>
          </section>
        </article>

        <footer className="mt-12 border-t border-slate-800 pt-6 text-xs text-slate-600">
          <div className="flex flex-wrap gap-4">
            <a href="/offers" className="hover:text-slate-400 transition-colors">
              Публичная оферта
            </a>
            <a href={BOT_URL} className="hover:text-slate-400 transition-colors">
              Telegram бот
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}
