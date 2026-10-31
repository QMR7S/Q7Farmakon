-- REVIEW ONLY. Not applied. Requires confirmed isolated Q7 staging and verified
-- public.lessons UUID primary key, schema backup, RLS and concurrency tests.
begin;
create table public.q7_private_study (
 user_id uuid not null references auth.users(id) on delete cascade,
 lesson_id uuid not null references public.lessons(id) on delete cascade,
 note text not null default '' check(length(note)<=20000),
 seconds double precision not null default 0 check(seconds>=0 and seconds<=604800),
 pdf_page integer not null default 1 check(pdf_page between 1 and 100000),
 version integer not null default 1 check(version>0),
 updated_at timestamptz not null default now(),
 primary key(user_id,lesson_id)
);
alter table public.q7_private_study enable row level security;
revoke all on public.q7_private_study from anon, authenticated;
grant select,insert,update,delete on public.q7_private_study to authenticated;
create policy q7_study_read on public.q7_private_study for select to authenticated using ((select auth.uid())=user_id);
create policy q7_study_insert on public.q7_private_study for insert to authenticated with check ((select auth.uid())=user_id);
create policy q7_study_update on public.q7_private_study for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy q7_study_delete on public.q7_private_study for delete to authenticated using ((select auth.uid())=user_id);
-- Deliberately no instructor or owner SELECT policy for private student notes.
-- API saves use compare-and-swap version predicates; stale writes return HTTP 409.
commit;
