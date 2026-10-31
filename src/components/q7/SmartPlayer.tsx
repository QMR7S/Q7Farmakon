"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./SmartPlayer.module.css";

export type QualitySource={label:string;src:string;mime?:string};
export type SubtitleSource={lang:"ar"|"en"|string;label:string;src:string};
export default function SmartPlayer({
 title, sources, subtitles=[], poster, previewSrc,
}:{
 title:string;sources:QualitySource[];subtitles?:SubtitleSource[];poster?:string;previewSrc?:string;
}){
 const video=useRef<HTMLVideoElement>(null);
 const hoverVideo=useRef<HTMLVideoElement>(null);
 const box=useRef<HTMLDivElement>(null);
 const [quality,setQuality]=useState(sources[0]?.label??"Auto");
 const [speed,setSpeed]=useState(1);
 const [playing,setPlaying]=useState(false);
 const [time,setTime]=useState(0);
 const [duration,setDuration]=useState(0);
 const [menu,setMenu]=useState(false);
 const [captions,setCaptions]=useState("off");
 const [muted,setMuted]=useState(false);
 const [hover,setHover]=useState<{x:number;t:number}|null>(null);
 const [error,setError]=useState("");
 const [controlsVisible,setControlsVisible]=useState(true);
 const [skipBy,setSkipBy]=useState(10);
 const hideTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 function reveal(){setControlsVisible(true);if(hideTimer.current)clearTimeout(hideTimer.current);hideTimer.current=setTimeout(()=>setControlsVisible(false),2500);}
 useEffect(()=>()=>{if(hideTimer.current)clearTimeout(hideTimer.current)},[]);
 const current=sources.find(x=>x.label===quality)??sources[0];
 const format=(seconds:number)=>`${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(Math.floor(seconds%60)).padStart(2,"0")}`;
 useEffect(()=>{const v=video.current;if(v)v.playbackRate=speed;},[speed]);
 useEffect(()=>{const v=video.current;if(v&&v.readyState>=1)setDuration(v.duration);},[current?.src]);
 useEffect(()=>{const v=video.current;if(!v)return;
  const tracks=Array.from(v.textTracks);
  tracks.forEach(track=>{track.mode=captions!=="off"&&track.language===captions?"showing":"disabled";});
 },[captions,quality,subtitles]);
 useEffect(()=>{const onEscape=(e:KeyboardEvent)=>{if(e.key==="Escape")setMenu(false);};
  document.addEventListener("keydown",onEscape);return()=>document.removeEventListener("keydown",onEscape)},[]);
 async function toggle(){
  const v=video.current;if(!v||!current)return;
  try{if(v.paused)await v.play();else v.pause();setError("");}
  catch{setError("تعذر تشغيل الملف. تحقق من عنوان الفيديو وصلاحية الوصول.");}
 }
 function skip(seconds:number){const v=video.current;if(v&&Number.isFinite(v.duration))v.currentTime=Math.max(0,Math.min(v.duration,v.currentTime+seconds));}
 function changeQuality(label:string){
  const v=video.current;if(!v||label===quality)return;
  const next=sources.find(s=>s.label===label);
  if(!next)return;
  const oldTime=v.currentTime,wasPlaying=!v.paused;
  setQuality(label);setMenu(false);
  v.pause();v.src=next.src;v.load();
  v.addEventListener("loadedmetadata",()=>{
    v.currentTime=Math.min(oldTime,v.duration||oldTime);
    v.playbackRate=speed;if(wasPlaying)void v.play().catch(()=>setError("تعذر استئناف الفيديو بعد تغيير الجودة."));
  },{once:true});
 }
 function preview(e:React.PointerEvent<HTMLInputElement>){
  const v=video.current,track=e.currentTarget;
  if(!v?.duration||!Number.isFinite(v.duration))return;
  const bounds=track.getBoundingClientRect();
  const ratio=Math.max(0,Math.min(1,(e.clientX-bounds.left)/bounds.width));
  const t=ratio*v.duration;
  setHover({x:Math.max(65,Math.min(bounds.width-65,e.clientX-bounds.left)),t});
  if(hoverVideo.current&&Math.abs(hoverVideo.current.currentTime-t)>.3)hoverVideo.current.currentTime=t;
 }
 async function fullscreen(){const el=box.current;if(!el)return;
  try{if(document.fullscreenElement)await document.exitFullscreen();else await el.requestFullscreen();}
  catch{setError("وضع ملء الشاشة غير مدعوم في هذا المتصفح.");}
 }
 async function pip(){const v=video.current;if(!v)return;
  try{if(document.pictureInPictureElement)await document.exitPictureInPicture();else if(document.pictureInPictureEnabled)await v.requestPictureInPicture();}
  catch{setError("صورة داخل صورة غير متاحة على هذا الجهاز.");}
 }
 return <div className={styles.wrap}>
  <div className={styles.player} ref={box} tabIndex={0} role="region" aria-label={title}
   onPointerMove={reveal} onFocusCapture={reveal}
   onKeyDown={e=>{if(e.target!==e.currentTarget)return;
    if(e.key===" "||e.key.toLowerCase()==="k"){e.preventDefault();void toggle();}
    if(e.key==="ArrowLeft"){e.preventDefault();skip(-skipBy);}
    if(e.key==="ArrowRight"){e.preventDefault();skip(skipBy);}
    if(e.key.toLowerCase()==="f")void fullscreen();reveal();}}
 onPointerDown={(e)=>{if(menu&&!((e.target as HTMLElement).closest("[data-player-menu]")))setMenu(false);}}>
   <div className={styles.title}>{title}</div>
   <video ref={video} className={styles.video} playsInline preload="metadata" poster={poster} src={current?.src}
    onLoadedMetadata={e=>setDuration(e.currentTarget.duration)} onTimeUpdate={e=>setTime(e.currentTarget.currentTime)} onDurationChange={e=>setDuration(e.currentTarget.duration)}
    onPlay={()=>{setPlaying(true);reveal();}} onPause={()=>setPlaying(false)}
    onError={()=>setError("فشل تحميل الفيديو.")}
   >{subtitles.map(s=><track key={s.lang} kind="subtitles" srcLang={s.lang} label={s.label} src={s.src}/>)}</video>
   {!playing&&<button className={styles.playBig} onClick={toggle} aria-label="تشغيل الفيديو">▶</button>}
   {hover&&<div className={styles.peek} style={{left:`${hover.x}px`}} aria-hidden="true">
    {previewSrc?<video ref={hoverVideo} muted playsInline preload="metadata" src={previewSrc} onLoadedMetadata={e=>{if(hover)e.currentTarget.currentTime=hover.t}} />:poster?<img src={poster} alt=""/>:null}
    <span>{format(hover.t)}</span>
   </div>}
   <div className={`${styles.controls} ${playing&&!menu&&!controlsVisible?styles.hidden:""}`}>
    <input aria-label="شريط تقدم الفيديو" className={styles.range} type="range" min="0" max={Number.isFinite(duration)?duration:0}
      step=".1" value={Math.min(time,Number.isFinite(duration)?duration:0)}
      onPointerMove={preview} onPointerLeave={()=>setHover(null)} onChange={e=>{if(video.current)video.current.currentTime=Number(e.target.value)}}/>
    <div className={styles.row}>
     <button onClick={toggle} aria-label={playing?"إيقاف":"تشغيل"}>{playing?"Ⅱ":"▶"}</button>
     <button onClick={()=>skip(-skipBy)} aria-label={`تأخير ${skipBy} ثانية`}>↶{skipBy}</button>
     <button onClick={()=>skip(skipBy)} aria-label={`تقديم ${skipBy} ثانية`}>{skipBy}↷</button>
     <button onClick={()=>{if(video.current){video.current.muted=!video.current.muted;setMuted(video.current.muted);}}} aria-label={muted?"إلغاء الكتم":"كتم"}>{muted?"×♫":"♫"}</button>
     <time className={styles.time}>{format(time)} / {format(Number.isFinite(duration)?duration:0)}</time>
     <button className={styles.pill} data-player-menu aria-expanded={menu} onClick={()=>setMenu(!menu)} aria-label="إعدادات التشغيل">⚙</button>
     <button disabled={typeof document!=="undefined"&&!document.pictureInPictureEnabled} title="يتطلب دعماً من المتصفح" onClick={pip} aria-label="صورة داخل صورة">▣</button>
     <button onClick={fullscreen} aria-label="ملء الشاشة">⛶</button>
    </div>
   </div>
   {menu&&<div className={styles.glass} data-player-menu role="dialog" aria-label="إعدادات الفيديو">
    <header>إعدادات الفيديو <button onClick={()=>setMenu(false)} aria-label="إغلاق">✕</button></header>
    <div className={styles.setting}><b>التقديم والتأخير</b><div>{[5,10,15].map(n=><button key={n} aria-pressed={skipBy===n} onClick={()=>setSkipBy(n)}>{n}s</button>)}</div></div>
    <div className={styles.setting}><b>السرعة</b><div>{[.5,.75,1,1.25,1.5,1.75,2].map(s=><button key={s} aria-pressed={speed===s} onClick={()=>setSpeed(s)}>{s}x</button>)}</div></div>
    <div className={styles.setting}><b>الجودة</b><div>{sources.length?sources.map(s=><button key={s.label} aria-pressed={quality===s.label} onClick={()=>changeQuality(s.label)}>{s.label}</button>):<small>لا توجد جودات مرفوعة</small>}</div></div>
    <div className={styles.setting}><b>الترجمة</b><div><button aria-pressed={captions==="off"} onClick={()=>setCaptions("off")}>إيقاف</button>{subtitles.map(s=><button key={s.lang} aria-pressed={captions===s.lang} onClick={()=>setCaptions(s.lang)}>{s.label}</button>)}</div></div>
   </div>}
  </div>
  {error&&<div className={styles.error} role="alert">{error}</div>}
  <p className={styles.explain}>تظهر الجودة والترجمة فقط عند توفر ملفاتها. التنزيل خارج المشغل ويتطلب صلاحية كورس وخدمة تنزيل مشفرة ومدعومة.</p>
 </div>
}
