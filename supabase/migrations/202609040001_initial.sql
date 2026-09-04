-- NULL GPA MVP schema for Supabase.
-- This launch architecture intentionally does NOT claim operator blindness:
-- Supabase project administrators remain inside the trust boundary.

create table if not exists public.subjects (
  id text primary key,
  academic_year integer not null,
  grade_level integer not null,
  name text not null,
  credits integer not null check (credits > 0),
  term text not null check (term in ('first-half', 'second-half', 'full-year', 'other'))
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pseudonym text not null unique default upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8)),
  identity_mode text not null default 'anonymous' check (identity_mode in ('anonymous', 'named')),
  display_name text,
  gpa_visibility text not null default 'private' check (gpa_visibility in ('public', 'private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint named_profile_requires_name check (
    identity_mode = 'anonymous' or nullif(btrim(display_name), '') is not null
  )
);

create table if not exists public.grade_submissions (
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null references public.subjects(id) on delete cascade,
  score numeric(5,2) check (score between 0 and 100),
  visibility text not null default 'private' check (visibility in ('public', 'private')),
  updated_at timestamptz not null default now(),
  primary key (user_id, subject_id)
);

create table if not exists public.gpa_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  gpa numeric(6,4) not null check (gpa between 0 and 4),
  graded_credits integer not null check (graded_credits > 0),
  updated_at timestamptz not null default now()
);

alter table public.subjects enable row level security;
alter table public.profiles enable row level security;
alter table public.grade_submissions enable row level security;
alter table public.gpa_snapshots enable row level security;

-- Subject metadata is not private.
drop policy if exists subjects_read_authenticated on public.subjects;
create policy subjects_read_authenticated
  on public.subjects
  for select
  to authenticated
  using (true);

-- A signed-in participant can only access their own profile directly.
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self
  on public.profiles
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
  on public.profiles
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
  on public.profiles
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Raw subject scores are never directly readable by other participants.
drop policy if exists grades_select_self on public.grade_submissions;
create policy grades_select_self
  on public.grade_submissions
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists grades_insert_self on public.grade_submissions;
create policy grades_insert_self
  on public.grade_submissions
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists grades_update_self on public.grade_submissions;
create policy grades_update_self
  on public.grade_submissions
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- A participant can inspect only their own derived GPA row directly.
drop policy if exists gpa_select_self on public.gpa_snapshots;
create policy gpa_select_self
  on public.gpa_snapshots
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists gpa_insert_self on public.gpa_snapshots;
create policy gpa_insert_self
  on public.gpa_snapshots
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists gpa_update_self on public.gpa_snapshots;
create policy gpa_update_self
  on public.gpa_snapshots
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

revoke all on public.subjects from anon;
revoke all on public.profiles from anon;
revoke all on public.grade_submissions from anon;
revoke all on public.gpa_snapshots from anon;

grant select on public.subjects to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.grade_submissions to authenticated;
grant select, insert, update on public.gpa_snapshots to authenticated;

insert into public.subjects (id, academic_year, grade_level, name, credits, term)
values
  ('english-4', 2026, 4, '英語IV', 4, 'full-year'),
  ('psychology', 2026, 4, '心理学', 2, 'first-half'),
  ('analysis-1', 2026, 4, '解析学I', 2, 'first-half'),
  ('discrete-math', 2026, 4, '離散数学', 2, 'full-year'),
  ('cognitive-science', 2026, 4, '認知科学', 4, 'full-year'),
  ('pe-4', 2026, 4, '保健体育IV', 2, 'full-year'),
  ('web-programming-2', 2026, 4, 'WebプログラミングII', 2, 'full-year'),
  ('computer-architecture', 2026, 4, 'コンピュータアーキテクチャ', 2, 'full-year'),
  ('neighborhood', 2026, 4, 'ネイバーフッド演習', 2, 'full-year'),
  ('design-engineering', 2026, 4, 'デザインエンジニアリング演習', 2, 'full-year')
on conflict (id) do update set
  academic_year = excluded.academic_year,
  grade_level = excluded.grade_level,
  name = excluded.name,
  credits = excluded.credits,
  term = excluded.term;

