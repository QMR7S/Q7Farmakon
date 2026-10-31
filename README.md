# Farmakon v2

منصة طلبة الصيدلة — Next.js 15 + Supabase + Vercel. مستقلة تمامًا عن Farmakon القديمة.

## التشغيل محليًا
```bash
npm install
cp .env.example .env.local
npm run dev
```

## النشر (مشروع Vercel جديد فقط)
1. ارفع هذا المجلد إلى مستودع GitHub الجديد `farmakon-v2`.
2. في Vercel: Add New → Project → اختر `farmakon-v2` (لا تربطه بمشروع قديم).
3. أضف المتغيرين من `.env.example` في Environment Variables.
4. Deploy.

## Supabase
بعد النشر: Authentication → URL Configuration → ضع رابط Vercel الجديد في Site URL.
