"use client";
import { useEffect, useState } from "react";
import SmartPlayer from "@/components/q7/SmartPlayer";
import { usePreferences } from "@/components/platform/Preferences";
export default function MediaLab() {
  const { tr } = usePreferences();
  const [src, setSrc] = useState("");
  const [caption, setCaption] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  useEffect(
    () => () => {
      if (src) URL.revokeObjectURL(src);
    },
    [src],
  );
  useEffect(
    () => () => {
      if (caption) URL.revokeObjectURL(caption);
    },
    [caption],
  );
  return (
    <>
      <div className="q-page-title">
        <div>
          <p className="q-eyebrow">FARMAKON / MEDIA LAB</p>
          <h1>
            {tr("اختبار المشغل بملف محلي", "Test the player with a local file")}
          </h1>
          <p className="q-muted">
            {tr(
              "اختبار تقني؛ لا رفع ولا حفظ خادمي ولا تنزيل محتوى محمي.",
              "Technical test: no upload, server storage or protected download.",
            )}
          </p>
        </div>
      </div>
      <div className="q-panel q-padded">
        <div className="q-form-grid">
          <label className="q-field">
            {tr("فيديو من جهازك", "Video from your device")}
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f?.type.startsWith("video/")) {
                  setName(f.name);
                  setSrc(URL.createObjectURL(f));
                  setError("");
                } else if (f)
                  setError(
                    tr("اختر ملف فيديو صالحاً", "Choose a valid video file"),
                  );
              }}
            />
          </label>
          <label className="q-field">
            {tr("ترجمة VTT اختيارية", "Optional VTT captions")}
            <input
              type="file"
              accept=".vtt"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f?.name.toLowerCase().endsWith(".vtt"))
                  setCaption(URL.createObjectURL(f));
              }}
            />
          </label>
        </div>
        {error && <p role="alert">{error}</p>}
        <div style={{ marginTop: 24 }}>
          <SmartPlayer
            key={src}
            title={name || tr("لا ملف محدد", "No file selected")}
            sources={src ? [{ label: tr("الأصلي", "Original"), src }] : []}
            subtitles={
              caption
                ? [
                    {
                      lang: "ar",
                      label: tr("ملفك المحلي", "Local captions"),
                      src: caption,
                    },
                  ]
                : []
            }
            previewSrc={src || undefined}
          />
        </div>
      </div>
    </>
  );
}
