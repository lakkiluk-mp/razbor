# Архитектура проекта Razbor

> Сервис оценки авто по запчастям

---

## 1. Обзор

### 1.1 Цель архитектуры

Построить систему, которая:
- Работает как Telegram Mini App (Mobile-first)
- Использует Telegram для авторизации, оплату через YooKassa
- Масштабируется от MVP до production с тысячами пользователей

### 1.2 Ключевые принципы

| Принцип | Описание |
|---------|----------|
| **API First** | Бэкенд отдаёт только данные (GraphQL). UI полностью отделён |
| **Shared Logic** | Бизнес-логика, валидация, типы -- в общих пакетах |
| **Telegram First** | Auth через initData, оплата через YooKassa, UI через Mini App |
| **Docker Everything** | Разработка и продакшен -- в контейнерах |

---

## 2. Технологический стек

### 2.1 Основной стек

| Слой | Технология | Версия | Почему выбрали |
|------|------------|--------|----------------|
| **Runtime** | Node.js | 20 LTS | Стабильность, поддержка до 2026 |
| **Package Manager** | pnpm | 9.x | Быстрый, экономит место, нативные workspaces |
| **Monorepo** | Turborepo | 2.x | Простой, быстрый, интеграция с Docker |
| **Frontend** | Vite 6 + React 19 | 6.x / 19.x | Telegram Mini App (SPA с HashRouter) |
| **UI Kit** | shadcn/ui | latest | Кастомизируемый, Tailwind-based |
| **Стили** | Tailwind CSS | 3.x | Utility-first, Mobile-first |
| **API Server** | graphql-yoga | 5.x | Standalone HTTP сервер (GraphQL + webhook + static) |
| **Schema** | Pothos | 4.x | Type-safe schema из TypeScript |
| **Telegram Bot** | Telegraf | 4.x | Webhook-based бот для Mini App |
| **Codegen** | GraphQL Codegen | 5.x | Генерация типов для клиента |
| **State** | TanStack Query | 5.x | Кэширование API ответов |
| **ORM** | Prisma | 5.x | Type-safe, отличные миграции |
| **Database** | PostgreSQL | 16 | Надёжность, JSON поддержка |
| **Cache** | Redis | 7.x | Кэш цен, очереди задач |
| **Containers** | Docker | 24+ | Изоляция, воспроизводимость |

### 2.2 Инфраструктура

| Компонент | Технология | Примечание |
|-----------|------------|------------|
| **VPS** | Timeweb / Selectel | Российский хостинг |
| **Orchestration** | Dokploy | Удобный UI для Docker |
| **Reverse Proxy** | Traefik | Встроен в Dokploy |
| **SSL** | Let's Encrypt | Автоматические сертификаты |
| **Мониторинг** | (позже) | Grafana + Prometheus |

---

## 3. Структура Monorepo

