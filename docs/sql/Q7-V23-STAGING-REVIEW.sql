-- REVIEW ONLY: DO NOT APPLY TO PRODUCTION. Requires staging backup and schema audit.
-- This is a non-auto-running reference; reconcile existing courses/enrollments schema first.
begin;
create table if not exists public.q7_owner_grants (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now()
);
alter table public.q7_owner_grants enable row level security;
revoke all on public.q7_owner_grants from anon, authenticated;
grant select on public.q7_owner_grants to authenticated;
drop policy if exists q7_owner_read_own on public.q7_owner_grants;
create policy q7_owner_read_own on public.q7_owner_grants for select to authenticated
  using (user_id=(select auth.uid()));

-- Owner grants must be inserted by a trusted database administrator AFTER Google
-- identity is verified. Never expose an owner-grant insert/update API to students.
-- See docs/Q7-V23-SECURITY-REVIEW.md for setup guidance.

create table if not exists public.q7_student_academic_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 university text,
 stage smallint check (stage between 1 and 8),
 updated_at timestamptz not null default now()
);
alter table public.q7_student_academic_profiles enable row level security;
grant select, insert, update on public.q7_student_academic_profiles to authenticated;
drop policy if exists q7_academic_select on public.q7_student_academic_profiles;
create policy q7_academic_select on public.q7_student_academic_profiles for select to authenticated
using (user_id=(select auth.uid()) or exists(select 1 from public.q7_owner_grants g where g.user_id=(select auth.uid())));
drop policy if exists q7_academic_insert_own on public.q7_student_academic_profiles;
create policy q7_academic_insert_own on public.q7_student_academic_profiles for insert to authenticated with check(user_id=(select auth.uid()));
drop policy if exists q7_academic_update_own on public.q7_student_academic_profiles;
create policy q7_academic_update_own on public.q7_student_academic_profiles for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create index if not exists q7_academic_university_stage on public.q7_student_academic_profiles(university,stage);

-- Existing courses table must be inspected before running ALTER TABLE.
do $$
begin
 if to_regclass('public.courses') is not null then
  execute 'alter table public.courses add column if not exists free_preview_limit integer not null default 0';
  execute 'alter table public.courses add column if not exists cover_path text';
  execute 'alter table public.courses add constraint q7_preview_limit_nonnegative check(free_preview_limit between 0 and 1000) not valid';
  -- Validate this constraint only after reviewing existing data.
 end if;
end $$;

create table if not exists public.q7_activation_codes (
 id uuid primary key default gen_random_uuid(),
 course_id uuid not null, -- add validated FK after verifying existing courses.id type
 code_hash text not null unique check(length(code_hash)=64),
 period_type text not null check(period_type in ('annual','lifetime','custom')),
 duration_days integer check(duration_days between 1 and 36500),
 status text not null default 'active' check(status in ('active','disabled')),
 uses_remaining integer not null default 1 check(uses_remaining>=0),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 check((period_type='lifetime' and duration_days is null) or (period_type<>'lifetime' and duration_days is not null))
);
alter table public.q7_activation_codes enable row level security;
grant select, insert, update on public.q7_activation_codes to authenticated;
drop policy if exists q7_code_owner_select on public.q7_activation_codes;
create policy q7_code_owner_select on public.q7_activation_codes for select to authenticated
 using (exists (select 1 from public.q7_owner_grants g where g.user_id=(select auth.uid())));
drop policy if exists q7_code_owner_insert on public.q7_activation_codes;
create policy q7_code_owner_insert on public.q7_activation_codes for insert to authenticated
 with check (created_by=(select auth.uid()) and exists(select 1 from public.q7_owner_grants g where g.user_id=(select auth.uid())));
drop policy if exists q7_code_owner_update on public.q7_activation_codes;
create policy q7_code_owner_update on public.q7_activation_codes for update to authenticated
 using (exists(select 1 from public.q7_owner_grants g where g.user_id=(select auth.uid())))
 with check (exists(select 1 from public.q7_owner_grants g where g.user_id=(select auth.uid())));

-- No plaintext activation code is stored. Redemption MUST use a server-only,
-- atomic transaction that locks the code row and checks uses_remaining.
-- Student clients must NOT have SELECT on activation code table.
-- IMPORTANT: remove SELECT grant above when replacing with a privileged owner-
-- only RPC (a table-level grant can still expose rows if policies are weakened).
commit;
