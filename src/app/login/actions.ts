"use server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
type Status = { error?: string; success?: string } | undefined;
const unavailable = { error: "المصادقة غير مهيأة في بيئة الاختبار. / Authentication is not configured." };
const value = (fd:FormData,key:string,max=120) => String(fd.get(key)??"").trim().slice(0,max);
const validEmail = (email:string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

export async function login(_prev:Status, formData:FormData):Promise<Status> {
  if (!isSupabaseConfigured()) return unavailable;
  const email=value(formData,"email",254).toLowerCase();
  const password=String(formData.get("password")??"");
  if(!validEmail(email)||!password) return {error:"أدخل البريد الإلكتروني وكلمة المرور بصورة صحيحة."};
  const supabase=await createClient();
  const {error}=await supabase.auth.signInWithPassword({email,password});
  if(error) return {error:"البريد الإلكتروني أو كلمة المرور غير صحيحة."};
  redirect("/");
}

export async function signup(_prev:Status, formData:FormData):Promise<Status> {
  const email=value(formData,"email",254).toLowerCase();
  const password=String(formData.get("password")??"");
  const full_name=value(formData,"full_name",120);
  const stage=value(formData,"stage",10);
  const university=value(formData,"university",120);
  const governorate=value(formData,"governorate",100);
  if(!validEmail(email)||full_name.length<2) return {error:"تحقق من الاسم الكامل والبريد الإلكتروني."};
  if(password.length<8 || !/\p{L}/u.test(password)||!/\d/.test(password))
    return {error:"كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل وتشمل حروفاً وأرقاماً."};
  if(!["1","2","3","4","5","grad"].includes(stage)||!university||!governorate)
    return {error:"أكمل المرحلة والجامعة والمحافظة."};
  if(!isSupabaseConfigured()) return unavailable;
  const supabase=await createClient();
  const {data,error}=await supabase.auth.signUp({
    email,password,
    options:{data:{full_name,stage,university,governorate}}
  });
  if(error) return {error:"تعذّر إنشاء الحساب. تحقق من البريد أو تواصل مع الدعم."};
  if(!data.session) return {success:"تم إرسال طلب التسجيل. تحقق من بريدك الإلكتروني لإكمال تفعيل الحساب إن كان تأكيد البريد مفعلاً."};
  redirect("/");
}

export async function resetPassword(_prev:Status,formData:FormData):Promise<Status>{
  const email=value(formData,"email",254).toLowerCase();
  if(!validEmail(email)) return {error:"أدخل بريداً إلكترونياً صحيحاً."};
  if(!isSupabaseConfigured()) return unavailable;
  const origin=process.env.NEXT_PUBLIC_SITE_URL
    ||(process.env.VERCEL_URL?`https://${process.env.VERCEL_URL}`:"");
  if(!origin || !/^https:\/\//i.test(origin))
    return {error:"استعادة كلمة المرور غير مهيأة لهذا الموقع بعد."};
  const supabase=await createClient();
  const redirectTo=`${origin.replace(/\/$/,"")}/auth/callback?next=%2Freset-password`;
  const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo});
  if(error) return {error:"تعذر إرسال الرابط حالياً. تحقق من إعدادات الاستعادة وأعد المحاولة."};
  return {success:"إذا كان البريد مسجلاً لدينا، فسيصلك رابط إعادة التعيين."};
}
