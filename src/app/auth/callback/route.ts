import { isSupabaseConfigured } from "@/lib/supabase/config";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requested = url.searchParams.get("next") ?? "/";
  // Relative destinations only; prevent open redirects and protocol-relative URLs.
  const next =
    requested.startsWith("/") &&
    !requested.startsWith("//") &&
    !requested.includes("\\")
      ? requested
      : "/";
  if (!code || !isSupabaseConfigured())
    return NextResponse.redirect(
      new URL("/owner/login?error=oauth", url.origin),
    );
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error)
    return NextResponse.redirect(
      new URL("/owner/login?error=oauth", url.origin),
    );
  return NextResponse.redirect(new URL(next, url.origin));
}
