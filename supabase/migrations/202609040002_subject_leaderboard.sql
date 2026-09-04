-- Public subject leaderboard projection.
-- Raw grade_submissions remain protected by RLS. This RPC exposes rank for every participant,
-- but only exposes the numeric score when that participant marked the subject Public.

create or replace function public.get_subject_leaderboard(p_subject_id text)
returns table (
  subject_id text,
  rank bigint,
  participant_count bigint,
  pseudonym text,
  display_name text,
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
    r.projected_score,
    r.user_id = auth.uid()
  from ranked r
  order by r.position asc, r.pseudonym asc;
$$;

revoke all on function public.get_subject_leaderboard(text) from public;
grant execute on function public.get_subject_leaderboard(text) to authenticated;
