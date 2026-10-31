"use server";

import { randomBytes, createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireOwnerAccess } from "@/lib/owner/access";

type Response = { ok: boolean; message: string; code?: string };

function writesAllowed() {
  // Explicitly opt in for an isolated staging environment only.
  return process.env.FARMAKON_OWNER_WRITES_ENABLED === "true" &&
    process.env.FARMAKON_DEPLOY_ENV === "staging";
}
const fail = (message: string): Response => ({ ok: false, message });

export async function createOwnerCourse(_prev: Response, form: FormData): Promise<Response> {
  try {
    const { supabase, user } = await requireOwnerAccess();
    if (!writesAllowed()) return fail("الحفظ معطل حتى يتم ربط قاعدة بيانات Staging واختبار الصلاحيات.");
    const title = String(form.get("title") ?? "").trim();
    const slug = String(form.get("slug") ?? "").toLowerCase().trim();
    const description = String(form.get("description") ?? "").trim();
    const price = Number(form.get("price_iqd") ?? 0);
    const limit = Number(form.get("free_preview_limit") ?? 0);
    if (title.length < 3 || title.length > 180) return fail("عنوان الكورس يجب أن يكون بين 3 و180 حرفاً.");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) return fail("رابط الكورس غير صالح.");
    if (!Number.isSafeInteger(price) || price < 0 || price > 100000000) return fail("السعر غير صالح.");
    if (!Number.isInteger(limit) || limit < 0 || limit > 1000) return fail("عدد الفيديوهات المجانية غير صالح.");
    let coverPath: string | null = null;
    const cover = form.get("cover");
    if (cover instanceof File && cover.size > 0) {
      if (cover.size > 3 * 1024 * 1024 || !["image/jpeg","image/png","image/webp"].includes(cover.type))
        return fail("صورة الغلاف يجب أن تكون JPG/PNG/WebP وبحجم لا يتجاوز 3MB.");
      const ext = cover.type === "image/png" ? "png" : cover.type === "image/webp" ? "webp" : "jpg";
      coverPath = `courses/${randomBytes(16).toString("hex")}.${ext}`;
      const { error } = await supabase.storage.from("course-covers").upload(coverPath, cover, { contentType: cover.type, upsert: false });
      if (error) return fail("تعذر رفع صورة الكورس: تحقق من إعداد التخزين والصلاحيات.");
    }
    const { error } = await supabase.from("courses").insert({
      title, slug, description, price_iqd: price, free_preview_limit: limit,
      cover_path: coverPath, status: "draft"
    });
    if (error) {
      if (coverPath) await supabase.storage.from("course-covers").remove([coverPath]);
      return fail("تعذر إنشاء الكورس. تحقق من الجداول وRLS وعدم تكرار رابط الكورس.");
    }
    revalidatePath("/owner");
    return { ok: true, message: "أُنشئ الكورس كمسودة على Staging. لا يُنشر إلا بعد المراجعة." };
  } catch { return fail("رُفضت العملية. تأكد من صلاحيات حساب المالك."); }
}

export async function issueActivationCode(_prev: Response, form: FormData): Promise<Response> {
  try {
    const { supabase, user } = await requireOwnerAccess();
    if (!writesAllowed()) return fail("إنشاء الأكواد معطل إلى حين تفعيل بيئة Staging الآمنة.");
    const courseId = String(form.get("course_id") ?? "");
    const type = String(form.get("period_type") ?? "");
    const days = type === "annual" ? 365 : type === "lifetime" ? null : Number(form.get("custom_days"));
    if (!/^[0-9a-f-]{36}$/i.test(courseId)) return fail("اختر كورساً صالحاً.");
    if (!["annual","lifetime","custom"].includes(type)) return fail("نوع الاشتراك غير صالح.");
    if (days !== null && (!Number.isSafeInteger(days) || days < 1 || days > 36500))
      return fail("المدة يجب أن تكون بين يوم و36500 يوم.");
    const { data: course } = await supabase.from("courses").select("id").eq("id", courseId).maybeSingle();
    if (!course) return fail("الكورس غير موجود.");
    const token = randomBytes(18).toString("hex").toUpperCase();
    const code = `FQ7-${token.slice(0,12)}-${token.slice(12,24)}-${token.slice(24)}`;
    const code_hash = createHash("sha256").update(code).digest("hex");
    const { error } = await supabase.from("q7_activation_codes").insert({
      course_id: courseId, code_hash, period_type: type, duration_days: days,
      created_by: user.id, status: "active", uses_remaining: 1
    });
    if (error) return fail("تعذر إنشاء الكود. تحقق من قاعدة البيانات والصلاحيات.");
    revalidatePath("/owner");
    return { ok: true, message: "تم إنشاء الكود. انسخه الآن، فلن يظهر نصه مرة ثانية.", code };
  } catch { return fail("رُفضت العملية. تأكد من صلاحيات المالك."); }
}
