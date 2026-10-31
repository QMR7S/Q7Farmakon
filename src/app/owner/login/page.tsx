"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function OwnerLogin() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function signIn() {
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/owner`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (err) throw err;
    } catch {
      setError("تعذّر بدء تسجيل الدخول باستخدام Google. تحقق من إعداد مزوّد Google وروابط OAuth.");
      setBusy(false);
    }
  }
  return <div dir="rtl" style={{minHeight:"75vh",display:"grid",placeItems:"center",padding:20}}>
    <section style={{width:"min(430px,100%)",background:"white",border:"1px solid #d3ddd8",padding:30,borderRadius:23,boxShadow:"0 20px 80px #2447b515"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <span style={{background:"#2447b5",color:"white",padding:"8px 14px",borderRadius:12,fontWeight:800}}>F.</span>
        <b style={{color:"#14232b",fontSize:22}}>Farmakon / المالك</b>
      </div>
      <h1 style={{fontSize:22,color:"#14232b"}}>تسجيل دخول إدارة المنصة</h1>
      <p style={{color:"#4a5b63",lineHeight:1.9}}>الدخول مخصص لحساب Google المعتمد فقط. لا تُمنح الصلاحيات لمجرد تطابق البريد؛ يلزم اعتماد حساب المالك في قاعدة البيانات.</p>
      <button disabled={busy} onClick={signIn} style={{width:"100%",padding:14,background:"#2447b5",color:"#fff",border:0,borderRadius:12,fontWeight:700,cursor:"pointer"}}>
        {busy?"جارٍ الاتصال…":"المتابعة باستخدام Google"}
      </button>
      {error && <p role="alert" style={{color:"#b3261e"}}>{error}</p>}
      <Link href="/" style={{display:"block",textAlign:"center",marginTop:16,color:"#2447b5"}}>العودة للمنصة</Link>
    </section>
  </div>;
}
