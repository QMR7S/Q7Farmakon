"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { createOwnerCourse, issueActivationCode } from "./actions";
import { usePreferences } from "@/components/platform/Preferences";
import Icon from "@/components/platform/Icon";
import GlassSelect from "@/components/platform/GlassSelect";
import styles from "./owner.module.css";
type Course = {
  id: string;
  title: string;
  slug: string;
  status: string;
  free_preview_limit: number | null;
  price_iqd: number | null;
  cover_path: string | null;
};
type Stats = {
  courses: number | null;
  students: number | null;
  enrollments: number | null;
  coverage: boolean;
};
type Group = [string, number];
const menu = [
  ["overview", "نظرة عامة", "Overview", "stats"],
  ["courses", "الكورسات", "Courses", "courses"],
  ["videos", "الفيديو والملفات", "Media", "learn"],
  ["access", "أكواد التفعيل", "Access codes", "lock"],
  ["analytics", "إحصاءات الطلاب", "Student analytics", "stats"],
  ["teachers", "المدرسون", "Instructors", "user"],
  ["users", "المستخدمون", "Users", "user"],
  ["notifications", "الإشعارات", "Notifications", "bell"],
  ["settings", "الأمان والإعدادات", "Security & settings", "shield"],
] as const;
export default function OwnerConsole({
  courses,
  summary,
  university,
  stages,
  byCourse,
  writesEnabled,
  review = false,
}: {
  courses: Course[];
  summary: Stats;
  university: Group[];
  stages: Group[];
  byCourse: { name: string; students: number }[];
  writesEnabled: boolean;
  review?: boolean;
}) {
  const { tr, theme } = usePreferences();
  const [section, setSection] = useState<string>("overview");
  const [period, setPeriod] = useState("annual");
  const [chosenCourse, setChosenCourse] = useState("");
  const [courseState, courseAction, coursePending] = useActionState(
    createOwnerCourse,
    { ok: false, message: "" },
  );
  const [codeState, codeAction, codePending] = useActionState(
    issueActivationCode,
    { ok: false, message: "" },
  );
  const [copy, setCopy] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const selected = menu.find((x) => x[0] === section)!;
  const enabled = writesEnabled && !review;
  return (
    <div
      className={`${styles.shell} q7-owner-shell`}
      data-theme={theme}
      data-farmakon-owner
      dir={tr("rtl", "ltr")}
    >
      <aside className={styles.side}>
        <div className={styles.logo}>
          <span className={styles.mark} aria-hidden="true" />
          <div>
            <strong>Farmakon</strong>
            <small>Q7 / OWNER STUDIO</small>
          </div>
        </div>
        <p className={styles.menuTitle}>
          {tr("إدارة المنصة", "PLATFORM MANAGEMENT")}
        </p>
        {menu.map(([id, ar, en, icon]) => (
          <button
            key={id}
            className={`${styles.nav} ${section === id ? styles.active : ""}`}
            onClick={() => setSection(id)}
            aria-current={section === id ? "page" : undefined}
          >
            <Icon name={icon} />
            {tr(ar, en)}
          </button>
        ))}
        <div className={styles.sideBottom}>
          <b>{tr("حساب المالك", "Owner account")}</b>
          <small>Google · appsmr32@gmail.com</small>
          <Link href="/">{tr("العودة للمنصة", "Back to platform")}</Link>
        </div>
      </aside>
      <div className={styles.area}>
        <header className={styles.top}>
          <div>
            <span className={styles.eyebrow}>FARMAKON / OWNER STUDIO</span>
            <h1>{tr(selected[1], selected[2])}</h1>
          </div>
          <span className={styles.status}>
            {enabled
              ? tr("كتابة Staging", "Staging writes")
              : tr("الكتابة معطلة", "Writes disabled")}
          </span>
        </header>
        <div className={styles.content}>
          {review && (
            <div className={styles.warning} role="status">
              {tr(
                "معاينة قراءة فقط للواجهة. لا بيانات مالك ولا صلاحيات إدارية. الإجراءات الخادمية تبقى محمية.",
                "Read-only interface review. No owner data or privileges. Server actions remain protected.",
              )}
            </div>
          )}
          {!summary.coverage && (
            <div className={styles.warning}>
              {tr(
                "البيانات غير متاحة. «—» تعني غير معروف، وليست صفراً.",
                "Data unavailable. “—” means unknown, not zero.",
              )}
            </div>
          )}
          <div className={styles.sectionSelect}>
            <GlassSelect
              className="q-glass-utility"
              label={tr("قسم لوحة التحكم", "Management section")}
              value={section}
              onChange={setSection}
              searchable
              searchPlaceholder={tr("ابحث عن قسم…","Find a section…")}
              options={menu.map(([id, ar, en, icon])=>({
                value:id,label:tr(ar,en),icon
              }))}
            />
          </div>
          {section === "overview" && (
            <>
              <section className={styles.hero}>
                <div>
                  <span>COMMAND CENTER</span>
                  <h2>
                    {tr(
                      "إدارة واضحة. تعلّم أفضل.",
                      "Clear management. Better learning.",
                    )}
                  </h2>
                  <p>
                    {tr(
                      "المحتوى والاشتراكات والطلاب، ضمن صلاحيات موثّقة.",
                      "Content, subscriptions and students, with verified access.",
                    )}
                  </p>
                </div>
                <button onClick={() => setSection("courses")}>
                  {tr("+ إنشاء كورس", "+ Create course")}
                </button>
              </section>
              <div className={styles.statGrid}>
                {[
                  [
                    "الطلاب الفريدون",
                    "Unique students",
                    summary.students,
                    "user",
                  ],
                  ["الكورسات", "Courses", summary.courses, "courses"],
                  [
                    "المشتركون النشطون",
                    "Active subscribers",
                    summary.enrollments,
                    "lock",
                  ],
                  [
                    "جامعات مسجلة",
                    "Universities",
                    summary.coverage ? university.length : null,
                    "library",
                  ],
                ].map(([ar, en, n, icon]) => (
                  <div className={styles.metric} key={String(ar)}>
                    <span className={styles.metricIcon}>
                      <Icon name={String(icon)} />
                    </span>
                    <small>{tr(String(ar), String(en))}</small>
                    <strong>
                      {n === null ? "—" : Number(n).toLocaleString()}
                    </strong>
                  </div>
                ))}
              </div>
              <div className={styles.columns}>
                <article className={styles.panel}>
                  <h3>{tr("آخر الكورسات", "Recent courses")}</h3>
                  {courses.length ? (
                    courses.map((c) => (
                      <div className={styles.line} key={c.id}>
                        <Icon name="courses" />
                        <div>
                          <b>{c.title}</b>
                          <small>{c.slug}</small>
                        </div>
                        <em>{c.status}</em>
                      </div>
                    ))
                  ) : (
                    <p className={styles.empty}>
                      {tr("لا توجد بيانات متاحة.", "No data available.")}
                    </p>
                  )}
                </article>
                <article className={styles.panel}>
                  <h3>
                    {tr("التوزيع حسب الجامعة", "University distribution")}
                  </h3>
                  {university.length ? (
                    university.map(([name, n]) => (
                      <div className={styles.line} key={name}>
                        <b>{name}</b>
                        <strong>{n}</strong>
                      </div>
                    ))
                  ) : (
                    <p className={styles.empty}>
                      {tr(
                        "لم تُربط بيانات الجامعات.",
                        "University data is not connected.",
                      )}
                    </p>
                  )}
                </article>
              </div>
            </>
          )}
          {section === "courses" && (
            <div className={styles.columns}>
              <section className={styles.panel}>
                <h3>{tr("إنشاء كورس كمسودة", "Create a course draft")}</h3>
                <form action={courseAction} className={styles.form}>
                  <label>
                    {tr("عنوان الكورس", "Course title")}
                    <input
                      name="title"
                      minLength={3}
                      maxLength={180}
                      required
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                    />
                  </label>
                  <label>
                    {tr("رابط الكورس", "Course slug")}
                    <input
                      name="slug"
                      dir="ltr"
                      required
                      maxLength={80}
                      pattern="[a-z0-9]+(-[a-z0-9]+)*"
                      placeholder="course-title"
                    />
                  </label>
                  <label>
                    {tr("الوصف", "Description")}
                    <textarea name="description" maxLength={10000} />
                  </label>
                  <div className={styles.twocol}>
                    <label>
                      {tr("السعر — دينار عراقي", "Price — IQD")}
                      <input
                        name="price_iqd"
                        type="number"
                        min={0}
                        max={100000000}
                        defaultValue={0}
                      />
                    </label>
                    <label>
                      {tr("عدد الدروس المجانية", "Free preview lessons")}
                      <input
                        name="free_preview_limit"
                        type="number"
                        min={0}
                        max={1000}
                        defaultValue={0}
                      />
                    </label>
                  </div>
                  <label>
                    {tr("غلاف الكورس — حتى 3MB", "Course cover — up to 3MB")}
                    <input
                      type="file"
                      name="cover"
                      accept="image/png,image/jpeg,image/webp"
                    />
                  </label>
                  <button disabled={!enabled || coursePending}>
                    {coursePending
                      ? tr("جارٍ الحفظ…", "Saving…")
                      : tr("حفظ مسودة", "Save draft")}
                  </button>
                  {!enabled && (
                    <p className={styles.warnText}>
                      {tr(
                        "الحفظ معطل لحين تهيئة Staging واختبار الصلاحيات.",
                        "Saving is disabled until staging and authorisation tests are ready.",
                      )}
                    </p>
                  )}
                  {courseState.message && (
                    <p role="status">{courseState.message}</p>
                  )}
                </form>
              </section>
              <section className={styles.panel}>
                <h3>{tr("معاينة العنوان فقط", "Title preview only")}</h3>
                <div className={styles.uploadPlaceholder}>
                  <Icon name="courses" size={40} />
                  <b>{courseTitle || tr("عنوان الكورس", "Course title")}</b>
                  <small>
                    {tr(
                      "مسودة غير محفوظة • لا يُنشر محتوى من المعاينة",
                      "Unsaved draft • Preview never publishes content",
                    )}
                  </small>
                </div>
                <h3>{tr("قائمة الكورسات", "Course list")}</h3>
                {courses.length ? (
                  courses.map((c) => (
                    <div className={styles.line} key={c.id}>
                      <b>{c.title}</b>
                      <em>{c.status}</em>
                    </div>
                  ))
                ) : (
                  <p className={styles.empty}>
                    {tr("لا توجد بيانات.", "No data.")}
                  </p>
                )}
              </section>
            </div>
          )}
          {section === "access" && (
            <div className={styles.columns}>
              <section className={styles.panel}>
                <h3>{tr("إنشاء كود تفعيل", "Issue an access code")}</h3>
                <form action={codeAction} className={styles.form}>
                  <GlassSelect label={tr("الكورس", "Course")} value={chosenCourse}
                    onChange={setChosenCourse}
                    placeholder={tr("اختر كورساً","Choose a course")}
                    searchable
                    searchPlaceholder={tr("ابحث عن كورس…","Search course…")}
                    options={courses.map(c=>({value:c.id,label:c.title,icon:"courses"}))}/>
                  <input type="hidden" name="course_id" value={chosenCourse} required/>
                  <GlassSelect label={tr("مدة الاشتراك", "Access period")} value={period}
                    onChange={setPeriod} options={[
                      {value:"annual",label:tr("سنوي — 365 يوماً","Annual — 365 days"),icon:"clock"},
                      {value:"lifetime",label:tr("مدى الحياة","Lifetime"),icon:"shield"},
                      {value:"custom",label:tr("أيام مخصصة","Custom days"),icon:"settings"}
                    ]}/>
                  <input type="hidden" name="period_type" value={period}/>
                  {period === "custom" && (
                    <label>
                      {tr("عدد الأيام", "Number of days")}
                      <input
                        type="number"
                        name="custom_days"
                        min={1}
                        max={36500}
                        required
                      />
                    </label>
                  )}
                  <button disabled={!enabled || codePending || !courses.length}>
                    {tr("إنشاء الكود", "Issue code")}
                  </button>
                  {codeState.message && (
                    <p role="status">{codeState.message}</p>
                  )}
                  {codeState.ok && codeState.code && (
                    <div className={styles.secret}>
                      <b dir="ltr">{codeState.code}</b>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              codeState.code!,
                            );
                            setCopy(tr("تم النسخ", "Copied"));
                          } catch {
                            setCopy(tr("تعذر النسخ", "Copy failed"));
                          }
                        }}
                      >
                        {tr("نسخ", "Copy")}
                      </button>
                      <span role="status">{copy}</span>
                    </div>
                  )}
                </form>
              </section>
              <section className={styles.panel}>
                <h3>
                  {tr(
                    "صلاحية تبدأ من التفعيل",
                    "Validity starts at redemption",
                  )}
                </h3>
                <p>
                  {tr(
                    "السنوي 365 يوماً من التفعيل، والدائم بلا تاريخ انتهاء مع بقاء الاشتراك فعالاً، والمخصص من 1 إلى 36500 يوم.",
                    "Annual access lasts 365 days from redemption. Lifetime has no expiry while active. Custom access is 1–36500 days.",
                  )}
                </p>
                <div className={styles.note}>
                  {tr(
                    "التفعيل الذري وإدارة الإلغاء لم يُفعّلا بعد. لا يكفي توليد الكود لإكمال نظام الاشتراكات.",
                    "Atomic redemption and revocation management are not enabled yet. Code issuance alone does not complete subscriptions.",
                  )}
                </div>
              </section>
            </div>
          )}
          {section === "analytics" && (
            <div className={styles.columns}>
              {[
                [tr("حسب الجامعة", "By university"), university],
                [tr("حسب المرحلة", "By year"), stages],
                [
                  tr("حسب الكورس", "By course"),
                  byCourse.map((c) => [c.name, c.students]),
                ],
              ].map(([heading, rows]) => (
                <article key={String(heading)} className={styles.panel}>
                  <h3>{String(heading)}</h3>
                  {(rows as Group[]).length ? (
                    (rows as Group[]).map(([name, n]) => (
                      <div className={styles.line} key={name}>
                        <b>{name}</b>
                        <strong>{n}</strong>
                      </div>
                    ))
                  ) : (
                    <p className={styles.empty}>
                      {tr("لا توجد بيانات متاحة.", "No data available.")}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
          {section === "videos" && (
            <div className={styles.columns}>
              <article className={styles.panel}>
                <h3>{tr("مركز الميديا", "Media workspace")}</h3>
                <div className={styles.uploadPlaceholder}>
                  <Icon name="download" size={36} />
                  <b>
                    {tr(
                      "الرفع والتحويل غير مهيأين",
                      "Upload and transcoding not configured",
                    )}
                  </b>
                  <small>
                    {tr(
                      "يلزم تخزين خاص وسياسات رفع ومراجعة ملفات.",
                      "Private storage, upload policies and file validation are required.",
                    )}
                  </small>
                </div>
                <Link className="q-btn secondary" href="/media-lab">
                  {tr(
                    "اختبار المشغل بملف محلي",
                    "Test player with a local file",
                  )}
                </Link>
              </article>
              <article className={styles.panel}>
                <h3>{tr("المشاهدة المحمية", "Protected playback")}</h3>
                <p>
                  {tr(
                    "تصدر البوابة رابطاً قصير العمر بعد فحص استحقاق المشاهدة. تتوفر الجودة والترجمة فقط مع ملفات فعلية.",
                    "The gateway checks access before issuing a short-lived URL. Quality and captions require actual files.",
                  )}
                </p>
                <p>
                  {tr(
                    "إنشاء الوحدات والمحاضرات ورفع PDF والترجمة والصور لا يزال مطلوباً.",
                    "Unit and lecture management, PDF, caption and poster uploads remain required.",
                  )}
                </p>
              </article>
            </div>
          )}
          {["teachers", "users", "notifications", "settings"].includes(
            section,
          ) && (
            <article className={styles.panel}>
              <h3>{tr(selected[1], selected[2])}</h3>
              <p>
                {tr(
                  "خدمة الإدارة لهذا القسم غير مربوطة بعد. لا تُعرض بيانات أو نتائج تجريبية.",
                  "This management service is not connected yet. No sample data or success results are shown.",
                )}
              </p>
              <div className={styles.note}>
                {tr(
                  "الأمان: هوية Google موثقة + حساب المالك المحدد + منحة خادمية. الكتابة تتطلب Staging وعَلَم تفعيل صريح.",
                  "Security: verified Google identity, the specified owner account and a server-side grant. Writes require staging and an explicit enable flag.",
                )}
              </div>
            </article>
          )}
        </div>
      </div>
      <nav
        className={styles.mobileNav}
        aria-label={tr("تنقل الإدارة", "Management navigation")}
      >
        {menu.slice(0, 5).map(([id, ar, en, icon]) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            aria-current={section === id ? "page" : undefined}
          >
            <Icon name={icon} />
            <small>{tr(ar, en)}</small>
          </button>
        ))}
      </nav>
    </div>
  );
}
