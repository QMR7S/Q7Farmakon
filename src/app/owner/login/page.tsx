"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { usePreferences } from "@/components/platform/Preferences";
import Icon from "@/components/platform/Icon";
export default function OwnerLogin() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { tr } = usePreferences();
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  async function signIn() {
    setBusy(true);
    setError("");
    try {
      const s = createClient();
      const { error } = await s.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/owner`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
    } catch {
      setError(
        tr(
          "تعذر بدء الدخول. تحقق من إعداد Google وروابط OAuth.",
          "Unable to sign in. Check Google provider and OAuth callbacks.",
        ),
      );
      setBusy(false);
    }
  }
  return (
    <section className="q-panel q-padded" style={{ width: "min(470px,100%)" }}>
      <span className="q-tool-icon">
        <Icon name="shield" size={26} />
      </span>
      <p className="q-eyebrow" style={{ marginTop: 22 }}>
        FARMAKON / OWNER STUDIO
      </p>
      <h1>{tr("دخول إدارة المنصة", "Platform management sign in")}</h1>
      <p className="q-muted">
        {tr(
          "الدخول بحساب Google المعتمد، ثم التحقق من منحة المالك على الخادم.",
          "Sign in with the approved Google account, then verify the server-side owner grant.",
        )}
      </p>
      <p dir="ltr" className="q-notice">
        appsmr32@gmail.com
      </p>
      <button
        className="q-btn"
        style={{ width: "100%" }}
        disabled={busy || !configured}
        onClick={signIn}
      >
        {busy
          ? tr("جارٍ الاتصال…", "Connecting…")
          : tr("المتابعة باستخدام Google", "Continue with Google")}
      </button>
      {!configured && (
        <p className="q-muted">
          {tr(
            "المصادقة غير مهيأة في هذه المعاينة.",
            "Authentication is not configured in this preview.",
          )}
        </p>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="q-row q-row-wrap" style={{ marginTop: 22 }}>
        <Link href="/" className="q-muted">
          {tr("العودة للمنصة", "Back to platform")}
        </Link>
        <Link href="/owner-review" className="q-muted">
          {tr("مراجعة التصميم — دون صلاحيات", "Review design — no privileges")}
        </Link>
      </div>
    </section>
  );
}
