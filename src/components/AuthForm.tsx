"use client";
import { useActionState } from "react";
import Link from "next/link";
import { usePreferences } from "./platform/Preferences";
import Icon from "./platform/Icon";
type Action = (
  prev: { error?: string } | undefined,
  fd: FormData,
) => Promise<{ error?: string } | undefined>;
export default function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "signup";
  action: Action;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const signup = mode === "signup";
  const { tr } = usePreferences();
  return (
    <section className="q-auth-card">
      <div className="q-auth-story">
        <span className="q-kicker">FARMAKON / YOUR STUDY COMPANION</span>
        <h2>
          {tr(
            "معرفتك اليوم،\nثقتك غداً.",
            "Knowledge today. Confidence tomorrow.",
          )}
        </h2>
        <p>
          {tr(
            "مساحتك لتعلّم الصيدلة. محاضرات مترابطة، مراجع مرتّبة، وتدريب يعمّق فهمك.",
            "Your space to learn pharmacy. Connected lectures, organised references and practice that deepens understanding.",
          )}
        </p>
        <div className="q-orbit" aria-hidden="true">
          <div className="q-orbit-ring" />
          <div className="q-orbit-ring two" />
          <div className="q-orbit-core">
            Rx<span>FARMAKON</span>
          </div>
          <span className="q-orbit-chip chip-one">
            <Icon name="learn" />
          </span>
          <span className="q-orbit-chip chip-two">
            <Icon name="library" />
          </span>
        </div>
      </div>
      <div className="q-auth-form">
        <p className="q-eyebrow">
          {tr("مرحباً بك في فارماكون", "WELCOME TO FARMAKON")}
        </p>
        <h1>
          {signup
            ? tr("ابدأ رحلتك", "Start your journey")
            : tr("سعيدون بعودتك", "Welcome back")}
        </h1>
        <p className="q-muted">
          {signup
            ? tr(
                "أنشئ حسابك لتجمع دراستك في مكان واحد.",
                "Create your account and bring your studies together.",
              )
            : tr(
                "سجّل الدخول، وكمّل من حيث توقفت.",
                "Sign in and continue where you left off.",
              )}
        </p>
        <form action={formAction} className="q-form">
          {signup && (
            <label className="q-field">
              {tr("الاسم الكامل", "Full name")}
              <input
                name="full_name"
                required
                autoComplete="name"
                maxLength={120}
              />
            </label>
          )}
          <label className="q-field">
            {tr("البريد الإلكتروني", "Email address")}
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              dir="ltr"
              placeholder="you@example.com"
            />
          </label>
          <label className="q-field">
            {tr("كلمة المرور", "Password")}
            <input
              name="password"
              type="password"
              required
              minLength={signup ? 8 : undefined}
              autoComplete={signup ? "new-password" : "current-password"}
              dir="ltr"
            />
          </label>
          {state?.error && (
            <p className="error" role="alert">
              {state.error}
            </p>
          )}
          <button className="q-btn" disabled={pending}>
            {pending
              ? tr("جارٍ التحقق…", "Checking…")
              : signup
                ? tr("إنشاء الحساب", "Create account")
                : tr("تسجيل الدخول", "Sign in")}
            <Icon name="arrow" size={18} />
          </button>
        </form>
        <p className="q-alt">
          {signup
            ? tr("لديك حساب بالفعل؟ ", "Already have an account? ")
            : tr("جديد في فارماكون؟ ", "New to Farmakon? ")}
          <Link href={signup ? "/login" : "/signup"}>
            {signup
              ? tr("سجّل الدخول", "Sign in")
              : tr("أنشئ حسابك", "Create an account")}
          </Link>
        </p>
        <p className="q-auth-legal">
          <Link href="/privacy">{tr("الخصوصية", "Privacy")}</Link> ·{" "}
          <Link href="/terms">{tr("شروط الاستخدام", "Terms of use")}</Link> ·{" "}
          <Link href="/owner/login">{tr("دخول المالك", "Owner sign in")}</Link>
        </p>
      </div>
    </section>
  );
}
