"use client";
import { useState } from "react";
import { destinations } from "@/lib/platform/navigation";
export default function Review() {
  const [width, setWidth] = useState(390);
  const [path, setPath] = useState("/");
  const [locale, setLocale] = useState("ar");
  const [theme, setTheme] = useState("light");
  return (
    <main className="q-review">
      <h1>Farmakon Q7 — مراجعة الشاشات الفعلية / Screen review</h1>
      <p>
        هذه صفحات المشروع الحالي. الحسابات والميديا والخدمات غير المهيأة تظهر
        بحالتها الحقيقية. ليست منصة مكتملة.
      </p>
      <div className="q-review-header">
        <label>
          الشاشة / Screen
          <select value={path} onChange={(e) => setPath(e.target.value)}>
            {[
              ...destinations,
              ["/login", "تسجيل الدخول", "Sign in"],
              ["/signup", "إنشاء حساب", "Sign up"],
              ["/owner/login", "دخول المالك", "Owner sign in"],
              [
                "/owner-review",
                "لوحة المالك — عرض قراءة فقط",
                "Owner console — read-only",
              ],
              ["/media-lab", "اختبار المشغل بملف محلي", "Local media test"],
            ].map(([url, ar, en]) => (
              <option key={url} value={url}>
                {ar} / {en}
              </option>
            ))}
          </select>
        </label>
        <label>
          العرض / Width
          <select
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          >
            {[360, 390, 768, 1024, 1440].map((w) => (
              <option key={w}>{w}</option>
            ))}
          </select>
        </label>
        <label>
          Language
          <select value={locale} onChange={(e) => setLocale(e.target.value)}>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </label>
        <label>
          Theme
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <a
          href={path}
          className="q-btn secondary"
          target="_blank"
          rel="noreferrer"
        >
          فتح الصفحة / Open page
        </a>
      </div>
      <div className="q-review-frame-wrap">
        <iframe
          key={`${path}-${locale}-${theme}`}
          title="Farmakon responsive review"
          src={`${path}?reviewLocale=${locale}&reviewTheme=${theme}`}
          style={{ width }}
        />
      </div>
    </main>
  );
}
