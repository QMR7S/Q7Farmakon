# Farmakon Q7 V3 — MASTER EXECUTION ORDER
**Status:** APPROVED DIRECTION / staged execution, not a declaration of feature completion.
**Repository:** `QMR7S/Q7Farmakon`
**V3 branch:** `feature/q7-v3-foundation-2026-11-01`, based on V2.4 work development `e6f48654699e5e90737618e9a83e5ed148d6a941`.
**Date:** 2026-11-01

> **تصحيح إلزامي للهوية — 2026-11-01:** المستخدم يشترط عدم تغيير تصميم وألوان واجهة تسجيل الدخول ولوحة الطالب المعتمدتين. يُلغى أي اقتراح سابق بإعادة تصميم شكلي أو تغيير شعار أو ألوان أو فرض CSS جديدة. يرجع التفصيل إلى `docs/Q7-V3-VISUAL-FIDELITY-CONTRACT-AR.md`. التحديثات تكون وظيفية وتقنية وتحسينات تجربة لا تغير الهوية إلا بموافقة صريحة على مرجع بصري قابل للفحص.\n\n## 0. Non-negotiable execution rules
1. Continue the existing repository, never create a parallel substitute or erase successful tests/security patches. Record precise base/head SHA and changes.
2. Do not alter `main`, merge, trigger a Production deployment, write any Production database, change Google Drive permissions, or buy/enable paid plans without specific authorization.
3. Production, staging, demo, local and protected media must be distinguished everywhere. A working frontend without backend is **not** a completed feature.
4. Never invent courses, learners, completion percentages, revenues, ministry approvals, AI citations, subtitles or analytics. If disconnected, show a clear and useful explanation.
5. Do not deploy a link merely because the build is READY: validate exact git commit, HTTP 200 on all advertised routes, visual correctness, login/owner permissions, and responsive navigation. Do not send Work-only localhost addresses as public URLs.
6. Every implementation phase must have source changes, executable checks, evidence, explicit pass/fail/blocked fields and a rollback path. “Zero defects” is a quality target, not a claim unsupported by testing.

## 1. Product and design brief
Farmakon is a bilingual (Arabic and English) professional pharmacy education experience. Students access purchased courses, videos, instructor handouts, licensed references, topic-aligned question banks and clinical cases; the owner controls publishing, access codes, instructors, entitlements, content and analytics. Tablet/phone/desktop are all first-class. User journey: sign in -> find course -> resume lecture -> consult PDF/notes -> take topic-linked practice -> see measured progress; owner journey: verified Google sign in and explicit DB grant -> create draft course -> upload and publish lesson -> issue activation code -> audit and measure activity.

Preserve the existing approved login and dashboard visuals unchanged. Do not infer exact design from cobalt/white/mint code colors or a text-only markdown export; those are not the supplied original screenshot. Any visual alteration must be authorized from an actual comparable source image. Consistency, clear hierarchy, native-feeling controls, real icon grammar, generous whitespace, calibrated motion and accessibility beat decorative glass. No emoji-only navigation, misaligned controls, fake cover art or deceptive badges. Default Arabic RTL, genuine English LTR, consistent light/dark.

### Design system acceptance
- Foundation tokens: semantic backgrounds, surfaces, text, muted text, stroke, accent, focus, elevation, spacing 4/8/12/16/24/32/48, 44+ px interactive targets, radii 12/16/20/24.
- Components: application shell, logo, icon set, heading, button (primary/secondary/quiet/destructive), input, select, search, tabs, badges, toast/inline error, modal/dialog, sidebar, mobile dock, breadcrumb, course tile, video controls, states (loading/empty/error/offline).
- Document and test disabled/loading/focus/hover/pressed/selected, RTL/LTR, dark mode and prefers-reduced-motion. Ensure icons have labels on icon-only controls, one active destination and no inert buttons.
- Responsive QA: widths 320/360/390/768/1024/1440, 200% zoom, keyboard navigation, contrast, overflow and the real browsers used by students.

## 2. Implementation stages and dependency gates
### P0 — Baseline and isolation — BLOCKING
Verify actual Q7 Supabase project reference and owner; protect backups, migrations, Storage and Auth settings. The other connected `Farmakon-Staging` is not automatically Q7. No guessed cross-project writes. Establish staging credentials; exact project-ref guard; isolated tests for Auth, RLS, sessions, subscription access and ownership. Document and review any migration before applying to the confirmed isolated database.

### P1 — V3 interface foundation (STARTED)
Preserve approved login and dashboard source identity exactly; improve only accessible labels, keyboard usability, mobile route behavior, language/theme functionality and truthful service status without an unapproved visual overhaul. Preserve known V2.4 security logic. Review Home, Auth, My Courses, Lecture Center and Owner separately on all breakpoint families. Require actual screenshots and no broken links before preview acceptance.

### P2 — Courses + Lecture Center
Course/unit/lesson navigation, published state, guarded entitlement checking server-side, signed media streaming, course chapters, verified resources, PDF reader with page linking, private note autosave, revision conflict recovery, resume video second and PDF page across devices, safe media error states. Player requirements: play/pause, seek 5/10/15, speed, captions, available quality selection, keyboard and focus, picture-in-picture/fullscreen where supported and volume. Verify real protected lecture media and cross-device persistence, not only local test fixtures.

### P3 — Owner + subscriptions
Verified owner Google identity AND DB grant. Admin CRUD for programs, years, instructors, subjects, courses, units, lectures, resources, question collections and clinical cases; resumable uploads and media processing; publish workflow; auditable hashed activation codes annual/lifetime; atomic redeem, revoke, expiry, manual extension; accurate enrollment and revenue analytics from real records; content rights and backups.

### P4 — Library, questions and clinical cases
Authorised library indexing (Materials/Sources/Questions/Cases), metadata, search and filters; question tagging to precise source/topic, reliable timed exam state and history, correct/incorrect analytics, ministerial provenance by authority/year/round with review before calling it official, progressive case reasoning with educator approval.

### P5 — AI and study personalization
Only after content/security gates: licensed source-grounded retrieval with page/video citations, no private-drive public access, instructor review, generation of MCQs/flashcards/cases, spaced repetition, recommendations and weak-topic map linking exact lesson timestamps/pages and previous attempts. Document cost limits, opt-out and model fallback.

### P6 — Accounts, mobile and notifications
Student profile, sessions, privacy/export/deletion, PWA and push, new-material notifications, reminder preferences/quiet hours, optional compliant offline playback with encrypted controlled licences, device limits and revocation. Never claim offline supported before completing real-device and adverse-network acceptance.

### P7 — Release gate
Automated unit, integration, E2E, accessibility, mobile visual, performance, security, tenancy/RLS, concurrency, recovery and consent checks. Record screenshots, build SHA and preview target. No Production before a distinct approval and explicit NO-GO/GO assessment.

## 3. Mandatory verification record
For each feature: scope, implemented file paths, test command and output, staging dataset identity, negative permission case, screenshots (if visible), remaining issues, regression risk, owner approval status. For previews: URL + target + exact commit + HTTP results for /, /login, /my-courses, /learn, /library, /questions, /cases, /review, /owner-review, /media-lab; verify that /review is itself a working tool and that no advertised links produce 404. If any fails, do not publish as approved.

## 4. Immediate source of truth
- The V2.4 branch `feature/q7-v24-work-development` is the implementation baseline.
- PR #2 and PR #3 are historical/draft references, not production.
- V3 foundation edits and their validation results belong to the V3 branch and V3 Draft PR.
- All P0–P7 gates remain OPEN unless specifically verified and documented.
