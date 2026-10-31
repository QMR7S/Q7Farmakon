import test from "node:test";
import assert from "node:assert/strict";
import { isIsolatedStaging } from "../src/lib/platform/environment.ts";
import { validateStudy } from "../src/lib/platform/study-validation.ts";
const env = {
  FARMAKON_DEPLOY_ENV: "staging",
  FARMAKON_STAGING_PROJECT_REF: "abcdefghijklmnopqrst",
  NEXT_PUBLIC_SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co",
};
test("staging must pin the exact Supabase project and reject production", () => {
  assert.equal(isIsolatedStaging(env), true);
  for (const patch of [
    { FARMAKON_DEPLOY_ENV: "production" },
    { FARMAKON_STAGING_PROJECT_REF: "" },
    { NEXT_PUBLIC_SUPABASE_URL: "https://other.supabase.co" },
    { NEXT_PUBLIC_SUPABASE_URL: "http://abcdefghijklmnopqrst.supabase.co" },
    { VERCEL_ENV: "production" },
    { NEXT_PUBLIC_SUPABASE_URL: "invalid" },
  ])
    assert.equal(isIsolatedStaging({ ...env, ...patch }), false);
});
test("study payload permits bounded plain text and precise seconds", () => {
  const value = {
    note: "<script>plain text only</script>",
    seconds: 12.35,
    pdf_page: 2,
    version: 0,
  };
  assert.deepEqual(validateStudy({ ...value, user_id: "forged" }), value);
});
test("invalid progress, oversized notes, pages and versions fail closed", () => {
  const base = { note: "note", seconds: 0, pdf_page: 1, version: 0 };
  for (const patch of [
    { note: "x".repeat(20001) },
    { seconds: -1 },
    { seconds: Infinity },
    { seconds: NaN },
    { seconds: 604801 },
    { pdf_page: 0 },
    { pdf_page: 1.5 },
    { version: -1 },
    { version: 2 ** 32 },
    { note: null },
  ])
    assert.equal(validateStudy({ ...base, ...patch }), null);
  assert.equal(validateStudy(null), null);
});
