-- Rehearsly initial schema.
--
-- Auth users are managed by Supabase Auth; `profiles` extends them with the
-- streak state and the onboarding experiment arm.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  streak_count int not null default 0,
  last_practice_date date,
  onboarding_variant text check (onboarding_variant in ('A', 'B')),
  created_at timestamptz not null default now()
);

comment on column public.profiles.onboarding_variant is
  'Layers growth experiment arm: A = pick a scenario first, B = describe your situation first.';

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  category text not null check (
    category in (
      'workplace_feedback',
      'boundaries',
      'saying_no',
      'family',
      'career_coaching',
      'custom'
    )
  ),
  title text not null,
  description text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  system_prompt text not null,
  is_premium boolean not null default false
);

comment on column public.scenarios.system_prompt is
  'Roleplay persona prompt. Must instruct the model to stay in character and to '
  'emit the crisis sentinel rather than engage with crisis content.';

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  scenario_id uuid references public.scenarios (id) on delete set null,
  custom_scenario_text text,
  transcript jsonb not null default '[]'::jsonb,
  feedback jsonb,
  duration_seconds int check (duration_seconds is null or duration_seconds >= 0),
  created_at timestamptz not null default now(),

  -- A session comes from a preset scenario or from the user's own text, never neither.
  constraint sessions_has_a_subject check (
    scenario_id is not null or custom_scenario_text is not null
  )
);

-- The history list and streak calculation both read a user's sessions newest-first.
create index if not exists sessions_user_created_idx
  on public.sessions (user_id, created_at desc);

create index if not exists scenarios_category_idx
  on public.scenarios (category);

-- Create the profile row automatically so the client never has to race it.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
