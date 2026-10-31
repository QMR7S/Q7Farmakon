"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "./Icon";
import { usePreferences } from "./Preferences";
import { destinations } from "@/lib/platform/navigation";
export default function Shell({
  children,
  signedIn,
  configured,
}: {
  children: React.ReactNode;
  signedIn: boolean;
  configured: boolean;
}) {
  const path = usePathname();
  const { locale, theme, setLocale, setTheme, tr } = usePreferences();
  const [collapsed, setCollapsed] = useState(false);
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  const auth =
    path === "/login" || path === "/signup" || path === "/owner/login";
  const owner = path === "/owner" || path === "/owner-review";
  const selectedPath = path.startsWith("/lessons/") ? "/learn" : path.startsWith("/courses/") ? "/my-courses" : path;
  const active = destinations.find((d) => d[0] === selectedPath);
  const label = active
    ? active[locale === "ar" ? 1 : 2]
    : tr("Farmakon", "Farmakon");
  const nav = (items: (typeof destinations)[number][]) =>
    items.map(([href, ar, en, icon]) => (
      <Link
        key={href}
        href={href}
        className={"q-nav " + (selectedPath === href ? "selected" : "")}
        aria-current={selectedPath === href ? "page" : undefined}
        aria-label={tr(ar, en)}
        title={tr(ar, en)}
      >
        <Icon name={icon} />
        <span>{tr(ar, en)}</span>
      </Link>
    ));
  if (path === "/review") return children;
  return (
    <div
      className={`q-app ${collapsed ? "is-collapsed" : ""} ${auth ? "auth-layout" : ""} ${owner ? "owner-layout" : ""}`}
    >
      {!auth && !owner && (
        <aside className="q-sidebar">
          <Link className="q-brand" href="/">
            <span className="q-mark" aria-hidden="true"><Icon name="pharmacy" size={25} /></span>
            <span className="q-brand-label">
              Farmakon<small>LEARN. CONNECT. GROW.</small>
            </span>
          </Link>
          <p className="q-nav-label">
            {tr("مساحتك الدراسية", "YOUR STUDY SPACE")}
          </p>
          <nav aria-label={tr("التنقل الرئيسي", "Main navigation")}>
            {nav(destinations.slice(0, 4))}
          </nav>
          <p className="q-nav-label">
            {tr("تعلّم بعمق", "EXPLORE & PRACTICE")}
          </p>
          <nav aria-label={tr("التدريب والتطبيق", "Practice and apply")}>{nav(destinations.slice(5, 9))}</nav>
          <p className="q-nav-label">{tr("أدواتي الدراسية", "MY STUDY TOOLS")}</p>
          <nav aria-label={tr("أدوات الطالب", "Student tools")}>{nav(destinations.slice(9, 14))}</nav>
          <div className="q-side-end">
            <Link className="q-nav" href="/settings">
              <Icon name="settings" />
              <span>{tr("الإعدادات", "Settings")}</span>
            </Link>
            <Link className="q-nav" href="/help">
              <Icon name="help" />
              <span>{tr("مركز المساعدة", "Help center")}</span>
            </Link>
            <button
              className="q-nav"
              onClick={() => setCollapsed(!collapsed)}
              type="button"
              aria-pressed={collapsed}
              aria-label={collapsed ? tr("توسيع القائمة", "Expand sidebar") : tr("طي القائمة", "Collapse sidebar")}
            >
              <Icon name="collapse" />
              <span>{tr("طي القائمة", "Collapse sidebar")}</span>
            </button>
            <div className="q-side-note">
              <Icon name="shield" />
              <span>
                {tr(
                  "خطوتك التالية تبدأ من هنا.",
                  "Your next step starts here.",
                )}
              </span>
            </div>
          </div>
        </aside>
      )}
      <div className="q-main">
        <header className="q-header">
          {auth || owner ? (
            <Link className="q-brand" href="/">
              <span className="q-mark" aria-hidden="true"><Icon name="pharmacy" size={25} /></span>
              <span>Farmakon</span>
            </Link>
          ) : (
            <div className="q-breadcrumb">
              Farmakon <span>/</span> <b>{label}</b>
            </div>
          )}
          {!auth && !owner && (
            <Link href="/search" className="q-search">
              <Icon name="search" />
              <span>
                {tr(
                  "ابحث عن كورس، محاضرة أو موضوع…",
                  "Search courses, lectures, topics…",
                )}
              </span>
              <kbd>⌕</kbd>
            </Link>
          )}
          <div className="q-header-actions">
            <button
              className="q-icon-button q-language"
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
              aria-label={tr("Switch to English", "التبديل للعربية")}
            >
              {locale === "ar" ? "EN" : "ع"}
            </button>
            <button
              className="q-icon-button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label={tr("تبديل المظهر", "Switch theme")}
            >
              <Icon name={theme === "light" ? "moon" : "sun"} />
            </button>
            {!auth && (
              <>
                <Link
                  className="q-icon-button"
                  href="/notifications"
                  aria-label={tr("الإشعارات", "Notifications")}
                >
                  <Icon name="bell" />
                </Link>
                <Link
                  href={signedIn ? "/settings" : "/login"}
                  className="q-avatar"
                  aria-label={tr("حسابي", "My account")}
                >
                  <Icon name="user" size={19} />
                </Link>
              </>
            )}
          </div>
        </header>
        {!configured && (
          <div className="q-environment">
            <span className="q-dot" />
            {tr(
              "معاينة تطوير • الحسابات والمحتوى بانتظار ربط بيئة اختبار معزولة",
              "Development preview • Accounts and content await isolated staging",
            )}
            <Link href="/review">{tr("مراجعة الشاشات", "Screen review")}</Link>
          </div>
        )}
        {!online && (
          <div className="q-offline" role="status">
            {tr(
              "أنت دون اتصال. المحتوى المحمي غير متاح دون ترخيص تنزيل صالح.",
              "You are offline. Protected media requires a valid download licence.",
            )}
          </div>
        )}
        <main
          id="main-content"
          className={
            auth ? "q-auth-main" : owner ? "q-owner-main" : "q-content"
          }
        >
          {children}
        </main>
        {!owner && !auth && (
          <footer className="q-footer">
            <span>Farmakon Q7</span>
            <span>
              {tr("مساحة واحدة، لتعلّم أعمق.", "One space. Deeper learning.")}
            </span>
            <Link href="/privacy">{tr("الخصوصية", "Privacy")}</Link>
          </footer>
        )}
      </div>
      {!auth && !owner && (
        <nav
          className="q-dock"
          aria-label={tr("تنقل الهاتف", "Mobile navigation")}
        >
          {nav(destinations.slice(0, 5))}
        </nav>
      )}
    </div>
  );
}
