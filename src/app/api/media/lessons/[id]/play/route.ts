import { isIsolatedStaging } from "@/lib/platform/environment";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createUserClient } from "@/lib/supabase/server";
import {
  freePreviewLessonIds,
  isEnrollmentActive,
} from "@/lib/courses/access-policy";

export const dynamic = "force-dynamic";

/** Server-side playback entitlement: no direct public link to protected lesson media. */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const noStore = { "Cache-Control": "private, no-store" };
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id))
    return NextResponse.json(
      { error: "Invalid lesson" },
      { status: 400, headers: noStore },
    );
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (
    !url ||
    !secret ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    !isIsolatedStaging(process.env)
  )
    return NextResponse.json(
      { error: "Playback gateway not configured" },
      { status: 503, headers: noStore },
    );
  const supabase = await createUserClient();
  // Administrative indexing must not depend on learner RLS visibility: a partially
  // visible list could incorrectly classify a paid video as a free preview.
  // The service client remains server-only, and every media request is authorized below.
  const admin = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: lesson, error: lessonError } = await admin
    .from("lessons")
    .select("id,course_id,unit_id,position,status,video_path")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (lessonError || !lesson || !lesson.video_path)
    return NextResponse.json(
      { error: "Media unavailable" },
      { status: 404, headers: noStore },
    );
  // Never accept a path or bucket from a client. The server reads it from DB only.
  if (
    typeof lesson.video_path !== "string" ||
    lesson.video_path.includes("..") ||
    !lesson.video_path.startsWith("courses/")
  )
    return NextResponse.json(
      { error: "Invalid media reference" },
      { status: 500, headers: noStore },
    );
  const { data: course } = await admin
    .from("courses")
    .select("id,status,free_preview_limit")
    .eq("id", lesson.course_id)
    .eq("status", "published")
    .maybeSingle();
  if (!course)
    return NextResponse.json(
      { error: "Course unavailable" },
      { status: 404, headers: noStore },
    );
  const limit = Number(course.free_preview_limit ?? 0);
  if (!Number.isSafeInteger(limit) || limit < 0 || limit > 1000)
    return NextResponse.json(
      { error: "Invalid preview policy" },
      { status: 503, headers: noStore },
    );
  let free = false;
  if (limit > 0) {
    const [
      { data: allLessons, error: lError },
      { data: units, error: uError },
    ] = await Promise.all([
      admin
        .from("lessons")
        .select("id,unit_id,position,status")
        .eq("course_id", lesson.course_id)
        .eq("status", "published")
        .range(0, 999),
      admin
        .from("units")
        .select("id,position")
        .eq("course_id", lesson.course_id)
        .range(0, 999),
    ]);
    // Fail closed if the default query window may truncate course data.
    // Full pagination will be implemented after verifying the real Q7 schema.
    if (
      lError ||
      uError ||
      !allLessons ||
      !units ||
      allLessons.length === 1000 ||
      units.length === 1000
    )
      return NextResponse.json(
        { error: "Preview policy requires verified course indexing" },
        { status: 503, headers: noStore },
      );
    free = freePreviewLessonIds(allLessons, units, limit).has(id);
  }
  let entitled = false;
  if (!free) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json(
        { error: "Subscription required" },
        { status: 403, headers: noStore },
      );
    const { data: active, error } = await admin
      .from("enrollments")
      .select("user_id,course_id,status,expires_at")
      .eq("user_id", user.id)
      .eq("course_id", lesson.course_id)
      .eq("status", "active")
      .limit(50);
    if (error)
      return NextResponse.json(
        { error: "Entitlement service unavailable" },
        { status: 503, headers: noStore },
      );
    entitled = (active ?? []).some((e) =>
      isEnrollmentActive(e, lesson.course_id, user.id),
    );
    if (!entitled)
      return NextResponse.json(
        { error: "Subscription expired or missing" },
        { status: 403, headers: noStore },
      );
  }
  const { data, error } = await admin.storage
    .from("course-videos")
    .createSignedUrl(lesson.video_path, 90);
  if (error || !data?.signedUrl)
    return NextResponse.json(
      { error: "Media signing failed" },
      { status: 503, headers: noStore },
    );
  return NextResponse.json(
    { url: data.signedUrl, expiresIn: 90, freePreview: free },
    { headers: noStore },
  );
}
