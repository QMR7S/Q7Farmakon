export const destinations = [
  ["/", "الرئيسية", "Home", "home"],
  ["/my-courses", "كورساتي", "My courses", "courses"],
  ["/learn", "التعلم", "Learn", "learn"],
  ["/library", "المكتبة", "Library", "library"],
  ["/more", "المزيد", "More", "more"],
  ["/questions", "بنك الأسئلة العام", "General questions", "questions"],
  ["/ministerial", "الأسئلة الوزارية", "Ministerial exams", "shield"],
  ["/cases", "الحالات السريرية", "Clinical cases", "cases"],
  ["/ai", "Farmakon AI", "Farmakon AI", "ai"],
  ["/notes", "ملاحظاتي", "My notes", "notes"],
  ["/saved", "المحفوظات", "Saved", "bookmark"],
  ["/downloads", "التنزيلات", "Downloads", "download"],
  ["/plan", "خطة الدراسة", "Study plan", "plan"],
  ["/analytics", "إحصائياتي", "My analytics", "stats"],
  ["/subscriptions", "الاشتراكات", "Subscriptions", "lock"],
  ["/notifications", "الإشعارات", "Notifications", "bell"],
  ["/settings", "الإعدادات", "Settings", "settings"],
  ["/help", "المساعدة", "Help", "help"],
  ["/install", "تثبيت التطبيق", "Install app", "download"],
] as const;
export type CourseCard = {
  id: string;
  slug: string;
  title: string;
  price_iqd: number | null;
};
