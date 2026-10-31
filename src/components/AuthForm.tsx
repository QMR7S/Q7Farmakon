"use client";
import {usePreferences} from "@/components/q7/AppShell";
import { useActionState } from "react";
import Link from "next/link";

type Action = (prev: { error?: string } | undefined, fd: FormData) => Promise<{ error?: string } | undefined>;

export default function AuthForm({ mode, action }: { mode: "login" | "signup"; action: Action }) {
  const {tr}=usePreferences();
  const [state, formAction, pending] = useActionState(action, undefined);
  const isSignup = mode === "signup";
  return (
    <div className="auth">
      <h1>{isSignup ? tr("إنشاء حساب","Create account") : tr("تسجيل الدخول","Sign in")}</h1>
      <form action={formAction}>
        {isSignup && (
          <>
            <label htmlFor="full_name">{tr("الاسم الكامل","Full name")}</label>
            <input id="full_name" name="full_name" required autoComplete="name" />
          </>
        )}
        <label htmlFor="email">{tr("البريد الإلكتروني","Email")}</label>
        <input id="email" name="email" type="email" required autoComplete="email" dir="ltr" />
        <label htmlFor="password">{tr("كلمة المرور","Password")}</label>
        <input id="password" name="password" type="password" required minLength={isSignup ? 8 : undefined}
               autoComplete={isSignup ? "new-password" : "current-password"} dir="ltr" />
        {state?.error && <p className="error" role="alert">{tr(state.error,"Authentication failed or is unavailable. Please check your details and try again.")}</p>}
        <button className="btn" type="submit" disabled={pending}>
          {pending ? tr("لحظة...","Please wait…") : isSignup ? tr("إنشاء الحساب","Create account") : tr("دخول","Sign in")}
        </button>
      </form>
      <p className="alt">
        {isSignup ? tr("لديك حساب؟ ","Already have an account? ") : tr("ليس لديك حساب؟ ","New here? ")}
        <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? tr("سجّل الدخول","Sign in") : tr("أنشئ حسابًا","Create account")}</Link>
      </p>
    </div>
  );
}
