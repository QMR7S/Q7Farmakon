# Farmakon Q7 V2.3 — Security, implementation & acceptance

## Status
Reviewed code on **feature/q7-v23-owner-player-2026-10-31** only. No production merge or deployment. Staging project connected to this account has **no matching public courses / lessons / enrollments tables** in the read-only schema inspection on 2026-10-31. The companion SQL file is deliberately under `docs/sql` (not in automatic migrations). Verify which Supabase project belongs to Q7 before any write.

## Colors from repository login
Read-only inspection of `src/app/globals.css`: #2447B5 primary, #1A3590 hover, #F4F7F5 background, #FFFFFF surface, #DCEBE3 mint, #14232B ink. New owner shell uses these; preview review uses same.

## Owner login requirements
User-specified Google account: `appsmr32@gmail.com`. Server checks verified Auth user, exact email and Google identity. Privilege requires separately provisioned `q7_owner_grants` row for `auth.uid()`. Do not rely on editable user metadata. No self-provisioning endpoint. After applying and reviewing migration to isolated Staging, owner signs in with Google. Qualified DBA reviews user ID + Google identity and inserts grant via privileged console. Do not insert based on email string supplied by frontend.

## Write safety
Server actions for course drafts and one-time code generation require owner access plus **FARMAKON_DEPLOY_ENV=staging** and **FARMAKON_OWNER_WRITES_ENABLED=true**. They return clear errors when missing. Never enable these on Vercel production. Free preview limit is metadata until the lesson delivery endpoint enforces it server-side. All paid lesson media must be stored in a private bucket and served only via short-lived signed URLs after checking the active entitlement.

## Activation periods
Annual = 365 days from activation, NOT from code creation; custom = validated day count; lifetime = null expires_at with a separately active entitlement record. On expiration/revocation, all non-free videos and protected files revert to locked. Existing `enrollments` consumers must filter status='active' and (expires_at is null OR expires_at > now()). Use a single atomic DB transaction to redeem a code and decrement usage; do not ever trust a client-supplied duration.

## Content pipeline pending
Instructor course cover, description, stage, subject, units, lesson order; per-course free preview count plus lesson visibility; resumable video upload, transcoding to actual available resolutions, VTT captions, video poster and storyboard, chapters, signed URL player, offline entitlement sync and revocation.

## Preview UX acceptance
Glass controls inside player: single settings popover for speed, available quality and captions; auto-dismiss, escape and outside click, full accessibility and RTL/LTR. Timeline scrub thumbnail of actual frame and smooth seek. Do not display fake quality options or transcript panel underneath. Mobile bottom dock must not overlap content and player must be usable on 360px phones. Dark/light + Arabic/English. Disabled actions need a reason, not fake success.

## Outstanding
- Build/CI verification on real isolated environment, schema migration review, Google provider settings, OAuth redirect allowlist.
- Provision owner grant after first Google sign in, RLS and negative role tests.
- Atomic code redemption and entitlement enforcement on video/PDF endpoints.
- Upload pipeline incl. transcoding, cache/auth and device offline testing.
- Accurate university/stage stats and course subscribers; verify old enrollments schema; data may be unavailable in preview.
- Complete admin CRUD for lessons, videos, analytics, accounts, teachers, notifications, audit logs, backups.
- Device/browser visual QA and accessibility, no production release until separately approved.
