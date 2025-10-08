# PowerLift Tracker - Сводка разработки

## Статус: ✅ MVP Завершён

Дата завершения: 8 октября 2025

## Выполненные задачи

### ✅ Инфраструктура и настройка
- [x] Инициализация Next.js 15 проекта с TypeScript и Tailwind CSS
- [x] Настройка Drizzle ORM с SQLite
- [x] Создание схем базы данных (User, Athlete, Plan, Log)
- [x] Настройка NextAuth.js v5 для аутентификации
- [x] Создание скриптов для управления пользователями

### ✅ Backend API
- [x] CRUD endpoints для атлетов (`/api/athletes`)
- [x] CRUD endpoints для планов тренировок (`/api/plans`)
- [x] API для логирования результатов (`/api/logs`)
- [x] API для экспорта в DOCX (`/api/athletes/[id]/export`)
- [x] API для импорта из DOCX (`/api/import/docx`)

### ✅ Утилиты и расчёты
- [x] Функции расчёта весов по процентам от PM
- [x] Парсер серий упражнений (поддержка форматов: `50кг×6×6`, `6,,6,,,,5,4,6*6`)
- [x] Генератор таблиц весов для всех упражнений
- [x] Округление весов с настраиваемым шагом (0.5/1/2.5 кг)

### ✅ Пользовательский интерфейс
- [x] Страница логина с валидацией
- [x] Dashboard с быстрыми ссылками
- [x] Список атлетов с таблицей PM
- [x] Профиль атлета с:
  - Текущими PM и историей
  - Таблицами весов по процентам для всех упражнений
  - Графиком прогресса PM (Chart.js)
  - Списком планов тренировок
- [x] Форма создания/редактирования атлета
- [x] Редактор планов тренировок с парсингом серий
- [x] Страница импорта/экспорта

### ✅ Импорт и Экспорт
- [x] Экспорт планов в DOCX (формат как в примере Марианы)
- [x] Импорт из DOCX с автоматическим парсингом:
  - Имени атлета
  - PM значений
  - Планов по неделям и тренировкам
  - Упражнений с сериями
- [x] Автоматическое создание/обновление атлетов при импорте

### ✅ Дополнительные функции
- [x] Калькулятор весов (встроен в профиль атлета)
- [x] Графики прогресса PM с Chart.js
- [x] История изменений PM
- [x] Поддержка типов тренировок (обычная/проходка)

### 🔄 Отложено на будущее
- [ ] Импорт из Excel (exceljs) - базовый функционал не требуется для MVP
- [ ] Мобильная версия (PWA)
- [ ] Уведомления о тренировках
- [ ] Экспорт в Excel

## Технологический стек

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Charts**: Chart.js + react-chartjs-2
- **Validation**: Zod
- **Auth**: NextAuth.js v5

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: SQLite (локальная файловая БД)
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js Credentials Provider

### Файлы и обработка
- **DOCX Export**: docx
- **DOCX Import**: mammoth
- **Excel**: exceljs (установлено, не используется в MVP)
- **ID Generation**: @paralleldrive/cuid2

## Структура проекта

```
powerlift-tracker/
├── app/                          # Next.js App Router
│   ├── api/                      # API endpoints
│   │   ├── athletes/             # Управление атлетами
│   │   ├── plans/                # Управление планами
│   │   ├── logs/                 # Логирование
│   │   ├── import/               # Импорт файлов
│   │   └── auth/                 # NextAuth endpoints
│   ├── athletes/                 # Страницы атлетов
│   ├── plans/                    # Страницы планов
│   ├── dashboard/                # Главная панель
│   ├── login/                    # Страница входа
│   └── import-export/            # Импорт/экспорт
├── lib/
│   ├── db/                       # База данных
│   │   ├── schema.ts             # Схемы Drizzle
│   │   └── index.ts              # DB connection
│   └── utils/                    # Утилиты
│       ├── calculations.ts       # Расчёты весов, парсинг
│       ├── export-docx.ts        # Экспорт в DOCX
│       └── import-docx.ts        # Импорт из DOCX
├── components/
│   └── PMProgressChart.tsx       # График прогресса
├── scripts/
│   └── create-user.ts            # Создание пользователей
├── data/
│   └── powerlift.db              # SQLite база
├── .env.local                    # Переменные окружения
├── drizzle.config.ts             # Конфигурация Drizzle
├── auth.config.ts                # Конфигурация NextAuth
├── middleware.ts                 # Next.js middleware (защита роутов)
├── README.md                     # Основная документация
└── QUICKSTART.md                 # Быстрый старт

```

## База данных

### Схема

