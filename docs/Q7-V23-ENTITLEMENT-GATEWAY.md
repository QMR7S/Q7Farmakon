# Q7 V2.3 video entitlement gateway (not yet activated)

`GET /api/media/lessons/:id/play` uses a published lesson from the DB and checks the published course.

The first N published lessons in stable (unit position, lesson position, lesson ID) order are free previews as configured in `courses.free_preview_limit`. Every other published lesson requires the authenticated user's **active** enrollment for that course and a future `expires_at` or null (lifetime). All routes fail closed if schema is missing.

Only a server-side storage client may issue a 90-second signed URL for media in the **private** `course-videos` bucket. `SUPABASE_SERVICE_ROLE_KEY` must remain server-only; never include it in `NEXT_PUBLIC_*` or expose it through logs, preview HTML, or source. When the gateway is not configured it returns a 503 instead of a fake link.

**Important pending tests**: schema parity in isolated staging; unique lesson ordering, storage policy review, signed URL forwarding and expiration, accidental CDN caching, concurrent redemption, album revocation, multi-quality sources, offline cache license and expired entitlements. Signed URLs valid until their short TTL and cannot alone instantly revoke media already fetched or cached. App must check entitlement again whenever it asks for a new playback URL or initiates download.

**Not a streaming service**: transcoding/HLS, thumbnails, captions, video uploads, rate limits, watermarking and reliable offline licenses require additional integration and tests. No production activation approved.
