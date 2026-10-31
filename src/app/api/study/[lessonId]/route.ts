import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isIsolatedStaging } from "@/lib/platform/environment";
import { validateStudy } from "@/lib/platform/study-validation";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };
const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers });
async function context(id: string) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    return { error: json({ error: "Invalid lesson" }, 400) };
  if (!isSupabaseConfigured())
    return { error: json({ error: "Study service not configured" }, 503) };
  const s = await createClient();
  const {
    data: { user },
    error,
  } = await s.auth.getUser();
  if (error || !user)
    return { error: json({ error: "Sign in required" }, 401) };
  return { s, user };
}
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await params;
  const c = await context(lessonId);
  if (c.error) return c.error;
  const { data, error } = await c
    .s!.from("q7_private_study")
    .select("note,seconds,pdf_page,version")
    .eq("user_id", c.user!.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (error) return json({ error: "Private study schema unavailable" }, 503);
  return json({
    record: data ?? { note: "", seconds: 0, pdf_page: 1, version: 0 },
    writable:
      isIsolatedStaging(process.env) &&
      process.env.FARMAKON_STUDY_WRITES_ENABLED === "true",
  });
}
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return json({ error: "Invalid origin" }, 403);
  if (
    !isIsolatedStaging(process.env) ||
    process.env.FARMAKON_STUDY_WRITES_ENABLED !== "true"
  )
    return json({ error: "Study writes disabled" }, 503);
  const { lessonId } = await params;
  const c = await context(lessonId);
  if (c.error) return c.error;
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return json({ error: "JSON required" }, 415);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > 100000)
    return json({ error: "Body too large" }, 413);
  let input;
  try {
    input = validateStudy(JSON.parse(raw));
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  if (!input) return json({ error: "Invalid study record" }, 400);
  const { data: lesson, error: lError } = await c
    .s!.from("lessons")
    .select("id")
    .eq("id", lessonId)
    .eq("status", "published")
    .maybeSingle();
  if (lError || !lesson) return json({ error: "Lesson unavailable" }, 403);
  const next = {
    note: input.note,
    seconds: input.seconds,
    pdf_page: input.pdf_page,
    version: input.version + 1,
    updated_at: new Date().toISOString(),
  };
  if (input.version === 0) {
    const { data, error } = await c
      .s!.from("q7_private_study")
      .insert({ ...next, lesson_id: lessonId, user_id: c.user!.id })
      .select("note,seconds,pdf_page,version")
      .single();
    if (error)
      return json(
        {
          error:
            error.code === "23505" ? "Version conflict" : "Save unavailable",
        },
        error.code === "23505" ? 409 : 503,
      );
    return json({ record: data });
  }
  const { data, error } = await c
    .s!.from("q7_private_study")
    .update(next)
    .eq("lesson_id", lessonId)
    .eq("user_id", c.user!.id)
    .eq("version", input.version)
    .select("note,seconds,pdf_page,version")
    .maybeSingle();
  if (error) return json({ error: "Save unavailable" }, 503);
  if (!data) return json({ error: "Version conflict" }, 409);
  return json({ record: data });
}
