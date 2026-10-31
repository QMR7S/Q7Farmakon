import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, description, price_iqd")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!course) notFound();

  const [{ data: units }, { data: lessons }, { data: { user } }] = await Promise.all([
    supabase.from("units").select("id, title, position").eq("course_id", course.id).order("position"),
    supabase.from("lessons").select("id, unit_id, title, is_free, position").eq("course_id", course.id).eq("status", "published").order("position"),
    supabase.auth.getUser(),
  ]);

  let enrolled = false;
  if (user) {
    const { data } = await supabase
      .from("enrollments").select("id")
      .eq("course_id", course.id).eq("user_id", user.id)
      .gt("expires_at", new Date().toISOString()).limit(1);
    enrolled = !!data?.length;
  }

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
                <span>{l.title}</span>
                {l.is_free || enrolled
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
