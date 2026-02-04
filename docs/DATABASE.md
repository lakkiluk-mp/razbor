# Database Schema — Razbor

> Схема базы данных (Prisma)

---

## 1. Обзор

### 1.1 MVP scope

```
┌─────────────────────────────────────────────────────────────────┐
│                         MVP SCHEMA                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐    ┌─────────┐    ┌──────────────┐                │
│  │  Brand  │───▶│  Model  │───▶│  Generation  │                │
│  └─────────┘    └─────────┘    └──────────────┘                │
│                                       │                         │
│                                       ▼                         │
│                              ┌──────────────┐                   │
│                              │  ModelPart   │◀─┐                │
│                              └──────────────┘  │                │
│                                       │        │                │
│                                       ▼        │                │
│  ┌──────────────┐            ┌──────────────┐  │                │
│  │ SchematicZone│◀───────────│    Part      │──┘                │
│  └──────────────┘            └──────────────┘  (связь между     │
│                                       │         моделями)       │
│                                       ▼                         │
│                              ┌──────────────┐                   │
│                              │    Price     │                   │
│                              └──────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Telegram-интеграция (User, Calculation, Payment)

```
┌─────────────────────────────────────────────────────────────────┐
│                   TELEGRAM INTEGRATION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐    ┌─────────────┐    ┌──────────────┐            │
│  │  User   │───▶│  Calculation │───▶│ CalcPart     │            │
│  │(Telegram)│    └─────────────┘    └──────────────┘            │
│  └────┬────┘                                                    │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────┐    ┌─────────────┐                            │
│  │  Payment    │───▶│  Package    │                            │
│  │  (Stars)    │    └─────────────┘                            │
│  └─────────────┘                                                │
│                                                                 │
│  + PriceHistory (история изменения цен, будущее)               │
│  + Region (региональные цены, будущее)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. MVP Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// КАТАЛОГ АВТОМОБИЛЕЙ
// ============================================

