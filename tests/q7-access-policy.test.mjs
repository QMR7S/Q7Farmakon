import test from "node:test";
import assert from "node:assert/strict";
import {
  freePreviewLessonIds, isEnrollmentActive, determineLessonAccess, expiryForActivation
} from "../src/lib/courses/access-policy.ts";

const units=[{id:"u-2",position:2},{id:"u-1",position:1}];
const lessons=[
 {id:"a",unit_id:"u-2",position:1,status:"published"},
 {id:"b",unit_id:"u-1",position:2,status:"published"},
 {id:"c",unit_id:"u-1",position:1,status:"published"},
 {id:"d",unit_id:"u-1",position:0,status:"draft"}
];
const now=new Date("2026-11-01T00:00:00.000Z");
const active={user_id:"student",course_id:"course",status:"active",expires_at:"2026-11-02T00:00:00.000Z"};

test("first N are ordered by units/lessons, drafts never preview",()=>{
 assert.deepEqual([...freePreviewLessonIds(lessons,units,2)],["c","b"]);
 assert.deepEqual([...freePreviewLessonIds(lessons,units,0)],[]);
});
test("invalid preview count fails closed",()=>{
 for(const n of [-1,1.2,1001,NaN])assert.throws(()=>freePreviewLessonIds(lessons,units,n));
});
test("active before expiry, locked at exact expiry, and revoked never active",()=>{
 assert.equal(isEnrollmentActive(active,"course","student",now),true);
 assert.equal(isEnrollmentActive(active,"course","student",new Date(active.expires_at)),false);
 assert.equal(isEnrollmentActive({...active,status:"revoked"},"course","student",now),false);
 assert.equal(isEnrollmentActive({...active,expires_at:null},"course","student",now),true);
 assert.equal(isEnrollmentActive({...active,status:"expired",expires_at:null},"course","student",now),false);
 assert.equal(isEnrollmentActive({...active,expires_at:"bad-date"},"course","student",now),false);
 assert.equal(isEnrollmentActive(active,"other","student",now),false);
 assert.equal(isEnrollmentActive(active,"course","other",now),false);
});
test("free preview works without login; subscriptions require matching identity",()=>{
 const previews=freePreviewLessonIds(lessons,units,1);
 const base={coursePublished:true,freeLessonIds:previews,enrollments:[active],courseId:"course",now};
 assert.equal(determineLessonAccess({...base,lessonId:"c",userId:null}),"free-preview");
 assert.equal(determineLessonAccess({...base,lessonId:"b",userId:null}),"locked");
 assert.equal(determineLessonAccess({...base,lessonId:"b",userId:"other"}),"locked");
 assert.equal(determineLessonAccess({...base,lessonId:"b",userId:"student"}),"subscribed");
 assert.equal(determineLessonAccess({...base,lessonId:"c",userId:"student",coursePublished:false}),"locked");
});
test("activation expires 365 days/custom days from redemption, lifetime stays null",()=>{
 const t=new Date("2026-10-31T12:00:00Z");
 assert.equal(expiryForActivation("annual",t),new Date(t.getTime()+365*86400000).toISOString());
 assert.equal(expiryForActivation("custom",t,90),new Date(t.getTime()+90*86400000).toISOString());
 assert.equal(expiryForActivation("lifetime",t),null);
 assert.throws(()=>expiryForActivation("custom",t,0));
 assert.throws(()=>expiryForActivation("custom",t,36501));
});
