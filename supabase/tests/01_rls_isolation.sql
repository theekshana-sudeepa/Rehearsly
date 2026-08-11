\set ON_ERROR_STOP on
\pset pager off

-- Session-level SET (not SET LOCAL) so it applies outside a transaction block.
-- `postgres` owns the tables and would bypass RLS, so we must switch role.

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'ana@example.com'),
       ('22222222-2222-2222-2222-222222222222', 'ben@example.com');

insert into public.sessions (user_id, custom_scenario_text, transcript)
values ('11111111-1111-1111-1111-111111111111', 'ana private situation', '[]'::jsonb),
       ('22222222-2222-2222-2222-222222222222', 'ben private situation', '[]'::jsonb);

\echo ''
\echo '=== acting as Ana (authenticated) ==='
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select current_user as acting_role, auth.uid() as acting_uid;

\echo '--- sessions visible to Ana (expect 1, hers) ---'
select count(*) as visible, count(*) filter (where custom_scenario_text like 'ana%') as hers
from public.sessions;

\echo '--- profiles visible to Ana (expect 1) ---'
select count(*) as visible from public.profiles;

\echo '--- cross-user insert must be blocked ---'
do $$
begin
  insert into public.sessions (user_id, custom_scenario_text, transcript)
  values ('22222222-2222-2222-2222-222222222222', 'forged', '[]'::jsonb);
  raise notice 'FAIL: cross-user insert was allowed';
exception
  when insufficient_privilege then raise notice 'PASS: cross-user insert blocked';
end
$$;

\echo '--- deleting Bens session must affect 0 rows ---'
with gone as (
  delete from public.sessions where custom_scenario_text = 'ben private situation' returning 1
)
select count(*) as bens_rows_deleted_by_ana from gone;

\echo '--- updating Bens profile must affect 0 rows ---'
with touched as (
  update public.profiles set streak_count = 99
  where id = '22222222-2222-2222-2222-222222222222' returning 1
)
select count(*) as bens_profile_updated_by_ana from touched;

\echo '--- Ana can update her own profile ---'
with touched as (
  update public.profiles set streak_count = 5
  where id = '11111111-1111-1111-1111-111111111111' returning 1
)
select count(*) as own_profile_updated from touched;

\echo '--- scenario catalogue readable ---'
select count(*) as scenarios_visible from public.scenarios;

\echo '--- writing to the catalogue must be blocked ---'
do $$
begin
  insert into public.scenarios (category, title, description, difficulty, system_prompt)
  values ('custom', 'injected', 'injected', 'easy', 'injected');
  raise notice 'FAIL: authenticated could write scenarios';
exception
  when insufficient_privilege then raise notice 'PASS: catalogue writes blocked';
end
$$;

reset role;
reset request.jwt.claim.sub;

\echo ''
\echo '=== acting as anon ==='
set role anon;
select count(*) as anon_can_read_scenarios from public.scenarios;

do $$
begin
  perform count(*) from public.sessions;
  raise notice 'FAIL: anon could query sessions';
exception
  when insufficient_privilege then raise notice 'PASS: anon has no privilege on sessions';
end
$$;

do $$
begin
  perform count(*) from public.profiles;
  raise notice 'FAIL: anon could query profiles';
exception
  when insufficient_privilege then raise notice 'PASS: anon has no privilege on profiles';
end
$$;

reset role;
\echo ''
\echo '=== RLS CHECKS COMPLETE ==='
