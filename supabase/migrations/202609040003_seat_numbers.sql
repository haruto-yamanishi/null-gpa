-- Add grade-4 seat numbers (401-440) as a required, unique participant key.
-- A seat number is only exposed by leaderboard RPCs when the participant marks it Public.

alter table public.profiles
  add column if not exists seat_number integer,
  add column if not exists seat_number_visibility text not null default 'private';

-- The launch database is expected to have no legacy profiles without a seat number.
-- Keeping this at the database layer prevents accidental registrations without one.
alter table public.profiles
  alter column seat_number set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_seat_number_range'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_seat_number_range check (seat_number between 401 and 440);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_seat_number_visibility_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_seat_number_visibility_check
      check (seat_number_visibility in ('public', 'private'));
  end if;
end
$$;

create unique index if not exists profiles_seat_number_unique
  on public.profiles (seat_number);

-- Return the seat number only when its owner marked it Public.
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
$$;

revoke all on function public.get_gpa_leaderboard() from public;
grant execute on function public.get_gpa_leaderboard() to authenticated;

-- Subject boards use the same identity/seat-number projection rules.
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
language sql
security definer
set search_path = public, pg_temp
as $$
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
$$;

revoke all on function public.get_subject_leaderboard(text) from public;
grant execute on function public.get_subject_leaderboard(text) to authenticated;
