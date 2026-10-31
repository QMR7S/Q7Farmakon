-- REVIEW ONLY. Not automatically applied. Verify the Q7 project/schema first.
-- Foreign keys to lessons must be reconciled with the confirmed Q7 lessons schema.
begin;
create table public.q7_private_notes (
 user_id uuid not null references auth.users(id) on delete cascade,
 lesson_id uuid not null,
 text text not null default '' check(char_length(text)<=50000),
 video_second double precision not null default 0 check(video_second>=0 and video_second<=604800),
 pdf_page integer not null default 1 check(pdf_page between 1 and 100000),
 revision integer not null default 1 check(revision>0),
 updated_at timestamptz not null default now(),
 primary key(user_id,lesson_id)
);
create table public.q7_learning_progress (
 user_id uuid not null references auth.users(id) on delete cascade,
 lesson_id uuid not null,
 video_second double precision not null default 0 check(video_second>=0 and video_second<=604800),
 pdf_page integer not null default 1 check(pdf_page between 1 and 100000),
 revision integer not null default 1 check(revision>0),
 updated_at timestamptz not null default now(),
 primary key(user_id,lesson_id)
);
-- Database-enforced revisions protect even direct Data API writers from silently
-- overwriting a newer version. A client must read before writing after a conflict.
create function public.q7_check_learning_revision() returns trigger
language plpgsql security invoker set search_path=pg_catalog as $$
begin
 if TG_OP='INSERT' then
  if NEW.revision<>1 then raise exception 'invalid_initial_revision' using errcode='23514'; end if;
 else
  if NEW.user_id<>OLD.user_id or NEW.lesson_id<>OLD.lesson_id then raise exception 'immutable_identity' using errcode='23514'; end if;
  if NEW.revision<>OLD.revision+1 then raise exception 'revision_conflict' using errcode='40001'; end if;
 end if;
 NEW.updated_at=statement_timestamp();
 return NEW;
end $$;
revoke all on function public.q7_check_learning_revision() from public;
create trigger q7_notes_revision before insert or update on public.q7_private_notes for each row execute function public.q7_check_learning_revision();
create trigger q7_progress_revision before insert or update on public.q7_learning_progress for each row execute function public.q7_check_learning_revision();
alter table public.q7_private_notes enable row level security;
alter table public.q7_learning_progress enable row level security;
revoke all on public.q7_private_notes,public.q7_learning_progress from public,anon,authenticated;
grant select,insert,update,delete on public.q7_private_notes,public.q7_learning_progress to authenticated;
create policy q7_notes_read on public.q7_private_notes for select to authenticated using(user_id=(select auth.uid()));
create policy q7_notes_insert on public.q7_private_notes for insert to authenticated with check(user_id=(select auth.uid()));
create policy q7_notes_update on public.q7_private_notes for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy q7_notes_delete on public.q7_private_notes for delete to authenticated using(user_id=(select auth.uid()));
create policy q7_progress_read on public.q7_learning_progress for select to authenticated using(user_id=(select auth.uid()));
create policy q7_progress_insert on public.q7_learning_progress for insert to authenticated with check(user_id=(select auth.uid()));
create policy q7_progress_update on public.q7_learning_progress for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy q7_progress_delete on public.q7_learning_progress for delete to authenticated using(user_id=(select auth.uid()));
commit;
