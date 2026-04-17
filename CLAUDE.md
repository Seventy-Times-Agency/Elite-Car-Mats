@AGENTS.md

# EliteCarMats — Сводка проекта

## Что это
Сайт-магазин премиальных EVA автоковриков для рынка США. Бренд: **EliteCarMats**.
Домен: **elitecarmats.us** (куплен на GoDaddy, привязан к Vercel через nameservers).

## Бренд
- Логотип: золотая буква "E" на сотовой текстуре + "ELITE CAR MATS" в хроме
- Нашивка на ковриках: маленькая чёрная бирка ~5x3 см с жёлтой надписью "ELITECARMATS.US", пришивается сбоку
- Цвета бренда: чёрный (#0F0F0F) + золотой (#D4A54A) — premium dark theme
- Целевой рынок: США (американцы + русско-/украиноязычная диаспора)
- Адрес: Rochester, NY, USA

## Стек
- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 (через @theme inline в globals.css)
- **Animations**: Framer Motion (только лёгкие — Hero вход, mobile menu)
- **ORM**: Prisma (схема готова, БД ещё не подключена)
- **Хостинг**: Vercel (автодеплой из main ветки)
- **Репо**: github.com/ilashofficial17-cmd/elitecarmats
- **Ветка разработки**: `claude/new-project-setup-c7GhH` (мёржится в main)

## Дизайн — текущее состояние
- **Полностью тёмная тема** — фон #0F0F0F с золотыми сотами (EVA honeycomb SVG pattern)
- **Glass-card эффект** на карточках (gradient bg + backdrop-blur + subtle border)
- **Золотое свечение** на кнопках и hover (shadow с rgba золотого)
- **Gradient кнопки** from-gold to-gold-light
- **Кастомные dropdown-ы** (не нативные select) в конфигураторе
- **Без тяжёлых анимаций** — убраны whileInView/stagger, оставлены CSS transitions
- Шрифт: Inter (локальный woff2 файл, не Google Fonts — т.к. на Vercel может быть проблема)

## Структура страниц
```
/ (Главная)
├── Hero (текст + CTA "Подобрать коврики" → #configurator)
├── CarSelectorSection (конфигуратор: 3 кастомных dropdown — марка/модель/год)
├── FeaturesSection (6 преимуществ в glass-card сетке)
├── ReviewsSection (3 отзыва)
└── FAQSection (6 вопросов, аккордеон)

/catalog (Каталог марок — сетка с логотипами)
/catalog/[brand] (Модели марки — карточки с фото авто из Wikipedia)
/catalog/[brand]/[model] (Страница продукта — конфигуратор коврика)
├── MatPreview (SVG превью коврика — меняет цвет/окантовку/бейдж динамически)
├── Выбор года, комплекта, цвета EVA, окантовки, шильдика
└── Кнопка "Добавить в корзину"

/cart (Корзина — localStorage)
/checkout (Оформление заказа — форма контактов + адрес)
/about (О компании — тёмный header + секции)
/reviews (Отзывы — рейтинг + список)
/contacts (Контакты — инфо + форма)
```

## API Routes
- `/api/car-image?make=Toyota&model=Camry` — проксирует фото авто из Wikipedia REST API, кэширует в памяти, fallback на placeholder SVG

## Компоненты
```
src/components/
├── layout/
│   ├── Header.tsx (sticky, прозрачный → solid при скролле)
│   ├── Footer.tsx (тёмный с золотыми акцентами)
│   └── FloatingCTA.tsx (плавающая кнопка "Заказать" внизу справа)
├── home/
│   ├── HeroSection.tsx
│   ├── CarSelectorSection.tsx (с кастомным Dropdown компонентом)
│   ├── FeaturesSection.tsx
│   ├── ReviewsSection.tsx
│   └── FAQSection.tsx
└── product/
    └── MatPreview.tsx (SVG превью коврика с динамическими цветами)
```

## Данные (src/data/mock.ts)
- **26 марок** с логотипами (CDN vl.imgix.net)
- **~150 моделей** с годами выпуска
- **2 цвета EVA**: чёрный, серый (placeholder — реальный список будет позже)
- **4 цвета окантовки**: чёрный, серый, золотой, красный
- **4 комплекта**: передние, полный, багажник, полный+багажник
- **Шильдики**: для всех марок
- **3 мок-отзыва**

## Prisma Schema (prisma/schema.prisma)
Готова, но БД не подключена. Модели:
Brand, Model, ModelYear, Product (MatSetType enum), EvaColor, EdgeColor, Badge, Order, OrderItem, Review, PromoCode

## Что НЕ сделано (TODO для следующей сессии)

### Высокий приоритет:
1. **Расширить базу моделей** — добавить ВСЕ марки/модели доступные в США (~40+ марок, ~400 моделей). Нужно добавить: Alfa Romeo, Aston Martin, Bentley, Buick, Genesis, Jaguar, Land Rover, Lamborghini, Lucid, Maserati, McLaren, MINI, Polestar, Ram, Rivian, Rolls-Royce, Fiat. Плюс расширить существующие марки (у Toyota добавить Supra, GR86, bZ4X, Crown, Sequoia, Land Cruiser и т.д.)
2. **Подключить БД** — Supabase или Neon (бесплатный PostgreSQL), запустить Prisma миграции
3. **Платёжная система** — Stripe (рекомендовано Stripe Checkout для простоты). Нужен Stripe аккаунт с US банком.
4. **Email уведомления** — Resend или SendGrid для подтверждения заказов

### Средний приоритет:
5. **Добавить выбор текстуры** (соты / ромб) в конфигуратор — как у конкурента EVAtech
6. **Добавить подпятник (Heel Pad)** как опцию — аналог шильдика
7. **Больше цветов EVA и окантовки** — когда будет реальный список от поставщика
8. **Реальные фото ковриков** — заменить SVG превью и placeholder на реальные фото после получения материала
9. **Google Workspace** — настроить info@elitecarmats.us (уже начали, нужно добавить TXT запись в Vercel DNS для верификации Google)
10. **Мультиязычность** (EN + RU) — заложено в архитектуру, включить позже

### Низкий приоритет:
11. **Админка** — CRUD для марок/моделей/заказов
12. **Блог** для SEO
13. **Промокоды** — модель в Prisma уже есть
14. **Отслеживание заказа** `/order/[id]`

## Конкуренты (изучены)
1. **FitMyCar** (fitmycar.com) — Австралия, Magento 2
2. **FortunaCarMats** (fortunacarmats.com) — США/Майами, jQuery, $109 за комплект
3. **PrimeEVA** (primeeva.com) — Европа, Shopify, €140 за full+cargo, ближайший аналог
4. **EVAtech** (evatech.com.ua) — Украина, Bitrix, продвинутый конфигуратор с превью цветов и выбором текстуры

## Аксессуары (из инвойса поставщика)
- **Металлические шильдики** (бейджи) с логотипом марки авто — тип DY, серебристые, $0.69/шт закупка
- 30 марок в первом заказе (по 30-50 шт каждой)
- Поставщик: Xiamen Dawoo Industry, Китай

## Важные файлы
- `src/app/globals.css` — все цвета темы через @theme inline
- `src/data/mock.ts` — вся база данных (марки, модели, цвета, отзывы)
- `src/components/product/MatPreview.tsx` — SVG превью коврика
- `src/app/api/car-image/route.ts` — прокси для фото авто из Wikipedia
- `prisma/schema.prisma` — схема БД
- `public/placeholder-car.svg` — заглушка для авто без фото

## Production Branch
На Vercel нужно убедиться что Production Branch = `main` (не `claude/...`).
Settings → Git → Production Branch → `main`
