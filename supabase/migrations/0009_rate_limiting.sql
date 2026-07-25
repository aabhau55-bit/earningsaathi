-- ============================================================================
-- Rate limiting (migration 0009)
-- Reuses this platform's own database — no new external service. Backs the
-- public, unauthenticated /creator/<code> stats lookup, which otherwise has
-- no abuse protection (anyone can hammer it trying to guess email/code
-- combinations). SECURITY DEFINER + no RLS policies means only this function
-- can touch the table — direct table access is denied to everyone,
-- including anon, which is exactly what lets an anonymous visitor safely
-- trigger a rate-limit check without any other table access.
-- ============================================================================

create table public.rate_limit_hits (
  id         bigint generated always as identity primary key,
  key        text not null,
  created_at timestamptz not null default now()
);
create index rate_limit_hits_key_created_idx on public.rate_limit_hits(key, created_at);

alter table public.rate_limit_hits enable row level security;
-- Intentionally no policies — direct access denied for every role, anon
-- included. Only check_rate_limit() (SECURITY DEFINER) can read/write it.

create or replace function public.check_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_count int;
begin
  -- Keep the table bounded regardless of which window a given caller uses.
  delete from public.rate_limit_hits where created_at < now() - interval '1 hour';

  insert into public.rate_limit_hits (key) values (p_key);

  select count(*) into v_count
  from public.rate_limit_hits
  where key = p_key and created_at >= now() - make_interval(secs => p_window_seconds);

  return v_count <= p_limit;
end;
$$;

grant execute on function public.check_rate_limit(text, int, int) to anon, authenticated;
