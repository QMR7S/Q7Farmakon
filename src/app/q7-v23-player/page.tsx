import SmartPlayer from "@/components/q7/SmartPlayer";
import Link from "next/link";
export const metadata={title:"Q7 V2.3 — Smart Player Review"};
export default function PreviewPlayerPage(){
 return <main dir="rtl" style={{maxWidth:1100,margin:"0 auto",padding:"24px 15px 100px",color:"var(--ink)"}}>
  <Link href="/q7-v21-preview" style={{color:"#2447b5"}}>← مراجعة الواجهات</Link>
  <h1 style={{fontSize:"clamp(23px,4vw,31px)"}}>Farmakon Smart Player V2.3</h1>
  <p style={{color:"var(--ink-soft)"}}>معاينة مستقلة لأزرار المشغل والقائمة الزجاجية. المقطع نمط اختبار مولّد محلياً وليس من الكورسات، ولا يظهر محتوى محمي.</p>
  <SmartPlayer title="فيديو اختبار تقني — Sample" sources={[{label:"720p",src:"/q7-qa/player-720.mp4",mime:"video/mp4"},{label:"360p",src:"/q7-qa/player-360.mp4",mime:"video/mp4"}]} subtitles={[{lang:"ar",label:"العربية",src:"/q7-qa/ar.vtt"},{lang:"en",label:"English",src:"/q7-qa/en.vtt"}]} previewSrc="/q7-qa/player-360.mp4"/>
  <section style={{marginTop:20,background:"var(--surface)",border:"1px solid #d3ddd8",borderRadius:15,padding:19}}>
   <h2>موارد المحاضرة القادمة</h2><p>ملزمة PDF • ملاحظات المدرس • ملاحظات الطالب الخاصة • Farmakon AI • الحالات السريرية • الأسئلة. لا يظهر تفريغ الكلام تحت الفيديو.</p>
  </section>
 </main>;
}