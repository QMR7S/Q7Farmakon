import {notFound} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {uuidPattern} from "@/lib/learning/state-policy";
import LectureCenter from "@/components/q7/LectureCenter";
export const dynamic="force-dynamic";
export default async function Lesson({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!uuidPattern.test(id))notFound();if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)return <p className="empty">بيئة المحاضرات غير متصلة. / Lecture environment not connected.</p>;const s=await createClient();const {data,error}=await s.from("lessons").select("id,title").eq("id",id).eq("status","published").maybeSingle();if(error)return <p className="empty">تعذر تحميل المحاضرة. / Unable to load lecture.</p>;if(!data)notFound();return <LectureCenter lessonId={id} title={data.title}/>}
