import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const font = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "فارماكون — منصة طلبة الصيدلة",
  description: "شرح مقررات ومواد الصيدلة، مع اختبارات وملخصات.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="ar" dir="rtl" className={font.variable}>
      <body>
        <header className="topbar">
          <div className="wrap">
            <Link href="/" className="brand">فارماكون</Link>
            <nav className="nav">
              {user ? (
                <form action="/auth/signout" method="post">
                  <button className="btn ghost" type="submit">تسجيل الخروج</button>
                </form>
              ) : (
                <>
                  <Link href="/login">تسجيل الدخول</Link>
                  <Link href="/signup" className="btn">إنشاء حساب</Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
