import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createUserClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Server-side playback entitlement: no direct public link to protected lesson media. */
export async function GET(_request: NextRequest, context:{params:Promise<{id:string}>}){
 const noStore={"Cache-Control":"private, no-store"};
 const {id}=await context.params;
 if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"Invalid lesson"},{status:400,headers:noStore});
 const supabase=await createUserClient();
 const {data:lesson,error:lessonError}=await supabase.from("lessons")
  .select("id,course_id,unit_id,position,status,video_path")
  .eq("id",id).eq("status","published").maybeSingle();
 if(lessonError||!lesson||!lesson.video_path)return NextResponse.json({error:"Media unavailable"},{status:404,headers:noStore});
 // Never accept a path or bucket from a client. The server reads it from DB only.
 if(typeof lesson.video_path!=="string"||lesson.video_path.includes("..")||!lesson.video_path.startsWith("courses/"))
  return NextResponse.json({error:"Invalid media reference"},{status:500,headers:noStore});
 const {data:course}=await supabase.from("courses")
  .select("id,status,free_preview_limit").eq("id",lesson.course_id).eq("status","published").maybeSingle();
 if(!course)return NextResponse.json({error:"Course unavailable"},{status:404,headers:noStore});
 const limit=Math.max(0,Math.min(1000,Number(course.free_preview_limit||0)));
 let free=false;
 if(limit>0){
  const [{data:allLessons,error:lError},{data:units,error:uError}]=await Promise.all([
   supabase.from("lessons").select("id,unit_id,position").eq("course_id",lesson.course_id).eq("status","published"),
   supabase.from("units").select("id,position").eq("course_id",lesson.course_id),
  ]);
  if(lError||uError)return NextResponse.json({error:"Preview configuration unavailable"},{status:503,headers:noStore});
  const up=new Map((units||[]).map(x=>[x.id,Number(x.position??0)]));
  const ordered=[...(allLessons||[])].sort((a,b)=>
    (up.get(a.unit_id)??0)-(up.get(b.unit_id)??0) ||
    Number(a.position??0)-Number(b.position??0) || a.id.localeCompare(b.id));
  free=ordered.slice(0,limit).some(x=>x.id===id);
 }
 let entitled=false;
 if(!free){
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Subscription required"},{status:403,headers:noStore});
  const now=new Date().toISOString();
  const {data:active,error}=await supabase.from("enrollments").select("id").eq("user_id",user.id)
   .eq("course_id",lesson.course_id).eq("status","active")
   .or(`expires_at.is.null,expires_at.gt.${now}`).limit(1);
  if(error)return NextResponse.json({error:"Entitlement service unavailable"},{status:503,headers:noStore});
  entitled=!!active?.length;
  if(!entitled)return NextResponse.json({error:"Subscription expired or missing"},{status:403,headers:noStore});
 }
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!secret||process.env.VERCEL_ENV==="production"&&process.env.FARMAKON_MEDIA_PRODUCTION_APPROVED!=="true")
  return NextResponse.json({error:"Playback gateway not configured"},{status:503,headers:noStore});
 const storage=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await storage.storage.from("course-videos").createSignedUrl(lesson.video_path,90);
 if(error||!data?.signedUrl)return NextResponse.json({error:"Media signing failed"},{status:503,headers:noStore});
 return NextResponse.json({url:data.signedUrl,expiresIn:90,freePreview:free},{headers:noStore});
}
