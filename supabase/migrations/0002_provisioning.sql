-- ============================================================================
-- Earning Saathi Dashboard — provisioning RPCs (migration 0002)
-- These assume the caller (a Server Action, using the service-role client)
-- already created the auth.users row via supabase.auth.admin.createUser() —
-- Postgres functions can't call the Auth Admin API themselves. The trigger
-- from migration 0001 has already inserted a bare platform_users row by the
-- time these run; these just fill in role/name/app_id and, for creators,
-- the campaign.
-- ============================================================================

create or replace function public.generate_campaign_token()
returns text
language plpgsql as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I — avoids visual ambiguity
  result text;
begin
  loop
    result := '';
    for i in 1..8 loop
      result := result || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    end loop;
    exit when not exists (select 1 from public.campaigns where token = result);
  end loop;
  return result;
end;
$$;

-- Resolve a platform user's id/role by email, scoped to what the caller is
-- allowed to see: super_admin sees anyone; admin only sees their own app's
-- creators. Used to (a) detect "does this creator already exist" before
-- creating a referral link, and (b) resolve the target user id for password
-- resets. Never exposes users outside the caller's authority.
create or replace function public.find_platform_user_by_email(p_email text)
returns table (id uuid, role text)
language plpgsql stable security definer set search_path = public as $$
begin
  if public.is_super_admin() then
    return query select pu.id, pu.role from public.platform_users pu where lower(pu.email) = lower(p_email);
  elsif public.current_role() = 'admin' then
    return query
      select pu.id, pu.role from public.platform_users pu
      where lower(pu.email) = lower(p_email) and pu.role = 'creator' and pu.app_id = public.current_app_id();
  else
    raise exception 'not authorized';
  end if;
end;
$$;

-- p_app_slug: required for a super_admin call, omitted for an admin call
-- (defaults to the admin's own app). Idempotent on identity fields — calling
-- this again for an existing creator just adds a new campaign, it never
-- overwrites their name/app.
create or replace function public.provision_creator(
  p_user_id uuid, p_email text, p_creator_name text, p_campaign_name text, p_app_slug text default null
)
returns table (token text, creator_email text, creator_name text, newly_created boolean)
language plpgsql security definer set search_path = public as $$
declare
  v_app_id uuid;
  v_existing_role text;
  v_is_new boolean;
  v_token text;
  v_name text;
begin
  if p_app_slug is not null then
    select id into v_app_id from public.apps where slug = p_app_slug;
    if v_app_id is null then raise exception 'unknown app'; end if;
  else
    v_app_id := public.current_app_id();
  end if;
  if v_app_id is null then raise exception 'no app specified'; end if;

  if not (public.is_super_admin() or v_app_id = public.current_app_id()) then
    raise exception 'not authorized';
  end if;

  select role, name into v_existing_role, v_name from public.platform_users where id = p_user_id;

  if v_existing_role is null then
    update public.platform_users
      set role = 'creator', name = p_creator_name, app_id = v_app_id
      where id = p_user_id;
    v_is_new := true;
    v_name := p_creator_name;
  elsif v_existing_role = 'creator' then
    v_is_new := false;
  else
    raise exception 'this email belongs to a non-creator account';
  end if;

  v_token := public.generate_campaign_token();

  insert into public.campaigns (app_id, creator_id, creator_email, name, token)
  values (v_app_id, p_user_id, p_email, p_campaign_name, v_token);

  return query select v_token, p_email, v_name, v_is_new;
end;
$$;

-- super_admin only. Errors if p_user_id was already provisioned (an admin
-- account is always freshly created, never reused, unlike creators).
create or replace function public.provision_admin(p_user_id uuid, p_name text, p_app_slug text)
returns void
language plpgsql security definer set search_path = public as $$
declare v_app_id uuid; v_existing_role text;
begin
  if not public.is_super_admin() then raise exception 'not authorized'; end if;

  select id into v_app_id from public.apps where slug = p_app_slug;
  if v_app_id is null then raise exception 'unknown app'; end if;

  select role into v_existing_role from public.platform_users where id = p_user_id;
  if v_existing_role is not null then raise exception 'user already provisioned'; end if;

  update public.platform_users set role = 'admin', name = p_name, app_id = v_app_id where id = p_user_id;
end;
$$;

grant execute on function
  public.find_platform_user_by_email(text),
  public.provision_creator(uuid, text, text, text, text),
  public.provision_admin(uuid, text, text)
to authenticated;
