import type { Metadata } from "next";
import AppShell from "@/components/q7/AppShell";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "./globals.css";



export const metadata: Metadata = {
  title: "فارماكون — منصة طلبة الصيدلة",
  description: "شرح مقررات ومواد الصيدلة، مع اختبارات وملخصات.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ar" dir="rtl"><body><AppShell>{children}</AppShell></body></html>;
}
