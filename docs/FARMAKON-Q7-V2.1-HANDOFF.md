# Farmakon Q7 V2.1 — Approved UX and implementation baseline

Status: approved for **isolated design work and staged implementation** on 2026-10-31. **DO NOT merge, deploy production, alter Supabase production data, enable paid services, or change access rules without separate review and approval.**

## Scope carried forward
- Student dashboard, stage/subject/course/unit/lecture hierarchy, mobile bottom dock and desktop sidebar; accessibility, Arabic/English localization, light/dark themes, consistent icons, motion and press interactions.
- Smart lecture: real player controls (seek +/- 5/10/15 seconds, speed 0.5–2x, captions Arabic/English, quality Auto if manifests support it, thumbnail hover/seek previews, bookmarks, chapters, fullscreen/PiP), precise cross-device resume, PDF page.
- Remove visible transcript under video. Keep caption overlay inside player when enabled.
- Course resources, instructor notes and **student-private** timestamped notes, authorized Farmakon AI summaries/explanations/quizzes/cases/flashcards/mind maps, provenance/citations.
- Offline Downloads with user video entitlements, quota, progress, pause/retry, playback offline, local subtitle assets, expiry/revocation and explicit PWA browser limitations. Cache of publicly accessible demo assets is NOT a production content protection design.
- Question Bank split into General and Ministerial collections, stage/subject/topic/lesson filters. Ministerial metadata must include verified exam year, round, issuing authority, source and rights review. Never mark mock content official.
- Medical library in Materials / Sources / Questions / Cases, PDF annotations and search, controlled Google Drive source ingestion; Cases classified by stage and subject with instructor approval.
- Student account: photo, display name, unique username, optional Telegram handle, authenticated email change, subscriptions, preferred language/theme, notification settings, privacy/export/deletion.
- Notification Center, support/help/terms/policy center, install app UI with `beforeinstallprompt` only if browser supports it; iOS manual Add to Home Screen.
- Teacher/owner admin workflows, annual/lifetime/manual activation-code periods, role enforcement through backend/RLS and audit trails, exam integrity server-side.

## Implementation order
P0: repo/schema/staging audit. P1: shared design system and i18n, responsive UI. P2: real video/PDF/notes. P3: offline rights-aware downloads. P4: library / general + ministerial bank / clinical cases. P5: grounded AI. P6: profile / notifications / PWA install. P7: instructor + admin workflows. P8: QA/performance/security and explicit go/no-go.

## Current status / limitations
- This branch is for safe incremental changes. Its in-repo preview route (if present) contains **sample information only**.
- A larger standalone interactive preview including an original demo video, captions, local sample-cache experiment, notes, account controls and screenshots was produced as an external handoff artifact, not added to repository here.
- No actual student video downloads, auth-backed notes, AI inference, verified ministerial questions, real push notifications or production deployment are claimed.
- Manual video offline testing must include real Android/iOS devices. Browser Cache Storage can be evicted; persistent storage is not guaranteed. Offline video requires streaming/range support plus rights/licence policy.
- Security must enforce permissions in server APIs and Supabase RLS, not by frontend navigation.

## Acceptance gates
- Baseline visual tests at 360/390/768/1024/1440, RTL/LTR, light/dark, 200% zoom and reduced motion.
- Video speed, quality, captions, resume, offline download/seek/retry on supported hardware; disable unavailable controls gracefully.
- Authorization for content/notes/bookmarks/attempts/notifications; stage and role scoping; signed URLs never exposed as permanent public assets.
- Security, accessibility, database migrations + rollback, reliable exams and tests must pass before production approval.
