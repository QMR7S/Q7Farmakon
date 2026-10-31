import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
test("V3 navigation destinations are unique and nonempty", () => {
 const file=read("src/lib/platform/navigation.ts");
 const paths=[...file.matchAll(/^\s*\["(\/[^"]*)",/gm)].map(x=>x[1]);
 assert.ok(paths.length>=15,"student destinations expected");
 assert.equal(paths.length,new Set(paths).size,"duplicate route");
 for(const p of paths) assert.ok(/^\/[a-z-]*$/.test(p),"unsafe route: "+p);
});
test("V3 mobile more and lesson paths remain reachable",()=>{
 const shell=read("src/components/platform/Shell.tsx");
 const workspace=read("src/components/platform/Workspace.tsx");
 const route=read("src/app/[section]/page.tsx");
 assert.match(shell,/destinations\.slice\(0, 5\)/);
 assert.match(workspace,/section === "more"/);
 assert.match(route,/destinations\.map/);
 assert.match(shell,/path\.startsWith\("\/lessons\/"\)/);
 assert.match(shell,/aria-current=\{selectedPath/);
 assert.match(shell,/aria-label=\{tr\(ar, en\)\}/);
});
test("V3 system keeps dark mode, focus and reduced motion",()=>{
 const css=read("src/app/v3.css");
 const layout=read("src/app/layout.tsx");
 assert.match(layout,/import "\.\/v3\.css"/);
 assert.match(css,/html\[data-theme="dark"\]/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/@media\(max-width:700px\)/);
});
test("V3 uses brand icon rather than fake cover or emoji navigation",()=>{
 const shell=read("src/components/platform/Shell.tsx");
 const icon=read("src/components/platform/Icon.tsx");
 assert.match(shell,/name="pharmacy"/);
 assert.match(icon,/pharmacy:/);
 assert.doesNotMatch(shell,/F<span>•<\/span>/);
});
