import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
// Deterministic source fingerprint. These are the V2.4-approved application sources,
// NOT a substitute for pixel-perfect comparison with the original visual reference.
function sourceFingerprint(value) {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

test("student navigation routes are unique and valid", () => {
  const file = read("src/lib/platform/navigation.ts");
  const paths = [...file.matchAll(/^\s*\["(\/[^"]*)",/gm)].map((x) => x[1]);
  assert.ok(paths.length >= 15);
  assert.equal(paths.length, new Set(paths).size);
  for (const p of paths) assert.match(p, /^\/[a-z-]*$/);
});

test("mobile destinations and nested lesson states remain functional", () => {
  const shell = read("src/components/platform/Shell.tsx");
  const workspace = read("src/components/platform/Workspace.tsx");
  const route = read("src/app/[section]/page.tsx");
  assert.match(shell, /destinations\.slice\(0, 5\)/);
  assert.match(workspace, /section === "more"/);
  assert.match(route, /destinations\.map/);
  assert.match(shell, /path\.startsWith\("\/lessons\/"\)/);
  assert.match(shell, /aria-current=\{selectedPath/);
  assert.match(shell, /aria-label=\{tr\(ar, en\)\}/);
});

test("preserve existing login and dashboard visual implementations", () => {
  const refs = {
    "src/components/AuthForm.tsx": "03301707",
    "src/components/platform/StudentHome.tsx": "80d9cd54",
    "src/app/platform.css": "3e035170",
    "src/app/globals.css": "5d7d6f9e",
    "src/app/owner/owner.module.css": "8999714a",
    "src/components/platform/Icon.tsx": "03fdb9a9",
  };
  for (const [path, expected] of Object.entries(refs)) {
    assert.equal(sourceFingerprint(read(path)), expected, "Unreviewed visual change: " + path);
  }
  const layout = read("src/app/layout.tsx");
  assert.doesNotMatch(layout, /import "\.\/v3\.css"/);
  assert.equal(existsSync(new URL("src/app/v3.css", root)), false);
  assert.match(read("src/components/platform/Shell.tsx"), /F<span>•<\/span>/);
});

test("approved CSS continues to support dark theme, focus and reduced motion", () => {
  const css = read("src/app/platform.css");
  assert.match(css, /html\[data-theme="dark"\]/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media \(max-width: 700px\)/);
});
