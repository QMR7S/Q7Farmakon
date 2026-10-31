import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Preferences } from "@/components/platform/Preferences";
import Shell from "@/components/platform/Shell";
import "./globals.css";
import "./platform.css";
import "./v3.css";
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
