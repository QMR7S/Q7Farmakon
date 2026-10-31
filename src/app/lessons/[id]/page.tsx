import { notFound } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import LectureCenter from "@/components/platform/LectureCenter";
export const dynamic = "force-dynamic";
export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    notFound();
  if (!isSupabaseConfigured())
    return (
      <div className="q-notice">
        بيئة المحاضرات غير متصلة. / Lecture service is not connected.
      </div>
    );
  const s = await createClient();
  const { data: lesson, error } = await s
    .from("lessons")
    .select("id,title,course_id")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (error)
    return (
      <div className="q-notice">
        تعذر قراءة المحاضرة. / Lecture unavailable.
      </div>
    );
  if (!lesson) notFound();
  const { data: course } = await s
    .from("courses")
    .select("title,slug")
    .eq("id", lesson.course_id)
    .eq("status", "published")
    .maybeSingle();
  if (!course) notFound();
  return (
    <LectureCenter
      id={lesson.id}
      title={lesson.title}
      courseTitle={course.title}
      courseSlug={course.slug}
    />
  );
}
