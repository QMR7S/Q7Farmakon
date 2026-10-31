"use client";

import { useState } from "react";

type Locale = "ar" | "en";
type Tab = "home" | "courses" | "lesson" | "questions" | "library" | "cases" | "downloads";

const headings: Record<Tab,[string,string]> = {
 home:["الرئيسية","Home"], courses:["كورساتي","My courses"],lesson:["مركز المحاضرات","Lecture center"],
 questions:["بنك الأسئلة","Question bank"],library:["المكتبة","Medical library"],
 cases:["الحالات السريرية","Clinical cases"],downloads:["تنزيلاتي","Offline downloads"]
};
const badge = {background:"#DDF6F1",color:"#0A655C",borderRadius:999,padding:"4px 12px",fontSize:12} as const;
const card = {background:"#fff",border:"1px solid #dce8ec",borderRadius:17,padding:20,boxShadow:"0 7px 20px #1238490a"} as const;

export default function Q7V21Preview() {
 const [locale,setLocale]=useState<Locale>("ar");
 const [dark,setDark]=useState(false);
 const [tab,setTab]=useState<Tab>("home");
 const [bank,setBank]=useState<"general"|"ministerial">("general");
 const tr=(ar:string,en:string)=>locale==="ar"?ar:en;
 const bg=dark?"#0A202D":"#F5F8FA",surface=dark?"#143647":"#fff",ink=dark?"#F5FAFC":"#102D3D";
 const block={...card,background:surface,color:ink,borderColor:dark?"#385463":"#dce8ec"};
 const button={border:0,borderRadius:11,background:"#087C73",color:"#fff",padding:"11px 15px",fontWeight:700,cursor:"pointer"} as const;
 const navigation=(Object.keys(headings) as Tab[]);
 return <section dir={locale==="ar"?"rtl":"ltr"} style={{background:bg,color:ink,minHeight:"80vh",padding:20,borderRadius:16,fontFamily:"system-ui,sans-serif",lineHeight:1.6}}>
  <div style={{maxWidth:1100,margin:"auto"}}>
   <div style={{display:"flex",gap:10,alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",marginBottom:24}}>
    <strong style={{fontSize:22}}>Farmakon <span style={{color:"#087C73"}}>Q7</span></strong>
    <div style={{display:"flex",gap:8}}>
     <button onClick={()=>setLocale(locale==="ar"?"en":"ar")} style={button}>{locale==="ar"?"English":"العربية"}</button>
     <button onClick={()=>setDark(!dark)} style={{...button,background:"#1E4050"}}>{tr("المظهر","Theme")}</button>
    </div>
   </div>
   <p style={{fontSize:12,color:dark?"#BBD4DD":"#607583",marginTop:-10}}>{tr("واجهة مراجعة مع بيانات تجريبية. لا اتصال ببيانات الحساب أو خادم.","Read-only demo. No account or backend data.")}</p>
   <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:13,marginBottom:16}}>
    {navigation.map(k=><button key={k} onClick={()=>setTab(k)} style={{...button,background:tab===k?"#087C73":surface,color:tab===k?"#fff":ink,border:"1px solid #c9dadd",whiteSpace:"nowrap"}}>{headings[k][locale==="ar"?0:1]}</button>)}
   </div>
   <h1 style={{fontSize:"clamp(23px,3vw,33px)",margin:"0 0 16px"}}>{headings[tab][locale==="ar"?0:1]}</h1>
   {tab==="home"&&<><div style={{background:"linear-gradient(120deg,#092937,#147c74)",color:"#fff",padding:24,borderRadius:18}}>
     <span style={{...badge,background:"#ffffff22",color:"#fff"}}>{tr("أكمل من حيث توقفت","Continue learning")}</span>
     <h2>{tr("علم الأدوية — الامتصاص والتوافر الحيوي","Pharmacology — Absorption & Bioavailability")}</h2>
     <p>18:25 / 40:00 • {tr("بيانات عرض","Sample data")}</p>
     <button style={{...button,background:"#e4fff9",color:"#153a44"}} onClick={()=>setTab("lesson")}>{tr("استكمال المحاضرة","Open lecture")}</button>
    </div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginTop:16}}>
    {[["03",tr("كورساتي","Courses")],["64%",tr("نسبة التقدم","Progress")],["24",tr("مراجعات اليوم","Reviews")],["71%",tr("دقة الإجابات","Accuracy")]].map(([n,label])=><div key={label} style={block}><strong style={{fontSize:23}}>{n}</strong><p>{label}</p></div>)}</div></>}
   {tab==="courses"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>{[tr("علم الأدوية","Pharmacology"),tr("الفسلجة","Physiology"),tr("الصيدلة السريرية","Clinical Pharmacy")].map(name=><div style={block} key={name}><span style={badge}>Course</span><h3>{name}</h3><p>{tr("المرحلة والمادة والوحدات","Study year, subject, modules")}</p><button style={button} onClick={()=>setTab("lesson")}>{tr("المحاضرات","Lectures")}</button></div>)}</div>}
   {tab==="lesson"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(275px,1fr))",gap:12}}>
     <div style={block}><div style={{height:200,background:"#092837",color:"#92FFF0",display:"grid",placeItems:"center",borderRadius:14}}>▶ {tr("مشغل فيديو — مصدر حقيقي مطلوب","Video player — media source required")}</div>
     <h3>{tr("خيارات المشغل المعتمدة","Player requirements")}</h3><p>{tr("السرعة، الدقة، الترجمة، الملء، التقديم والتأخير، والعرض دون إنترنت حسب الصلاحيات.","Speed, quality, captions, seek, fullscreen and rights-aware offline support.")}</p></div>
     <div style={block}><h3>{tr("موارد المحاضرة","Lecture resources")}</h3>
     <p>{tr("الملزمة • ملاحظات المدرس • ملاحظاتي الخاصة • AI • أسئلة • حالات","PDF • Instructor notes • Private notes • AI • MCQs • Cases")}</p>
     <button onClick={()=>setTab("questions")} style={button}>{tr("أسئلة المحاضرة","Lecture questions")}</button></div></div>}
   {tab==="questions"&&<div style={block}><div style={{display:"flex",gap:8}}>{(["general","ministerial"] as const).map(k=><button key={k} style={{...button,background:bank===k?"#087C73":"#45606A"}} onClick={()=>setBank(k)}>{k==="general"?tr("بنك عام","General bank"):tr("بنك وزاري","Ministerial bank")}</button>)}</div><h3>{bank==="general"?tr("أسئلة حسب المادة والمحاضرة والموضوع","Topic and lecture practice"):tr("حسب السنة والدور والمرحلة والمصدر الموثق","Exam year, round, subject, verified source")}</h3><p>{tr("البيانات هنا للتصميم فقط ولا تُنسب أسئلة تجريبية لجهة رسمية.","Mock classification only; no official question claims.")}</p></div>}
   {tab==="library"&&<div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12}}>{["Materials","Sources","Questions","Cases"].map(label=><div key={label} style={block}><h3>{label}</h3><p>{tr("حسب المرحلة والمادة","By study year and subject")}</p></div>)}</div>}
   {tab==="cases"&&<div style={block}><h3>{tr("التصنيف السريري","Clinical classification")}</h3><p>{tr("المرحلة ← المادة ← المحاضرة ← الحالة ← الفحوص ← القرار والمصادر","Study year → subject → lecture → case → investigations → decision and sources")}</p></div>}
   {tab==="downloads"&&<div style={block}><h3>{tr("تنزيلات الفيديو الآمنة","Entitlement-aware downloads")}</h3><p>{tr("العينة داخل ملف التسليم تعمل كنموذج مختلف؛ هذه الصفحة لا تنزل محتوى حقيقياً.","The standalone handoff contains a separate technical offline sample; this in-repo route does not download actual course media.")}</p></div>}
   <footer style={{fontSize:11,marginTop:35,opacity:.72}}>Q7 V2.1 — {tr("معاينة آمنة دون تغييرات على بيانات المستخدمين","Safe UI preview; no user data changes")}</footer>
  </div>
 </section>;
}
