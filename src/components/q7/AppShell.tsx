"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {createContext,useContext,useEffect,useState} from "react";
const Preferences=createContext({locale:"ar",tr:(ar:string,en:string)=>ar});
export const usePreferences=()=>useContext(Preferences);
export const sections=[
 ["/","الرئيسية","Home","home"],["/courses","كورساتي","Courses","courses"],["/learn","التعلم","Learn","learn"],["/library","المكتبة","Library","library"],["/more","المزيد","More","more"],
 ["/questions","بنك الأسئلة","Question bank","questions"],["/ministerial","الأسئلة الوزارية","Ministerial bank","questions"],["/cases","الحالات السريرية","Clinical cases","cases"],["/ai","Farmakon AI","Farmakon AI","ai"],["/downloads","التنزيلات","Downloads","download"],["/settings","الإعدادات","Settings","settings"]
] as const;
const paths:Record<string,string>={home:"m3 10 9-7 9 7v11h-6v-7H9v7H3z",courses:"M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3z M12 6v16",learn:"m8 4 13 8-13 8z",library:"M3 3h5v18H3z M10 3h4v18h-4z M16 4l4-1 4 17-4 1z",more:"M4 5h16 M4 12h16 M4 19h16",questions:"M9 8a3 3 0 1 1 6 0c0 3-3 2-3 6 M12 18v1 M3 3h18v18H3z",cases:"M8 6V3h8v3 M3 6h18v15H3z M9 13h6 M12 10v6",ai:"m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z",download:"M12 3v12 m-5-5 5 5 5-5 M4 17v4h16v-4",bell:"M5 17h16l-2-4V9a6 6 0 0 0-12 0v4z M10 22h6",settings:"M4 5h16 M4 12h16 M4 19h16 M8 2v6 M16 9v6 M10 16v6"};
export function Icon({name}:{name:string}){return <svg viewBox="0 0 26 26" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]??paths.more}/></svg>}
export default function AppShell({children}:{children:React.ReactNode}){
 const pathname=usePathname();const [locale,setLocale]=useState("ar");const [dark,setDark]=useState(false);const [collapsed,setCollapsed]=useState(false);
 const tr=(ar:string,en:string)=>locale==="ar"?ar:en;
 useEffect(()=>{try{const q=new URLSearchParams(window.location.search);setLocale((q.get("reviewLocale")??localStorage.getItem("q7.locale.v1"))==="en"?"en":"ar");setDark((q.get("reviewTheme")??localStorage.getItem("q7.theme.v1"))==="dark");}catch{}},[]);
 useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dir=locale==="ar"?"rtl":"ltr";document.documentElement.dataset.theme=dark?"dark":"light";},[locale,dark]);
 function language(){const next=locale==="ar"?"en":"ar";setLocale(next);try{localStorage.setItem("q7.locale.v1",next)}catch{}}
 function theme(){setDark(!dark);try{localStorage.setItem("q7.theme.v1",dark?"light":"dark")}catch{}}
 if(pathname==="/review"||pathname.startsWith("/owner"))return <Preferences.Provider value={{locale,tr}}>{children}</Preferences.Provider>;
 const nav=(compact=false)=>sections.slice(0,compact?5:sections.length).map(([href,ar,en,icon])=><Link href={href} key={href} aria-current={pathname===href?"page":undefined} title={tr(ar,en)}><Icon name={icon}/><span>{tr(ar,en)}</span></Link>);
 return <Preferences.Provider value={{locale,tr}}><div className={`q7-shell ${collapsed?"collapsed":""}`}>
 <a className="skip" href="#main-content">{tr("تجاوز إلى المحتوى","Skip to content")}</a>
 <aside className="q7-side"><Link className="q7-brand" href="/"><b>F<span>•</span></b><span>Farmakon<small>LEARN · PRACTICE · GROW</small></span></Link><button className="q7-collapse" onClick={()=>setCollapsed(!collapsed)} aria-label={tr("طي القائمة","Collapse sidebar")} aria-expanded={!collapsed}>☰</button><nav aria-label={tr("التنقل الرئيسي","Main navigation")}>{nav()}</nav><Link className="q7-owner" href="/owner">{tr("دخول المالك","Owner sign in")}</Link></aside>
 <div className="q7-area"><header className="q7-top"><Link href="/" className="q7-wordmark">Farmakon <small>Q7</small></Link><div className="q7-actions"><button onClick={language} aria-label={tr("تغيير اللغة إلى الإنجليزية","Switch to Arabic")}>{locale==="ar"?"EN":"عربي"}</button><button onClick={theme} aria-label={tr("تغيير المظهر","Change theme")}>{dark?"☀":"☾"}</button><Link href="/notifications" aria-label={tr("الإشعارات","Notifications")}><Icon name="bell"/></Link><Link href="/login" className="q7-signin">{tr("دخول","Sign in")}</Link></div></header><main id="main-content" className="wrap q7-content">{children}</main></div>
 <nav className="q7-dock" aria-label={tr("التنقل السفلي","Bottom navigation")}>{nav(true)}</nav></div></Preferences.Provider>
}
