"use client";
import Link from "next/link";
import { usePreferences } from "./Preferences";
import Icon from "./Icon";
type Unit = { id: string; title: string; position: number | null };
type Lesson = {
  id: string;
  unit_id: string;
  title: string;
  position: number | null;
  access: "free-preview" | "subscribed" | "locked";
};
export default function CourseDetails({
  title,
  description,
  units,
  lessons,
  complete,
}: {
  title: string;
  description: string | null;
  units: Unit[];
  lessons: Lesson[];
  complete: boolean;
}) {
  const { tr } = usePreferences();
  return (
    <>
      <Link className="q-muted" href="/learn">
        {tr("التعلم / الكورسات", "Learn / Courses")}
      </Link>
      <div className="q-page-title" style={{ marginTop: 20 }}>
        <div>
          <p className="q-eyebrow">FARMAKON / COURSE</p>
          <h1>{title}</h1>
          {description && <p className="q-muted">{description}</p>}
        </div>
        <Icon name="courses" size={32} />
      </div>
      {!complete && (
        <div className="q-notice">
          {tr(
            "تعذر تأكيد فهرس الدروس الكامل. المعاينات المجانية لا تُحدد من بيانات ناقصة.",
            "The full lesson index could not be confirmed. Incomplete data cannot establish free previews.",
          )}
        </div>
      )}
      {!units.length && (
        <div className="q-panel q-padded">
          {tr("لا توجد وحدات متاحة بعد.", "No units available yet.")}
        </div>
      )}
      {units.map((u, index) => (
        <section
          className="q-panel q-padded"
          style={{ marginBottom: 18 }}
          key={u.id}
        >
          <span className="q-eyebrow">
            {tr("وحدة", "UNIT")} {String(index + 1).padStart(2, "0")}
          </span>
          <h2 style={{ fontSize: 19 }}>{u.title}</h2>
          {lessons
            .filter((l) => l.unit_id === u.id)
            .map((l) => (
              <Link
                key={l.id}
                href={
                  l.access === "locked" ? "/subscriptions" : `/lessons/${l.id}`
                }
                className="q-nav"
                style={{
                  borderTop: "1px solid var(--q-line)",
                  borderRadius: 0,
                  paddingBlock: 16,
                }}
              >
                <Icon name={l.access === "locked" ? "lock" : "learn"} />
                <span style={{ flex: 1 }}>{l.title}</span>
                <span className="q-pill">
                  {l.access === "free-preview"
                    ? tr("معاينة مجانية", "Free preview")
                    : l.access === "subscribed"
                      ? tr("متاح", "Available")
                      : tr("اشتراك مطلوب", "Subscription required")}
                </span>
              </Link>
            ))}
        </section>
      ))}
    </>
  );
}
