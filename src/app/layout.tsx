import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Preferences } from "@/components/platform/Preferences";
import Shell from "@/components/platform/Shell";
import "./globals.css";
import "./platform.css";
import "./internal-identity.css";
import "./glass-motion.css";
import "./auth-reference.css";
export const metadata: Metadata = {
  title: {
    default: "Farmakon — مساحتك لتعلّم الصيدلة",
    template: "%s | Farmakon",
  },
  description: "منصة تعلّم الصيدلة: الكورسات والمحاضرات والمراجع والتدريب.",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let signedIn = false;
  const configured = isSupabaseConfigured();
  if (configured) {
    try {
      const s = await createClient();
      signedIn = Boolean((await s.auth.getUser()).data.user);
    } catch {}
  }
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Inter:wght@400;500;600;700&display=swap" />
      </head>
      <body>
        <a className="q-skip" href="#main-content">
          تجاوز إلى المحتوى / Skip to content
        </a>
        <Preferences>
          <Shell signedIn={signedIn} configured={configured}>
            {children}
          </Shell>
        </Preferences>
      </body>
    </html>
  );
}