```
/razbor
│
├── /apps
│   │
│   ├── /server                    # Standalone Node.js HTTP сервер
│   │   ├── /src
│   │   │   ├── index.ts          # Точка входа (HTTP + GraphQL + Bot)
│   │   │   ├── bot.ts            # Telegraf бот (webhook)
│   │   │   └── auth.ts           # Валидация Telegram initData
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── /mini-app                  # Vite + React SPA (Telegram Mini App)
│   │   ├── /src
│   │   │   ├── App.tsx           # HashRouter + TelegramProvider
│   │   │   ├── /pages           # Страницы (Home, Models, Estimation, Result)
│   │   │   ├── /components      # UI компоненты (shadcn)
│   │   │   │   ├── /ui          # Базовые (button, input, etc.)
│   │   │   │   └── /features    # Фичевые (CarSelector, PartsList)
│   │   │   ├── /hooks           # React хуки
│   │   │   └── /lib             # Утилиты, GraphQL клиент
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── /web                      # [legacy] Next.js PWA (заменяется на mini-app)
│       ├── /app
│       └── package.json
│
├── /packages
│   │
│   ├── /api                      # GraphQL сервер (graphql-yoga + Pothos)
│   │   ├── /src
│   │   │   ├── /schema          # Pothos схема
│   │   │   │   ├── index.ts     # Главная схема
│   │   │   │   ├── builder.ts   # Pothos builder configuration
│   │   │   │   ├── /types       # GraphQL типы
│   │   │   │   ├── /queries     # Query fields
│   │   │   │   └── /mutations   # Mutation fields
│   │   │   ├── /services        # Бизнес-логика
│   │   │   │   └── estimation.service.ts
│   │   │   └── index.ts         # Экспорт yoga сервера
│   │   └── package.json
│   │
│   ├── /db                       # Prisma (база данных)
│   │   ├── /prisma
│   │   │   ├── schema.prisma    # Схема БД
│   │   │   ├── /migrations      # Миграции
│   │   │   └── seed.ts          # Начальные данные
│   │   ├── /src
│   │   │   └── client.ts        # Prisma Client singleton
│   │   └── package.json
│   │
│   ├── /shared                   # Общий код (Web + Mobile)
│   │   ├── /src
│   │   │   ├── /validators      # Zod схемы
│   │   │   ├── /utils           # Чистые функции (форматирование, расчёты)
│   │   │   ├── /constants       # Константы, енамы
│   │   │   └── /types           # Общие типы
│   │   └── package.json
│   │
│   ├── /graphql-client           # GraphQL клиент + codegen
│   │   ├── /src
│   │   │   ├── client.ts        # graphql-request instance
│   │   │   ├── /queries         # GraphQL query документы
│   │   │   ├── /mutations       # GraphQL mutation документы
│   │   │   └── /generated       # Сгенерированные типы (codegen)
│   │   ├── codegen.ts           # Конфиг GraphQL Codegen
│   │   └── package.json
│   │
│   └── /hooks                    # React Query хуки (универсальные Web + Mobile)
│       ├── /src
│       │   ├── useBrands.ts     # Запрос списка марок
│       │   ├── useBrand.ts      # Запрос марки с моделями
│       │   ├── useModel.ts      # Запрос модели с поколениями
│       │   ├── useGeneration.ts # Запрос поколения с запчастями
│       │   ├── useCalculate.ts  # Mutation расчёта стоимости
│       │   └── index.ts         # Реэкспорт всех хуков
│       └── package.json
│
├── /tools
│   │
│   └── /scraper                  # CLI для парсинга данных
│       ├── /src
│       │   ├── /parsers         # Парсеры площадок
│       │   │   ├── avito.ts
│       │   │   └── drom.ts
│       │   ├── /catalog         # Парсеры каталогов
│       │   │   └── exist.ts
│       │   └── cli.ts           # Точка входа CLI
│       ├── Dockerfile
│       └── package.json
│
├── /docker
│   ├── docker-compose.yml        # Production
│   ├── docker-compose.dev.yml    # Development
│   └── /services
│       ├── postgres/
│       │   └── init.sql
│       └── redis/
│           └── redis.conf
│
├── turbo.json                    # Turborepo конфиг
├── pnpm-workspace.yaml           # pnpm workspaces
├── package.json                  # Root package.json
├── .env.example                  # Пример переменных
└── README.md
```

---

## 4. Архитектура сервера

