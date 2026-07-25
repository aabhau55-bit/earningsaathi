-- ============================================================================
-- Earning Saathi Dashboard — platform schema (migration 0001)
-- Tables, RLS, the auth-signup trigger, and every READ-ONLY RPC the dashboard
-- calls today. Write RPCs that need to create real login accounts
-- (create_creator, create_admin, reset_password) are in migration 0002,
-- since those need the service-role key + a Server Action rework to call
-- Supabase's Admin API before touching this schema.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.apps (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.platform_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text check (role in ('super_admin', 'admin', 'creator')),
  app_id uuid references public.apps(id) on delete set null,
  created_at timestamptz not null default now()
);
create index platform_users_app_id_idx on public.platform_users(app_id);
create index platform_users_email_idx on public.platform_users(lower(email));

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  creator_id uuid not null references public.platform_users(id) on delete cascade,
  creator_email text not null,
  name text not null,
  token text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index campaigns_app_id_idx on public.campaigns(app_id);
create index campaigns_creator_id_idx on public.campaigns(creator_id);

-- One row per end-user who signed up through a campaign. `coins` is a
-- read/display column here — the PrizeUp app's own Supabase project is the
-- real source of truth for balances; this gets synced in later (roadmap
-- Phase 1/2), so it defaults to 0 until that sync exists.
create table public.campaign_signups (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  app_id uuid not null references public.apps(id) on delete cascade,
  external_user_id text not null,
  email text,
  coins bigint not null default 0,
  signed_up_at timestamptz not null default now()
);
create index campaign_signups_campaign_id_idx on public.campaign_signups(campaign_id);
create index campaign_signups_app_id_idx on public.campaign_signups(app_id);
create index campaign_signups_signed_up_at_idx on public.campaign_signups(signed_up_at);
create index campaign_signups_external_user_id_idx on public.campaign_signups(external_user_id);

-- ---------------------------------------------------------------------------
-- Helper functions (used by RLS policies and RPCs below)
-- ---------------------------------------------------------------------------

create or replace function public.current_role()
returns text
language sql stable security definer set search_path = public as $$
  select role from public.platform_users where id = auth.uid();
$$;

create or replace function public.current_app_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select app_id from public.platform_users where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'super_admin' from public.platform_users where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------------
-- Auto-provision a bare platform_users row whenever an auth user is created.
-- Role is left NULL — proxy.ts already treats "no role" as "no account yet,
-- sign out" — the create_creator/create_admin RPCs (migration 0002) fill in
-- role/name/app_id right after the auth user is created via the Admin API.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.platform_users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.apps enable row level security;
alter table public.platform_users enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_signups enable row level security;

-- apps: any recognized platform user can read; only super_admin can write
create policy apps_select on public.apps for select
  using (exists (select 1 from public.platform_users pu where pu.id = auth.uid()));
create policy apps_super_admin_write on public.apps for all
  using (public.is_super_admin()) with check (public.is_super_admin());

-- platform_users: read your own row (or any row, if super_admin)
create policy platform_users_select on public.platform_users for select
  using (id = auth.uid() or public.is_super_admin());
create policy platform_users_super_admin_update on public.platform_users for update
  using (public.is_super_admin()) with check (public.is_super_admin());

-- campaigns: super sees all; admin sees their app's; creator sees their own
create policy campaigns_select on public.campaigns for select
  using (
    public.is_super_admin()
    or app_id = public.current_app_id()
    or creator_id = auth.uid()
  );
create policy campaigns_update on public.campaigns for update
  using (public.is_super_admin() or app_id = public.current_app_id())
  with check (public.is_super_admin() or app_id = public.current_app_id());

-- campaign_signups: never selected directly by the client — only via the
-- SECURITY DEFINER RPCs below, which do their own authorization checks.
create policy campaign_signups_locked on public.campaign_signups for select using (false);

-- ---------------------------------------------------------------------------
-- Read RPCs
-- ---------------------------------------------------------------------------

