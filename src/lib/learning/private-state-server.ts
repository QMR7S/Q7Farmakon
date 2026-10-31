import "server-only";
import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {matchesQ7Database,parseLearningState,uuidPattern,type LearningKind} from "./state-policy";
const headers={"Cache-Control":"private, no-store","Vary":"Cookie"};
type Context={params:Promise<{lessonId:string;kind:string}>};
const json=(value:unknown,status=200)=>NextResponse.json(value,{status,headers});
function configured(){return process.env.FARMAKON_DEPLOY_ENV==="staging"&&matchesQ7Database(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.FARMAKON_Q7_DATABASE_REF)&&!!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;}
function table(kind:LearningKind){return kind==="notes"?"q7_private_notes":"q7_learning_progress";}
export async function readState(_request:NextRequest,context:Context){
 const {lessonId,kind}=await context.params;
 if(!uuidPattern.test(lessonId)||!["notes","progress"].includes(kind))return json({error:"invalid_request"},400);
 if(!configured())return json({error:"q7_staging_not_verified"},503);
 const s=await createClient();const {data:{user},error:authError}=await s.auth.getUser();
 if(authError||!user||user.is_anonymous)return json({error:"sign_in_required"},401);
 const {data,error}=await s.from(table(kind as LearningKind)).select(kind==="notes"?"text,video_second,pdf_page,revision,updated_at":"video_second,pdf_page,revision,updated_at").eq("user_id",user.id).eq("lesson_id",lessonId).maybeSingle();
 if(error)return json({error:"learning_storage_unavailable"},503);
 return json({state:data??null});
}
export async function writeState(request:NextRequest,context:Context){
 const {lessonId,kind}=await context.params;
 if(!uuidPattern.test(lessonId)||!["notes","progress"].includes(kind))return json({error:"invalid_request"},400);
 if(request.headers.get("origin")!==request.nextUrl.origin)return json({error:"origin_rejected"},403);
 if(!configured()||process.env.FARMAKON_LEARNING_WRITES_ENABLED!=="true"||process.env.VERCEL_ENV==="production")return json({error:"q7_staging_not_verified"},503);
 const s=await createClient();const {data:{user},error:authError}=await s.auth.getUser();
 if(authError||!user||user.is_anonymous)return json({error:"sign_in_required"},401);
 let body:unknown;
 try{if(Number(request.headers.get("content-length"))>210000)return json({error:"body_too_large"},413);const raw=await request.text();if(new TextEncoder().encode(raw).length>210000)return json({error:"body_too_large"},413);body=JSON.parse(raw);}catch{return json({error:"invalid_json"},400);}
 const parsed=parseLearningState(kind as LearningKind,body);if(!parsed)return json({error:"invalid_state"},400);
 // A visible, published lesson is required. No service-role client or caller-supplied UID.
 const lesson=await s.from("lessons").select("id").eq("id",lessonId).eq("status","published").maybeSingle();
 if(lesson.error)return json({error:"lesson_index_unavailable"},503);
 if(!lesson.data)return json({error:"lesson_unavailable"},403);
 const {revision,...values}=parsed;
 const q=revision===0?s.from(table(kind as LearningKind)).insert({...values,user_id:user.id,lesson_id:lessonId,revision:1}):s.from(table(kind as LearningKind)).update({...values,revision:revision+1}).eq("user_id",user.id).eq("lesson_id",lessonId).eq("revision",revision);
 const {data,error}=await q.select("revision,updated_at").maybeSingle();
 if((error?.code==="23505"||error?.code==="40001")||(!error&&!data))return json({error:"revision_conflict"},409);
 if(error)return json({error:"learning_storage_unavailable"},503);
 return json({state:data});
}
