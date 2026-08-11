\set ON_ERROR_STOP on
\pset pager off

-- Schema and seed-catalogue shape checks.
-- RLS behaviour is covered separately in 01_rls_isolation.sql.

\echo '=== scenarios per category (custom is generated at runtime, not seeded) ==='
select category, count(*) as n, sum(case when is_premium then 1 else 0 end) as premium
from public.scenarios
group by category
order by category;

\echo ''
\echo '=== every seeded prompt carries the safety clause and the in-character rule ==='
-- The crisis sentinel is a hard requirement: a scenario without it could roleplay
-- a crisis (CLAUDE.md §2).
select
  count(*) as total,
  count(*) filter (where system_prompt like '%__REHEARSLY_CRISIS_STOP__%') as with_sentinel,
  count(*) filter (where system_prompt like '%Stay in character%') as with_in_character,
  count(*) filter (where length(system_prompt) < 400) as suspiciously_short
from public.scenarios;

\echo ''
\echo '=== every category from the brief is represented ==='
select
  count(*) as expected_categories_present
from (values
  ('workplace_feedback'), ('boundaries'), ('saying_no'), ('family'), ('career_coaching')
) as required (category)
where exists (select 1 from public.scenarios s where s.category = required.category);

\echo ''
\echo '=== handle_new_user creates a profile automatically ==='
insert into auth.users (id, email)
values ('33333333-3333-3333-3333-333333333333', 'cara@example.com');

select count(*) as profile_created
from public.profiles
where id = '33333333-3333-3333-3333-333333333333';

\echo ''
\echo '=== a session must reference a scenario or carry custom text ==='
do $$
begin
  insert into public.sessions (user_id, transcript)
  values ('33333333-3333-3333-3333-333333333333', '[]'::jsonb);
  raise notice 'FAIL: constraint did not fire';
exception
  when check_violation then
    raise notice 'PASS: session with neither subject rejected';
end
$$;

\echo ''
\echo '=== deleting an auth user cascades to their profile and sessions ==='
insert into public.sessions (user_id, custom_scenario_text, transcript)
values ('33333333-3333-3333-3333-333333333333', 'cara situation', '[]'::jsonb);

delete from auth.users where id = '33333333-3333-3333-3333-333333333333';

select
  (select count(*) from public.profiles where id = '33333333-3333-3333-3333-333333333333') as orphan_profiles,
  (select count(*) from public.sessions where user_id = '33333333-3333-3333-3333-333333333333') as orphan_sessions;

\echo ''
\echo '=== SCHEMA SHAPE CHECKS COMPLETE ==='
