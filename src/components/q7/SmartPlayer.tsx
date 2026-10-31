"use client";
import { useEffect, useRef, useState } from "react";
import { usePreferences } from "@/components/platform/Preferences";
import styles from "./SmartPlayer.module.css";
export type QualitySource = { label: string; src: string; mime?: string };
export type SubtitleSource = { lang: string; label: string; src: string };
export default function SmartPlayer({
  title,
  sources,
  subtitles = [],
  poster,
  previewSrc,
  onProgress,
  initialTime = 0,
}: {
  title: string;
  sources: QualitySource[];
  subtitles?: SubtitleSource[];
  poster?: string;
  previewSrc?: string;
  onProgress?: (seconds: number) => void;
  initialTime?: number;
}) {
  const { tr } = usePreferences();
  const video = useRef<HTMLVideoElement>(null);
  const hoverVideo = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const restore = useRef<{ time: number; play: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [quality, setQuality] = useState(sources[0]?.label ?? "");
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [menu, setMenu] = useState(false);
  const [captions, setCaptions] = useState("off");
  const [muted, setMuted] = useState(false);
  const [hover, setHover] = useState<{ x: number; t: number } | null>(null);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(true);
  const [skipAmount, setSkipAmount] = useState(10);
  const current = sources.find((s) => s.label === quality) ?? sources[0];
  const format = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  useEffect(() => {
    try {
      const s = Number(localStorage.getItem("q7:playback-speed"));
      if ([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].includes(s)) setSpeed(s);
    } catch {}
  }, []);
  useEffect(() => {
    if (video.current) video.current.playbackRate = speed;
    try {
      localStorage.setItem("q7:playback-speed", String(speed));
    } catch {}
  }, [speed]);
  useEffect(() => {
    if (video.current)
      Array.from(video.current.textTracks).forEach((t) => {
        t.mode = captions === t.language ? "showing" : "disabled";
      });
  }, [captions, current?.src, subtitles]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        settingsButton.current?.focus();
      }
    };
    const outside = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  function show() {
    setVisible(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 3000);
  }
  async function toggle() {
    const v = video.current;
    if (!v || !current) return;
    try {
      if (v.paused) await v.play();
      else v.pause();
      setError("");
    } catch {
      setError(
        tr(
          "تعذر تشغيل الملف. تحقق من صلاحية الوصول.",
          "Unable to play. Check media access.",
        ),
      );
    }
    show();
  }
  function skip(n: number) {
    const v = video.current;
    if (v && Number.isFinite(v.duration))
      v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + n));
    show();
  }
  function changeQuality(label: string) {
    if (label === quality) return;
    const v = video.current;
    if (v) restore.current = { time: v.currentTime, play: !v.paused };
    setQuality(label);
    setMenu(false);
  }
  function preview(e: React.PointerEvent<HTMLInputElement>) {
    if (!Number.isFinite(duration) || !duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    const t =
      Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration;
    setHover({
      x: Math.max(65, Math.min(r.width - 65, e.clientX - r.left)),
      t,
    });
    if (
      hoverVideo.current &&
      Math.abs(hoverVideo.current.currentTime - t) > 0.3
    )
      hoverVideo.current.currentTime = t;
  }
  async function full() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await box.current?.requestFullscreen();
    } catch {
      setError(tr("ملء الشاشة غير مدعوم.", "Fullscreen unavailable."));
    }
  }
  async function pip() {
    try {
      if (document.pictureInPictureElement)
        await document.exitPictureInPicture();
      else if (document.pictureInPictureEnabled)
        await video.current?.requestPictureInPicture();
      else
        setError(
          tr("صورة داخل صورة غير مدعومة.", "Picture in picture unavailable."),
        );
    } catch {
      setError(
        tr("صورة داخل صورة غير متاحة.", "Picture in picture unavailable."),
      );
    }
  }
  function loaded(v: HTMLVideoElement) {
    setDuration(v.duration);
    v.playbackRate = speed;
    const target = restore.current?.time ?? initialTime;
    if (Number.isFinite(target))
      v.currentTime = Math.max(
        0,
        Math.min(target, Number.isFinite(v.duration) ? v.duration : 0),
      );
    if (restore.current?.play)
      void v
        .play()
        .catch(() => setError(tr("تعذر الاستئناف.", "Unable to resume.")));
    restore.current = null;
    Array.from(v.textTracks).forEach((t) => {
      t.mode = captions === t.language ? "showing" : "disabled";
    });
  }
  return (
    <div className={styles.wrap}>
      <div
        className={styles.player}
        ref={box}
        tabIndex={0}
        role="region"
        aria-label={tr("مشغل الفيديو", "Video player")}
        onPointerMove={show}
        onFocus={show}
        onPointerDown={(e) => {
          if (menu && !(e.target as HTMLElement).closest("[data-player-menu]"))
            setMenu(false);
        }}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === " " || e.key.toLowerCase() === "k") {
            e.preventDefault();
            void toggle();
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            skip(skipAmount);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            skip(-skipAmount);
          }
          if (e.key.toLowerCase() === "f") void full();
        }}
      >
        <div className={styles.title}>{title}</div>
        <video
          ref={video}
          className={styles.video}
          playsInline
          preload="metadata"
          poster={poster}
          src={current?.src}
          onClick={toggle}
          onLoadedMetadata={(e) => loaded(e.currentTarget)}
          onTimeUpdate={(e) => {
            setTime(e.currentTarget.currentTime);
            onProgress?.(e.currentTarget.currentTime);
          }}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onPlay={() => {
            setPlaying(true);
            show();
          }}
          onPause={() => {
            setPlaying(false);
            setVisible(true);
          }}
          onEnded={() => setPlaying(false)}
          onError={() =>
            setError(tr("فشل تحميل الفيديو.", "Video loading failed."))
          }
        >
          {subtitles.map((s) => (
            <track
              key={`${s.lang}-${s.src}`}
              kind="subtitles"
              srcLang={s.lang}
              label={s.label}
              src={s.src}
            />
          ))}
        </video>
        {!current && (
          <div className={styles.unavailable}>
            {tr("لم يتوفر مصدر فيديو مصرح به", "No authorised video source")}
            <small>
              {tr(
                "لا يُعرض فيديو تجريبي بدلاً من محاضرتك.",
                "No sample video replaces your lecture.",
              )}
            </small>
          </div>
        )}
        {current && !playing && (
          <button
            className={styles.playBig}
            onClick={toggle}
            aria-label={tr("تشغيل الفيديو", "Play video")}
          >
            ▶
          </button>
        )}
        {hover && previewSrc && (
          <div
            className={styles.peek}
            style={{ left: `${hover.x}px` }}
            aria-hidden="true"
          >
            <video
              ref={hoverVideo}
              muted
              playsInline
              preload="metadata"
              src={previewSrc}
            />
            <span>{format(hover.t)}</span>
          </div>
        )}
        <div
          className={`${styles.controls} ${playing && !visible && !menu ? styles.hidden : ""}`}
        >
          <input
            aria-label={tr("شريط تقدم الفيديو", "Video progress")}
            className={styles.range}
            type="range"
            min={0}
            max={Number.isFinite(duration) ? duration : 0}
            step={0.1}
            value={Math.min(time, Number.isFinite(duration) ? duration : 0)}
            disabled={!current}
            onPointerMove={preview}
            onPointerLeave={() => setHover(null)}
            onChange={(e) => {
              if (video.current)
                video.current.currentTime = Number(e.target.value);
            }}
          />
          <div className={styles.row}>
            <button
              disabled={!current}
              onClick={toggle}
              aria-label={
                playing ? tr("إيقاف مؤقت", "Pause") : tr("تشغيل", "Play")
              }
            >
              {playing ? "Ⅱ" : "▶"}
            </button>
            <button
              disabled={!current}
              onClick={() => skip(-skipAmount)}
              aria-label={tr(
                `تأخير ${skipAmount} ثوان`,
                `Back ${skipAmount} seconds`,
              )}
            >
              ↶{skipAmount}
            </button>
            <button
              disabled={!current}
              onClick={() => skip(skipAmount)}
              aria-label={tr(
                `تقديم ${skipAmount} ثوان`,
                `Forward ${skipAmount} seconds`,
              )}
            >
              {skipAmount}↷
            </button>
            <button
              disabled={!current}
              onClick={() => {
                if (video.current) {
                  video.current.muted = !video.current.muted;
                  setMuted(video.current.muted);
                }
              }}
              aria-label={
                muted ? tr("إلغاء الكتم", "Unmute") : tr("كتم", "Mute")
              }
            >
              {muted ? "×♫" : "♫"}
            </button>
            <time className={styles.time}>
              {format(time)} /{" "}
              {format(Number.isFinite(duration) ? duration : 0)}
            </time>
            <button
              ref={settingsButton}
              data-player-menu
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
              aria-label={tr("إعدادات التشغيل", "Playback settings")}
            >
              ⚙
            </button>
            <button
              disabled={!current}
              onClick={pip}
              aria-label={tr("صورة داخل صورة", "Picture in picture")}
            >
              ▣
            </button>
            <button onClick={full} aria-label={tr("ملء الشاشة", "Fullscreen")}>
              ⛶
            </button>
          </div>
        </div>
        {menu && (
          <div
            className={styles.glass}
            data-player-menu
            role="dialog"
            aria-label={tr("إعدادات الفيديو", "Video settings")}
          >
            <header>
              {tr("إعدادات الفيديو", "Video settings")}
              <button
                onClick={() => {
                  setMenu(false);
                  settingsButton.current?.focus();
                }}
                aria-label={tr("إغلاق", "Close")}
              >
                ✕
              </button>
            </header>
            <div className={styles.setting}>
              <b>{tr("السرعة", "Speed")}</b>
              <div>
                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                  <button
                    key={s}
                    aria-pressed={speed === s}
                    onClick={() => setSpeed(s)}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.setting}>
              <b>{tr("الجودة", "Quality")}</b>
              <div>
                {sources.length ? (
                  sources.map((s) => (
                    <button
                      key={s.label}
                      aria-pressed={current?.label === s.label}
                      onClick={() => changeQuality(s.label)}
                    >
                      {s.label}
                    </button>
                  ))
                ) : (
                  <small>{tr("لا توجد ملفات فيديو", "No media files")}</small>
                )}
              </div>
            </div>
            <div className={styles.setting}>
              <b>{tr("الترجمة", "Captions")}</b>
              <div>
                <button
                  aria-pressed={captions === "off"}
                  onClick={() => setCaptions("off")}
                >
                  {tr("إيقاف", "Off")}
                </button>
                {subtitles.map((s) => (
                  <button
                    key={s.lang}
                    aria-pressed={captions === s.lang}
                    onClick={() => setCaptions(s.lang)}
                  >
                    {s.label}
                  </button>
                ))}
                {!subtitles.length && (
                  <small>
                    {tr("لا ملفات VTT متاحة", "No VTT files available")}
                  </small>
                )}
              </div>
            </div>
            <div className={styles.setting}>
              <b>{tr("خطوة التقديم والتأخير", "Seek interval")}</b>
              <div>
                {[5, 10, 15].map((n) => (
                  <button
                    key={n}
                    aria-pressed={skipAmount === n}
                    onClick={() => setSkipAmount(n)}
                  >
                    {n}s
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      <p className={styles.explain}>
        {tr(
          "الجودة والترجمة حسب الملفات الفعلية. الاختصارات عند تركيز إطار المشغل: Space/K، الأسهم، F.",
          "Quality and captions use actual files. Focus the player for shortcuts: Space/K, arrows, F.",
        )}
      </p>
    </div>
  );
}
