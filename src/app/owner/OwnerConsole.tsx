"use client";
import { useActionState,useState } from "react";
import Link from "next/link";
import { createOwnerCourse,issueActivationCode } from "./actions";
import styles from "./owner.module.css";
type Course={id:string;title:string;slug:string;status:string;free_preview_limit:number|null;price_iqd:number|null;cover_path:string|null};
type Stats={courses:number|null;students:number|null;enrollments:number|null;coverage:boolean};
type Group=[string,number];
const defaultState={ok:false,message:""};
const menu=[
 ["overview","نظرة عامة","▤"],["courses","الكورسات والمحتوى","▣"],["videos","الفيديوهات والجودة","▷"],
 ["access","أكواد التفعيل","⌗"],["analytics","الطلاب والجامعات","◫"],["settings","الأمان والإعدادات","⚙"]
] as const;
type Section=typeof menu[number][0];
export default function OwnerConsole({courses,summary,university,stages,byCourse,writesEnabled}:{courses:Course[];summary:Stats;university:Group[];stages:Group[];byCourse:{name:string;students:number}[];writesEnabled:boolean}){
 const [section,setSection]=useState<Section>("overview");
 const [courseState,courseAction,coursePending]=useActionState(createOwnerCourse,defaultState);
 const [codeState,codeAction,codePending]=useActionState(issueActivationCode,defaultState);
 const [theme,setTheme]=useState<"light"|"dark">("light");
 const [period,setPeriod]=useState("annual");
 return <div className={styles.shell} data-theme={theme} data-farmakon-owner dir="rtl">
  <aside className={styles.side}>
   <div className={styles.logo}><span className={styles.mark}>F<span>•</span></span><div><strong>Farmakon</strong><small>Q7 / Owner Studio</small></div></div>
   <p className={styles.menuTitle}>إدارة المنصة</p>
   {menu.map(([id,title,icon])=><button key={id} className={styles.nav+(section===id?" "+styles.active:"")} onClick={()=>setSection(id)} aria-current={section===id?"page":undefined}><span>{icon}</span>{title}</button>)}
   <div className={styles.sideBottom}><b>حساب المالك</b><small>Google • appsmr32@gmail.com</small><Link href="/">العودة للمنصة</Link></div>
  </aside>
  <div className={styles.area}>
   <header className={styles.top}>
    <div><span className={styles.eyebrow}>Farmakon · إدارة المحتوى والاشتراكات</span><h1>{menu.find(x=>x[0]===section)?.[1]}</h1></div>
    <div className={styles.topRight}><span className={styles.status}>{writesEnabled?"وضع Staging":"الكتابة معلقة للحماية"}</span><button className={styles.outline} onClick={()=>setTheme(theme==="light"?"dark":"light")}>{theme==="light"?"☾ داكن":"☼ فاتح"}</button></div>
   </header>
   <div className={styles.content}>
    {!summary.coverage&&<div className={styles.warning} role="status">بعض الجداول أو صلاحيات القراءة لم تجهز بعد. لا تُعرض أرقام تخمينية؛ علامة «—» تعني بيانات غير متوفرة.</div>}
    {section==="overview"&&<>
     <section className={styles.hero}><div><span>COMMAND CENTER</span><h2>لوحة المالك — تحكم شامل ومنظّم</h2><p>الكورسات، المعاينات المجانية، أكواد التفعيل، الاشتراكات ومتابعة الطلبة. البيانات الحقيقية تظهر عند تهيئة Staging.</p></div><button onClick={()=>setSection("courses")}>+ إنشاء كورس جديد</button></section>
     <div className={styles.statGrid}>
      {([["الطلاب",summary.students,"◫"],["الكورسات",summary.courses,"▣"],["الاشتراكات النشطة",summary.enrollments,"◇"],["جامعات مسجلة",summary.coverage?university.length:null,"⌂"]] as const).map(([t,n,icon])=><div className={styles.metric} key={t}><span className={styles.metricIcon}>{icon}</span><small>{t}</small><strong>{n===null?"—":n.toLocaleString("ar-IQ")}</strong></div>)}
     </div>
     <div className={styles.columns}>
      <article className={styles.panel}><h3>آخر الكورسات</h3>{courses.length?courses.slice(0,6).map(c=><div className={styles.line} key={c.id}><span>◈</span><div><b>{c.title}</b><small>{c.slug}</small></div><em>{c.status==="published"?"منشور":"مسودة"}</em></div>):<p className={styles.empty}>لا توجد كورسات متاحة للعرض حتى الآن.</p>}</article>
      <article className={styles.panel}><h3>توزيع الطلاب حسب الجامعة</h3>{university.length?university.slice(0,6).map(([name,n])=><div className={styles.barrow} key={name}><span>{name}</span><b>{n}</b><i style={{width:`${Math.max(5,100*n/(university[0]?.[1]||1))}%`}}/></div>):<p className={styles.empty}>لا توجد بيانات جامعات متاحة بعد.</p>}</article>
     </div>
    </>}
    {section==="courses"&&<div className={styles.columns}>
      <section className={styles.panel}><h3>إنشاء كورس احترافي</h3><p className={styles.sub}>كل كورس يبدأ كمسودة؛ يمكن تحديد عدد المحاضرات المجانية قبل الاشتراك.</p>
       <form action={courseAction} className={styles.form}>
        <label>عنوان الكورس<input name="title" placeholder="مثال: علم الأدوية — المرحلة الثالثة" minLength={3} maxLength={180} required/></label>
        <label>رابط الكورس (لاتيني)<input dir="ltr" name="slug" placeholder="pharmacology-stage-3" pattern="[a-z0-9]+(-[a-z0-9]+)*" required/></label>
        <label>وصف الكورس<textarea name="description" placeholder="الأهداف، محاور الكورس، المدرس، والملفات المتاحة"/></label>
        <div className={styles.twocol}><label>السعر بالدينار العراقي<input name="price_iqd" type="number" min={0} defaultValue={0}/></label><label>عدد الدروس المجانية<input name="free_preview_limit" type="number" min={0} max={1000} defaultValue={2}/></label></div>
        <label>صورة غلاف الكورس<input name="cover" type="file" accept="image/png,image/jpeg,image/webp"/><small>JPG، PNG أو WebP بحد أقصى 3 MB</small></label>
        <button type="submit" disabled={coursePending||!writesEnabled}>{coursePending?"جارٍ الحفظ…":"حفظ الكورس كمسودة"}</button>
        {courseState.message&&<p role="status" className={courseState.ok?styles.success:styles.warnText}>{courseState.message}</p>}
        {!writesEnabled&&<p className={styles.warnText}>الحفظ غير مفعّل حتى اختبار قاعدة Staging وإعداد جدول الصلاحيات.</p>}
       </form>
      </section>
      <section className={styles.panel}><h3>قائمة الكورسات</h3><p className={styles.sub}>تنظيم حسب المادة والوحدات والمستوى والاشتراك.</p>{courses.length?courses.map(c=><div className={styles.line} key={c.id}><span>▣</span><div><b>{c.title}</b><small>{c.status} • {c.free_preview_limit??0} دروس مجانية • {c.price_iqd??0} د.ع</small></div></div>):<p className={styles.empty}>لا توجد كورسات منشأة بعد.</p>}</section>
    </div>}
    {section==="access"&&<div className={styles.columns}>
      <section className={styles.panel}><h3>إنشاء كود تفعيل فريد</h3><p className={styles.sub}>الكود مرتبط بكورس واحد ويُستخدم مرة واحدة؛ يُحفظ في قاعدة البيانات كبصمة تشفيرية وليس كنص مكشوف.</p>
       <form action={codeAction} className={styles.form}>
        <label>اختر الكورس<select name="course_id" required defaultValue=""><option value="" disabled>حدد الكورس</option>{courses.map(c=><option value={c.id} key={c.id}>{c.title}</option>)}</select></label>
        <label>مدة الاشتراك<select name="period_type" value={period} onChange={e=>setPeriod(e.target.value)}><option value="annual">سنوي — 365 يوماً</option><option value="lifetime">مدى الحياة</option><option value="custom">عدد أيام مخصص</option></select></label>
        {period==="custom"&&<label>عدد الأيام<input name="custom_days" type="number" min={1} max={36500} required/></label>}
        <button type="submit" disabled={codePending||!writesEnabled||courses.length===0}>{codePending?"جارٍ الإنشاء…":"إنشاء كود التفعيل"}</button>
        {codeState.message&&<p role="status" className={codeState.ok?styles.success:styles.warnText}>{codeState.message}</p>}
        {codeState.ok&&codeState.code&&<div className={styles.secret}><b dir="ltr">{codeState.code}</b><button type="button" onClick={()=>navigator.clipboard.writeText(codeState.code!)}>نسخ</button></div>}
       </form>
      </section>
      <section className={styles.panel}><h3>قواعد الوصول</h3><p className={styles.sub}>عند انتهاء الكود تُقفل المحاضرات المدفوعة تلقائياً، وتبقى المعاينات المجانية المنشورة متاحة. لا يسمح بالتجاوز عبر الواجهة.</p>
       <div className={styles.note}>قفل الفيديو الحقيقي يعتمد على سياسات RLS وعلى إصدار رابط مشاهدة قصير العمر بعد التأكد من اشتراك الطالب. لا يكفي إخفاء زر التشغيل.</div>
      </section>
    </div>}
    {section==="analytics"&&<div className={styles.columns}>
     <article className={styles.panel}><h3>الطلاب حسب الجامعة</h3>{university.length?university.map(([k,n])=><div className={styles.line} key={k}><b>{k}</b><strong>{n}</strong></div>):<p className={styles.empty}>لا توجد بيانات.</p>}</article>
     <article className={styles.panel}><h3>الطلاب حسب المرحلة</h3>{stages.length?stages.map(([k,n])=><div className={styles.line} key={k}><b>المرحلة {k}</b><strong>{n}</strong></div>):<p className={styles.empty}>لا توجد بيانات.</p>}</article>
     <article className={styles.panel}><h3>المشتركون حسب الكورس</h3>{byCourse.length?byCourse.map(c=><div className={styles.line} key={c.name}><b>{c.name}</b><strong>{c.students}</strong></div>):<p className={styles.empty}>لا توجد بيانات.</p>}</article>
    </div>}
    {section==="videos"&&<div className={styles.columns}>
     <article className={styles.panel}><h3>مركز رفع ومعالجة الفيديو</h3><p className={styles.sub}>المخطط المعتمد: تحميل قابل للاستئناف، تحويل للجودات المتوفرة، صور معاينة زمنية، ترجمة VTT، فصول، ثم نشر بعد الفحص.</p>
      <div className={styles.uploadPlaceholder}>▤<b>رفع الفيديوهات قيد ربط خدمة التخزين والمعالجة</b><small>لا يتم قبول رفع فيديو قبل تهيئة الصلاحيات والحجم والتخزين الآمن.</small></div>
     </article>
     <article className={styles.panel}><h3>سياسة العرض</h3><p>القنوات: Auto / 360p / 480p / 720p / 1080p حسب ملفات الفيديو الموجودة.</p><p>زائر بلا اشتراك: فقط الدروس المجانية. مشترك: الدروس المصرّح بها حتى انتهاء اشتراكه.</p><div className={styles.note}>إعداد عدد الدروس المجانية يتم في إنشاء الكورس. يجب تطبيقه خادمياً أيضاً في كل طلب فيديو.</div></article>
    </div>}
    {section==="settings"&&<div className={styles.columns}>
      <article className={styles.panel}><h3>صلاحيات المالك</h3><p>الدخول بحساب Google المحدد، ثم منحة q7_owner_grants. لا تُقرأ الصلاحية من بيانات ملف قابل للتعديل.</p><p>عمليات الكتابة لا تفعل إلا في Staging بعد اختبارات RLS.</p></article>
      <article className={styles.panel}><h3>أقسام لوحة المالك المخطط لها</h3><p>إدارة المدرسين، الجامعات، المراحل، الاشتراكات، الأكواد، التقارير، الحالات السريرية، الأسئلة الوزارية، شكاوى المستخدمين، السجلات، النسخ الاحتياطي والإشعارات.</p></article>
    </div>}
   </main>
  </div>
  <nav className={styles.mobileNav} aria-label="تنقل الإدارة">{menu.slice(0,5).map(([id,title,icon])=><button key={id} onClick={()=>setSection(id)} aria-current={section===id?"page":undefined}><b>{icon}</b><small>{title.split(" ")[0]}</small></button>)}</nav>
 </div>;
}
