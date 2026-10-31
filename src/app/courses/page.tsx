import Link from "next/link";
import {createClient} from "@/lib/supabase/server";
import WorkspaceSection from "@/components/q7/WorkspaceSection";
export const dynamic="force-dynamic";
export default async function Courses(){
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)return <WorkspaceSection section="courses"/>;
 const supabase=await createClient();
 const {data,error}=await supabase.from("courses").select("id,slug,title,description,price_iqd").eq("status","published").order("created_at",{ascending:false});
 return <><h1>الكورسات / Courses</h1>{error?<p role="alert" className="empty">تعذر تحميل الكورسات. حاول مرة أخرى لاحقاً. / Unable to load courses.</p>:!data?.length?<p className="empty">لا توجد كورسات منشورة بعد. / No published courses yet.</p>:<div className="q7-grid">{data.map(c=><Link href={`/courses/${c.slug}`} key={c.id} className="q7-panel"><h2>{c.title}</h2><p>{c.description}</p><b>{c.price_iqd===0?"مجاني / Free":`${c.price_iqd} IQD`}</b></Link>)}</div>}</>;
}
