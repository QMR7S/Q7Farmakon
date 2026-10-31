import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {parseLearningState,matchesQ7Database} from '../src/lib/learning/state-policy.ts';
test('learning payload rejects identity spoofing, unbounded input and invalid revisions',()=>{
 const value={text:'ملاحظتي',revision:0,video_second:10.5,pdf_page:2};
 assert.deepEqual(parseLearningState('notes',value),value);
 for(const bad of [{...value,user_id:'other'},{...value,revision:-1},{...value,video_second:Infinity},{...value,pdf_page:0},{...value,text:'x'.repeat(50001)},{...value,revision:'1'}])assert.equal(parseLearningState('notes',bad),null);
 assert.equal(parseLearningState('progress',value),null);
 assert.equal(matchesQ7Database('https://mafahnyjhzemzwiyazzr.supabase.co','qfzharpouemueipsrduv'),false);
 assert.equal(matchesQ7Database('https://qfzharpouemueipsrduv.supabase.co','qfzharpouemueipsrduv'),true);
 assert.equal(matchesQ7Database('https://qfzharpouemueipsrduv.supabase.co.evil.test','qfzharpouemueipsrduv'),false);
});
test('private learning SQL: RLS isolation, immutable ownership and revision conflicts in local PostgreSQL WASM',async t=>{
 const db=new PGlite();const alice='00000000-0000-0000-0000-000000000010',bob='00000000-0000-0000-0000-000000000020',lesson='00000000-0000-0000-0000-000000000001';
 try{
 await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
 await db.query('insert into auth.users(id) values ($1),($2)',[alice,bob]);
 await db.exec(await readFile(new URL('../docs/sql/Q7-V24-PRIVATE-LEARNING-REVIEW.sql',import.meta.url),'utf8'));
 async function as(uid){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid]);await db.exec('set role authenticated')}
 await as(alice);
 for(const table of ['q7_private_notes','q7_learning_progress']){
 await t.test(`${table}: owner insert and read`,async()=>{await db.query(`insert into public.${table}(user_id,lesson_id) values($1,$2)`,[alice,lesson]);assert.equal((await db.query(`select * from public.${table}`)).rows.length,1)});
 await t.test(`${table}: different learner / teacher identity cannot read, change or delete`,async()=>{await as(bob);assert.equal((await db.query(`select * from public.${table}`)).rows.length,0);assert.equal((await db.query(`update public.${table} set revision=revision+1 returning revision`)).rows.length,0);assert.equal((await db.query(`delete from public.${table} returning lesson_id`)).rows.length,0);await assert.rejects(db.query(`insert into public.${table}(user_id,lesson_id) values($1,$2)`,[alice,lesson]),e=>e.code==='42501');await as(alice)});
 await t.test(`${table}: ownership is immutable and stale revision is rejected`,async()=>{await assert.rejects(db.query(`update public.${table} set user_id=$1,revision=2`,[bob]));const results=await Promise.all([db.query(`update public.${table} set revision=2 where revision=1 returning revision`),db.query(`update public.${table} set revision=2 where revision=1 returning revision`)]);assert.equal(results.reduce((n,r)=>n+r.rows.length,0),1);await assert.rejects(db.query(`update public.${table} set revision=2`),e=>e.code==='40001')});
 }
 await t.test('anonymous role has no read access',async()=>{await db.exec('reset role; set role anon');await assert.rejects(db.query('select * from public.q7_private_notes'),e=>e.code==='42501')});
 }finally{await db.close()}
});
