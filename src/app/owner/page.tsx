import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwnerAccess } from "@/lib/owner/access";
import OwnerConsole from "./OwnerConsole";
import styles from "./owner.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "لوحة مالك فارماكون | Q7" };

type Course = { id: string; title: string; slug: string; status: string; free_preview_limit: number | null; price_iqd: number | null; cover_path: string | null };
type Student = { user_id: string; university: string | null; stage: number | null };
type Enrollment = { course_id: string; user_id: string; expires_at: string | null; status?: string | null };
async function getAll<T>(fetchPage:(from:number,to:number)=>Promise<{data:T[] | null;error:unknown}>):Promise<{rows:T[];complete:boolean}> {
  const rows:T[]=[];
  for(let i=0;i<20;i++){
    const {data,error}=await fetchPage(i*500,i*500+499);
    if(error)return {rows:[],complete:false};
    rows.push(...(data||[]));
    if(!data || data.length<500)return {rows,complete:true};
  }
  return {rows,complete:false};
}

export default async function OwnerPage() {
 const access=await getOwnerAccess();
 if(access.state==="signed-out")redirect("/owner/login");
 if(access.state==="forbidden")return <div className={styles.denied} dir="rtl"><h1>الدخول غير مسموح</h1><p>هذه المنطقة لحساب المالك المعتمد عبر Google فقط.</p><Link href="/owner/login">الدخول بحساب Google</Link></div>;
 if(access.state==="not-provisioned")return <div className={styles.denied} dir="rtl">
   <h1>يلزم اعتماد صلاحية المالك</h1>
   <p>تم التحقق من بريد Google، لكن منحة المالك لم تُضف إلى جدول q7_owner_grants. هذا إجراء أمني متعمّد وليس عطلاً.</p>
   <p>بعد تطبيق ترحيل قاعدة Staging ومراجعة حساب Google، تُضاف هوية المستخدم إلى جدول المنح عبر مسؤول قواعد البيانات، دون السماح بالتعيين الذاتي.</p>
   <Link href="/">العودة للرئيسية</Link>
 </div>;
 const s=access.supabase;
 const [courses, students, enrollments] = await Promise.all([
   getAll<Course>(async(a,b)=>{const r=await s.from("courses").select("id,title,slug,status,free_preview_limit,price_iqd,cover_path").order("created_at",{ascending:false}).range(a,b);return {data:r.data,error:r.error};}),
   getAll<Student>(async(a,b)=>{const r=await s.from("q7_student_academic_profiles").select("user_id,university,stage").range(a,b);return {data:r.data,error:r.error};}),
   getAll<Enrollment>(async(a,b)=>{const r=await s.from("enrollments").select("user_id,course_id,expires_at,status").range(a,b);return {data:r.data,error:r.error};}),
 ]);
 const now=Date.now();
 const valid=enrollments.rows.filter(e=>(!e.status || e.status==="active") && (e.expires_at===null || Date.parse(e.expires_at)>now));
 const byUniversity=Object.entries(students.rows.reduce<Record<string,number>>((a,s)=>{const key=s.university?.trim()||"غير محددة";a[key]=(a[key]||0)+1;return a;},{})).sort((a,b)=>b[1]-a[1]);
 const byStage=Object.entries(students.rows.reduce<Record<string,number>>((a,s)=>{const key=s.stage?String(s.stage):"غير محددة";a[key]=(a[key]||0)+1;return a;},{})).sort((a,b)=>Number(a[0])-Number(b[0]));
 const byCourse=courses.rows.map(c=>({name:c.title,students:new Set(valid.filter(e=>e.course_id===c.id).map(e=>e.user_id)).size}));
 return <OwnerConsole
   courses={courses.rows}
   summary={{courses:courses.complete?courses.rows.length:null,students:students.complete?students.rows.length:null,enrollments:enrollments.complete?valid.length:null,coverage:courses.complete&&students.complete&&enrollments.complete}}
   university={students.complete?byUniversity:[]}
   stages={students.complete?byStage:[]}
   byCourse={courses.complete&&enrollments.complete?byCourse:[]}
   writesEnabled={process.env.FARMAKON_OWNER_WRITES_ENABLED==="true"&&process.env.FARMAKON_DEPLOY_ENV==="staging"}
 />;
}
