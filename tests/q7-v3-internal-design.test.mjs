import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL("../"+p,import.meta.url),"utf8");
const css = read("src/app/internal-identity.css");

test("Internal design imports only after legacy CSS and outside auth layouts",()=>{
 const layout = read("src/app/layout.tsx");
 assert.match(layout,/import "\.\/platform\.css";\s*import "\.\/internal-identity\.css";/);
 assert.match(css,/\.q-app:not\(\.auth-layout\)/);
 assert.doesNotMatch(css,/(^|\n)\.q-auth-card\s*\{|(^|\n)\.q-auth-form\s*\{/);
 assert.doesNotMatch(css,/(^|\n)body\s*\{/);
 assert.doesNotMatch(css,/(^|\n):root\s*\{/);
 assert.doesNotMatch(css,/(^|\n)\.auth-layout\s*\{/);
});

test("Interior palette is copied from approved HTML reference for dark and light",()=>{
 for(const color of ["#F4F6FC","#FFFFFF","#0C1233","#586284","#DDE2F0","#1578D4","#060A22","#0D1336","#EEF2FF","#9AA5CC","#1E2750","#3FBAFD","#FDC23A","#FD8D4B","#FA6956","#2D9DF3"]){
  assert.ok(css.includes(color),"Missing approved color "+color);
 }
 assert.match(css,/html\[data-theme="dark"\] \.q-app:not\(\.auth-layout\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/@media\(max-width:700px\)/);
 assert.match(css,/\/brand\/farmakon-icon\.webp/);
});

test("Approved brand asset is a genuine WebP and retains its identity",()=>{
 const file=new URL("../public/brand/farmakon-icon.webp",import.meta.url);
 assert.ok(existsSync(file),"Missing original logo asset");
 const a=readFileSync(file);
 assert.ok(a.length>10000,"Logo should not be a dummy icon");
 assert.equal(a.subarray(0,4).toString("ascii"),"RIFF");
 assert.equal(a.subarray(8,12).toString("ascii"),"WEBP");
});

test("No login/sign-up visual CSS overlays have been introduced",()=>{
 const form=read("src/components/AuthForm.tsx");
 assert.match(form,/className="q-auth-card"/);
 assert.match(form,/className="q-auth-story"/);
 assert.match(form,/className="q-auth-form"/);
 assert.match(css,/\.q-app:not\(\.auth-layout\) \.q-sidebar/);
 assert.match(css,/\.q-app:not\(\.auth-layout\) \.q-continue/);
 assert.match(css,/\.q-app:not\(\.auth-layout\) \.q-panel/);
});
