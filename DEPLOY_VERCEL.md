# FastPIN — Vercel'ga deploy qilish

Arxitektura: **2 ta Vercel loyiha** (bitta repodan) + tashqi PostgreSQL.

| Qism | Root Directory | Nima |
|---|---|---|
| Frontend (Mini App) | `frontend` | Vite + React, statik |
| Backend (API + bot webhook) | `backend` | NestJS, serverless function (`api/index.js`) |
| Baza | — | Neon / Supabase (PostgreSQL) |
| Redis | — | Ixtiyoriy (Upstash). Berilmasa kesh o'chiq. |

> Bot Vercel'da **polling bilan ishlamaydi**. U webhook rejimiga o'tkazilgan (`POST /api/bot/webhook`).

## 0. Deploydan oldin lokal tekshiruv (MAJBURIY)

Bu o'zgarishlar sandbox'da to'liq build qilib sinalmagan (paket o'rnatish yopiq edi). O'zingizda:

```bash
cd backend  && npm install && npm run build   # xatosiz tugashi kerak
cd ../frontend && npm install && npm run build # tsc -b + vite build xatosiz bo'lsin
```
Build xato bersa, Vercel ham xato beradi. Xatoni shu yerda tuzating.

## 1. Baza (Neon)
1. https://neon.tech → yangi project → **Connection string** (`?sslmode=require` bilan) ni oling.
2. Jadvallarni yaratish (repo ildizidan):
```bash
npm install
DATABASE_URL="postgresql://..." npx prisma db push
```

## 2. Backend loyiha (Vercel)
1. Vercel → **Add New → Project** → `khypes/fastPIN` repo.
2. **Root Directory:** `backend` · **Framework Preset:** Other.
3. **Environment Variables:** `.env.example` dagi BACKEND qismini kiriting (`JWT_SECRET`, `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `FRONTEND_URL`, `PUBLIC_API_URL`, `COINDROP_*`, `NODE_ENV=production`).
   - `JWT_SECRET`: `openssl rand -hex 32`
   - `TELEGRAM_WEBHOOK_SECRET`: `openssl rand -hex 24`
4. Deploy. Tekshirish: `https://<backend>.vercel.app/api` → "Hello World" (yoki shunga o'xshash) qaytishi kerak.

## 3. Frontend loyiha (Vercel)
1. Yana **Add New → Project**, o'sha repo.
2. **Root Directory:** `frontend` · Framework: Vite (avtomatik).
3. Env: `VITE_API_URL=https://<backend>.vercel.app/api`
4. Deploy. Keyin backend'dagi `FRONTEND_URL` ni frontend manziliga o'zgartirib, backendni **Redeploy** qiling (CORS uchun).

## 4. Telegram webhook va menyu tugmasi (bir marta)
```bash
TOKEN=<bot token>
API=https://<backend>.vercel.app
SECRET=<TELEGRAM_WEBHOOK_SECRET qiymati>
FRONT=https://<frontend>.vercel.app

curl "https://api.telegram.org/bot$TOKEN/setWebhook" \
  --data-urlencode "url=$API/api/bot/webhook" \
  --data-urlencode "secret_token=$SECRET" \
  --data-urlencode "drop_pending_updates=true"

curl "https://api.telegram.org/bot$TOKEN/setChatMenuButton" \
  --data-urlencode 'menu_button={"type":"web_app","text":"Xaridni boshlash","web_app":{"url":"'$FRONT'"}}'

curl "https://api.telegram.org/bot$TOKEN/getWebhookInfo"   # url chiqishi, last_error_message bo'sh bo'lishi kerak
```
Bot `/start` xabaridagi "Xaridni boshlash" tugmasi `FRONTEND_URL` ga ochiladi.

## 5. Admin yaratish
Parol kodda yo'q, siz berasiz (kamida 12 belgi):
```bash
cd backend
npx prisma generate --schema=../prisma/schema.prisma
DATABASE_URL="..." JWT_SECRET=x ADMIN_EMAIL=you@mail.com ADMIN_PASSWORD='uzun-parol-123' npm run admin:create
```
> Eski `admin@fastuc.uz / admin123` hisobi bazada bo'lsa, o'chiring.

## 6. Tekshiruv ro'yxati
- [ ] Telegramda `/start` javob beradi, "Xaridni boshlash" Mini App'ni ochadi.
- [ ] Mini App ochilganda login so'ramaydi (initData orqali kiradi).
- [ ] Brauzerda `GET /api/orders` tokensiz **401** qaytaradi (ilgari ochiq edi).
- [ ] `GET /api/admin/dashboard` tokensiz **401** qaytaradi.
- [ ] `POST /api/wallet/dev/confirm-topup` productionda **403** qaytaradi.
- [ ] Admin API ishlaydi: `POST /api/admin/auth/login` token qaytaradi, shu token bilan `GET /api/admin/dashboard` 200.
- [ ] Sahifani yangilash (`/balance`, `/game/...`) 404 bermaydi.

## Ma'lum cheklovlar
- **Cold start:** birinchi so'rov 1–3 soniya kechikishi mumkin (Nest + Prisma).
- **Fon ishlari yo'q:** `bullmq`/`@nestjs/schedule` hozir ishlatilmaydi. Keyin kerak bo'lsa, Vercel Cron yoki alohida worker (Railway/Render) kerak.
- **CoinDrop webhook imzosi** hozir "secret header" ga teng solishtirilyapti. CoinDrop hujjatidagi haqiqiy sxemaga (HMAC bo'lsa) moslang.
- **Admin sahifalar frontend'da ulanmagan:** `frontend/src/pages/admin/*` fayllari bor, lekin `App.tsx` da route yo'q. Hozircha admin faqat API orqali (yoki route qo'shilgach UI orqali) ishlaydi.
- Chek rasmi xotirada (multer memory) qabul qilinadi, diskka yozilmaydi. Vercel so'rov hajmi limiti ~4.5 MB.
