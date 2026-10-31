"use client";
import Link from "next/link";
import { useState } from "react";
import { usePreferences } from "./Preferences";
import Icon from "./Icon";
import { destinations, type CourseCard } from "@/lib/platform/navigation";
import { CourseCards, Empty } from "./StudentHome";
export default function Workspace({
  section,
  courses,
  available,
  signedIn,
}: {
  section: string;
  courses: CourseCard[];
  available: boolean;
  signedIn: boolean;
}) {
  const { tr, locale, setLocale, theme, setTheme } = usePreferences();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Materials");
  const [tool, setTool] = useState("شرح");
  const [mode, setMode] = useState("simple");
  const title = destinations.find((x) => x[0] === `/${section}`);
  const titles: Record<string, [string, string]> = {
    search: ["البحث الشامل", "Search everything"],
    privacy: ["سياسة الخصوصية", "Privacy policy"],
    terms: ["شروط الاستخدام", "Terms of use"],
  };
  const heading = title
    ? tr(title[1], title[2])
    : tr(...(titles[section] ?? ["مساحتك الدراسية", "Study workspace"]));
  const empty = (
    icon: string,
    ar: string,
    en: string,
    detailAr: string,
    detailEn: string,
  ) => (
    <div className="q-panel">
      <Empty
        icon={icon}
        title={tr(ar, en)}
        description={tr(detailAr, detailEn)}
      />
    </div>
  );
  const connect = tr(
    "يتطلب تسجيل الدخول وربط خدمة البيانات في بيئة اختبار معزولة.",
    "Requires sign in and a connected isolated staging data service.",
  );
  const intro: Record<string, [string, string]> = {
    library: [
      "مادتك، مرجعك، وتدريبك. كل شيء في مكانه.",
      "Your materials, references and practice. Everything in its place.",
    ],
    questions: [
      "اختبر فهمك، واكتشف ما يحتاج إلى مراجعة.",
      "Test your understanding. Discover what to review.",
    ],
    ministerial: [
      "مصادر موثقة، وسنوات وأدوار واضحة.",
      "Verified sources, exam years and rounds.",
    ],
    cases: [
      "من المعلومة إلى القرار السريري.",
      "From knowledge to clinical decisions.",
    ],
    learn: [
      "تابع محاضراتك واربط الفيديو بموارد الدرس.",
      "Connect your lectures, videos and learning resources.",
    ],
    settings: ["مساحتك، بالطريقة التي تناسبك.", "Your study space, your way."],
  };
  return (
    <>
      <div className="q-page-title">
        <div>
          <p className="q-eyebrow">FARMAKON / {section.toUpperCase()}</p>
          <h1>
            {heading}
            <span className="q-title-dot">.</span>
          </h1>
          <p className="q-muted">
            {intro[section]
              ? tr(...intro[section])
              : tr(
                  "تعلّم منظّم، ومعرفة تبقى.",
                  "Organised learning. Knowledge that stays.",
                )}
          </p>
        </div>
        <Icon name={title?.[3] ?? "grid"} size={28} />
      </div>
      {["my-courses", "learn", "search"].includes(section) && (
        <>
          <div className="q-filterbar">
            <label className="q-field" style={{ flex: 1 }}>
              <span>{tr("ابحث عن كورس", "Search courses")}</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tr("اسم الكورس…", "Course name…")}
              />
            </label>
          </div>
          {courses.filter((c) =>
            c.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
          ).length ? (
            <CourseCards
              courses={courses.filter((c) =>
                c.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
              )}
            />
          ) : (
            empty(
              "courses",
              available ? "لا توجد كورسات مطابقة" : "قائمة الكورسات غير متاحة",
              available ? "No matching courses" : "Catalogue unavailable",
              signedIn ? "ستظهر كورساتك الفعالة هنا عند إتاحتها." : connect,
              signedIn
                ? "Your active courses appear here when available."
                : connect,
            )
          )}
          {!signedIn && (
            <div className="q-notice">
              <Link href="/login">
                {tr(
                  "سجّل الدخول لمشاهدة كورساتك واشتراكاتك.",
                  "Sign in to see your courses and subscriptions.",
                )}
              </Link>
            </div>
          )}
        </>
      )}
      {section === "more" && (
        <div className="q-screen-grid">
          {destinations.slice(5).map(([href, ar, en, icon]) => (
            <Link className="q-panel q-screen-link" href={href} key={href}>
              <Icon name={icon} />
              <span>
                {tr(ar, en)}
                <small>Farmakon / {en}</small>
              </span>
            </Link>
          ))}
          <Link href="/owner/login" className="q-panel q-screen-link">
            <Icon name="shield" />
            {tr("إدارة المنصة", "Platform management")}
          </Link>
        </div>
      )}
      {section === "library" && (
        <>
          <div
            className="q-tabbar"
            role="group"
            aria-label={tr("أقسام المكتبة", "Library sections")}
          >
            {["Materials", "Sources", "Questions", "Cases"].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="q-filterbar">
            <label className="q-field" style={{ flex: 1 }}>
              {tr("بحث في المكتبة", "Search library")}
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tr(
                  "عنوان أو موضوع أو مدرس…",
                  "Title, topic or instructor…",
                )}
              />
            </label>
          </div>
          {empty(
            "library",
            `لا توجد ملفات متاحة في ${category}`,
            `No files available in ${category}`,
            "لم يُربط فهرس الملفات المصرح بها بعد. لا تُفتح مصادر Drive الخاصة للعامة.",
            "The authorised file index is not connected. Private Drive sources are not made public.",
          )}
        </>
      )}
      {["questions", "ministerial"].includes(section) && (
        <>
          <nav
            className="q-tabbar"
            aria-label={tr("بنوك الأسئلة", "Question banks")}
          >
            <Link
              className={section === "questions" ? "active" : ""}
              href="/questions"
            >
              {tr("البنك العام", "General bank")}
            </Link>
            <Link
              className={section === "ministerial" ? "active" : ""}
              href="/ministerial"
            >
              {tr("البنك الوزاري", "Ministerial bank")}
            </Link>
          </nav>
          <div className="q-detail-grid">
            {[
              [
                "questions",
                "تدريب حسب الموضوع",
                "Practice by topic",
                "تصفّح المرحلة، المادة، ثم المحاضرة.",
                "Browse year, subject and lecture.",
              ],
              [
                "clock",
                "محاكاة الامتحان",
                "Exam simulation",
                "تحتاج جلسة بتوقيت خادمي واستعادة آمنة.",
                "Requires server timing and secure session recovery.",
              ],
            ].map(([icon, ar, en, a, b]) => (
              <article className="q-panel q-feature-card" key={icon}>
                <Icon name={icon} />
                <h2>{tr(ar, en)}</h2>
                <p>{tr(a, b)}</p>
                <span className="q-pill">
                  {tr("بانتظار ربط المحتوى", "Awaiting content connection")}
                </span>
              </article>
            ))}
          </div>
          <div className="q-notice">
            {section === "ministerial"
              ? tr(
                  "لا تظهر أسئلة بوصف «وزاري رسمي» إلا بعد توثيق الجهة والسنة والدور والمصدر وحقوق النشر.",
                  "Questions are labelled official only after verifying the issuing authority, year, round, source and rights.",
                )
              : tr(
                  "تُنشر أسئلة المدرس وأسئلة AI بعد المراجعة والاعتماد.",
                  "Instructor and AI questions require review before publication.",
                )}
          </div>
          {empty(
            "questions",
            "لا توجد مجموعات معتمدة بعد",
            "No approved question sets yet",
            "سجل المحاولات ودفتر الأخطاء يرتبطان بحسابك عند تشغيل الخدمة.",
            "Attempts and error review link to your account when the service is connected.",
          )}
        </>
      )}
      {section === "cases" && (
        <>
          <div
            className="q-tabbar"
            role="group"
            aria-label={tr("مستوى الحالة", "Case level")}
          >
            {[
              ["Materials", "الكل", "All"],
              ["beginner", "مبتدئ", "Beginner"],
              ["intermediate", "متوسط", "Intermediate"],
              ["advanced", "متقدم", "Advanced"],
            ].map(([id, ar, en]) => (
              <button
                key={id}
                onClick={() => setCategory(id)}
                aria-pressed={category === id}
              >
                {tr(ar, en)}
              </button>
            ))}
          </div>
          <div className="q-panel q-padded">
            <div className="q-row q-row-wrap">
              {[
                ["01", "التاريخ والأعراض", "History & symptoms"],
                ["02", "الفحوص والأدوية", "Tests & medicines"],
                ["03", "القرار والمراجع", "Decision & references"],
              ].map(([n, ar, en]) => (
                <span className="q-pill" key={n}>
                  {n} / {tr(ar, en)}
                </span>
              ))}
            </div>
            <Empty
              icon="cases"
              title={tr("لا توجد حالات منشورة بعد", "No published cases yet")}
              description={tr(
                "ستُعرض الحالات المعتمدة تدريجياً مع التفسير والمصدر والتقييم التعليمي.",
                "Approved cases will unfold step by step with explanations, sources and educational feedback.",
              )}
            />
          </div>
        </>
      )}
      {section === "ai" && (
        <>
          <div className="q-notice">
            {tr(
              "لم يُربط مزود AI أو فهرس المصادر بعد. لا يتم إرسال نصك ولا توليد إجابات في هذه المعاينة.",
              "No AI provider or source index is connected. This preview does not send text or generate answers.",
            )}
          </div>
          <div className="q-detail-grid">
            <div className="q-panel q-padded">
              <h2>
                {tr("ماذا تريد أن تفهم؟", "What would you like to understand?")}
              </h2>
              <div className="q-tabbar">
                {[
                  ["شرح", "Explain"],
                  ["تلخيص", "Summarise"],
                  ["MCQ", "MCQ"],
                  ["حالات", "Cases"],
                  ["بطاقات", "Flashcards"],
                  ["مخطط", "Mind map"],
                  ["مقارنة", "Compare"],
                ].map(([ar, en]) => (
                  <button
                    key={ar}
                    onClick={() => setTool(ar)}
                    aria-pressed={tool === ar}
                  >
                    {tr(ar, en)}
                  </button>
                ))}
              </div>
              <div className="q-form">
                <label className="q-field">
                  {tr("أسلوب الشرح", "Explanation style")}
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="simple">{tr("مبسط", "Simple")}</option>
                    <option value="academic">
                      {tr("أكاديمي", "Academic")}
                    </option>
                    <option value="iraqi">
                      {tr("بالعراقي", "Iraqi Arabic")}
                    </option>
                  </select>
                </label>
                <label className="q-field">
                  {tr("سؤالك", "Your question")}
                  <textarea
                    placeholder={tr(
                      "اكتب الفكرة التي تريد شرحها…",
                      "Describe what you want to understand…",
                    )}
                  />
                </label>
                <button className="q-btn" disabled>
                  {tr(
                    "يلزم ربط مصدر ومزود AI",
                    "Connect a source and AI provider",
                  )}
                </button>
              </div>
            </div>
            <div className="q-panel q-padded">
              <Icon name="ai" size={32} />
              <h2>
                {tr("إجابة يمكن الرجوع إلى مصدرها", "An answer you can trace")}
              </h2>
              <p className="q-muted">
                {tr(
                  "عند التفعيل: اختر المحاضرة أو الوحدة أو المراجع المخوّلة. تظهر صفحة PDF أو توقيت الفيديو بجانب المعلومة المتاحة في المصدر.",
                  "Once configured, choose a lecture, unit or authorised reference. Available claims cite a PDF page or video timestamp.",
                )}
              </p>
              <Empty
                icon="notes"
                title={tr("لا مصدر محدد", "No source selected")}
                description={tr(
                  "ستظهر المصادر المصرح لك بالوصول إليها فقط.",
                  "Only sources you are authorised to access will appear.",
                )}
              />
            </div>
          </div>
        </>
      )}
      {section === "settings" && (
        <div className="q-detail-grid">
          <section className="q-panel q-padded">
            <h2>{tr("تفضيلات العرض", "Display preferences")}</h2>
            <div className="q-form">
              <label className="q-field">
                {tr("اللغة", "Language")}
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as "ar" | "en")}
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </label>
              <label className="q-field">
                {tr("المظهر", "Appearance")}
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as "light" | "dark")}
                >
                  <option value="light">{tr("فاتح", "Light")}</option>
                  <option value="dark">{tr("داكن", "Dark")}</option>
                </select>
              </label>
              <p className="q-muted">
                {tr(
                  "تُحفظ تفضيلات العرض على هذا المتصفح. تُحترم تفضيلات تقليل الحركة في جهازك.",
                  "Display preferences are stored in this browser. Your device’s reduced motion preference is respected.",
                )}
              </p>
            </div>
          </section>
          <section className="q-panel q-padded">
            <h2>{tr("حسابي والخصوصية", "Account & privacy")}</h2>
            <p className="q-muted">{connect}</p>
            <div className="q-form">
              <Link className="q-btn" href="/login">
                {tr("الدخول إلى حسابي", "Sign in")}
              </Link>
              <Link className="q-btn secondary" href="/subscriptions">
                {tr("الاشتراكات وأكواد التفعيل", "Subscriptions & activation")}
              </Link>
              <Link className="q-btn secondary" href="/privacy">
                {tr(
                  "الخصوصية وتصدير البيانات والحذف",
                  "Privacy, export & deletion",
                )}
              </Link>
            </div>
          </section>
        </div>
      )}
      {section === "downloads" && (
        <>
          <div className="q-detail-grid">
            <article className="q-panel q-feature-card">
              <Icon name="download" />
              <h2>{tr("تنزيل لهذا الجهاز", "Download to this device")}</h2>
              <p>
                {tr(
                  "يتطلب إذن الكورس واشتراكاً صالحاً وترخيص تشغيل محلي. لا يتوفر تنزيل فيديو محمي في هذه المرحلة.",
                  "Requires course permission, an active subscription and an offline licence. Protected video downloads are not available at this stage.",
                )}
              </p>
              <button className="q-btn" disabled>
                {tr("التنزيل غير مهيأ", "Downloads are not configured")}
              </button>
            </article>
            <article className="q-panel q-feature-card">
              <Icon name="bookmark" />
              <h2>{tr("حفظ في حسابي", "Save to my account")}</h2>
              <p>
                {tr(
                  "المحفوظات قائمة للرجوع إلى المحتوى، ولا تعني تنزيله دون إنترنت.",
                  "Saved items help you return to content. Saving is separate from offline downloading.",
                )}
              </p>
              <Link href="/saved" className="q-btn secondary">
                {tr("المحفوظات", "Saved items")}
              </Link>
            </article>
          </div>
          {empty(
            "download",
            "لا توجد تنزيلات على هذا الجهاز",
            "No downloads on this device",
            "تخزين المتصفح قابل للإزالة ولا يضمن مشاهدة دائمة. اختبار Android وiOS الفعلي ما زال مطلوباً.",
            "Browser storage can be evicted and is not permanent. Real Android and iOS tests remain required.",
          )}
        </>
      )}
      {section === "install" && (
        <>
          <div className="q-detail-grid">
            <article className="q-panel q-feature-card">
              <Icon name="download" />
              <h2>Android</h2>
              <p>
                {tr(
                  "تثبيت PWA غير مهيأ بعد. سيظهر طلب المتصفح الأصلي عند استيفاء شروط التثبيت.",
                  "PWA installation is not configured yet. The native browser prompt appears once installation requirements are met.",
                )}
              </p>
            </article>
            <article className="q-panel q-feature-card">
              <Icon name="download" />
              <h2>iPhone / iPad</h2>
              <p>
                {tr(
                  "من Safari: مشاركة ← إضافة إلى الشاشة الرئيسية. هذا لا يضمن تنزيل المحتوى أو تشغيله دون اتصال.",
                  "In Safari: Share → Add to Home Screen. This does not guarantee offline content or downloads.",
                )}
              </p>
            </article>
          </div>
          <div className="q-notice">
            {tr(
              "الإشعارات المباشرة والتخزين المحمي دون إنترنت لم يُفعّلا بعد.",
              "Push notifications and protected offline storage are not enabled yet.",
            )}
          </div>
        </>
      )}
      {section === "subscriptions" && (
        <div className="q-detail-grid">
          <div className="q-panel q-padded">
            <h2>{tr("تفعيل اشتراك كورس", "Activate a course subscription")}</h2>
            <p className="q-muted">
              {tr(
                "سنوي: 365 يوماً من التفعيل • دائم • مدة مخصصة.",
                "Annual: 365 days from redemption • Lifetime • Custom duration.",
              )}
            </p>
            <label className="q-field">
              {tr("كود التفعيل", "Activation code")}
              <input dir="ltr" placeholder="FQ7-…" disabled />
            </label>
            <p className="q-muted">
              {tr(
                "التفعيل معطل إلى حين اعتماد المعاملة الذرية واختبار الصلاحيات في Staging.",
                "Redemption is disabled until the atomic transaction and staging authorisation tests are approved.",
              )}
            </p>
            <button className="q-btn" disabled>
              {tr("التفعيل غير مهيأ", "Redemption is not configured")}
            </button>
          </div>
          {empty(
            "lock",
            "اشتراكاتك غير متاحة للقراءة",
            "Subscriptions unavailable",
            "عند انتهاء الاشتراك يعود قفل المحتوى المدفوع، وتبقى المعاينات المجانية حسب سياسة الكورس.",
            "When a subscription expires, paid content locks again. Free previews follow the course policy.",
          )}
        </div>
      )}
      {["notes", "saved", "notifications", "analytics", "plan"].includes(
        section,
      ) && (
        <>
          {empty(
            title?.[3] ?? "notes",
            tr(
              "لا تتوفر بيانات مرتبطة بحسابك هنا بعد",
              "No account data available here yet",
            ),
            tr(
              "No account data available here yet",
              "No account data available here yet",
            ),
            connect,
            connect,
          )}
          <div className="q-notice">
            {tr(
              "لا يتم إنشاء سجل أو نسبة تقدم أو إشعار تجريبي باسمك.",
              "No sample records, progress percentages or notifications are created in your name.",
            )}
          </div>
          <Link className="q-btn secondary" href="/learn">
            {tr("اذهب إلى التعلم", "Go to learning")}
            <Icon name="arrow" />
          </Link>
        </>
      )}
      {section === "help" && (
        <div className="q-detail-grid">
          {[
            [
              "الأكواد والاشتراكات",
              "Codes & subscriptions",
              "المدة السنوية تبدأ يوم تفعيل الكود. المحتوى المدفوع يتطلب اشتراكاً فعالاً.",
              "Annual access starts on redemption. Paid content requires an active subscription.",
            ],
            [
              "المحاضرات والمصادر",
              "Lectures & sources",
              "تظهر الموارد المتاحة لك فقط. لا تتم مشاركة ملفات Drive الخاصة للعامة.",
              "Only authorised resources appear. Private Drive files are not made public.",
            ],
            [
              "الملاحظات الخاصة",
              "Private notes",
              "ملاحظات الطالب مستقلة عن ملاحظات المدرس. المزامنة تتطلب خدمة بيانات وصلاحيات مختبرة.",
              "Student notes are separate from instructor notes. Sync requires a configured and tested data service.",
            ],
            [
              "تواصل معنا",
              "Contact support",
              "حساب التواصل عبر تيليجرام: @ID29i",
              "Telegram contact: @ID29i",
            ],
          ].map(([ar, en, a, b]) => (
            <article className="q-panel q-feature-card" key={ar}>
              <Icon name="help" />
              <h2>{tr(ar, en)}</h2>
              <p>{tr(a, b)}</p>
            </article>
          ))}
        </div>
      )}
      {["privacy", "terms"].includes(section) && (
        <div className="q-panel q-padded">
          <span className="q-pill">
            {tr("مسودة للمراجعة قبل الإطلاق", "Draft for review before launch")}
          </span>
          <h2>
            {tr("بياناتك ومحتواك التعليمي", "Your data and learning content")}
          </h2>
          <p className="q-muted">
            {tr(
              "تعرض المنصة محتوى تعليمياً صيدلانياً. الموارد والمراجع تخضع لحقوق أصحابها وصلاحيات الاشتراك. لا يُعد المحتوى بديلاً عن القرار السريري المهني.",
              "The platform provides pharmacy education. Resources are subject to their owners’ rights and subscription access. Educational content does not replace professional clinical decisions.",
            )}
          </p>
          <h3>{tr("الحساب والملاحظات", "Account & notes")}</h3>
          <p className="q-muted">
            {tr(
              "عند تهيئة الخدمة، يرتبط تقدم التعلم وملاحظاتك الخاصة بحسابك. لا يملك المدرس حق قراءة ملاحظاتك الخاصة. تصدير البيانات وحذف الحساب لم يُفعّلا بعد، ويحتاجان مساراً خادمياً آمناً.",
              "Once connected, progress and private notes belong to your account. Instructors must not read private student notes. Data export and account deletion are not enabled yet and require secure server workflows.",
            )}
          </p>
          <h3>{tr("التخزين والتنزيل", "Storage & downloads")}</h3>
          <p className="q-muted">
            {tr(
              "تُحفظ تفضيلات اللغة والمظهر محلياً في المتصفح. المشاهدة دون إنترنت ليست ضماناً دائماً، وتحتاج ترخيصاً صالحاً. لا تعمل خدمة AI أو Push في هذه المعاينة.",
              "Language and appearance preferences are stored locally in the browser. Offline storage is not permanent and requires valid licensing. AI and push services are not active in this preview.",
            )}
          </p>
          <Link href="/help" className="q-btn secondary">
            {tr("الدعم والاستفسارات", "Support & enquiries")}
          </Link>
        </div>
      )}
    </>
  );
}