create or replace function public.campaign_stats()
returns table (
  campaign_id uuid, token text, name text,
  app_id uuid, app_slug text, app_name text,
  creator_email text, active boolean, signups bigint
)
language sql stable security definer set search_path = public as $$
  select c.id, c.token, c.name, a.id, a.slug, a.name, c.creator_email, c.active,
         count(cs.id)
  from public.campaigns c
  join public.apps a on a.id = c.app_id
  left join public.campaign_signups cs on cs.campaign_id = c.id
  where public.is_super_admin() or c.app_id = public.current_app_id()
  group by c.id, a.id
  order by c.created_at desc;
$$;

create or replace function public.list_creators()
returns table (
  creator_email text, creator_name text,
  campaigns bigint, lifetime bigint, last_day bigint, last_week bigint
)
language sql stable security definer set search_path = public as $$
  select pu.email, pu.name,
         count(distinct c.id),
         count(cs.id),
         count(cs.id) filter (where cs.signed_up_at >= now() - interval '1 day'),
         count(cs.id) filter (where cs.signed_up_at >= now() - interval '7 days')
  from public.campaigns c
  join public.platform_users pu on pu.id = c.creator_id
  left join public.campaign_signups cs on cs.campaign_id = c.id
  where c.app_id = public.current_app_id()
  group by pu.email, pu.name;
$$;

create or replace function public.super_kpis(p_app_slug text default null)
returns table (
  total_users bigint, total_coins bigint, total_signups bigint,
  active_campaigns bigint, creators bigint, admins bigint
)
language plpgsql stable security definer set search_path = public as $$
declare v_app_id uuid;
begin
  if not public.is_super_admin() then raise exception 'not authorized'; end if;
  if p_app_slug is not null then select id into v_app_id from public.apps where slug = p_app_slug; end if;

  return query
  select
    (select count(distinct cs.external_user_id) from public.campaign_signups cs
       where v_app_id is null or cs.app_id = v_app_id),
    (select coalesce(sum(cs.coins), 0) from public.campaign_signups cs
       where v_app_id is null or cs.app_id = v_app_id),
    (select count(*) from public.campaign_signups cs
       where v_app_id is null or cs.app_id = v_app_id),
    (select count(*) from public.campaigns c where c.active and (v_app_id is null or c.app_id = v_app_id)),
    (select count(distinct c.creator_id) from public.campaigns c where v_app_id is null or c.app_id = v_app_id),
    (select count(*) from public.platform_users pu where pu.role = 'admin' and (v_app_id is null or pu.app_id = v_app_id));
end;
$$;

create or replace function public.signups_over_time(p_app_slug text default null, p_days int default 30)
returns table (day date, signups bigint)
language plpgsql stable security definer set search_path = public as $$
declare v_app_id uuid;
begin
  if not public.is_super_admin() then raise exception 'not authorized'; end if;
  if p_app_slug is not null then select id into v_app_id from public.apps where slug = p_app_slug; end if;

  return query
  select d.day::date, coalesce(count(cs.id), 0)
  from generate_series(current_date - (p_days - 1), current_date, interval '1 day') as d(day)
  left join public.campaign_signups cs
    on cs.signed_up_at::date = d.day::date
    and (v_app_id is null or cs.app_id = v_app_id)
  group by d.day
  order by d.day;
end;
$$;