create or replace function public.refresh_my_gpa()
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_gpa numeric;
  v_credits integer;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  select
    sum(
      (case
        when g.score >= 90 then 4
        when g.score >= 80 then 3
        when g.score >= 70 then 2
        when g.score >= 60 then 1
        else 0
      end) * s.credits
    )::numeric / nullif(sum(s.credits), 0),
    coalesce(sum(s.credits), 0)::integer
  into v_gpa, v_credits
  from public.grade_submissions g
  join public.subjects s on s.id = g.subject_id
  where g.user_id = v_user_id
    and g.score is not null;

  if v_credits = 0 or v_gpa is null then
    delete from public.gpa_snapshots where user_id = v_user_id;
    return;
  end if;

  insert into public.gpa_snapshots (user_id, gpa, graded_credits, updated_at)
  values (v_user_id, v_gpa, v_credits, now())
  on conflict (user_id) do update set
    gpa = excluded.gpa,
    graded_credits = excluded.graded_credits,
    updated_at = excluded.updated_at;
end;
$$;

revoke all on function public.refresh_my_gpa() from public;
grant execute on function public.refresh_my_gpa() to authenticated;

-- The leaderboard function can see all GPA rows, but returns only the public projection.
-- Private GPA values never appear in the RPC result.
create or replace function public.get_gpa_leaderboard()
returns table (
  rank bigint,
  participant_count bigint,
  top_percent numeric,
  pseudonym text,
  display_name text,
  gpa numeric,
  is_me boolean
)
language sql
security definer
set search_path = public, pg_temp
as $$
  with ranked as (
    select
      gs.user_id,
      p.pseudonym,
      case
        when p.identity_mode = 'named' then nullif(btrim(p.display_name), '')
        else null
      end as projected_display_name,
      case
        when p.gpa_visibility = 'public' then gs.gpa
        else null
      end as projected_gpa,
      rank() over (order by gs.gpa desc) as position,
      count(*) over () as total
    from public.gpa_snapshots gs
    join public.profiles p on p.user_id = gs.user_id
    where gs.gpa is not null
  )
  select
    r.position,
    r.total,
    round((100.0 * r.position::numeric) / nullif(r.total, 0), 1),
    r.pseudonym,
    r.projected_display_name,
    r.projected_gpa,
    r.user_id = auth.uid()
  from ranked r
  order by r.position asc, r.pseudonym asc;
$$;

revoke all on function public.get_gpa_leaderboard() from public;
grant execute on function public.get_gpa_leaderboard() to authenticated;

-- Returns only the caller's subject score/rank plus thresholded aggregates.
-- It never returns another participant's raw score.
create or replace function public.get_subject_statistics(p_subject_id text)
returns table (
  subject_id text,
  score numeric,
  rank bigint,
  participant_count bigint,
  average numeric,
  median numeric,
  deviation numeric
)
language sql
security definer
set search_path = public, pg_temp
as $$
  with pool as (
    select g.user_id, g.score
    from public.grade_submissions g
    where g.subject_id = p_subject_id
      and g.score is not null
  ),
  ranked as (
    select
      p.user_id,
      p.score,
      rank() over (order by p.score desc) as position
    from pool p
  ),
  aggregates as (
    select
      count(*)::bigint as n,
      avg(p.score)::numeric as avg_score,
      percentile_cont(0.5) within group (order by p.score)::numeric as median_score,
      stddev_pop(p.score)::numeric as stddev_score
    from pool p
  )
  select
    p_subject_id,
    me.score,
    me.position,
    a.n,
    case
      when a.n < 10 then null
      when a.n < 20 then round(a.avg_score, 0)
      else round(a.avg_score, 1)
    end,
    case
      when a.n < 10 then null
      when a.n < 20 then round(a.median_score, 0)
      else round(a.median_score, 1)
    end,
    case
      when a.n < 10 or a.stddev_score is null or a.stddev_score = 0 then null
      when a.n < 20 then round(50 + 10 * ((me.score - a.avg_score) / a.stddev_score), 0)
      else round(50 + 10 * ((me.score - a.avg_score) / a.stddev_score), 1)
    end
  from ranked me
  cross join aggregates a
  where me.user_id = auth.uid();
$$;

revoke all on function public.get_subject_statistics(text) from public;
grant execute on function public.get_subject_statistics(text) to authenticated;