**users** - Пользователи (тренеры)
- id, email, passwordHash, name, createdAt

**athletes** - Атлеты
- id, userId, name
- squatPM, benchPM, deadliftPM, pmDate
- pmHistory (JSON массив с историей PM)
- roundingStep, createdAt, updatedAt

**plans** - Планы тренировок
- id, athleteId, week, workoutNumber, date
- exercises (JSON массив упражнений с сериями)
- type (regular/test), notes
- createdAt, updatedAt

**logs** - Логи результатов
- id, planId, athleteId, date
- results (JSON массив фактических результатов)
- comment, createdAt

## API Endpoints

### Атлеты
- `GET /api/athletes` - Список всех атлетов
- `POST /api/athletes` - Создать атлета
- `GET /api/athletes/[id]` - Получить атлета
- `PUT /api/athletes/[id]` - Обновить атлета
- `DELETE /api/athletes/[id]` - Удалить атлета
- `GET /api/athletes/[id]/pm-history` - История PM
- `GET /api/athletes/[id]/export` - Экспорт в DOCX

### Планы
- `GET /api/plans?athleteId=X` - Планы атлета
- `POST /api/plans` - Создать план
- `GET /api/plans/[id]` - Получить план
- `PUT /api/plans/[id]` - Обновить план
- `DELETE /api/plans/[id]` - Удалить план

### Логи
- `GET /api/logs?athleteId=X` - Логи атлета
- `GET /api/logs?planId=X` - Логи плана
- `POST /api/logs` - Создать лог

### Импорт
- `POST /api/import/docx` - Импорт из DOCX

## Команды

```bash
# Разработка
npm run dev                       # Запуск dev сервера
npm run build                     # Сборка production
npm start                         # Запуск production

# База данных
npm run db:generate               # Генерация миграций
npm run db:push                   # Применение изменений
npm run db:studio                 # GUI для БД

# Пользователи
npm run create-user [email] [pwd] [name]
```

## Формат данных

### Парсинг серий
- `50×6` → 50 кг, 6 повторений
- `50кг×6×3` → 50 кг, 6 повторений, 3 подхода
- `25кг×6, 32.5кг×6, 50кг×6×6` → несколько серий
- `6,,6,,,,5,4,6*6` → Excel формат (только повторы)

### Расчёт весов
```typescript
weight = round(PM × percent, roundingStep)
```

Стандартные проценты: 30-105% с шагом 6%

## Тестовые данные

### Пользователь
- Email: `trainer@powerlift.com`
- Пароль: `password123`
- Имя: `Тренер`

### Примеры файлов
- `/example/Ильяшенко Дамир.xlsx` - Excel формат (референс)
- `/example/Мариана.docx` - DOCX формат (целевой формат экспорта)

## Известные ограничения

1. **Один пользователь**: Система рассчитана на одного тренера
2. **Локальная БД**: SQLite не подходит для облачного деплоя без миграции на PostgreSQL
3. **Импорт Excel**: Пока не реализован (можно добавить позже)
4. **Нет уведомлений**: Планируется в будущих версиях
5. **Chart.js SSR**: Компонент графика - клиентский (use client)

## Безопасность

- ✅ Пароли хешируются с bcrypt
- ✅ JWT токены для сессий (NextAuth)
- ✅ Middleware защищает приватные роуты
- ✅ Валидация данных с Zod
- ✅ CSRF защита встроена в Next.js
- ⚠️ Для production требуется HTTPS и надёжный NEXTAUTH_SECRET

## Масштабирование

### Для production:
1. Заменить SQLite на PostgreSQL
2. Настроить HTTPS
3. Добавить rate limiting
4. Настроить логирование ошибок
5. Добавить резервное копирование БД
6. Оптимизировать индексы в БД

### Возможные улучшения:
- Поддержка нескольких тренеров
- Доступ атлетов к своим планам (read-only)
- Экспорт в PDF
- Импорт из Excel
- Мобильное приложение (React Native)
- PWA для оффлайн доступа

## Статистика разработки

- **Время разработки**: ~2-3 часа с AI-ассистентом
- **Строк кода**: ~3000+ строк TypeScript/TSX
- **Файлов создано**: 40+
- **API endpoints**: 15+
- **Страниц UI**: 8

## Заключение

MVP полностью функционален и готов к использованию. Приложение заменяет ручное ведение записей в Excel/DOCX, автоматизирует расчёты и хранение данных. Код написан с учётом простоты и понятности для Junior разработчиков, без использования сложных техник (наследование, рефлексия и т.д.).

Следующие шаги: тестирование с реальными данными, сбор обратной связи от пользователя, итерация и улучшения по мере необходимости.




