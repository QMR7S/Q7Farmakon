"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };
  redirect("/");
}

export async function signup(_prev: { error?: string } | undefined, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "كلمة المرور يجب ألا تقل عن 8 أحرف." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: String(formData.get("email") ?? ""),
    password,
    options: { data: { full_name: String(formData.get("full_name") ?? "") } },
  });
  if (error) return { error: "تعذّر إنشاء الحساب. تأكد من البريد الإلكتروني وحاول مجددًا." };
  redirect("/");
}
