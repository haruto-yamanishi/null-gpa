-- Gate leaderboard access behind a recent grade submission or a lightweight re-entry check.
-- Re-entry uses seat number + one randomly selected previously submitted subject score.
-- This is intentional lightweight verification, not strong identity authentication.

create table if not exists public.ranking_access_grants (
  session_user_id uuid primary key references auth.users(id) on delete cascade,
  verified_participant_user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ranking_reentry_challenges (
  session_user_id uuid primary key references auth.users(id) on delete cascade,
  participant_user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null references public.subjects(id) on delete cascade,
  attempts integer not null default 0 check (attempts between 0 and 5),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.ranking_access_grants enable row level security;
alter table public.ranking_reentry_challenges enable row level security;

revoke all on public.ranking_access_grants from anon, authenticated;
revoke all on public.ranking_reentry_challenges from anon, authenticated;

create or replace function public.has_ranking_access()
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.ranking_access_grants rag
    where rag.session_user_id = auth.uid()
      and rag.expires_at > now()
  );
$$;

revoke all on function public.has_ranking_access() from public;
grant execute on function public.has_ranking_access() to authenticated;

create or replace function public.grant_ranking_access_after_submission()
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if not exists (
    select 1 from public.gpa_snapshots gs where gs.user_id = v_user_id
  ) then
    return false;
  end if;

  insert into public.ranking_access_grants (
    session_user_id,
    verified_participant_user_id,
    expires_at,
    updated_at
  ) values (
    v_user_id,
    v_user_id,
    now() + interval '12 hours',
    now()
  )
  on conflict (session_user_id) do update set
    verified_participant_user_id = excluded.verified_participant_user_id,
    expires_at = excluded.expires_at,
    updated_at = excluded.updated_at;

  return true;
end;
$$;

revoke all on function public.grant_ranking_access_after_submission() from public;
grant execute on function public.grant_ranking_access_after_submission() to authenticated;

create or replace function public.begin_ranking_reentry(p_seat_number integer)
returns table (
  subject_id text,
  subject_name text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_session_user_id uuid := auth.uid();
  v_participant_user_id uuid;
  v_subject_id text;
begin
  if v_session_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_seat_number < 401 or p_seat_number > 440 then
    return;
  end if;

  select p.user_id
  into v_participant_user_id
  from public.profiles p
  where p.seat_number = p_seat_number;

  if v_participant_user_id is null then
    return;
  end if;

  select g.subject_id
  into v_subject_id
  from public.grade_submissions g
  where g.user_id = v_participant_user_id
    and g.score is not null
  order by random()
  limit 1;

  if v_subject_id is null then
    return;
  end if;

  insert into public.ranking_reentry_challenges (
    session_user_id,
    participant_user_id,
    subject_id,
    attempts,
    expires_at,
    created_at
  ) values (
    v_session_user_id,
    v_participant_user_id,
    v_subject_id,
    0,
    now() + interval '10 minutes',
    now()
  )
  on conflict (session_user_id) do update set
    participant_user_id = excluded.participant_user_id,
    subject_id = excluded.subject_id,
    attempts = 0,
    expires_at = excluded.expires_at,
    created_at = excluded.created_at;

  return query
  select s.id, s.name
  from public.subjects s
  where s.id = v_subject_id;
end;
$$;

revoke all on function public.begin_ranking_reentry(integer) from public;
grant execute on function public.begin_ranking_reentry(integer) to authenticated;

create or replace function public.verify_ranking_reentry(
  p_seat_number integer,
  p_score numeric
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_session_user_id uuid := auth.uid();
  v_challenge public.ranking_reentry_challenges%rowtype;
  v_expected_score numeric;
  v_actual_seat_number integer;
begin
  if v_session_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_score < 0 or p_score > 100 then
    return false;
  end if;

  select *
  into v_challenge
  from public.ranking_reentry_challenges c
  where c.session_user_id = v_session_user_id
    and c.expires_at > now()
    and c.attempts < 5
  for update;

  if not found then
    return false;
  end if;

  update public.ranking_reentry_challenges
  set attempts = attempts + 1
  where session_user_id = v_session_user_id;

  select p.seat_number
  into v_actual_seat_number
  from public.profiles p
  where p.user_id = v_challenge.participant_user_id;

  if v_actual_seat_number is distinct from p_seat_number then
    return false;
  end if;

  select g.score
  into v_expected_score
  from public.grade_submissions g
  where g.user_id = v_challenge.participant_user_id
    and g.subject_id = v_challenge.subject_id;

  if v_expected_score is null or v_expected_score is distinct from p_score then
    return false;
  end if;

  insert into public.ranking_access_grants (
    session_user_id,
    verified_participant_user_id,
    expires_at,
    updated_at
  ) values (
    v_session_user_id,
    v_challenge.participant_user_id,
    now() + interval '12 hours',
    now()
  )
  on conflict (session_user_id) do update set
    verified_participant_user_id = excluded.verified_participant_user_id,
    expires_at = excluded.expires_at,
    updated_at = excluded.updated_at;

  delete from public.ranking_reentry_challenges
  where session_user_id = v_session_user_id;

  return true;
end;
$$;

revoke all on function public.verify_ranking_reentry(integer, numeric) from public;
grant execute on function public.verify_ranking_reentry(integer, numeric) to authenticated;

-- GPA board: require a valid ranking access grant.
drop function if exists public.get_gpa_leaderboard();
create function public.get_gpa_leaderboard()
returns table (
  rank bigint,
  participant_count bigint,
  top_percent numeric,
  pseudonym text,
  display_name text,
  seat_number integer,
  gpa numeric,
  is_me boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.has_ranking_access() then
    raise exception 'ranking access verification required' using errcode = '42501';
  end if;

  return query
  with ranked as (
    select
      gs.user_id,
      p.pseudonym,
      case
        when p.identity_mode = 'named' then nullif(btrim(p.display_name), '')
        else null
      end as projected_display_name,
      case
        when p.seat_number_visibility = 'public' then p.seat_number
        else null
      end as projected_seat_number,
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
    r.projected_seat_number,
    r.projected_gpa,
    r.user_id = auth.uid()
  from ranked r
  order by r.position asc, r.pseudonym asc;
end;
$$;

revoke all on function public.get_gpa_leaderboard() from public;
grant execute on function public.get_gpa_leaderboard() to authenticated;

-- Subject board: same access gate.
drop function if exists public.get_subject_leaderboard(text);
create function public.get_subject_leaderboard(p_subject_id text)
returns table (
  subject_id text,
  rank bigint,
  participant_count bigint,
  pseudonym text,
  display_name text,
  seat_number integer,
  score numeric,
  is_me boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.has_ranking_access() then
    raise exception 'ranking access verification required' using errcode = '42501';
  end if;

  return query
  with ranked as (
    select
      g.user_id,
      g.subject_id,
      p.pseudonym,
      case
        when p.identity_mode = 'named' then nullif(btrim(p.display_name), '')
        else null
      end as projected_display_name,
      case
        when p.seat_number_visibility = 'public' then p.seat_number
        else null
      end as projected_seat_number,
      case
        when g.visibility = 'public' then g.score
        else null
      end as projected_score,
      rank() over (order by g.score desc) as position,
      count(*) over () as total
    from public.grade_submissions g
    join public.profiles p on p.user_id = g.user_id
    where g.subject_id = p_subject_id
      and g.score is not null
  )
  select
    r.subject_id,
    r.position,
    r.total,
    r.pseudonym,
    r.projected_display_name,
    r.projected_seat_number,
    r.projected_score,
    r.user_id = auth.uid()
  from ranked r
  order by r.position asc, r.pseudonym asc;
end;
$$;

revoke all on function public.get_subject_leaderboard(text) from public;
grant execute on function public.get_subject_leaderboard(text) to authenticated;
