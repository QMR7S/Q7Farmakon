import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { CourseCard } from "./navigation";
export async function readCatalogue(
  own = false,
): Promise<{ courses: CourseCard[]; available: boolean; signedIn: boolean }> {
  if (!isSupabaseConfigured())
    return { courses: [], available: false, signedIn: false };
  try {
    const s = await createClient();
    const {
      data: { user },
    } = await s.auth.getUser();
    let ids: string[] = [];
    if (own) {
      if (!user) return { courses: [], available: true, signedIn: false };
      const { data, error } = await s
        .from("enrollments")
        .select("course_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .limit(500);
      if (error) throw error;
      ids = (data ?? []).map((x) => x.course_id);
      if (!ids.length) return { courses: [], available: true, signedIn: true };
    }
    let query = s
      .from("courses")
      .select("id,slug,title,price_iqd")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(100);
    if (own) query = query.in("id", ids);
    const { data, error } = await query;
    return {
      courses: error ? [] : (data ?? []),
      available: !error,
      signedIn: Boolean(user),
    };
  } catch {
    return { courses: [], available: false, signedIn: false };
  }
}
