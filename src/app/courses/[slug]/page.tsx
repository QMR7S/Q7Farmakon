import Link from "next/link";
import { notFound } from "next/navigation";
import { freePreviewLessonIds, isEnrollmentActive } from "@/lib/courses/access-policy";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return <div className="empty" role="status">بيانات الكورس غير متاحة حتى ربط بيئة الاختبار.</div>;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, description, price_iqd, free_preview_limit")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!course) notFound();

  const [{ data: units }, { data: lessons }, { data: { user } }] = await Promise.all([
    supabase.from("units").select("id, title, position").eq("course_id", course.id).order("position"),
    supabase.from("lessons").select("id, unit_id, title, status, position").eq("course_id", course.id).eq("status", "published").order("position"),
    supabase.auth.getUser(),
  ]);

  let enrolled = false;
  if (user) {
    const { data } = await supabase
      .from("enrollments").select("user_id,course_id,status,expires_at")
      .eq("course_id", course.id).eq("user_id", user.id)
      .eq("status", "active").limit(50);
    enrolled = (data ?? []).some(e => isEnrollmentActive(e, course.id, user.id));
  }

  const limit = Number(course.free_preview_limit ?? 0);
  const previews = Number.isSafeInteger(limit) && limit >= 0 && limit <= 1000
    ? freePreviewLessonIds(lessons ?? [], units ?? [], limit) : new Set<string>();
  return (
    <>
      <Link href="/" className="back">← كل المقررات</Link>
      <section className="hero">
        <h1>{course.title}</h1>
        {course.description && <p>{course.description}</p>}
      </section>

      {(units ?? []).length === 0 && <div className="empty">لم تُضف دروس لهذا المقرر بعد.</div>}

      {(units ?? []).map((u) => (
        <div className="unit" key={u.id}>
          <h3>{u.title}</h3>
          <ul className="lessons">
            {(lessons ?? []).filter((l) => l.unit_id === u.id).map((l) => (
              <li key={l.id}>
                <Link href={`/lessons/${l.id}`}>{l.title}</Link>
                {previews.has(l.id) || enrolled
                  ? <span className="tag">متاح</span>
                  : <span className="tag lock">مقفل</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