Standalone Node.js HTTP сервер (`apps/server/`) обслуживает:
- **GET /graphql** -- GraphQL Playground (dev)
- **POST /graphql** -- GraphQL API endpoint
- **POST /webhook** -- Telegram Bot webhook (Telegraf)
- **GET /*** -- Static файлы mini-app (production)

Auth реализован через заголовок `X-Telegram-Init-Data`. Сервер валидирует подпись HMAC с помощью BOT_TOKEN и извлекает данные пользователя в GraphQL context.

### 4.1 Принципы написания переиспользуемого кода

#### Бизнес-логика отдельно от UI

```typescript
// ✓ packages/shared/src/utils/estimation.ts
export function calculateMarketValue(parts: Part[]): number {
  return parts
    .filter(p => !p.isDamaged)
    .reduce((sum, p) => sum + p.averagePrice, 0)
}

export function calculateScrapValue(parts: Part[], metalPrices: MetalPrices): number {
  return parts
    .filter(p => p.isDamaged)
    .reduce((sum, p) => sum + p.weight * metalPrices[p.metalType], 0)
}

// Используется одинаково в Web и Mobile
```

#### Хуки без DOM-зависимостей

```typescript
// ✓ packages/hooks/src/useCalculation.ts
export function useCalculation(carId: string) {
  const { data: parts } = useParts(carId)
  const { data: prices } = useMetalPrices()

  const result = useMemo(() => {
    if (!parts || !prices) return null
    return {
      marketValue: calculateMarketValue(parts),
      scrapValue: calculateScrapValue(parts, prices),
    }
  }, [parts, prices])

  return result
}
```

#### Валидация через Zod

```typescript
// ✓ packages/shared/src/validators/car.ts
import { z } from 'zod'

export const selectCarSchema = z.object({
  brandId: z.string().uuid(),
  modelId: z.string().uuid(),
  generationId: z.string().uuid().optional(),
})

export type SelectCarInput = z.infer<typeof selectCarSchema>

// Работает на клиенте, сервере, Web и Mobile
```

#### Абстракция навигации

```typescript
// ✓ packages/shared/src/constants/routes.ts
export const ROUTES = {
  home: '/',
  estimation: (carId: string) => `/estimation/${carId}`,
  result: (calculationId: string) => `/result/${calculationId}`,
} as const

// Web: Next.js router.push(ROUTES.estimation(carId))
// Mobile: navigation.navigate('Estimation', { carId })
```

---

## 5. Потоки данных

### 5.1 Основной поток (выбор авто -> расчёт)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Telegram   │────▶│   Server    │────▶│   Prisma    │
│  Mini App   │◀────│  (GraphQL)  │◀────│ PostgreSQL  │
└─────────────┘     └──────┬──────┘     └─────────────┘
       │                   │
       │                   ▼
       │            ┌─────────────┐
       │            │    Redis    │
       │            │  (кэш цен)  │
       │            └─────────────┘
       │
       ▼
┌─────────────┐
│  Telegram   │
│  Bot API    │
│ (webhook)   │
└─────────────┘
```

### 5.2 Поток обновления цен (фоновый)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Scraper   │────▶│    Redis    │────▶│  PostgreSQL │
│    (CLI)    │     │   (queue)   │     │   (prices)  │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│ Avito/Drom  │
│  (парсинг)  │
└─────────────┘
```

### 5.3 Запрос с кэшированием

```
Клиент запрашивает цены на запчасти Lada Vesta
                    │
                    ▼
         ┌─────────────────────┐
         │ Проверяем Redis кэш │
         └──────────┬──────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
   [Кэш свежий]           [Кэш старый]
   < 7 дней               > 7 дней
        │                       │
        ▼                       ▼
   Возвращаем            Возвращаем старые
   из кэша               + запускаем фоновое
                         обновление
```

---

## 6. Docker конфигурация

### 6.1 Development (docker-compose.dev.yml)

```yaml
version: '3.8'

services:
  # База данных
  postgres:
    image: postgres:16-alpine
    container_name: razbor-postgres
    environment:
      POSTGRES_USER: razbor
      POSTGRES_PASSWORD: razbor_dev
      POSTGRES_DB: razbor
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/services/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U razbor"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Кэш
  redis:
    image: redis:7-alpine
    container_name: razbor-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Приложение (dev режим с hot reload)
  server:
    build:
      context: .
      dockerfile: ./apps/server/Dockerfile.dev
    container_name: razbor-server
    ports:
      - "4000:4000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://razbor:razbor_dev@postgres:5432/razbor
      - REDIS_URL=redis://redis:6379
      - BOT_TOKEN=${BOT_TOKEN}
      - MINI_APP_URL=${MINI_APP_URL}
      - PORT=4000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

volumes:
  postgres_data:
  redis_data:
```

### 6.2 Production (docker-compose.yml)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: razbor-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: razbor-redis
    volumes:
      - redis_data:/data
    restart: unless-stopped

  server:
    build:
      context: .
      dockerfile: ./Dockerfile
    container_name: razbor-server
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      - REDIS_URL=redis://redis:6379
      - BOT_TOKEN=${BOT_TOKEN}
      - MINI_APP_URL=${MINI_APP_URL}
      - BOT_WEBHOOK_URL=${BOT_WEBHOOK_URL}
      - PORT=4000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.razbor.rule=Host(`razbor.example.com`)"
      - "traefik.http.routers.razbor.tls.certresolver=letsencrypt"
      - "traefik.http.services.razbor.loadbalancer.server.port=4000"

volumes:
  postgres_data:
  redis_data:
```

### 6.3 Dockerfile (Production)

```dockerfile
# Dockerfile (корень проекта)

# === Base ===
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# === Dependencies ===
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json ./apps/server/
COPY apps/mini-app/package.json ./apps/mini-app/
COPY packages/api/package.json ./packages/api/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY packages/hooks/package.json ./packages/hooks/
COPY packages/graphql-client/package.json ./packages/graphql-client/
RUN pnpm install --frozen-lockfile

# === Builder ===
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm --filter @razbor/db db:generate
RUN pnpm build

# === Runner ===
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

COPY --from=builder --chown=appuser:nodejs /app .

USER appuser

EXPOSE 4000

ENV PORT=4000

CMD ["node", "apps/server/dist/index.js"]
```

---

## 7. Переменные окружения

### 7.1 .env.example

```bash
# === Database ===
DATABASE_URL="postgresql://razbor:razbor_dev@localhost:5432/razbor"
POSTGRES_USER=razbor
POSTGRES_PASSWORD=razbor_dev
POSTGRES_DB=razbor

# === Redis ===
REDIS_URL="redis://localhost:6379"

# === Telegram Bot ===
BOT_TOKEN="123456:ABC-DEF..."
MINI_APP_URL="https://your-domain.ru"
BOT_WEBHOOK_URL="https://your-domain.ru/webhook"

# === App ===
NODE_ENV=development
PORT=4000

# === Scraper (будущее) ===
# PROXY_URL=
# AVITO_DELAY_MS=3000
```

---

## 8. Скрипты и команды

### 8.1 Корневой package.json

```json
{
  "name": "razbor",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "dev:server": "pnpm --filter @razbor/server dev",
    "dev:mini-app": "pnpm --filter @razbor/mini-app dev",
    "build": "turbo run build",
    "start": "turbo run start",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "db:generate": "pnpm --filter @razbor/db db:generate",
    "db:migrate": "pnpm --filter @razbor/db db:migrate",
    "db:seed": "pnpm --filter @razbor/db db:seed",
    "db:studio": "pnpm --filter @razbor/db db:studio",
    "codegen": "pnpm --filter @razbor/graphql-client codegen",
    "docker:dev": "docker compose -f docker/docker-compose.dev.yml up",
    "docker:dev:build": "docker compose -f docker/docker-compose.dev.yml up --build",
    "docker:prod": "docker compose -f docker/docker-compose.yml up -d",
    "docker:down": "docker compose -f docker/docker-compose.dev.yml down"
  }
}
```

### 8.2 Turborepo конфиг (turbo.json)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build", "@razbor/db#db:generate", "@razbor/graphql-client#codegen"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    },
    "codegen": {
      "dependsOn": ["@razbor/api#build"],
      "outputs": ["generated/**"]
    }
  }
}
```

---

## 9. Telegram Mini App -- особенности

### Auth flow
1. Telegram открывает Mini App и передает `initData` через `Telegram.WebApp.initData`
2. Mini App отправляет `initData` в каждом GraphQL запросе через заголовок `X-Telegram-Init-Data`
3. Сервер валидирует HMAC-подпись с помощью `BOT_TOKEN`
4. Из `initData` извлекается `user.id` и создается/находится User в БД

### HashRouter
Telegram WebView не поддерживает History API, поэтому используется HashRouter.
Все маршруты доступны через `#/path`.

### Telegram WebApp SDK
При инициализации вызывается:
- `WebApp.ready()` — сообщает Telegram что приложение готово
- `WebApp.expand()` — развернуть на весь экран
- `WebApp.setHeaderColor('#09090b')` — цвет шапки совпадает с фоном приложения
- `WebApp.setBackgroundColor('#09090b')` — цвет фона за границами приложения

### Уведомления от бота (будущая фича)
Бот может отправлять пуш-уведомления пользователям:
- **Напоминания**: "Давно не заходили — проверьте новые цены на запчасти"
- **Обновления цен**: "Цены на Lada Vesta обновлены"
- **Лимиты**: "Ваши бесплатные расчёты обновились"
- **Акции**: "Пакет 20 расчётов со скидкой 30%"

Реализация через `bot.telegram.sendMessage(chatId, text)` с хранением `chatId` в модели User (поле из initData). Рассылка через cron-задачу или event-driven (при обновлении цен).

---

## 10. Следующие шаги

1. **PROJECT.md** — описание продукта, целевая аудитория
2. **MVP.md** — что входит в первую версию
3. **DATABASE.md** — схема Prisma
4. **API.md** — GraphQL схема
5. **Инициализация проекта** — создание структуры
