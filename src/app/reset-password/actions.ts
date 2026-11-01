"use server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
type Response = {error?:string;success?:string}|undefined;
export async function updatePassword(_prev:Response,formData:FormData):Promise<Response>{
 if(!isSupabaseConfigured()) return {error:"مصادقة Farmakon غير مهيأة بعد."};
 const password=String(formData.get("password")??"");
 const confirm=String(formData.get("confirm")??"");
 if(password.length<8||!/\p{L}/u.test(password)||!/\d/.test(password))
  return {error:"استخدم ثمانية أحرف على الأقل تشمل حروفاً وأرقاماً."};
 if(password!==confirm) return {error:"كلمتا المرور غير متطابقتين."};
 const client=await createClient();
 const {data:{user}}=await client.auth.getUser();
 if(!user) return {error:"انتهت جلسة الاستعادة. اطلب رابطاً جديداً من صفحة الدخول."};
 const {error}=await client.auth.updateUser({password});
 if(error) return {error:"تعذّر تعيين كلمة المرور. اطلب رابطاً جديداً وحاول مجدداً."};
 return {success:"تم تحديث كلمة المرور. يمكنك متابعة تسجيل الدخول."};
}
