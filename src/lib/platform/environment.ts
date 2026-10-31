/** Explicit project pin prevents a staging switch accidentally targeting production. */
export function isIsolatedStaging(
  env: Record<string, string | undefined>,
): boolean {
  if (env.FARMAKON_DEPLOY_ENV !== "staging" || env.VERCEL_ENV === "production")
    return false;
  const ref = env.FARMAKON_STAGING_PROJECT_REF;
  if (!ref || !/^[a-z0-9]{20}$/.test(ref)) return false;
  try {
    return (
      new URL(env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin ===
      `https://${ref}.supabase.co`
    );
  } catch {
    return false;
  }
}
