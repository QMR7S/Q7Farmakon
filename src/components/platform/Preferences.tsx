"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
export type Locale = "ar" | "en";
type Prefs = {
  locale: Locale;
  theme: "light" | "dark";
  setLocale: (l: Locale) => void;
  setTheme: (t: "light" | "dark") => void;
  tr: (ar: string, en: string) => string;
};
const Context = createContext<Prefs>({
  locale: "ar",
  theme: "light",
  setLocale: () => {},
  setTheme: () => {},
  tr: (a) => a,
});
export function Preferences({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ar");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const q = new URLSearchParams(location.search);
      setLocale(
        (q.get("reviewLocale") ?? localStorage.getItem("q7:locale")) === "en"
          ? "en"
          : "ar",
      );
      setTheme(
        (q.get("reviewTheme") ?? localStorage.getItem("q7:theme") ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark"
          ? "dark"
          : "light",
      );
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.dataset.theme = theme;
    if (ready)
      try {
        localStorage.setItem("q7:locale", locale);
        localStorage.setItem("q7:theme", theme);
      } catch {}
  }, [locale, theme, ready]);
  const tr = useCallback(
    (ar: string, en: string) => (locale === "ar" ? ar : en),
    [locale],
  );
  return (
    <Context.Provider value={{ locale, theme, setLocale, setTheme, tr }}>
      {children}
    </Context.Provider>
  );
}
export const usePreferences = () => useContext(Context);
