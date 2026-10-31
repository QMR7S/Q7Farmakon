import Link from "next/link";
import HomeIntro from "@/components/q7/HomeIntro";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return <HomeIntro unconfigured/>;
  const supabase = await createClient();

  const [{ data: subjects }, { data: courses }] = await Promise.all([
    supabase.from("subjects").select("id, name_ar, academic_year, position").order("academic_year").order("position"),
    supabase.from("courses").select("id, slug, title, price_iqd").eq("status", "published").order("created_at", { ascending: false }),
  ]);

  const byYear = new Map<number, string[]>();
  (subjects ?? []).forEach((s) => {
    const y = s.academic_year ?? 0;
    byYear.set(y, [...(byYear.get(y) ?? []), s.name_ar]);
  });

  return (
    <>
      <section className="hero">
        <h1>ادرس الصيدلة بترتيب يفهمه عقلك</h1>
        <p>شرح مقررات الصيدلة مادةً بمادة، مع ملخصات واختبارات تدريبية.</p>
        <Link href="/signup" className="btn">ابدأ الآن</Link>
      </section>

      <h2 className="section">المقررات المتاحة</h2>
      {courses && courses.length > 0 ? (
        <ul className="course-list">
          {courses.map((c) => (
            <li key={c.id}>
              <Link href={`/courses/${c.slug}`} className="course">
                <span><strong>{c.title}</strong></span>
                <span className="price">{c.price_iqd === 0 ? "مجاني" : `${c.price_iqd.toLocaleString("ar-IQ")} د.ع`}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">لا توجد مقررات منشورة بعد. تظهر الكورسات هنا بعد إتاحتها من المدرّس.</div>
      )}

      {byYear.size > 0 && (
        <>
          <h2 className="section">المواد الدراسية</h2>
          {[...byYear.entries()].map(([year, names]) => (
            <div className="year-block" key={year}>
              <h3>{year === 0 ? "عام" : `المرحلة ${year}`}</h3>
              <div className="chips">{names.map((n) => <span className="chip" key={n}>{n}</span>)}</div>
            </div>
          ))}
        </>
      )}
    </>
  );
}
