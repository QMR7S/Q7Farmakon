# Farmakon Q7

Existing Next.js + Supabase application in `QMR7S/Q7Farmakon`. Continue this project; do not recreate it, merge into main, deploy production or apply review SQL without isolated staging verification.

## Local development / Work

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run dev
```

The interface runs without Supabase environment variables. It clearly reports disconnected services and does not fabricate courses, subscriptions or analytics. The development command translates Work Preview's host/port flags for Next.js. Development and verification builds use separate output directories.

```bash
sites-preview start /absolute/path/to/Q7Farmakon
npm test
npm run build
npm run typecheck
```

`/review` displays the actual application routes in 360/390/768/1024/1440px frames with Arabic/English and light/dark controls. `/owner-review` is an explicitly read-only console with no owner data or privileges. It is disabled for Vercel production. `/media-lab` tests the real player with user-selected local video/VTT files; it uploads nothing and is not protected offline support.

## Connect isolated staging

Copy `.env.example` to `.env.local` only after confirming the correct Q7 project. Never reuse an old project URL or production secrets. Owner writes and study writes default off and require `FARMAKON_DEPLOY_ENV=staging`, an exact `FARMAKON_STAGING_PROJECT_REF` matching the Supabase URL, and a non-production Vercel environment. Media signing also requires this project pin and server-only credentials.

Owner access requires verified Google identity for `appsmr32@gmail.com` plus a separately provisioned database grant. Browser-controlled metadata cannot grant ownership. Do not enable writes before RLS, schema, storage and negative access tests pass.

SQL under `docs/sql` is **review-only**, not an applied migration. The available connected Farmakon-Staging project has no public tables; it was not modified or assumed to be Q7.

## Status

See `docs/Q7-V24-WORK-IMPLEMENTATION-REPORT-AR.md`. The UI and local build checks are implemented; 126 responsive DOM checks and local-video player checks are documented. Full database integration, atomic activation redemption, protected offline video, source-grounded AI, content management and complete device/browser acceptance are incomplete. No full-platform completion or production readiness is claimed.
