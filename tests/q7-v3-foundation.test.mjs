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

test("preserve approved sign-in and baseline CSS resources", () => {
  const refs = {
    "src/components/platform/StudentHome.tsx": "80d9cd54",
    "src/app/platform.css": "3e035170",
    "src/app/globals.css": "5d7d6f9e",
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

test("authentication uses original reference flows and real server actions",()=>{
 const auth=read("src/components/AuthForm.tsx");
 const css=read("src/app/auth-reference.css");
 const shell=read("src/components/platform/Shell.tsx");
 const actions=read("src/app/login/actions.ts");
 assert.match(auth,/ApprovedAuthSymbols/);
 assert.match(auth,/className="shell"/);
 assert.match(auth,/className="pane"/);
 assert.match(auth,/className="card"/);
 assert.match(auth,/className=\{\x60seg /);
 assert.match(auth,/ReferenceSelect name="stage"/);
 assert.match(auth,/ReferenceSelect name="uni"/);
 assert.match(auth,/ReferenceSelect name="gov"/);
 assert.match(auth,/action=\{formAction\}/);
 assert.match(actions,/signInWithPassword/);
 assert.match(actions,/auth\.signUp/);
 assert.match(shell,/\/\/ Approved authentication screen[^\n]*\n\s*if \(path === "\/login" \|\| path === "\/signup" \|\| path === "\/reset-password"\) return children;/);
 assert.match(css,/\.fk-auth/);
 assert.doesNotMatch(css,/(^|\n)body\s*\{/);
});

test("interior glass components are connected to real controls",()=>{
 const workspace = read("src/components/platform/Workspace.tsx");
 const owner = read("src/app/owner/OwnerConsole.tsx");
 const select = read("src/components/platform/GlassSelect.tsx");
 const glass = read("src/app/glass-motion.css");
 const ownCss = read("src/app/owner/owner.module.css");
 const icon = read("src/components/platform/Icon.tsx");
 assert.ok((workspace.match(/<GlassSelect/g)||[]).length>=6);
 assert.ok((owner.match(/<GlassSelect/g)||[]).length>=3);
 assert.doesNotMatch(workspace,/<select(?:\\s|>)/);
 assert.doesNotMatch(owner,/<select(?:\\s|>)/);
 assert.match(owner,/name="course_id" value=\\{chosenCourse\\}/);
 assert.match(owner,/name="period_type" value=\\{period\\}/);
 assert.match(select,/role="listbox"/);
 assert.match(select,/role="option"/);
 assert.match(select,/aria-expanded=\\{open\\}/);
 assert.match(select,/onKeyDown=\\{onKeys\\}/);
 assert.match(select,/searchable/);
 assert.match(glass,/backdrop-filter/);
 assert.match(glass,/prefers-reduced-motion/);
 assert.match(ownCss,/\.shell :global\\(\.q-glass-popover\\)/);
 assert.match(icon,/"chevron-down":/);
});
test("authentication remains visually isolated from interior motion rules",()=>{
 const motion=read("src/app/glass-motion.css");
 const auth=read("src/components/AuthForm.tsx");
 assert.match(auth,/className="fk-auth"/);
 assert.match(motion,/\.q-app:not\\(\.auth-layout\\)/);
 assert.doesNotMatch(motion,/\.fk-auth\\s*\\{/);
});
