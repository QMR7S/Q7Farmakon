"use client";
import { useActionState } from "react";
import Link from "next/link";

type Action = (prev: { error?: string } | undefined, fd: FormData) => Promise<{ error?: string } | undefined>;

export default function AuthForm({ mode, action }: { mode: "login" | "signup"; action: Action }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isSignup = mode === "signup";
  return (
    <div className="auth">
      <h1>{isSignup ? "إنشاء حساب" : "تسجيل الدخول"}</h1>
      <form action={formAction}>
        {isSignup && (
          <>
            <label htmlFor="full_name">الاسم الكامل</label>
            <input id="full_name" name="full_name" required autoComplete="name" />
          </>
        )}
        <label htmlFor="email">البريد الإلكتروني</label>
        <input id="email" name="email" type="email" required autoComplete="email" dir="ltr" />
        <label htmlFor="password">كلمة المرور</label>
        <input id="password" name="password" type="password" required minLength={isSignup ? 8 : undefined}
               autoComplete={isSignup ? "new-password" : "current-password"} dir="ltr" />
        {state?.error && <p className="error" role="alert">{state.error}</p>}
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "لحظة..." : isSignup ? "إنشاء الحساب" : "دخول"}
        </button>
      </form>
      <p className="alt">
        {isSignup ? "لديك حساب؟ " : "ليس لديك حساب؟ "}
        <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "سجّل الدخول" : "أنشئ حسابًا"}</Link>
      </p>
    </div>
  );
}
