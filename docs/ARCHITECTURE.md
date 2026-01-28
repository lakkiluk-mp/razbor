# Архитектура проекта Razbor

> Калькулятор маржинальности авторазбора

---

## 1. Обзор

### 1.1 Цель архитектуры

Построить систему, которая:
- Работает как PWA на мобильных устройствах (Mobile-first)
- Легко мигрирует на React Native без переписывания бизнес-логики
- Масштабируется от MVP до production с тысячами пользователей

### 1.2 Ключевые принципы

| Принцип | Описание |
|---------|----------|
| **API First** | Бэкенд отдаёт только данные (GraphQL). UI полностью отделён |
| **Shared Logic** | Бизнес-логика, валидация, типы — в общих пакетах |
| **Mobile Ready** | Архитектура готова к React Native с первого дня |
| **Docker Everything** | Разработка и продакшен — в контейнерах |

---

## 2. Технологический стек

### 2.1 Основной стек

| Слой | Технология | Версия | Почему выбрали |
|------|------------|--------|----------------|
| **Runtime** | Node.js | 20 LTS | Стабильность, поддержка до 2026 |
| **Package Manager** | pnpm | 9.x | Быстрый, экономит место, нативные workspaces |
| **Monorepo** | Turborepo | 2.x | Простой, быстрый, интеграция с Vercel/Docker |
| **Frontend** | Next.js | 14+ | App Router, SSR, оптимизация |
| **UI Kit** | shadcn/ui | latest | Кастомизируемый, Tailwind-based |
| **Стили** | Tailwind CSS | 3.x | Utility-first, Mobile-first |
| **API** | graphql-yoga | 5.x | Лёгкий, современный GraphQL сервер |
| **Schema** | Pothos | 4.x | Type-safe schema из TypeScript |
| **Codegen** | GraphQL Codegen | 5.x | Генерация типов для клиента |
| **State** | TanStack Query | 5.x | Кэширование, работает с React Native |
| **ORM** | Prisma | 5.x | Type-safe, отличные миграции |
| **Database** | PostgreSQL | 16 | Надёжность, JSON поддержка |
| **Cache** | Redis | 7.x | Кэш цен, очереди задач |
| **Containers** | Docker | 24+ | Изоляция, воспроизводимость |

### 2.2 Будущий стек (React Native)

| Слой | Технология | Примечание |
|------|------------|------------|
| **Framework** | React Native | 0.73+ |
| **Navigation** | React Navigation | 6.x |
| **UI** | React Native Paper / Tamagui | Выберем при старте mobile |
| **Min iOS** | 15+ | iPhone 6s и новее (~99%) |
| **Min Android** | API 26 (Android 8+) | ~95% устройств |

### 2.3 Инфраструктура

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
│   ├── /web                      # Next.js PWA (основное приложение)
│   │   ├── /app                  # App Router pages
│   │   │   ├── /(main)          # Основные страницы
│   │   │   │   ├── page.tsx     # Главная (выбор авто)
│   │   │   │   ├── /calculator  # Калькулятор
│   │   │   │   └── /result      # Результат оценки
│   │   │   ├── /api             # API routes (GraphQL endpoint)
│   │   │   └── layout.tsx
│   │   ├── /components           # UI компоненты (shadcn)
│   │   │   ├── /ui              # Базовые (button, input, etc.)
│   │   │   └── /features        # Фичевые (CarSelector, PartsList)
│   │   ├── /lib                  # Web-specific утилиты
│   │   ├── /styles               # Global styles
│   │   ├── Dockerfile
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   └── /mobile                   # React Native (будущее)
│       ├── /src
│       │   ├── /screens         # Экраны
│       │   ├── /components      # Native компоненты
│       │   └── /navigation      # React Navigation
│       └── package.json
│
├── /packages
│   │
│   ├── /api                      # GraphQL сервер
│   │   ├── /src
│   │   │   ├── /schema          # Pothos схема
│   │   │   │   ├── index.ts     # Главная схема
│   │   │   │   ├── car.ts       # Car types & queries
│   │   │   │   ├── part.ts      # Part types & queries
│   │   │   │   └── calculation.ts
│   │   │   ├── /resolvers       # Резолверы (если выносим)
│   │   │   ├── /services        # Бизнес-логика
│   │   │   │   ├── car.service.ts
│   │   │   │   ├── part.service.ts
│   │   │   │   ├── price.service.ts
│   │   │   │   └── calculator.service.ts
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
│   │   │   │   ├── car.ts
│   │   │   │   ├── part.ts
│   │   │   │   └── calculation.ts
│   │   │   ├── /utils           # Чистые функции
│   │   │   │   ├── calculator.ts    # Логика расчётов
│   │   │   │   ├── formatters.ts    # Форматирование цен
│   │   │   │   └── helpers.ts
│   │   │   ├── /constants       # Константы, енамы
│   │   │   │   ├── metals.ts    # Цены на металл
│   │   │   │   ├── categories.ts
│   │   │   │   └── routes.ts    # Маршруты (абстракция)
│   │   │   └── /types           # Общие типы
│   │   │       └── index.ts
│   │   └── package.json
│   │
│   ├── /hooks                    # React хуки (универсальные)
│   │   ├── /src
│   │   │   ├── useCars.ts       # Запрос списка авто
│   │   │   ├── useParts.ts      # Запрос запчастей
│   │   │   ├── useCalculation.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── /graphql-client           # GraphQL клиент
│       ├── /src
│       │   ├── client.ts        # graphql-request instance
│       │   ├── /queries         # GraphQL queries
│       │   └── /mutations       # GraphQL mutations
│       ├── /generated           # Сгенерированные типы (codegen)
│       │   └── graphql.ts
│       ├── codegen.ts           # Конфиг codegen
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

