"use client";
import Link from "next/link";
import Icon from "./Icon";
import { usePreferences } from "./Preferences";
import type { CourseCard } from "@/lib/platform/navigation";
export function CourseCards({ courses }: { courses: CourseCard[] }) {
  const { tr } = usePreferences();
  return (
    <div className="q-course-grid">
      {courses.map((c) => (
        <Link
          href={`/courses/${c.slug}`}
          className="q-panel q-course-card"
          key={c.id}
        >
          <div className="q-course-cover">
            <Icon name="courses" size={42} />
            <span>FARMAKON / COURSE</span>
          </div>
          <div className="q-course-info">
            <span className="q-pill">
              {tr("كورس منشور", "Published course")}
            </span>
            <h3>{c.title}</h3>
            <div className="q-row">
              <span>
                {c.price_iqd === 0
                  ? tr("مجاني", "Free")
                  : `${(c.price_iqd ?? 0).toLocaleString()} ${tr("د.ع", "IQD")}`}
              </span>
              <Icon name="arrow" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
export function Empty({
  icon = "courses",
  title,
  description,
}: {
  icon?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="q-empty">
      <span className="q-empty-icon">
        <Icon name={icon} size={29} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export default function StudentHome({
  courses,
  available,
  signedIn,
}: {
  courses: CourseCard[];
  available: boolean;
  signedIn: boolean;
}) {
  const { tr } = usePreferences();
  return (
    <>
      <div className="q-page-title">
        <div>
          <p className="q-eyebrow">
            {tr("مساحتك الدراسية", "YOUR STUDY SPACE")}
          </p>
          <h1>
            {tr("أهلاً بك في فارماكون", "Welcome to Farmakon")}
            <span className="q-title-dot">.</span>
          </h1>
          <p className="q-muted">
            {tr(
              "تعلّم بتركيز، وابنِ معرفتك خطوة بخطوة.",
              "Learn with focus. Build your knowledge, one step at a time.",
            )}
          </p>
        </div>
        <Link className="q-btn secondary" href="/plan">
          <Icon name="plan" />
          {tr("خطة دراستي", "My study plan")}
        </Link>
      </div>
      <section className="q-continue">
        <div>
          <span className="q-kicker">
            <span className="q-dot" />
            {tr("خطوتك التالية", "YOUR NEXT STEP")}
          </span>
          <h2>
            {signedIn
              ? tr(
                  "اختر محاضرتك، وابدأ رحلتك.",
                  "Choose your lecture. Start learning.",
                )
              : tr(
                  "كل ما تحتاجه، في مساحة واحدة.",
                  "Everything you need. One study space.",
                )}
          </h2>
          <p>
            {tr(
              "محاضراتك ومراجعك وتدريباتك، بترتيب يساعدك على الفهم.",
              "Your lectures, references and practice, organised for understanding.",
            )}
          </p>
          <Link
            className="q-btn white"
            href={signedIn ? "/my-courses" : "/login"}
          >
            {signedIn
              ? tr("عرض كورساتي", "My courses")
              : tr("الدخول إلى حسابي", "Sign in to my account")}
            <Icon name="arrow" />
          </Link>
        </div>
        <div className="q-orbit" aria-hidden="true">
          <div className="q-orbit-ring" />
          <div className="q-orbit-ring two" />
          <div className="q-orbit-core">
            Rx<span>FARMAKON</span>
          </div>
          <span className="q-orbit-chip chip-one">
            <Icon name="learn" />
          </span>
          <span className="q-orbit-chip chip-two">
            <Icon name="notes" />
          </span>
          <span className="q-orbit-chip chip-three">
            <Icon name="ai" />
          </span>
        </div>
      </section>
      <div className="q-home-columns">
        <section>
          <div className="q-section-title">
            <h2>
              {tr("كورساتك، ومعرفتك القادمة", "Courses. Your next discovery.")}
            </h2>
            <Link href="/my-courses">
              {tr("عرض الكل", "View all")}
              <Icon name="arrow" size={16} />
            </Link>
          </div>
          {courses.length ? (
            <CourseCards courses={courses} />
          ) : (
            <div className="q-panel">
              <Empty
                title={tr("لم تُعرض كورسات بعد", "No courses to show yet")}
                description={
                  available
                    ? tr(
                        "ستجد هنا الكورسات المنشورة عند إتاحتها.",
                        "Published courses will appear here when available.",
                      )
                    : tr(
                        "لم نتمكن من قراءة قائمة الكورسات. بياناتك لم تتغير.",
                        "The course catalogue is not connected. Your data is unchanged.",
                      )
                }
              />
              <div className="q-empty-footer">
                <Link href="/my-courses">
                  {tr("استكشف مساحة الكورسات", "Explore courses")}
                  <Icon name="arrow" size={17} />
                </Link>
              </div>
            </div>
          )}
          <div className="q-section-title">
            <h2>{tr("تعلّم، طبّق، راجع", "Learn. Apply. Review.")}</h2>
          </div>
          <div className="q-tools">
            {[
              [
                "/questions",
                "questions",
                "تدرّب على الأسئلة",
                "Question practice",
                "اختبر فهمك موضوعاً بموضوع",
                "Build understanding, topic by topic",
              ],
              [
                "/cases",
                "cases",
                "فكّر سريرياً",
                "Think clinically",
                "اربط المعرفة بالقرار",
                "Connect knowledge to decisions",
              ],
              [
                "/library",
                "library",
                "مرجعك بين يديك",
                "Your study library",
                "مواد ومصادر في مكان واحد",
                "Materials and sources in one place",
              ],
            ].map(([href, icon, ar, en, desc, descEn]) => (
              <Link className="q-panel q-tool" href={href} key={href}>
                <span className="q-tool-icon">
                  <Icon name={icon} size={23} />
                </span>
                <h3>{tr(ar, en)}</h3>
                <p>{tr(desc, descEn)}</p>
                <Icon name="arrow" size={17} />
              </Link>
            ))}
          </div>
        </section>
        <aside className="q-study-rail">
          <div className="q-panel q-today">
            <span className="q-eyebrow">
              {tr("خطّة اليوم", "TODAY, WITH INTENTION")}
            </span>
            <h2>
              {tr("خطوة صغيرة. أثر كبير.", "Small steps. Lasting knowledge.")}
            </h2>
            <p className="q-muted">
              {tr(
                "ابدأ بمحاضرة، اختبر فهمك، ثم دوّن أهم فكرة.",
                "Watch a lecture, test your understanding, save one key idea.",
              )}
            </p>
            <ol>
              {[
                ["01", "learn", "استمع وافهم", "Watch & understand"],
                ["02", "questions", "اختبر نفسك", "Test yourself"],
                ["03", "notes", "دوّن وراجع", "Reflect & review"],
              ].map(([n, icon, ar, en]) => (
                <li key={n}>
                  <span>{n}</span>
                  <Icon name={icon} />
                  <b>{tr(ar, en)}</b>
                </li>
              ))}
            </ol>
            <Link href="/plan" className="q-btn secondary">
              {tr("افتح خطة الدراسة", "Open study plan")}
              <Icon name="arrow" size={17} />
            </Link>
          </div>
          <div className="q-panel q-ai-callout">
            <Icon name="ai" size={26} />
            <h3>
              {tr("المعرفة تبدأ بسؤال", "Knowledge begins with a question")}
            </h3>
            <p>
              {tr(
                "أدوات Farmakon AI مرتبطة بمصادر محاضرتك عند تهيئتها.",
                "Farmakon AI tools use lecture sources when configured.",
              )}
            </p>
            <Link href="/ai">
              {tr("استكشف الأدوات", "Explore tools")}
              <Icon name="arrow" size={17} />
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
