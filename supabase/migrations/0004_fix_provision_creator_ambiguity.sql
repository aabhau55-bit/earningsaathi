-- ============================================================================
-- Fix: provision_creator's RETURNS TABLE output column `creator_email` shadows
-- the campaigns.creator_email column inside the function body (PL/pgSQL OUT
-- parameters are in scope as variables for the whole function), so the
-- unqualified reference in the "is this a new creator" check was ambiguous.
-- Same fix applied proactively to find_platform_user_by_email, which has the
-- identical shadowing risk (OUT column `role` vs platform_users.role) even
-- though it happened to work by luck of already being table-alias-qualified.
-- ============================================================================

create or replace function public.provision_creator(
  p_creator_email text, p_creator_name text, p_campaign_name text, p_app_slug text default null
)
returns table (token text, creator_email text, creator_name text, newly_created boolean)
language plpgsql security definer set search_path = public as $$
declare
  v_app_id uuid;
  v_is_new boolean;
  v_token text;
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

  v_is_new := not exists (
    select 1 from public.campaigns c where lower(c.creator_email) = lower(p_creator_email)
  );

  v_token := public.generate_campaign_token();

  insert into public.campaigns (app_id, creator_email, creator_name, name, token)
  values (v_app_id, p_creator_email, p_creator_name, p_campaign_name, v_token);

  return query select v_token, p_creator_email, p_creator_name, v_is_new;
end;
$$;
