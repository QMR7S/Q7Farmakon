/**
 * Q7 entitlement policy. Pure functions used in server-side authorization.
 * UI controls NEVER replace entitlement checks in API/RLS.
 */
export type Q7Period = "annual" | "lifetime" | "custom";
export type AccessState = "free-preview" | "subscribed" | "locked";
export type Q7Enrollment = {
  status: string | null;
  expires_at: string | null;
  course_id: string;
  user_id: string;
};
export type Q7Unit = { id: string; position: number | null };
export type Q7Lesson = {
  id: string;
  unit_id: string;
  position: number | null;
  status: string;
};

function position(value: number | null): number {
  return value !== null && Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
}

export function freePreviewLessonIds(
  lessons: Q7Lesson[], units: Q7Unit[], requestedLimit: number
): Set<string> {
  if (!Number.isSafeInteger(requestedLimit) || requestedLimit < 0 || requestedLimit > 1000) {
    throw new Error("Invalid free preview limit");
  }
  const unitOrder = new Map(units.map(u => [u.id, position(u.position)]));
  const ordered = lessons
    .filter(l => l.status === "published" && unitOrder.has(l.unit_id))
    .sort((a, b) => {
      const byUnit = (unitOrder.get(a.unit_id) ?? Number.MAX_SAFE_INTEGER)
        - (unitOrder.get(b.unit_id) ?? Number.MAX_SAFE_INTEGER);
      if (byUnit) return byUnit;
      const byUnitId = a.unit_id.localeCompare(b.unit_id);
      if (byUnitId) return byUnitId;
      const byPosition = position(a.position) - position(b.position);
      return byPosition || a.id.localeCompare(b.id);
    });
  return new Set(ordered.slice(0, requestedLimit).map(l => l.id));
}

export function isEnrollmentActive(
  enrollment: Q7Enrollment,
  courseId: string,
  userId: string,
  now: Date = new Date()
): boolean {
  if (!courseId || !userId || enrollment.course_id !== courseId
      || enrollment.user_id !== userId || enrollment.status !== "active") return false;
  if (!Number.isFinite(now.getTime())) return false;
  if (enrollment.expires_at === null) return true; // lifetime entitlement, while active
  const expiresAt = Date.parse(enrollment.expires_at);
  return Number.isFinite(expiresAt) && expiresAt > now.getTime();
}

export function determineLessonAccess(params: {
  lessonId: string;
  coursePublished: boolean;
  freeLessonIds: ReadonlySet<string>;
  enrollments: Q7Enrollment[];
  courseId: string;
  userId: string | null;
  now?: Date;
}): AccessState {
  if (!params.coursePublished) return "locked";
  if (params.freeLessonIds.has(params.lessonId)) return "free-preview";
  if (params.userId && params.enrollments.some(e =>
      isEnrollmentActive(e, params.courseId, params.userId!, params.now))) return "subscribed";
  return "locked";
}

export function expiryForActivation(
  period: Q7Period, activatedAt: Date, customDays?: number | null
): string | null {
  if (!Number.isFinite(activatedAt.getTime())) throw new Error("Invalid activation time");
  if (period === "lifetime") return null;
  const days = period === "annual" ? 365 : customDays;
  if (!Number.isSafeInteger(days) || (days as number) < 1 || (days as number) > 36500) {
    throw new Error("Invalid subscription period");
  }
  return new Date(activatedAt.getTime() + (days as number) * 86400000).toISOString();
}
