-- Row Level Security.
--
-- Rule: a user may only read/write their own `profiles` and
-- `sessions` rows. `scenarios` is public-read and writable only by the service
-- role (no policy grants write, so writes require bypassing RLS).

alter table public.profiles enable row level security;
alter table public.scenarios enable row level security;
alter table public.sessions enable row level security;

-- Table privileges.
--
-- A hosted Supabase project grants these implicitly through default privileges
-- on the public schema, but we state them explicitly so the security model is
-- complete in the repo and least-privilege is visible: `anon` can read the
-- scenario catalogue and nothing else. RLS then narrows the authenticated
-- grants to own-row access.
grant usage on schema public to anon, authenticated;

grant select on public.scenarios to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.sessions to authenticated;

-- --- profiles ---------------------------------------------------------------

create policy "Users read their own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- The handle_new_user trigger normally inserts this, but allow a self-insert so
-- the client can recover if a profile is ever missing.
create policy "Users insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Required for the Settings "delete my data" flow.
create policy "Users delete their own profile"
  on public.profiles for delete
  to authenticated
  using (auth.uid() = id);

-- --- scenarios --------------------------------------------------------------

-- Readable by signed-in and anonymous users so the catalogue renders during a
-- guest/demo session. Intentionally no insert/update/delete policy.
create policy "Scenarios are public read"
  on public.scenarios for select
  to authenticated, anon
  using (true);

-- --- sessions ---------------------------------------------------------------

create policy "Users read their own sessions"
  on public.sessions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users create their own sessions"
  on public.sessions for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Feedback is attached after the transcript is saved, so update must be allowed.
create policy "Users update their own sessions"
  on public.sessions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete their own sessions"
  on public.sessions for delete
  to authenticated
  using (auth.uid() = user_id);
