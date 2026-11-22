# FastPAY Mini App — MVP KONTEKST VA ARXITEKTURA

## Loyiha Tavsifi
"FastPAY Mini App" — O'zbekiston bozori uchun o'yin valyutasi (PUBG UC, Free Fire, Mobile Legends, Telegram Stars/Premium va h.k.) sotadigan Telegram bot + Telegram Mini App. Foydalanuvchi so'mda to'laydi, mahsulot avtomatik yetkaziladi.

## Texnologik Stek
- **Frontend / Mini App**: React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion + Lucide Icons + @twa-dev/sdk + i18next
- **Backend**: Node.js (NestJS) + PostgreSQL + Redis + BullMQ + Prisma ORM
- **Bot**: Telegram Bot (grammY / node-telegram-bot-api)
- **Infratuzilma**: Docker Compose

## Dizayn Tizimi Qoidalari
1. **Dark-first + Light tema**: Telegram `themeParams`/`colorScheme` ga avtomatik moslashadi.
2. **Tokenlar (CSS Variables)**:
   - Fon: Dark `#0B0D12` / Light `#F8FAFC`
   - Surface 1: Dark `#12151B` / Light `#FFFFFF`
   - Surface 2: Dark `#1A1E28` / Light `#F1F5F9`
   - Matn: Dark `#F2F4F8` / Light `#0F172A`
   - Ikkilamchi matn: Dark `#9AA3B2` / Light `#64748B`
   - Aksent: `#3E5CF5` (Dark'da `#6B84FF`; tugmadagi matn oq, kontrast AA >= 4.5:1)
   - Success: `#3DE0A2`, Warning: `#FFB020`, Danger: `#FF5A6A`
3. **Shrift**: Inter, shkala 12/14/16/20/24/32, raqamlar `tabular-nums`.
4. **Spacing**: 4px ritmi (4, 8, 12, 16, 20, 24, 32...).
5. **Radius**: Faqat 4 ta radius:
   - `12px` (kichik / tugma / chip / input)
   - `16px` (karta)
   - `24px` (sheet / modal)
   - `9999px` (pill)
   - *Boshqa radius taqiqlangan!*
6. **Tegish maydoni (Touch target)**: >= 44px; asosiy CTA balandligi 52–56px pastda (sticky).
7. **Harakat/Animatsiya**: 150–300ms, cubic-bezier(0.2, 0.8, 0.2, 1), `scale: 0.98` on tap, `prefers-reduced-motion` qo'llab-quvvatlash.
8. **Holatlar**: Har ekranda loading (skeleton), empty, error, offline holatlari bo'lishi shart.
9. **Matn**: O'zbekcha (lotin), qisqa, iliq, "siz" shakli. Summa formati: `36 000 so'm`. i18n orqali.
10. **Telegram Native**: MainButton, BackButton, HapticFeedback, safe-area, expand().

## Qat'iy Qoidalar
- Tashqi xizmatlar (to'lov, provayder) adapter interfeysi + mock orqasida bo'ladi.
- Pul harakati ledger orqali, append-only, idempotent, DB transaksiyasida amalga oshiriladi.
- Playwright bilan 390x844 va 360x740 o'lchamlarda UI tekshirilib skrinshot olinadi.
