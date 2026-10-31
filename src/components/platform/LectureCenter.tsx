"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SmartPlayer from "@/components/q7/SmartPlayer";
import { usePreferences } from "./Preferences";
import Icon from "./Icon";
type Study = {
  note: string;
  seconds: number;
  pdf_page: number;
  version: number;
};
export default function LectureCenter({
  id,
  title,
  courseTitle,
  courseSlug,
}: {
  id: string;
  title: string;
  courseTitle: string;
  courseSlug: string;
}) {
  const { tr } = usePreferences();
  const [source, setSource] = useState("");
  const [mediaStatus, setMediaStatus] = useState("");
  const [active, setActive] = useState("notes");
  const [study, setStudy] = useState<Study | null>(null);
  const [note, setNote] = useState("");
  const [sync, setSync] = useState("");
  const [editable, setEditable] = useState(false);
  const [initialTime, setInitialTime] = useState(0);
  const latestTime = useRef(0);
  const edit = useRef(0);
  const [changed, setChanged] = useState(0);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setSource("");
    setStudy(null);
    setEditable(false);
    setSync("");
    setMediaStatus(
      tr("جارٍ التحقق من صلاحية المشاهدة…", "Checking playback access…"),
    );
    void fetch(`/api/media/lessons/${id}/play`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (r) => {
        const data = await r.json();
        if (r.ok && data.url) {
          setSource(data.url);
          setMediaStatus("");
        } else
          setMediaStatus(
            r.status === 403
              ? tr(
                  "المحاضرة تحتاج اشتراكاً فعالاً.",
                  "An active subscription is required.",
                )
              : tr(
                  "المشاهدة غير متاحة؛ يلزم إعداد التخزين وبوابة الصلاحيات.",
                  "Playback unavailable. Storage and entitlement gateway need configuration.",
                ),
          );
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setMediaStatus(
            tr("تعذر الاتصال بخدمة المشاهدة.", "Playback connection failed."),
          );
      });
    void fetch(`/api/study/${id}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          setSync(
            tr(
              "ملاحظات الحساب غير متاحة حتى تسجيل الدخول وتهيئة الخدمة.",
              "Account notes require sign in and a configured service.",
            ),
          );
          return;
        }
        setStudy(data.record);
        setNote(data.record.note);
        setInitialTime(data.record.seconds);
        latestTime.current = data.record.seconds;
        setEditable(data.writable);
        setSync(
          data.writable
            ? tr("جاهز للمزامنة", "Ready to sync")
            : tr(
                "قراءة فقط؛ كتابة Staging معطلة",
                "Read-only; staging writes disabled",
              ),
        );
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setSync(tr("تعذر تحميل الملاحظات.", "Notes could not be loaded."));
      });
    return () => controller.abort();
  }, [id, reload]);
  // Refetch only for a different lecture or an explicit reload; language changes must not discard a draft.
  useEffect(() => {
    if (!changed || !study || !editable) return;
    const version = study.version;
    const localEdit = edit.current;
    const timeout = setTimeout(async () => {
      setSync(tr("جارٍ الحفظ…", "Saving…"));
      try {
        const r = await fetch(`/api/study/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            note,
            seconds: latestTime.current,
            pdf_page: study.pdf_page,
            version,
          }),
        });
        const data = await r.json();
        if (r.status === 409) {
          setEditable(false);
          setSync(
            tr(
              "تعارض: توجد نسخة أحدث على جهاز آخر. انسخ مسودتك ثم أعد التحميل.",
              "Conflict: another device saved a newer version. Copy your draft, then reload.",
            ),
          );
          return;
        }
        if (!r.ok) throw Error("save");
        setStudy(data.record);
        if (edit.current === localEdit) setChanged(0);
        setSync(tr("تم الحفظ على حسابك", "Saved to your account"));
      } catch {
        setSync(
          tr(
            "لم يتم الحفظ. احتفظ بمسودتك وأعد المحاولة عند الاتصال.",
            "Not saved. Keep your draft and retry when connected.",
          ),
        );
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [changed, study, editable, id, note, tr]);
  return (
    <>
      <div className="q-breadcrumb" style={{ marginBottom: 18 }}>
        <Link href={`/courses/${courseSlug}`}>{courseTitle}</Link>
        <span>/</span>
        {title}
      </div>
      <div className="q-page-title">
        <div>
          <p className="q-eyebrow">FARMAKON / LECTURE CENTER</p>
          <h1>{title}</h1>
        </div>
        <Link href="/downloads" className="q-btn secondary">
          <Icon name="download" />
          {tr("التنزيلات", "Downloads")}
        </Link>
      </div>
      <div className="q-lecture-grid">
        <div>
          {mediaStatus && (
            <p className="q-notice" role="status">
              {mediaStatus}
            </p>
          )}
          <SmartPlayer
            title={title}
            sources={
              source
                ? [{ label: tr("الملف الأصلي", "Original file"), src: source }]
                : []
            }
            initialTime={initialTime}
            onProgress={(seconds) => {
              latestTime.current = seconds;
            }}
          />
          <div
            className="q-tabbar"
            role="group"
            aria-label={tr("موارد المحاضرة", "Lecture resources")}
          >
            {[
              ["notes", "ملاحظاتي", "My notes"],
              ["pdf", "الملزمة", "PDF"],
              ["instructor", "ملاحظات المدرس", "Instructor notes"],
              ["ai", "Farmakon AI", "Farmakon AI"],
            ].map(([tab, ar, en]) => (
              <button
                key={tab}
                aria-pressed={active === tab}
                onClick={() => setActive(tab)}
              >
                {tr(ar, en)}
              </button>
            ))}
          </div>
          <section className="q-panel q-padded">
            {active === "notes" ? (
              <>
                <div className="q-row q-row-wrap">
                  <h2>{tr("ملاحظاتي الخاصة", "My private notes")}</h2>
                  <span className="q-pill">
                    {tr("خاصة بحسابك", "Private to your account")}
                  </span>
                </div>
                <label className="q-field">
                  {tr("الملاحظة", "Note")}
                  <textarea
                    value={note}
                    disabled={!editable}
                    maxLength={20000}
                    onChange={(e) => {
                      setNote(e.target.value);
                      edit.current++;
                      setChanged(edit.current);
                    }}
                    placeholder={tr(
                      "دوّن الفكرة التي تريد تذكرها…",
                      "Write an idea to remember…",
                    )}
                  />
                </label>
                <p className="q-muted" role="status">
                  {sync}
                </p>
                <div className="q-row q-row-wrap">
                  <button
                    className="q-btn secondary"
                    disabled={!editable}
                    onClick={() => {
                      const stamp = Math.floor(latestTime.current);
                      setNote(
                        (s) =>
                          `${s}\n[${Math.floor(stamp / 60)}:${String(stamp % 60).padStart(2, "0")}] `,
                      );
                      edit.current++;
                      setChanged(edit.current);
                    }}
                  >
                    {tr("إضافة توقيت الفيديو", "Insert video timestamp")}
                  </button>
                  <button
                    className="q-btn secondary"
                    onClick={() => setReload((n) => n + 1)}
                  >
                    {tr("إعادة تحميل من الحساب", "Reload from account")}
                  </button>
                </div>
                <p className="q-muted">
                  {tr(
                    "الحفظ التلقائي عند الكتابة فقط. لا تُحفظ مسودة خاصة محلياً على جهاز مشترك. مزامنة التقدم الدورية دون تعديل الملاحظة لم تكتمل بعد.",
                    "Autosave runs on note edits. No private draft is stored locally on shared devices. Periodic progress sync without note edits remains incomplete.",
                  )}
                </p>
              </>
            ) : active === "ai" ? (
              <>
                <h2>Farmakon AI</h2>
                <p className="q-muted">
                  {tr(
                    "لا مزود أو مصادر مفهرسة متصلة بعد.",
                    "No provider or indexed sources are connected yet.",
                  )}
                </p>
                <Link href="/ai" className="q-btn secondary">
                  {tr("أدوات المساعدة", "Study tools")}
                </Link>
              </>
            ) : (
              <>
                <h2>
                  {active === "pdf"
                    ? tr("ملزمة المحاضرة", "Lecture PDF")
                    : tr("ملاحظات المدرس", "Instructor notes")}
                </h2>
                <p className="q-muted">
                  {tr(
                    "لم يُربط مصدر مصرح به لهذا المورد بعد.",
                    "No authorised source for this resource is connected yet.",
                  )}
                </p>
              </>
            )}
          </section>
        </div>
        <aside>
          <section className="q-panel q-padded">
            <p className="q-eyebrow">{tr("تعمّق في المحاضرة", "GO DEEPER")}</p>
            <h2>
              {tr("من الفهم إلى التطبيق", "From understanding to practice")}
            </h2>
            <div className="q-form">
              {[
                ["/questions", "questions", "بنك الأسئلة", "Question bank"],
                ["/cases", "cases", "الحالات السريرية", "Clinical cases"],
                [
                  "/library",
                  "library",
                  "المراجع والملفات",
                  "References & files",
                ],
              ].map(([href, icon, ar, en]) => (
                <Link key={href} href={href} className="q-nav">
                  <Icon name={icon} />
                  {tr(ar, en)}
                </Link>
              ))}
            </div>
            <p className="q-muted">
              {tr(
                "الربط الدقيق بأسئلة وحالات هذه المحاضرة ينتظر فهرسة المحتوى.",
                "Precise links to this lecture’s questions and cases await content indexing.",
              )}
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
