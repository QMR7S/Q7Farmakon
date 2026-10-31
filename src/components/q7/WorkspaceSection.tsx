"use client";
import Link from "next/link";
import {usePreferences,sections,Icon} from "./AppShell";
export default function WorkspaceSection({section}:{section:string}){
 const {tr}=usePreferences();const item=sections.find(s=>s[0]===`/${section}`);
 const messages:Record<string,[string,string]>={
 courses:["تظهر كورسات حسابك بعد تسجيل الدخول وربط بيئة البيانات.","Your courses appear after signing in and connecting the data environment."],
 learn:["اختر محاضرة من كورساتك لمتابعة الفيديو والملزمة والملاحظات.","Choose a lecture from your courses to view its video, PDF and notes."],
 questions:["لم يُربط محتوى بنك الأسئلة بعد. لا توجد محاولات أو نتائج مسجلة هنا.","Question content is not connected yet. No attempts or scores are recorded here."],
 ministerial:["تُتاح الأسئلة بعد توثيق الجهة والسنة والدور والمصدر وحقوق النشر.","Questions become available after verifying authority, year, round, source and rights."],
 cases:["تظهر الحالات المصنفة بعد المراجعة العلمية وربط المحتوى.","Classified cases appear after scientific review and content integration."],
 ai:["المساعد غير متصل بمزود أو مصادر مخوّلة بعد. لا تُرسل ملفاتك من هذه الصفحة.","The assistant has no provider or authorized sources connected yet. This page does not send your files."],
 downloads:["تنزيل الفيديو المحمي غير متاح بعد. يلزم ربط التخزين والتراخيص واختبار التشغيل دون اتصال.","Protected video downloads are not available yet. Storage, licensing and offline playback must be integrated and tested."],
 notifications:["خدمة الإشعارات غير متصلة بعد؛ لا توجد إشعارات تجريبية.","Notifications are not connected yet; no sample notifications are shown."],
 library:["لم تُربط الملفات المخوّلة بعد. لا تُعرض مراجع خاصة أو روابط عامة بديلة.","Authorized files are not connected yet. Private references are not exposed."],
 settings:["يمكنك تغيير اللغة والمظهر من شريط الصفحة. تُحفظ التفضيلات على هذا الجهاز فقط؛ إدارة الحساب والجلسات تحتاج اتصالاً آمناً.","Change language and theme in the page header. Preferences are saved on this device only; account and session management require a secure connection."]};
 return <><p className="eyebrow">FARMAKON / {section.toUpperCase()}</p><h1>{item?tr(item[1],item[2]):tr("الإشعارات","Notifications")}</h1>{section==="more"?<div className="q7-grid">{sections.slice(5).map(([href,ar,en,icon])=><Link className="q7-panel" href={href} key={href}><Icon name={icon}/><h2>{tr(ar,en)}</h2></Link>)}</div>:<>
 {section==="library"&&<div className="q7-grid">{["Materials","Sources","Questions","Cases"].map(x=><section className="q7-panel" key={x}><Icon name="library"/><h2>{x}</h2><p>{tr("لا توجد ملفات متاحة للعرض.","No files available to display.")}</p></section>)}</div>}
 <section className="q7-panel"><Icon name={item?.[3]??"more"}/><p role="status">{messages[section]?tr(...messages[section]):""}</p><div className="q7-tools"><Link href="/">{tr("الرئيسية","Home")}</Link>{section==="courses"&&<Link href="/login">{tr("تسجيل الدخول","Sign in")}</Link>}{section==="learn"&&<Link href="/q7-v23-player">{tr("اختبار تقني للمشغل — فيديو عينة","Technical player review — sample video")}</Link>}</div></section></>}</>;
}
