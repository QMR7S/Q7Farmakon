"use client";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { usePreferences } from "./platform/Preferences";
import { ApprovedAuthSymbols, AuthGlyph } from "./ApprovedAuthIcons";
import { GOV, UNI, STG, type AuthOption } from "./ApprovedAuthData";
import { resetPassword } from "@/app/login/actions";

type Result = {error?:string;success?:string}|undefined;
type Action = (prev:Result, data:FormData)=>Promise<Result>;
type Lang="ar"|"en";
const D={
 ar:{
  tagline:"ادرس الصيدلة بذكاء وبمنهج واضح",
  detail:"منصة لطلبة الصيدلة وخريجيها: محاضرات منظّمة، وبنك أسئلة، ومراجعة متباعدة، ومساعد ذكي يستند إلى مصادر موثّقة.",
  features:["بنك الأسئلة","البطاقات التعليمية","المساعد الذكي"],
  login:"تسجيل الدخول",signup:"إنشاء حساب",welcome:"مرحباً بعودتك",welcomeDetail:"سجّل دخولك لتكمل دراستك من حيث توقفت.",
  join:"أنشئ حسابك",joinDetail:"خطوتان فقط لتبدأ رحلتك الدراسية.",name:"الاسم الكامل",email:"البريد الإلكتروني",password:"كلمة المرور",
  remember:"تذكّرني على هذا الجهاز",forgot:"نسيت كلمة المرور؟",next:"التالي",prev:"السابق",stage:"المرحلة الدراسية",uni:"الجامعة",gov:"المحافظة",
  stepOne:"بيانات الحساب",stepTwo:"بياناتك الدراسية",min:"8 أحرف على الأقل",alnum:"حروف وأرقام معاً",
  pwStrength:["ضعيفة","مقبولة","جيدة","قوية"],strength:"قوة كلمة المرور: ",
  search:"ابحث…",searchUni:"ابحث أو اكتب اسم جامعتك",nothing:"لا توجد نتائج",
  reset:"استعادة كلمة المرور",resetInfo:"أدخل بريدك الإلكتروني وسنرسل إليك رابط إعادة التعيين.",send:"إرسال الرابط",
  back:"العودة إلى تسجيل الدخول",show:"إظهار كلمة المرور",hide:"إخفاء كلمة المرور",
  off:"معاينة تطوير: تسجيل الحساب وإرسال البيانات غير متاحين حتى إعداد المصادقة.",
  on:"مصادقة Farmakon الآمنة",badEmail:"أدخل بريداً إلكترونياً صحيحاً.",
  short:"استخدم 8 أحرف على الأقل، تشمل حروفاً وأرقاماً.",required:"أكمل الحقول المطلوبة.",
  universityCustom:"استخدام اسم الجامعة المكتوب",caps:"مفتاح Caps Lock مفعّل."
 },
 en:{
  tagline:"Study pharmacy smarter, with a clear path",
  detail:"Built for pharmacy students and graduates: structured lectures, a question bank, spaced repetition and an AI tutor grounded in cited sources.",
  features:["Question bank","Flashcards","AI tutor"],
  login:"Sign in",signup:"Sign up",welcome:"Welcome back",welcomeDetail:"Sign in to pick up right where you left off.",
  join:"Create your account",joinDetail:"Just two steps to start your study journey.",name:"Full name",email:"Email address",password:"Password",
  remember:"Remember me on this device",forgot:"Forgot password?",next:"Next",prev:"Back",stage:"Academic year",uni:"University",gov:"Governorate",
  stepOne:"Account details",stepTwo:"Your studies",min:"At least 8 characters",alnum:"Letters and numbers",
  pwStrength:["Weak","Fair","Good","Strong"],strength:"Password strength: ",
  search:"Search…",searchUni:"Search or type your university",nothing:"No results found",
  reset:"Reset your password",resetInfo:"Enter your email and we’ll send you a link to reset it.",send:"Send reset link",
  back:"Back to sign in",show:"Show password",hide:"Hide password",
  off:"Development preview: sign-in and data submission are unavailable until authentication is configured.",
  on:"Farmakon secure authentication",badEmail:"Enter a valid email address.",
  short:"Use at least 8 characters including letters and numbers.",required:"Complete the required fields.",
  universityCustom:"Use the typed university name",caps:"Caps Lock is on."
 }
};
const emailOk=(s:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
const passwordOk=(s:string)=>s.length>=8&&/\p{L}/u.test(s)&&/\d/.test(s);
const norm=(s:string)=>s.toLowerCase().replace(/[أإآ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").replace(/[\u064B-\u0652]/g,"").trim();

function ReferenceSelect({name,label,icon,options,locale,selected,onSelect,searchable=false,custom=false,error}:{
 name:string;label:string;icon:string;options:AuthOption[];locale:Lang;selected:AuthOption|null;
 onSelect:(item:AuthOption)=>void;searchable?:boolean;custom?:boolean;error?:string;
}){
 const [open,setOpen]=useState(false);
 const [query,setQuery]=useState("");
 const [active,setActive]=useState(0);
 const root=useRef<HTMLDivElement>(null);
 const input=useRef<HTMLInputElement>(null);
 const T=D[locale];
 const list=options.filter(o=>!query.trim()||norm(o.ar).includes(norm(query))||norm(o.en).includes(norm(query)));
 if(custom&&query.trim()&&!options.some(o=>norm(o.ar)===norm(query)||norm(o.en)===norm(query))){
   list.push({v:query.trim().slice(0,120),ar:query.trim().slice(0,120),en:query.trim().slice(0,120),custom:true});
 }
 useEffect(()=>{
   const close=(e:PointerEvent)=>{if(root.current&&!root.current.contains(e.target as Node))setOpen(false)};
   document.addEventListener("pointerdown",close);
   return ()=>document.removeEventListener("pointerdown",close);
 },[]);
 useEffect(()=>{if(open&&searchable)input.current?.focus({preventScroll:true})},[open,searchable]);
 const show=()=>{setOpen(true);setQuery("");setActive(0)};
 const pick=(opt:AuthOption)=>{onSelect(opt);setOpen(false);setQuery("")};
 const key=(e:React.KeyboardEvent)=>{
   if(e.key==="Escape"){e.preventDefault();setOpen(false);return}
   if(!list.length)return;
   if(e.key==="ArrowDown"){e.preventDefault();setActive(v=>(v+1)%list.length)}
   if(e.key==="ArrowUp"){e.preventDefault();setActive(v=>(v+list.length-1)%list.length)}
   if(e.key==="Enter"&&open){e.preventDefault();pick(list[Math.min(active,list.length-1)])}
 };
 return <div className={`dd ${open?"open":""} ${selected?"has":""} ${error?"bad":""}`} id={`dd-${name}`} ref={root} onKeyDown={key}>
   <AuthGlyph className="i ic" name={icon}/>
   <button className="ddb" type="button" aria-label={label} aria-haspopup="listbox" aria-expanded={open}
     onClick={()=>open?setOpen(false):show()}>
     <span className="ddl">{label}</span><span className="ddv">{selected?(selected.custom?selected.v:selected[locale]):""}</span>
   </button>
   <AuthGlyph className="i chev" name="chev"/>
   {open&&<div className="ddp">
      <div className="dds" hidden={!searchable}><AuthGlyph name="search"/><input ref={input} autoComplete="off"
        spellCheck={false} placeholder={name==="uni"?T.searchUni:T.search}
        value={query} onChange={e=>{setQuery(e.target.value);setActive(0)}} aria-label={T.search}/>
      </div>
      <ul role="listbox" tabIndex={-1} aria-label={label}>
       {list.length?list.map((o,i)=><li role="option" key={o.v+"_"+i}
         aria-selected={selected?.v===o.v} className={active===i?"act":""}
         onMouseEnter={()=>setActive(i)} onClick={()=>pick(o)}>
         {o.n?<b className="nb">{o.n}</b>:o.v==="grad"?<AuthGlyph className="i nb" name="cap"/>:null}
         <span>{o.custom?T.universityCustom+" «"+o.v+"»":o[locale]}</span>
         {selected?.v===o.v?<AuthGlyph name="check"/>:null}
       </li>):<li className="none">{T.nothing}</li>}
      </ul>
   </div>}
   {error&&<div className="fe" role="alert">{error}</div>}
 </div>
}

export default function AuthForm({mode,action,configured}:{
 mode:"login"|"signup";action:Action;configured:boolean;
}){
 const [result,formAction,pending]=useActionState(action,undefined);
 const [resetResult,resetAction,resetPending]=useActionState(resetPassword,undefined);
 const {locale,theme,setLocale,setTheme}=usePreferences();
 const L=locale as Lang,T=D[L],signup=mode==="signup";
 const [reset,setReset]=useState(false);
 const [step,setStep]=useState(1);
 const [name,setName]=useState("");
 const [email,setEmail]=useState("");
 const [pass,setPass]=useState("");
 const [revealed,setRevealed]=useState(false);
 const [stage,setStage]=useState<AuthOption|null>(null);
 const [uni,setUni]=useState<AuthOption|null>(null);
 const [gov,setGov]=useState<AuthOption|null>(null);
 const [clientError,setClientError]=useState("");
 const [caps,setCaps]=useState(false);
 const [remember,setRemember]=useState(true);
 const [resetEmail,setResetEmail]=useState("");
 const strength=(pass.length>=8?1:0)+(/\p{Ll}/u.test(pass)&&/\p{Lu}/u.test(pass)?1:0)+(/\d/.test(pass)?1:0)+(/[^\p{L}\d]/u.test(pass)?1:0);
 const error=result?.error||clientError;
 const two=stage&&uni&&gov;
 const fail=(message:string)=>{setClientError(message)};
 const submit=(e:React.FormEvent<HTMLFormElement>)=>{
   setClientError("");
   if(!emailOk(email)){e.preventDefault();fail(T.badEmail);return}
   if(signup){
    if(name.trim().length<2||!passwordOk(pass)){e.preventDefault();fail(T.short);return}
    if(step===1){e.preventDefault();setStep(2);return}
    if(!two){e.preventDefault();fail(T.required);return}
   }else if(!pass){e.preventDefault();fail(T.required);return}
 };
 const resetSubmit=(e:React.FormEvent<HTMLFormElement>)=>{if(!emailOk(resetEmail)){e.preventDefault();fail(T.badEmail)}else setClientError("")};
 return <main className="fk-auth" id="main-content" lang={L} dir={L==="ar"?"rtl":"ltr"} data-theme={theme}>
  <ApprovedAuthSymbols/>
  <div className="shell">
   <section className="brand" aria-label="Farmakon">
    <div className="logo"><span className="tile-logo"/><span>Farmakon<small>{L==="ar"?"منصة تعليم الصيدلة":"Pharmacy learning platform"}</small></span></div>
    <div className="mark"><img src="/brand/farmakon-hero.webp" alt="Farmakon" width="400" height="400"/></div>
    <div className="hero"><h1>{L==="ar"?<>ادرس الصيدلة <em>بذكاء</em> وبمنهج واضح</>:<>Study pharmacy <em>smarter</em>, with a clear path</>}</h1>
     <p>{T.detail}</p>
     <div className="feats">{T.features.map((label,i)=><span className="feat" key={label}><AuthGlyph name={["help","layers","ai"][i]}/>{label}</span>)}</div>
    </div>
    <div className="foot">© Farmakon</div>
   </section>
   <section className="pane">
    <div className="tools">
      <button type="button" className="tbtn" onClick={()=>setLocale(L==="ar"?"en":"ar")}
        aria-label={L==="ar"?"Switch to English":"التبديل إلى العربية"}>{L==="ar"?"EN":"ع"}</button>
      <button type="button" className="tbtn" onClick={()=>setTheme(theme==="dark"?"light":"dark")}
        aria-label={L==="ar"?"تبديل المظهر":"Switch theme"}><AuthGlyph name="sun"/></button>
    </div>
    <div className="card" id="card">
     <div className="cardhead"><span className="tile-logo"/><b style={{fontSize:19}}>Farmakon</b></div>
     {!reset&&<div className={`seg ${signup?"r":""}`} role="tablist" aria-label="Authentication">
       <span className="pill" aria-hidden="true"/>
       <Link role="tab" id="t-login" aria-selected={!signup&&!reset} href="/login">{T.login}</Link>
       <Link role="tab" id="t-reg" aria-selected={signup&&!reset} href="/signup">{T.signup}</Link>
     </div>}
     {reset?<form action={resetAction} onSubmit={resetSubmit} noValidate>
       <h2>{T.reset}</h2><p className="sub">{T.resetInfo}</p>
       <div className="f"><AuthGlyph name="mail"/><input id="remail" name="email" className="ltr" type="email"
         placeholder=" " autoComplete="email" required value={resetEmail} onChange={e=>setResetEmail(e.target.value)}/>
         <label htmlFor="remail">{T.email}</label></div>
       {(resetResult?.error||clientError)&&<div className="fe" role="alert">{resetResult?.error||clientError}</div>}
       {resetResult?.success&&<p className="ok" role="status">{resetResult.success}</p>}
       <button className="btn" disabled={resetPending} type="submit">{resetPending?<span className="spin"/>:T.send}<AuthGlyph className="i go" name="arrow"/></button>
       <div className="alt"><button type="button" className="lnk" onClick={()=>{setReset(false);setClientError("")}}>{T.back}</button></div>
     </form>:<form action={formAction} onSubmit={submit} noValidate>
      <h2>{signup?T.join:T.welcome}</h2><p className="sub">{signup?T.joinDetail:T.welcomeDetail}</p>
      {result?.success&&<div className="ok" role="status">{result.success} <Link href="/login">{T.login}</Link></div>}
      {signup&&<div className="steps" aria-live="polite"><i className="on"/><i className={step===2?"on":""}/>
        <span>{L==="ar"?`الخطوة ${step} من 2 · ${step===1?T.stepOne:T.stepTwo}`:`Step ${step} of 2 · ${step===1?T.stepOne:T.stepTwo}`}</span></div>}
      <div className="step" hidden={signup&&step!==1}>
       {signup&&<div className="f"><AuthGlyph name="user"/><input id="auth-full-name" name="full_name" type="text" placeholder=" "
          autoComplete="name" maxLength={120} value={name} onChange={e=>setName(e.target.value)}/>
          <label htmlFor="auth-full-name">{T.name}</label></div>}
       <div className="f"><AuthGlyph name="mail"/><input id="auth-email" name="email" className="ltr" type="email" inputMode="email"
         placeholder=" " autoComplete={signup?"email":"username"} autoCapitalize="none" spellCheck={false}
         value={email} onChange={e=>setEmail(e.target.value)}/>
         <label htmlFor="auth-email">{T.email}</label></div>
       <div className="f pw"><AuthGlyph name="lock"/><input id="auth-pass" name="password" className="ltr"
         type={revealed?"text":"password"} placeholder=" " autoComplete={signup?"new-password":"current-password"}
         value={pass} onChange={e=>setPass(e.target.value)}
         onKeyDown={e=>setCaps(e.getModifierState("CapsLock"))} onKeyUp={e=>setCaps(e.getModifierState("CapsLock"))} onBlur={()=>setCaps(false)}/>
         <label htmlFor="auth-pass">{T.password}</label>
         <button type="button" className="eye" aria-label={revealed?T.hide:T.show} onClick={()=>setRevealed(v=>!v)}>
           <AuthGlyph name={revealed?"eyeoff":"eye"}/>
         </button></div>
       {caps&&<p className="fe hint">{T.caps}</p>}
       {signup&&<><div className="meter" aria-label={T.strength+(strength?T.pwStrength[strength-1]:"")}>
         {[0,1,2,3].map(i=><span key={i} style={{background:i<strength?["#FA6956","#FD8D4B","#3FBAFD","#2D9DF3"][strength-1]:undefined}}/>)}
        </div>
        <ul className="reqs"><li className={pass.length>=8?"ok":""}><AuthGlyph name="check"/>{T.min}</li>
         <li className={/\p{L}/u.test(pass)&&/\d/.test(pass)?"ok":""}><AuthGlyph name="check"/>{T.alnum}</li></ul></>}
       {!signup&&<div className="row">
        <label><input type="checkbox" name="remember" checked={remember} onChange={e=>setRemember(e.target.checked)}/><span>{T.remember}</span></label>
        <button type="button" className="lnk" onClick={()=>{setReset(true);setClientError("")}}>{T.forgot}</button>
       </div>}
       {error&&<div className="fe" role="alert">{error}</div>}
       {!signup&&<button className="btn" disabled={pending} type="submit">{pending?<span className="spin"/>:T.login}<AuthGlyph className="i go" name="arrow"/></button>}
       {signup&&<button className="btn" type="submit">{T.next}<AuthGlyph className="i go" name="arrow"/></button>}
      </div>
      {signup&&<div className="step" hidden={step!==2}>
       <ReferenceSelect name="stage" icon="cap" label={T.stage} options={STG} locale={L} selected={stage} onSelect={setStage}/>
       <ReferenceSelect name="uni" icon="uni" label={T.uni} options={UNI} locale={L} selected={uni} onSelect={setUni} searchable custom/>
       <ReferenceSelect name="gov" icon="pin" label={T.gov} options={GOV} locale={L} selected={gov} onSelect={setGov} searchable/>
       <input type="hidden" name="stage" value={stage?.v??""}/>
       <input type="hidden" name="university" value={uni?.v??""}/>
       <input type="hidden" name="governorate" value={gov?.v??""}/>
       {error&&<div className="fe" role="alert">{error}</div>}
       <div className="btns">
        <button className="btn ghost" type="button" onClick={()=>{setStep(1);setClientError("")}}><AuthGlyph className="i back" name="back"/>{T.prev}</button>
        <button className="btn" disabled={pending} type="submit">{pending?<span className="spin"/>:T.signup}<AuthGlyph className="i go" name="arrow"/></button>
       </div>
      </div>}
     </form>}
     <div className="note" role="status">{configured?T.on:T.off}</div>
    </div>
   </section>
  </div>
 </main>;
}
