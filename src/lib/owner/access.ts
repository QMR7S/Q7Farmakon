import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Defense in depth: an authenticated, verified Google identity, exact owner
 * email, AND an owner grant provisioned by a trusted DBA.
 * No roles from editable user_metadata, no browser-side owner decisions.
 */
export async function getOwnerAccess() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { state: "signed-out" as const, supabase };
  const verifiedGoogle = user.identities?.some(
    (identity) => identity.provider === "google" &&
      identity.identity_data?.email?.toLowerCase() === "appsmr32@gmail.com"
  );
  if (user.email?.toLowerCase() !== "appsmr32@gmail.com" ||
      !user.email_confirmed_at || !verifiedGoogle) {
    return { state: "forbidden" as const, supabase };
  }
  const { data, error: grantError } = await supabase
    .from("q7_owner_grants").select("user_id").eq("user_id", user.id).maybeSingle();
  if (grantError || !data) return { state: "not-provisioned" as const, supabase };
  return { state: "authorized" as const, supabase, user };
}

export async function requireOwnerAccess() {
  const result = await getOwnerAccess();
  if (result.state !== "authorized") {
    throw new Error("لا توجد صلاحية لتنفيذ العملية. تحقق من تسجيل Google ومنح المالك الموثق.");
  }
  return result;
}
