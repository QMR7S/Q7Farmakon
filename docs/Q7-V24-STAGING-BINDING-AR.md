# ربط Q7 — نتيجة مراجعة 1 نوفمبر 2026

## نتيجة مؤكدة

المتغير `NEXT_PUBLIC_SUPABASE_URL` في `.env.example` يشير إلى `mafahnyjhzemzwiyazzr.supabase.co`.

فحص المشروعين المتصلين عبر حساب Farmakon أظهر:
- Farmakon-Staging: `qfzharpouemueipsrduv`.
- Farmakon: `zviqtacbsprewyxrmpbb`.

الحساب المتصل الآخر أظهر PhQMR7S's Project وHodou Telegram Bot وGQMRMed، ولا يظهر فيه `mafahnyjhzemzwiyazzr` أيضاً.

لذلك لا يجوز مساواة Farmakon-Staging تلقائياً بمشروع Q7. خلو public في Staging الذي فُحص سابقاً لا يثبت فقدان بيانات Q7. لا نعرف من القائمة وحدها هل المشروع المشار إليه في ملف المثال ما زال موجوداً أو نُقل أو أصبح المثال قديماً؛ يلزم الاتصال بالحساب الذي يملكه أو تحديد مرجع Q7 الصحيح من لوحة إدارته.

## لا تغييرات على قواعد البيانات

لم تُنشأ جداول أو تُنقل بيانات أو تُطبّق migrations، ولم تُفتح صلاحيات أو يُفعّل OAuth في أي مشروع متصل.

## متطلبات ربط الحفظ الخاص الجديد

بعد التحقق من بيئة Q7 التجريبية الصحيحة ومراجعة مخطط lessons:
1. مطابقة URL الفعلي ومرجع المشروع؛ لا تستخدم مشروع Farmakon القديم بالاسم فقط.
2. مراجعة `docs/sql/Q7-V24-PRIVATE-LEARNING-REVIEW.sql` في بيئة معزولة؛ أضف FK مطابقاً إلى lessons بعد التحقق من نوع المعرفات. الملف غير تلقائي التطبيق.
3. تهيئة `FARMAKON_Q7_DATABASE_REF` ليطابق host حرفياً، و`FARMAKON_DEPLOY_ENV=staging` ومفتاح publishable؛ لا ترسل service-role إلى المتصفح.
4. `FARMAKON_LEARNING_WRITES_ENABLED=true` يظل غير مفعل حتى الاختبار الخادمي. المسار الجديد يرفض الكتابة إذا كان `VERCEL_ENV=production`.
5. تجربة مستخدمين مختلفين ونسختين من الملاحظة عبر Supabase Auth الحقيقي وREST، وفحص RLS والجلسات؛ النجاح المحلي لا يغني عن ذلك.

## المعاينة الخارجية

وجد مشروع مستقل في Vercel باسم `farmakon-q7-v23-preview` ومعرف `prj_T999P4KfLbfjohERaLKeKOxwZJNh`. لا Git link ظاهر، ولا envs في نتيجة فحص المتغيرات؛ النسخة الجديدة يجب أن تستخدم target Preview/Staging صراحة، دون production أو تغيير صلاحيات مشاركة أو نقل بيانات. الحسابات والخدمات غير المهيأة تظل غير مفعلة في المعاينة.
