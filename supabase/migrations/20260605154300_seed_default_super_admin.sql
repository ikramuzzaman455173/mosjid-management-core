-- ============================================================
-- DEFAULT SUPER ADMIN USER SEED MIGRATION
-- Email    : admin@info.com
-- Password : admin123
-- Role     : super_admin  (full access, cannot be deleted)
-- ============================================================

-- ── Step 1: Create the default super admin in auth.users ──────────────────
-- We use a fixed UUID so re-running this migration is idempotent.
DO $$
DECLARE
  v_admin_id  UUID := 'a0000000-0000-0000-0000-000000000001';
  v_email     TEXT := 'admin@info.com';
  -- Generate correct bcrypt hash at runtime using pgcrypto (always accurate)
  v_pwd_hash  TEXT := crypt('admin123', gen_salt('bf', 10));
BEGIN

  -- ❶ Remove any EXISTING user with this email that has a DIFFERENT UUID.
  --    This prevents the "users_email_partial_key" duplicate conflict.
  DELETE FROM auth.users
   WHERE email = v_email
     AND id   != v_admin_id;

  -- ❷ Insert into auth.users (Supabase internal table)
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    role,
    aud,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  VALUES (
    v_admin_id,
    '00000000-0000-0000-0000-000000000000',
    v_email,
    v_pwd_hash,
    now(),                                           -- email already confirmed
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Super Admin"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password  = EXCLUDED.encrypted_password,
    email_confirmed_at  = COALESCE(auth.users.email_confirmed_at, now()),
    updated_at          = now();

  -- ❸ Insert email identity row (required by Supabase Auth)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    v_admin_id,
    v_admin_id,
    jsonb_build_object('sub', v_admin_id::text, 'email', v_email),
    'email',
    v_email,
    now(),
    now(),
    now()
  )
  ON CONFLICT (provider, provider_id) DO UPDATE SET
    user_id       = EXCLUDED.user_id,
    identity_data = EXCLUDED.identity_data,
    updated_at    = now();

  -- ❹ Insert profile
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (v_admin_id, 'Super Admin', v_email)
  ON CONFLICT (id) DO NOTHING;

  -- ❺ Assign super_admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_admin_id, 'super_admin')
  ON CONFLICT (user_id, role) DO NOTHING;

END $$;



-- ── Step 2: Protect the super admin – block any DELETE attempt ────────────

CREATE OR REPLACE FUNCTION public.prevent_super_admin_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Block deletion of the fixed super admin UUID
  IF OLD.id = 'a0000000-0000-0000-0000-000000000001'::UUID THEN
    RAISE EXCEPTION 'এই সুপার অ্যাডমিন ব্যবহারকারী মুছে ফেলা যাবে না। (Protected super admin cannot be deleted.)';
  END IF;
  RETURN OLD;
END $$;

-- Attach trigger on auth.users so no one can delete this row
DROP TRIGGER IF EXISTS trg_protect_super_admin ON auth.users;
CREATE TRIGGER trg_protect_super_admin
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.prevent_super_admin_delete();


-- ── Step 3: Also block role removal for this super admin ─────────────────

CREATE OR REPLACE FUNCTION public.prevent_super_admin_role_removal()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.user_id = 'a0000000-0000-0000-0000-000000000001'::UUID
     AND OLD.role = 'super_admin' THEN
    RAISE EXCEPTION 'সুপার অ্যাডমিনের রোল সরানো যাবে না। (Cannot remove super_admin role from protected user.)';
  END IF;
  RETURN OLD;
END $$;

DROP TRIGGER IF EXISTS trg_protect_super_admin_role ON public.user_roles;
CREATE TRIGGER trg_protect_super_admin_role
  BEFORE DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_super_admin_role_removal();


-- ── Step 4: Auto-restore super admin if ALL users are deleted ────────────
-- Update the existing handle_new_user trigger to also handle the "no users"
-- edge-case, but a separate restore function is more robust.

CREATE OR REPLACE FUNCTION public.restore_default_super_admin()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id  UUID := 'a0000000-0000-0000-0000-000000000001';
  v_email     TEXT := 'admin@info.com';
  -- Generate correct bcrypt hash at runtime using pgcrypto
  v_pwd_hash  TEXT := crypt('admin123', gen_salt('bf', 10));
BEGIN
  -- Re-create in auth.users if missing
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    role, aud, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  )
  VALUES (
    v_admin_id,
    '00000000-0000-0000-0000-000000000000',
    v_email,
    v_pwd_hash,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Super Admin"}'::jsonb,
    'authenticated', 'authenticated', now(), now(),
    '', '', '', ''
  )
  ON CONFLICT (id) DO NOTHING;

  -- Re-create identity
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  )
  VALUES (
    v_admin_id, v_admin_id,
    jsonb_build_object('sub', v_admin_id::text, 'email', v_email),
    'email', v_email, now(), now(), now()
  )
  ON CONFLICT (provider, provider_id) DO NOTHING;

  -- Re-create profile
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (v_admin_id, 'Super Admin', v_email)
  ON CONFLICT (id) DO NOTHING;

  -- Re-assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_admin_id, 'super_admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;


-- ── Step 5: Trigger – auto-restore if auth.users becomes empty ───────────

CREATE OR REPLACE FUNCTION public.auto_restore_super_admin_if_empty()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_remaining INT;
BEGIN
  SELECT COUNT(*) INTO v_remaining FROM auth.users;
  IF v_remaining = 0 THEN
    PERFORM public.restore_default_super_admin();
  END IF;
  RETURN OLD;
END $$;

DROP TRIGGER IF EXISTS trg_auto_restore_super_admin ON auth.users;
CREATE TRIGGER trg_auto_restore_super_admin
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_restore_super_admin_if_empty();


-- ── Step 6: Update handle_new_user – first real user gets super_admin ─────
-- (Unchanged logic, but now skips the fixed admin UUID to avoid duplicating role)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  -- The fixed super admin already has its role; skip it
  IF NEW.id = 'a0000000-0000-0000-0000-000000000001'::UUID THEN
    RETURN NEW;
  END IF;

  -- Among non-admin users, first one gets super_admin
  SELECT COUNT(*) INTO user_count
    FROM auth.users
   WHERE id != 'a0000000-0000-0000-0000-000000000001'::UUID;

  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END $$;

-- ── Done ─────────────────────────────────────────────────────────────────
-- Credentials:
--   Email    : admin@info.com
--   Password : admin123
-- This user is permanently protected and cannot be deleted.
