export const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export type LearningKind="notes"|"progress";
export type LearningState={revision:number;video_second:number;pdf_page:number;text?:string};
export function parseLearningState(kind:LearningKind,value:unknown):LearningState|null{
 if(!value||typeof value!=="object"||Array.isArray(value))return null;
 const x=value as Record<string,unknown>;
 if(Object.keys(x).some(k=>!["revision","video_second","pdf_page",...(kind==="notes"?["text"]:[])].includes(k)))return null;
 if(typeof x.revision!=="number"||!Number.isSafeInteger(x.revision)||x.revision<0||x.revision>2147483646)return null;
 if(typeof x.video_second!=="number"||!Number.isFinite(x.video_second)||x.video_second<0||x.video_second>604800)return null;
 if(typeof x.pdf_page!=="number"||!Number.isSafeInteger(x.pdf_page)||x.pdf_page<1||x.pdf_page>100000)return null;
 if(kind==="notes"&&(typeof x.text!=="string"||x.text.length>50000))return null;
 return {revision:x.revision,video_second:x.video_second,pdf_page:x.pdf_page,...(kind==="notes"?{text:x.text as string}:{})};
}
export function matchesQ7Database(url:string|undefined,expected:string|undefined):boolean{
 if(!url||!expected||!/^[a-z]{20}$/.test(expected))return false;
 try{const u=new URL(url);return u.protocol==="https:"&&u.hostname===`${expected}.supabase.co`&&u.port==="";}catch{return false;}
}
