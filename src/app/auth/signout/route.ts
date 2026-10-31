import { isSupabaseConfigured } from "@/lib/supabase/config";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new NextResponse(null, { status: 403 });
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
