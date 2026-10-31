import SmartPlayer from "@/components/q7/SmartPlayer";
import Link from "next/link";
export const metadata={title:"Q7 V2.3 — Smart Player Review"};
export default function PreviewPlayerPage(){
 return <main dir="rtl" style={{maxWidth:1100,margin:"0 auto",padding:"24px 15px 100px",color:"#14232b"}}>
  <Link href="/q7-v21-preview" style={{color:"#2447b5"}}>← مراجعة الواجهات</Link>
  <h1 style={{fontSize:"clamp(23px,4vw,31px)"}}>Farmakon Smart Player V2.3</h1>
  <p style={{color:"#4a5b63"}}>معاينة مستقلة لأزرار المشغل والقائمة الزجاجية. فيديو العينة عام وليس من الكورسات، ولا يظهر محتوى محمي.</p>
  <SmartPlayer title="فيديو اختبار تقني — Sample" sources={[{label:"Auto / Original",src:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",mime:"video/mp4"}]} previewSrc="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"/>
  <section style={{marginTop:20,background:"white",border:"1px solid #d3ddd8",borderRadius:15,padding:19}}>
   <h2>موارد المحاضرة القادمة</h2><p>ملزمة PDF • ملاحظات المدرس • ملاحظات الطالب الخاصة • Farmakon AI • الحالات السريرية • الأسئلة. لا يظهر تفريغ الكلام تحت الفيديو.</p>
  </section>
 </main>;
}