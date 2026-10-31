import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  freePreviewLessonIds,
  determineLessonAccess,
} from "@/lib/courses/access-policy";
import CourseDetails from "@/components/platform/CourseDetails";
export const dynamic = "force-dynamic";
export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isSupabaseConfigured())
    return (
      <div className="q-notice">
        خدمة الكورسات غير متصلة. / Course service not connected.
      </div>
    );
  const s = await createClient();
  const { data: course, error } = await s
    .from("courses")
    .select("id,title,description,free_preview_limit")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error)
    return (
      <div className="q-notice">تعذر قراءة الكورس. / Course unavailable.</div>
    );
  if (!course) notFound();
  const [
    u,
    l,
    {
      data: { user },
    },
  ] = await Promise.all([
    s
      .from("units")
      .select("id,title,position")
      .eq("course_id", course.id)
      .order("position")
      .order("id")
      .range(0, 999),
    s
      .from("lessons")
      .select("id,unit_id,title,position,status")
      .eq("course_id", course.id)
      .eq("status", "published")
      .order("position")
      .order("id")
      .range(0, 999),
    s.auth.getUser(),
  ]);
  // This learner-visible list is presentation only. The media gateway independently
  // reads the COMPLETE service-side index before granting a free preview.
  let complete =
    !u.error &&
    !l.error &&
    (u.data?.length ?? 0) < 1000 &&
    (l.data?.length ?? 0) < 1000;
  let previews = new Set<string>();
  try {
    if (complete)
      previews = freePreviewLessonIds(
        l.data ?? [],
        u.data ?? [],
        course.free_preview_limit ?? 0,
      );
  } catch {
    complete = false;
  }
  const enrollments = user
    ? await s
        .from("enrollments")
        .select("user_id,course_id,status,expires_at")
        .eq("course_id", course.id)
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(50)
    : { data: [] };
  const lessons = (l.data ?? []).map((x) => ({
    ...x,
    access: determineLessonAccess({
      lessonId: x.id,
      coursePublished: true,
      freeLessonIds: previews,
      enrollments: enrollments.data ?? [],
      courseId: course.id,
      userId: user?.id ?? null,
    }),
  }));
  return (
    <CourseDetails
      title={course.title}
      description={course.description}
      units={u.data ?? []}
      lessons={lessons}
      complete={complete}
    />
  );
}