## 4. Переиспользование кода (Web → Mobile)

### 4.1 Матрица переиспользования

| Пакет | Web | Mobile | Переиспользование |
|-------|-----|--------|-------------------|
| `@razbor/api` | ✓ | ✓ | 100% |
| `@razbor/db` | ✓ | ✓ | 100% |
| `@razbor/shared` | ✓ | ✓ | 100% |
| `@razbor/hooks` | ✓ | ✓ | 100% |
| `@razbor/graphql-client` | ✓ | ✓ | 100% |
| `apps/web/components` | ✓ | ✗ | 0% (переписываем) |

**Итого: ~80% кода переиспользуется при переходе на React Native**

### 4.2 Принципы написания переиспользуемого кода

#### Бизнес-логика отдельно от UI

```typescript
// ✓ packages/shared/src/utils/calculator.ts
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
  calculator: (carId: string) => `/calculator/${carId}`,
  result: (calculationId: string) => `/result/${calculationId}`,
} as const

// Web: Next.js router.push(ROUTES.calculator(carId))
// Mobile: navigation.navigate('Calculator', { carId })
```

---

## 5. Потоки данных

### 5.1 Основной поток (выбор авто → расчёт)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Клиент    │────▶│   GraphQL   │────▶│   Prisma    │
│  (Web/App)  │◀────│    Yoga     │◀────│ PostgreSQL  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Redis    │
                    │  (кэш цен)  │
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
  app:
    build:
      context: .
      dockerfile: ./apps/web/Dockerfile.dev
    container_name: razbor-app
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/apps/web/node_modules
      - /app/apps/web/.next
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://razbor:razbor_dev@postgres:5432/razbor
      - REDIS_URL=redis://redis:6379
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

  app:
    build:
      context: .
      dockerfile: ./apps/web/Dockerfile
    container_name: razbor-app
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      - REDIS_URL=redis://redis:6379
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

volumes:
  postgres_data:
  redis_data:
```

### 6.3 Dockerfile (Production)

```dockerfile
# apps/web/Dockerfile

# === Base ===
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# === Dependencies ===
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
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

# Генерация Prisma Client
RUN pnpm --filter @razbor/db db:generate

# Генерация GraphQL типов
RUN pnpm --filter @razbor/graphql-client codegen

# Сборка приложения
RUN pnpm --filter @razbor/web build

# === Runner ===
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
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

# === App ===
NODE_ENV=development
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_GRAPHQL_URL="http://localhost:3000/api/graphql"

# === Auth (будущее) ===
# YANDEX_CLIENT_ID=
# YANDEX_CLIENT_SECRET=
# VK_CLIENT_ID=
# VK_CLIENT_SECRET=

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

## 9. Чеклист миграции на React Native

Когда решим добавить мобильное приложение:

### Подготовка (1 день)
- [ ] Инициализация React Native проекта в `/apps/mobile`
- [ ] Настройка Metro bundler для monorepo
- [ ] Подключение `@razbor/shared`, `@razbor/hooks`, `@razbor/graphql-client`

### Навигация (2-3 дня)
- [ ] Установка React Navigation
- [ ] Маппинг `ROUTES` на экраны
- [ ] Настройка deep linking

### UI компоненты (1-2 недели)
- [ ] Выбор UI библиотеки (React Native Paper / Tamagui)
- [ ] Создание базовых компонентов (Button, Input, Card)
- [ ] Перенос фичевых компонентов (CarSelector, PartsList, Calculator)

### Тестирование (3-5 дней)
- [ ] Тестирование на iOS симуляторе
- [ ] Тестирование на Android эмуляторе
- [ ] Тестирование на реальных устройствах

### Публикация
- [ ] Настройка Fastlane
- [ ] Сборка для App Store
- [ ] Сборка для Google Play

**Оценка: 3-4 недели** при готовой архитектуре (которую закладываем сейчас).

---

## 10. Следующие шаги

1. **PROJECT.md** — описание продукта, целевая аудитория
2. **MVP.md** — что входит в первую версию
3. **DATABASE.md** — схема Prisma
4. **API.md** — GraphQL схема
5. **Инициализация проекта** — создание структуры
