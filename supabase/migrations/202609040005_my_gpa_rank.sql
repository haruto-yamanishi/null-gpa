-- Return only the caller's own GPA rank so My Page can show it without
-- exposing the full leaderboard or requiring a ranking access grant.
create or replace function public.get_my_gpa_rank()
returns table (
  rank bigint,
  participant_count bigint,
  top_percent numeric
)
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  with ranked as (
    select
      gs.user_id,
      rank() over (order by gs.gpa desc) as position,
      count(*) over () as total
    from public.gpa_snapshots gs
    where gs.gpa is not null
  )
  select
    r.position,
    r.total,
    round((100.0 * r.position::numeric) / nullif(r.total, 0), 1)
  from ranked r
  where r.user_id = auth.uid();
$$;

revoke all on function public.get_my_gpa_rank() from public;
grant execute on function public.get_my_gpa_rank() to authenticated;
