"use client";
import Link from "next/link";
import {useActionState,useState} from "react";
import {usePreferences} from "./platform/Preferences";
import {ApprovedAuthSymbols,AuthGlyph} from "./ApprovedAuthIcons";
type Result={error?:string;success?:string}|undefined;
export default function ResetPasswordScreen({action,configured}:{action:(prev:Result,data:FormData)=>Promise<Result>;configured:boolean}){
 const [state,formAction,pending]=useActionState(action,undefined);
 const [show,setShow]=useState(false);
 const {locale,theme,setLocale,setTheme}=usePreferences();
 const ar=locale==="ar";
 return <main className="fk-auth" id="main-content" dir={ar?"rtl":"ltr"} lang={ar?"ar":"en"} data-theme={theme}>
  <ApprovedAuthSymbols/>
  <div className="shell">
   <section className="brand">
    <div className="logo"><span className="tile-logo"/><span>Farmakon<small>{ar?"منصة تعليم الصيدلة":"Pharmacy learning platform"}</small></span></div>
    <div className="mark"><img src="/brand/farmakon-hero.webp" alt="Farmakon" width="400" height="400"/></div>
    <div className="hero"><h1>{ar?"دراستك بأمان":"Your learning, securely"}</h1><p>{ar?"عد إلى دراستك بإعداد كلمة مرور جديدة لحسابك.":"Return to learning with a new password for your account."}</p></div>
    <div className="foot">© Farmakon</div>
   </section>
   <section className="pane">
    <div className="tools">
      <button type="button" className="tbtn" onClick={()=>setLocale(ar?"en":"ar")}>{ar?"EN":"ع"}</button>
      <button type="button" className="tbtn" onClick={()=>setTheme(theme==="dark"?"light":"dark")} aria-label={ar?"تبديل المظهر":"Switch theme"}><AuthGlyph name="sun"/></button>
    </div>
    <div className="card">
     <div className="cardhead"><span className="tile-logo"/><b style={{fontSize:19}}>Farmakon</b></div>
     <h2>{ar?"تعيين كلمة المرور":"Set a new password"}</h2>
     <p className="sub">{ar?"اختر كلمة مرور قوية لحماية حسابك.":"Choose a strong password to protect your account."}</p>
     <form action={formAction}>
      <div className="f pw"><AuthGlyph name="lock"/>
       <input id="new-password" type={show?"text":"password"} name="password" placeholder=" " minLength={8} required autoComplete="new-password"/>
       <label htmlFor="new-password">{ar?"كلمة المرور الجديدة":"New password"}</label>
       <button className="eye" type="button" onClick={()=>setShow(!show)} aria-label={show?"Hide":"Show"}><AuthGlyph name={show?"eyeoff":"eye"}/></button></div>
      <div className="f pw"><AuthGlyph name="lock"/>
       <input id="confirm-password" type={show?"text":"password"} name="confirm" placeholder=" " minLength={8} required autoComplete="new-password"/>
       <label htmlFor="confirm-password">{ar?"تأكيد كلمة المرور":"Confirm password"}</label></div>
      {state?.error&&<div className="fe" role="alert">{state.error}</div>}
      {state?.success&&<div className="ok" role="status">{state.success}</div>}
      <button className="btn" disabled={pending||!configured} type="submit">{pending?<span className="spin"/>:ar?"حفظ كلمة المرور":"Save password"}<AuthGlyph className="i go" name="arrow"/></button>
     </form>
     <div className="alt"><Link href="/login" className="lnk">{ar?"العودة لتسجيل الدخول":"Back to sign in"}</Link></div>
     {!configured&&<div className="note" role="status">{ar?"بيئة المصادقة غير مهيأة لهذه المعاينة.":"Authentication is not configured for this preview."}</div>}
    </div>
   </section>
  </div>
 </main>;
}