create or replace function public.signups_by_app()
returns table (app_name text, signups bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_super_admin() then raise exception 'not authorized'; end if;
  return query
  select a.name, count(cs.id)
  from public.apps a
  left join public.campaign_signups cs on cs.app_id = a.id
  group by a.name
  order by a.name;
end;
$$;

create or replace function public.list_admins()
returns table (
  admin_id uuid, email text, name text, app_slug text,
  creators bigint, campaigns bigint, signups bigint
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_super_admin() then raise exception 'not authorized'; end if;
  return query
  select pu.id, pu.email, pu.name, a.slug,
         count(distinct c.creator_id),
         count(distinct c.id),
         count(cs.id)
  from public.platform_users pu
  left join public.apps a on a.id = pu.app_id
  left join public.campaigns c on c.app_id = pu.app_id
  left join public.campaign_signups cs on cs.campaign_id = c.id
  where pu.role = 'admin'
  group by pu.id, pu.email, pu.name, a.slug;
end;
$$;

create or replace function public.admin_creators(p_admin_id uuid)
returns table (
  creator_email text, creator_name text, campaigns bigint,
  last_day bigint, last_week bigint, last_month bigint, lifetime bigint
)
language plpgsql stable security definer set search_path = public as $$
declare v_app_id uuid;
begin
  if not public.is_super_admin() then raise exception 'not authorized'; end if;
  select app_id into v_app_id from public.platform_users where id = p_admin_id;

  return query
  select pu.email, pu.name,
         count(distinct c.id),
         count(cs.id) filter (where cs.signed_up_at >= now() - interval '1 day'),
         count(cs.id) filter (where cs.signed_up_at >= now() - interval '7 days'),
         count(cs.id) filter (where cs.signed_up_at >= now() - interval '30 days'),
         count(cs.id)
  from public.campaigns c
  join public.platform_users pu on pu.id = c.creator_id
  left join public.campaign_signups cs on cs.campaign_id = c.id
  where c.app_id = v_app_id
  group by pu.email, pu.name;
end;
$$;

create or replace function public.campaign_users(p_campaign_id uuid)
returns table (external_user_id text, email text, coins bigint, app_slug text, signed_up_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare v_campaign record;
begin
  select c.app_id, c.creator_id into v_campaign from public.campaigns c where c.id = p_campaign_id;
  if v_campaign is null then raise exception 'not found'; end if;
  if not (public.is_super_admin() or v_campaign.app_id = public.current_app_id() or v_campaign.creator_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  return query
  select cs.external_user_id, cs.email, cs.coins, a.slug, cs.signed_up_at
  from public.campaign_signups cs
  join public.apps a on a.id = cs.app_id
  where cs.campaign_id = p_campaign_id
  order by cs.signed_up_at desc;
end;
$$;

create or replace function public.creator_stats()
returns table (
  campaign_id uuid, name text, app_slug text,
  last_hour bigint, last_day bigint, last_week bigint, last_month bigint, lifetime bigint
)
language sql stable security definer set search_path = public as $$
  select c.id, c.name, a.slug,
         count(cs.id) filter (where cs.signed_up_at >= now() - interval '1 hour'),
         count(cs.id) filter (where cs.signed_up_at >= now() - interval '1 day'),
         count(cs.id) filter (where cs.signed_up_at >= now() - interval '7 days'),
         count(cs.id) filter (where cs.signed_up_at >= now() - interval '30 days'),
         count(cs.id)
  from public.campaigns c
  join public.apps a on a.id = c.app_id
  left join public.campaign_signups cs on cs.campaign_id = c.id
  where c.creator_id = auth.uid()
  group by c.id, a.slug;
$$;

-- ---------------------------------------------------------------------------
-- Write RPCs that don't touch auth.users (safe to include now)
-- ---------------------------------------------------------------------------

create or replace function public.register_app(p_slug text, p_name text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_super_admin() then raise exception 'not authorized'; end if;
  insert into public.apps (slug, name) values (lower(p_slug), p_name);
end;
$$;

create or replace function public.set_role(p_email text, p_role text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_super_admin() then raise exception 'not authorized'; end if;
  if p_role not in ('super_admin', 'admin', 'creator') then raise exception 'invalid role'; end if;
  if lower(p_email) = lower((select email from public.platform_users where id = auth.uid())) then
    raise exception 'cannot change your own role';
  end if;
  update public.platform_users set role = p_role where lower(email) = lower(p_email);
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants — RLS above still applies on top of these for direct table access;
-- RPCs are SECURITY DEFINER and do their own authorization checks internally.
-- Nothing is granted to `anon` — every path requires a signed-in platform user.
-- ---------------------------------------------------------------------------

grant select on public.apps, public.platform_users, public.campaigns to authenticated;
grant update on public.campaigns to authenticated;

grant execute on function
  public.campaign_stats(),
  public.list_creators(),
  public.super_kpis(text),
  public.signups_over_time(text, int),
  public.signups_by_app(),
  public.list_admins(),
  public.admin_creators(uuid),
  public.campaign_users(uuid),
  public.creator_stats(),
  public.register_app(text, text),
  public.set_role(text, text)
to authenticated;