/// Марка автомобиля (Lada, Hyundai, Kia...)
model Brand {
  id        String   @id @default(cuid())
  name      String   @unique // "Lada"
  slug      String   @unique // "lada"
  logo      String?  // URL иконки
  sortOrder Int      @default(0) // для сортировки на главной

  models    Model[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("brands")
}

/// Модель автомобиля (Vesta, Granta, Solaris...)
model Model {
  id        String   @id @default(cuid())
  brandId   String
  name      String   // "Vesta"
  slug      String   // "vesta"

  brand     Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)
  generations Generation[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([brandId, slug])
  @@map("models")
}

/// Поколение модели (I 2015-2023, II 2023-...)
model Generation {
  id          String    @id @default(cuid())
  modelId     String
  name        String    // "I (2015-2023)"
  slug        String    // "1-2015-2023"
  yearStart   Int       // 2015
  yearEnd     Int?      // 2023 или null если текущее
  bodyType    BodyType  // sedan, hatchback, crossover, wagon
  isActive    Boolean   @default(true) // показывать в списке

  model       Model     @relation(fields: [modelId], references: [id], onDelete: Cascade)
  modelParts  ModelPart[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([modelId, slug])
  @@map("generations")
}

/// Тип кузова (определяет какие картинки трафарета использовать)
enum BodyType {
  sedan      // Седан, купе
  hatchback  // Хэтчбек, лифтбек
  crossover  // Кроссовер, SUV
  wagon      // Универсал, минивэн
}

// ============================================
// ЗАПЧАСТИ
// ============================================

/// Запчасть (универсальная, может быть привязана к нескольким моделям)
model Part {
  id              String        @id @default(cuid())
  name            String        // "Фара передняя левая"
  slug            String        @unique // "headlight-front-left"
  category        PartCategory  // body, optics, engine...
  schematicZoneId String?       // связь с зоной трафарета

  // Поисковые запросы для парсинга (JSON массив)
  // ["фара левая", "фара передняя левая", "headlight left"]
  searchQueries   String[]      @default([])

  schematicZone   SchematicZone? @relation(fields: [schematicZoneId], references: [id])
  modelParts      ModelPart[]
  prices          Price[]

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@map("parts")
}

/// Категория запчасти
enum PartCategory {
  body          // Кузов (капот, крылья, двери)
  optics        // Оптика (фары, фонари)
  glass         // Стёкла
  interior      // Салон (сиденья, панель)
  engine        // Двигатель и навесное
  transmission  // КПП
  suspension    // Подвеска
  electrical    // Электрика
  cooling       // Охлаждение (радиаторы)
  other         // Прочее
}

/// Связь запчасти с конкретной моделью (поколением)
/// Позволяет одной Part быть в нескольких моделях
model ModelPart {
  id            String     @id @default(cuid())
  generationId  String
  partId        String

  // Специфичные для модели данные
  oem           String?    // OEM номер для этой модели "92101-4L500"
  note          String?    // Примечание "только для комплектации Luxe"
  isDefault     Boolean    @default(true) // включать по умолчанию в расчёт

  generation    Generation @relation(fields: [generationId], references: [id], onDelete: Cascade)
  part          Part       @relation(fields: [partId], references: [id], onDelete: Cascade)

  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  @@unique([generationId, partId])
  @@map("model_parts")
}

// ============================================
// ТРАФАРЕТ (СХЕМА АВТО)
// ============================================

/// Зона на трафарете (кнопка [+] на картинке)
model SchematicZone {
  id          String      @id @default(cuid())
  code        String      @unique // "hood", "door_fl", "engine"
  name        String      // "Капот", "Дверь передняя левая"
  type        ZoneType    // body, aggregate
  view        String?     // на каком виде показывать: "left", "right", "front", "back"
  bodyTypes   BodyType[]  // для каких типов кузова актуальна

  parts       Part[]

  @@map("schematic_zones")
}

/// Тип зоны
enum ZoneType {
  body       // Кнопка на картинке авто (кузовные)
  aggregate  // Отдельная кнопка внизу (двигатель, КПП)
}

// ============================================
// ЦЕНЫ
// ============================================

/// Текущая цена на запчасть
model Price {
  id          String   @id @default(cuid())
  partId      String

  // Агрегированные данные
  median      Int      // Медианная цена в рублях
  min         Int      // Минимальная (после фильтрации выбросов)
  max         Int      // Максимальная
  count       Int      // Кол-во объявлений в выборке

  // Метаданные
  source      String   @default("avito") // avito, drom, manual
  updatedAt   DateTime @updatedAt

  part        Part     @relation(fields: [partId], references: [id], onDelete: Cascade)

  @@unique([partId]) // одна актуальная цена на запчасть
  @@map("prices")
}
```

---

## 3. Зоны трафарета (seed данные)

```typescript
// prisma/seed/schematic-zones.ts

export const schematicZones = [
  // === КУЗОВ (на трафарете) ===
  // Верхняя часть
  { code: 'hood', name: 'Капот', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },
  { code: 'roof', name: 'Крыша', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },
  { code: 'trunk', name: 'Багажник / Крышка', type: 'body', bodyTypes: ['sedan', 'crossover', 'wagon'] },
  { code: 'tailgate', name: 'Дверь багажника', type: 'body', bodyTypes: ['hatchback', 'crossover', 'wagon'] },

  // Крылья
  { code: 'fender_fl', name: 'Крыло переднее левое', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },
  { code: 'fender_fr', name: 'Крыло переднее правое', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },
  { code: 'fender_rl', name: 'Крыло заднее левое', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },
  { code: 'fender_rr', name: 'Крыло заднее правое', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },

  // Двери
  { code: 'door_fl', name: 'Дверь передняя левая', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },
  { code: 'door_fr', name: 'Дверь передняя правая', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },
  { code: 'door_rl', name: 'Дверь задняя левая', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },
  { code: 'door_rr', name: 'Дверь задняя правая', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },

  // Бамперы
  { code: 'bumper_f', name: 'Бампер передний', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },
  { code: 'bumper_r', name: 'Бампер задний', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },

  // Оптика
  { code: 'headlight_l', name: 'Фара левая', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },
  { code: 'headlight_r', name: 'Фара правая', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },
  { code: 'taillight_l', name: 'Фонарь левый', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },
  { code: 'taillight_r', name: 'Фонарь правый', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },

  // Зеркала
  { code: 'mirror_l', name: 'Зеркало левое', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },
  { code: 'mirror_r', name: 'Зеркало правое', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },

  // Стёкла
  { code: 'windshield', name: 'Лобовое стекло', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },
  { code: 'rear_glass', name: 'Заднее стекло', type: 'body', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },

  // === АГРЕГАТЫ (отдельные иконки) ===
  { code: 'engine', name: 'Двигатель', type: 'aggregate', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },
  { code: 'transmission', name: 'КПП', type: 'aggregate', bodyTypes: ['sedan', 'hatchback', 'crossover', 'wagon'] },
]
```

---

## 4. Пример данных (Lada Vesta)

```typescript
// prisma/seed/lada-vesta.ts

export const ladaVestaSeed = {
  brand: {
    name: 'Lada',
    slug: 'lada',
    logo: '/brands/lada.svg',
    sortOrder: 1,
  },

  model: {
    name: 'Vesta',
    slug: 'vesta',
  },

  generation: {
    name: 'I (2015-2023)',
    slug: '1-2015-2023',
    yearStart: 2015,
    yearEnd: 2023,
    bodyType: 'sedan',
  },

  parts: [
    // Двигатель и КПП
    {
      name: 'Двигатель 1.6 106 л.с. (21129)',
      slug: 'engine-1-6-106-21129',
      category: 'engine',
      schematicZone: 'engine',
      searchQueries: ['двигатель vesta 1.6', 'мотор vesta 21129', 'двс веста'],
      price: { median: 120000, min: 95000, max: 150000, count: 15 },
    },
    {
      name: 'Двигатель 1.8 122 л.с. (21179)',
      slug: 'engine-1-8-122-21179',
      category: 'engine',
      schematicZone: 'engine',
      searchQueries: ['двигатель vesta 1.8', 'мотор vesta 21179'],
      price: { median: 140000, min: 110000, max: 170000, count: 8 },
    },
    {
      name: 'МКПП JH3 5-ступ',
      slug: 'transmission-mt-jh3',
      category: 'transmission',
      schematicZone: 'transmission',
      searchQueries: ['коробка vesta мкпп', 'кпп vesta jh3'],
      price: { median: 45000, min: 35000, max: 55000, count: 12 },
    },
    {
      name: 'АКПП Jatco (вариатор)',
      slug: 'transmission-at-jatco',
      category: 'transmission',
      schematicZone: 'transmission',
      searchQueries: ['коробка vesta акпп', 'вариатор vesta jatco'],
      price: { median: 85000, min: 70000, max: 100000, count: 6 },
    },

    // Кузов
    {
      name: 'Капот',
      slug: 'hood',
      category: 'body',
      schematicZone: 'hood',
      searchQueries: ['капот vesta', 'капот веста'],
      price: { median: 12000, min: 8000, max: 18000, count: 20 },
    },
    {
      name: 'Крыло переднее левое',
      slug: 'fender-front-left',
      category: 'body',
      schematicZone: 'fender_fl',
      searchQueries: ['крыло vesta левое переднее'],
      price: { median: 6000, min: 4000, max: 9000, count: 18 },
    },
    {
      name: 'Крыло переднее правое',
      slug: 'fender-front-right',
      category: 'body',
      schematicZone: 'fender_fr',
      searchQueries: ['крыло vesta правое переднее'],
      price: { median: 6000, min: 4000, max: 9000, count: 16 },
    },
    {
      name: 'Дверь передняя левая',
      slug: 'door-front-left',
      category: 'body',
      schematicZone: 'door_fl',
      searchQueries: ['дверь vesta передняя левая', 'дверь водителя vesta'],
      price: { median: 18000, min: 12000, max: 25000, count: 14 },
    },
    {
      name: 'Дверь передняя правая',
      slug: 'door-front-right',
      category: 'body',
      schematicZone: 'door_fr',
      searchQueries: ['дверь vesta передняя правая'],
      price: { median: 18000, min: 12000, max: 25000, count: 12 },
    },
    {
      name: 'Дверь задняя левая',
      slug: 'door-rear-left',
      category: 'body',
      schematicZone: 'door_rl',
      searchQueries: ['дверь vesta задняя левая'],
      price: { median: 15000, min: 10000, max: 20000, count: 10 },
    },
    {
      name: 'Дверь задняя правая',
      slug: 'door-rear-right',
      category: 'body',
      schematicZone: 'door_rr',
      searchQueries: ['дверь vesta задняя правая'],
      price: { median: 15000, min: 10000, max: 20000, count: 9 },
    },
    {
      name: 'Бампер передний',
      slug: 'bumper-front',
      category: 'body',
      schematicZone: 'bumper_f',
      searchQueries: ['бампер vesta передний'],
      price: { median: 8000, min: 5000, max: 12000, count: 22 },
    },
    {
      name: 'Бампер задний',
      slug: 'bumper-rear',
      category: 'body',
      schematicZone: 'bumper_r',
      searchQueries: ['бампер vesta задний'],
      price: { median: 7000, min: 4000, max: 10000, count: 18 },
    },

    // Оптика
    {
      name: 'Фара передняя левая',
      slug: 'headlight-left',
      category: 'optics',
      schematicZone: 'headlight_l',
      searchQueries: ['фара vesta левая', 'фара веста'],
      price: { median: 12000, min: 8000, max: 18000, count: 15 },
    },
    {
      name: 'Фара передняя правая',
      slug: 'headlight-right',
      category: 'optics',
      schematicZone: 'headlight_r',
      searchQueries: ['фара vesta правая'],
      price: { median: 12000, min: 8000, max: 18000, count: 14 },
    },
    {
      name: 'Фонарь задний левый',
      slug: 'taillight-left',
      category: 'optics',
      schematicZone: 'taillight_l',
      searchQueries: ['фонарь vesta левый задний'],
      price: { median: 5000, min: 3000, max: 8000, count: 12 },
    },
    {
      name: 'Фонарь задний правый',
      slug: 'taillight-right',
      category: 'optics',
      schematicZone: 'taillight_r',
      searchQueries: ['фонарь vesta правый задний'],
      price: { median: 5000, min: 3000, max: 8000, count: 11 },
    },

    // Стёкла
    {
      name: 'Лобовое стекло',
      slug: 'windshield',
      category: 'glass',
      schematicZone: 'windshield',
      searchQueries: ['лобовое стекло vesta'],
      price: { median: 8000, min: 5000, max: 12000, count: 10 },
    },

    // Зеркала
    {
      name: 'Зеркало левое',
      slug: 'mirror-left',
      category: 'body',
      schematicZone: 'mirror_l',
      searchQueries: ['зеркало vesta левое'],
      price: { median: 4000, min: 2500, max: 6000, count: 8 },
    },
    {
      name: 'Зеркало правое',
      slug: 'mirror-right',
      category: 'body',
      schematicZone: 'mirror_r',
      searchQueries: ['зеркало vesta правое'],
      price: { median: 4000, min: 2500, max: 6000, count: 7 },
    },

    // Механика (без зоны на трафарете)
    {
      name: 'Радиатор охлаждения',
      slug: 'radiator',
      category: 'cooling',
      schematicZone: null,
      searchQueries: ['радиатор vesta охлаждения'],
      price: { median: 6000, min: 4000, max: 9000, count: 10 },
    },
    {
      name: 'Радиатор кондиционера',
      slug: 'ac-condenser',
      category: 'cooling',
      schematicZone: null,
      searchQueries: ['радиатор кондиционера vesta', 'конденсор vesta'],
      price: { median: 5000, min: 3000, max: 7000, count: 8 },
    },
    {
      name: 'Компрессор кондиционера',
      slug: 'ac-compressor',
      category: 'cooling',
      schematicZone: null,
      searchQueries: ['компрессор кондиционера vesta'],
      price: { median: 12000, min: 8000, max: 18000, count: 6 },
    },
    {
      name: 'Генератор',
      slug: 'alternator',
      category: 'electrical',
      schematicZone: null,
      searchQueries: ['генератор vesta'],
      price: { median: 8000, min: 5000, max: 12000, count: 12 },
    },
    {
      name: 'Стартер',
      slug: 'starter',
      category: 'electrical',
      schematicZone: null,
      searchQueries: ['стартер vesta'],
      price: { median: 5000, min: 3000, max: 8000, count: 10 },
    },
    {
      name: 'Рулевая рейка',
      slug: 'steering-rack',
      category: 'suspension',
      schematicZone: null,
      searchQueries: ['рулевая рейка vesta'],
      price: { median: 15000, min: 10000, max: 22000, count: 7 },
    },

    // Салон (без зоны)
    {
      name: 'Панель приборов (торпедо)',
      slug: 'dashboard',
      category: 'interior',
      schematicZone: null,
      searchQueries: ['торпедо vesta', 'панель приборов vesta'],
      price: { median: 15000, min: 10000, max: 25000, count: 5 },
    },
    {
      name: 'Сиденье переднее левое',
      slug: 'seat-front-left',
      category: 'interior',
      schematicZone: null,
      searchQueries: ['сиденье vesta водительское'],
      price: { median: 8000, min: 5000, max: 12000, count: 8 },
    },
    {
      name: 'Сиденье переднее правое',
      slug: 'seat-front-right',
      category: 'interior',
      schematicZone: null,
      searchQueries: ['сиденье vesta пассажирское'],
      price: { median: 7000, min: 4000, max: 10000, count: 7 },
    },
    {
      name: 'Диван задний',
      slug: 'seat-rear',
      category: 'interior',
      schematicZone: null,
      searchQueries: ['задний диван vesta', 'заднее сиденье vesta'],
      price: { median: 10000, min: 6000, max: 15000, count: 6 },
    },
  ],
}
```

---

## 5. Индексы и оптимизация

```prisma
// Добавляем в schema.prisma

model Brand {
  // ...
  @@index([sortOrder])
}

model Model {
  // ...
  @@index([brandId])
}

model Generation {
  // ...
  @@index([modelId])
  @@index([bodyType])
  @@index([isActive])
}

model Part {
  // ...
  @@index([category])
  @@index([schematicZoneId])
}

model ModelPart {
  // ...
  @@index([generationId])
  @@index([partId])
}

model Price {
  // ...
  @@index([partId])
  @@index([updatedAt])
}
```

---

## 6. Post-MVP Schema (будущее)

### 6.1 Пользователи (Telegram Auth)

```prisma
/// Пользователь Telegram
model User {
  id            String    @id @default(cuid())
  telegramId    BigInt    @unique    // Telegram user ID
  firstName     String               // Из Telegram initData
  lastName      String?
  username      String?
  languageCode  String?

  // Баланс оценок
  freeUsed      Int       @default(0)  // использовано бесплатных на этой неделе
  freeResetAt   DateTime  @default(now()) // когда сбрасывать счётчик
  paidBalance   Int       @default(0)  // оплаченные оценки (кредиты)

  calculations  Calculation[]
  payments      Payment[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("users")
}
```

### 6.2 История оценок

```prisma
/// Сохранённая оценка
model Calculation {
  id            String          @id @default(cuid())
  userId        String
  generationId  String

  // Снапшот на момент расчёта
  totalPrice    Int             // Итоговая сумма
  partsCount    Int             // Кол-во учтённых запчастей
  damagedZones  String[]        // Отмеченные повреждения ['hood', 'fender_fl']

  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  generation    Generation      @relation(fields: [generationId], references: [id])
  parts         CalcPart[]

  createdAt     DateTime        @default(now())

  @@index([userId])
  @@index([generationId])
  @@map("calculations")
}

/// Запчасть в расчёте (снапшот цены)
model CalcPart {
  id            String      @id @default(cuid())
  calculationId String
  partId        String

  name          String      // Название на момент расчёта
  price         Int         // Цена на момент расчёта
  included      Boolean     // Включена в итог
  isDamaged     Boolean     // Отмечена как повреждённая

  calculation   Calculation @relation(fields: [calculationId], references: [id], onDelete: Cascade)
  part          Part        @relation(fields: [partId], references: [id])

  @@map("calc_parts")
}
```

### 6.3 Платежи (Telegram Stars)

```prisma
/// Пакет оценок
model Package {
  id          String    @id @default(cuid())
  name        String    // "10 оценок"
  credits     Int       // 10
  price       Int       // Цена в Telegram Stars
  isActive    Boolean   @default(true)
  sortOrder   Int       @default(0)

  payments    Payment[]

  @@map("packages")
}

/// Платёж через Telegram Stars
model Payment {
  id                    String        @id @default(cuid())
  userId                String
  packageId             String

  amount                Int           // Сумма в Stars
  credits               Int           // Кол-во оценок
  status                PaymentStatus @default(pending)

  // Telegram Payment данные
  telegramPaymentChargeId String?    @unique  // charge_id от Telegram
  invoicePayload        String?               // payload для идентификации

  user          User          @relation(fields: [userId], references: [id])
  package       Package       @relation(fields: [packageId], references: [id])

  createdAt     DateTime      @default(now())
  paidAt        DateTime?

  @@index([userId])
  @@index([status])
  @@map("payments")
}

enum PaymentStatus {
  pending
  succeeded
  canceled
  refunded
}
```

### 6.4 Детализация цен (samples) и история

```prisma
/// Примеры объявлений (для попапа "статистика по запчасти")
/// Хранятся последние 10 штук, старше 30 дней — удаляются
model PriceSample {
  id        String   @id @default(cuid())
  partId    String

  amount    Int      // цена из объявления
  city      String?  // город продавца
  url       String?  // ссылка на объявление
  source    String   @default("avito") // avito, drom

  part      Part     @relation(fields: [partId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([partId, createdAt])
  @@map("price_samples")
}

/// История изменения цен (агрегированная, для аналитики и графиков)
/// Samples старше 30 дней агрегируются сюда и удаляются
model PriceHistory {
  id        String   @id @default(cuid())
  partId    String

  median    Int
  min       Int
  max       Int
  count     Int
  source    String

  part      Part     @relation(fields: [partId], references: [id], onDelete: Cascade)

  period    DateTime // начало периода (неделя)
  createdAt DateTime @default(now())

  @@unique([partId, period])
  @@index([partId])
  @@index([createdAt])
  @@map("price_history")
}

// Логика очистки (cron раз в неделю):
// 1. Samples старше 30 дней → агрегируем в PriceHistory
// 2. Удаляем агрегированные samples
// 3. Оставляем максимум 10 samples на запчасть
```

### 6.5 Региональные цены (будущее)

```prisma
/// Регион
model Region {
  id        String   @id @default(cuid())
  name      String   // "Москва и МО"
  slug      String   @unique // "moscow"

  prices    RegionalPrice[]

  @@map("regions")
}

/// Цена для региона
model RegionalPrice {
  id        String   @id @default(cuid())
  partId    String
  regionId  String

  median    Int
  min       Int
  max       Int
  count     Int

  part      Part     @relation(fields: [partId], references: [id], onDelete: Cascade)
  region    Region   @relation(fields: [regionId], references: [id], onDelete: Cascade)

  updatedAt DateTime @updatedAt

  @@unique([partId, regionId])
  @@map("regional_prices")
}
```

---

## 7. Миграции

### 7.1 Порядок миграций

```
MVP:
1. init -- базовые таблицы (brands, models, generations)
2. parts -- запчасти и связи (parts, model_parts, schematic_zones)
3. prices -- цены (prices)

Telegram Integration:
4. users -- пользователи (Telegram auth)
5. calculations -- история оценок
6. payments -- платежи (Telegram Stars)

Будущее:
7. price_history -- история цен
8. regions -- региональные цены
```

### 7.2 Команды

```bash
# Создать миграцию
pnpm --filter @razbor/db db:migrate:dev --name init

# Применить миграции
pnpm --filter @razbor/db db:migrate:deploy

# Сгенерировать Prisma Client
pnpm --filter @razbor/db db:generate

# Запустить seed
pnpm --filter @razbor/db db:seed

# Открыть Prisma Studio
pnpm --filter @razbor/db db:studio
```

---

## 8. Связь с Redis (кэш цен)

```typescript
// packages/db/src/cache.ts

interface CachedPrice {
  median: number
  min: number
  max: number
  count: number
  updatedAt: string
}

// Ключи в Redis
const PRICE_KEY = (partId: string) => `price:${partId}`
const PRICE_TTL = 14 * 24 * 60 * 60 // 14 дней

// Получить цену (сначала Redis, потом PostgreSQL)
async function getPrice(partId: string): Promise<CachedPrice | null> {
  // 1. Проверяем Redis
  const cached = await redis.get(PRICE_KEY(partId))
  if (cached) {
    return JSON.parse(cached)
  }

  // 2. Если нет — берём из PostgreSQL
  const price = await prisma.price.findUnique({
    where: { partId },
  })

  if (price) {
    // Кэшируем в Redis
    await redis.setex(
      PRICE_KEY(partId),
      PRICE_TTL,
      JSON.stringify(price)
    )
    return price
  }

  return null
}
```

---

## 9. ER-диаграмма

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MVP SCHEMA                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐         ┌──────────┐         ┌──────────────┐                │
│  │  Brand   │ 1─────M │  Model   │ 1─────M │  Generation  │                │
│  ├──────────┤         ├──────────┤         ├──────────────┤                │
│  │ id       │         │ id       │         │ id           │                │
│  │ name     │         │ brandId  │         │ modelId      │                │
│  │ slug     │         │ name     │         │ name         │                │
│  │ logo     │         │ slug     │         │ yearStart    │                │
│  │ sortOrder│         └──────────┘         │ yearEnd      │                │
│  └──────────┘                              │ bodyType     │                │
│                                            └──────┬───────┘                │
│                                                   │                        │
│                                                   │ 1                      │
│                                                   │                        │
│                                                   ▼ M                      │
│  ┌────────────────┐                       ┌──────────────┐                 │
│  │ SchematicZone  │ 1───────────────────M │  ModelPart   │                 │
│  ├────────────────┤                       ├──────────────┤                 │
│  │ id             │                       │ id           │                 │
│  │ code           │                       │ generationId │                 │
│  │ name           │                       │ partId       │                 │
│  │ type           │                       │ oem          │                 │
│  │ bodyTypes[]    │                       │ note         │                 │
│  └───────┬────────┘                       └──────┬───────┘                 │
│          │                                       │                         │
│          │ 1                                     │ M                       │
│          │                                       │                         │
│          ▼ M                                     ▼ 1                       │
│  ┌──────────────┐                         ┌──────────────┐                 │
│  │    Part      │ M─────────────────────1 │    Part      │                 │
│  ├──────────────┤                         ├──────────────┤                 │
│  │ id           │                         │ id           │                 │
│  │ name         │                         │ name         │                 │
│  │ slug         │                         │ category     │                 │
│  │ category     │                         │ schematicZoneId                │
│  │ schematicZoneId                        │ searchQueries│                 │
│  │ searchQueries│                         └──────┬───────┘                 │
│  └──────────────┘                                │                         │
│                                                  │ 1                       │
│                                                  │                         │
│                                                  ▼ 1                       │
│                                           ┌──────────────┐                 │
│                                           │    Price     │                 │
│                                           ├──────────────┤                 │
│                                           │ id           │                 │
│                                           │ partId       │                 │
│                                           │ median       │                 │
│                                           │ min          │                 │
│                                           │ max          │                 │
│                                           │ count        │                 │
│                                           │ source       │                 │
│                                           └──────────────┘                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Следующие шаги

1. **API.md** — GraphQL схема (queries, mutations)
2. **Инициализация проекта** — создание структуры Turborepo
3. **Docker + Prisma** — настройка базы
4. **Seed данных** — Lada Vesta
