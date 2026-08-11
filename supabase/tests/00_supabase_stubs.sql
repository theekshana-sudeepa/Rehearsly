-- Minimal stubs for the Supabase-managed objects the migrations depend on,
-- so the migrations can be validated against real Postgres locally.

create schema if not exists auth;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique
);

-- Supabase exposes the current user id via auth.uid().
create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

-- Roles that RLS policies are granted to.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
end
$$;

-- Hosted Supabase grants these so RLS policies can call auth.uid().
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
