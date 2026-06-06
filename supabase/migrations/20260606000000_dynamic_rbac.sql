-- 20260606000000_dynamic_rbac.sql

-- 1. Create tables for Dynamic RBAC
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  UNIQUE(module, action)
);

CREATE TABLE public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE public.permission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  target_role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_logs ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.roles TO authenticated;
GRANT SELECT ON public.permissions TO authenticated;
GRANT SELECT ON public.role_permissions TO authenticated;

GRANT ALL ON public.roles TO service_role;
GRANT ALL ON public.permissions TO service_role;
GRANT ALL ON public.role_permissions TO service_role;
GRANT ALL ON public.permission_logs TO service_role;

-- Note: In this migration, we rely on public.is_admin() which will be updated below
-- For now, we temporarily disable RLS to allow seamless migration of user_roles
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Seed system roles (mapping from old enum)
INSERT INTO public.roles (name, is_system, description) VALUES
('super_admin', true, 'System Super Administrator with full access'),
('mosque_admin', true, 'Mosque Administrator'),
('imam', true, 'Imam of the Mosque'),
('muazzin', true, 'Muazzin of the Mosque'),
('treasurer', true, 'Treasurer managing finances'),
('committee', true, 'Committee Member'),
('auditor', true, 'Auditor'),
('accountant', true, 'Accountant'),
('reception', true, 'Reception Operator'),
('member', true, 'General Mosque Member'),
('volunteer', true, 'Volunteer');

-- 2. Migrate existing user_roles
ALTER TABLE public.user_roles ADD COLUMN role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE;

UPDATE public.user_roles ur
SET role_id = r.id
FROM public.roles r
WHERE r.name = ur.role::text;

-- Drop old unique constraint
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

-- Drop old column
ALTER TABLE public.user_roles DROP COLUMN role;

-- Add new constraints
ALTER TABLE public.user_roles ALTER COLUMN role_id SET NOT NULL;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_id_key UNIQUE(user_id, role_id);

-- Re-enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Replace Auth / Role Functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role_name TEXT)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = _user_id AND r.name = _role_name
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = _user_id AND r.name IN ('super_admin','mosque_admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.can_manage_finance(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = _user_id AND r.name IN ('super_admin','mosque_admin','treasurer','accountant')
  )
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _module TEXT, _action TEXT)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT 
    -- 1. Super admin always gets true
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = _user_id AND r.name = 'super_admin'
    )
    OR
    -- 2. Otherwise check role_permissions
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.role_permissions rp ON rp.role_id = ur.role_id
      JOIN public.permissions p ON p.id = rp.permission_id
      WHERE ur.user_id = _user_id AND p.module = _module AND p.action = _action
    )
$$;

-- Apply RLS using new is_admin
CREATE POLICY "admin manage roles" ON public.roles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admin manage permissions" ON public.permissions FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admin manage role_permissions" ON public.role_permissions FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admin manage permission_logs" ON public.permission_logs FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 4. Fix Triggers
CREATE OR REPLACE FUNCTION public.restore_default_super_admin()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id  UUID := 'a0000000-0000-0000-0000-000000000001';
  v_email     TEXT := 'admin@info.com';
  v_pwd_hash  TEXT := crypt('admin123', gen_salt('bf', 10));
  v_role_id   UUID;
BEGIN
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    role, aud, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    v_admin_id, '00000000-0000-0000-0000-000000000000', v_email, v_pwd_hash, now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Super Admin"}'::jsonb,
    'authenticated', 'authenticated', now(), now(), '', '', '', ''
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (v_admin_id, v_admin_id, jsonb_build_object('sub', v_admin_id::text, 'email', v_email), 'email', v_email, now(), now(), now())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, full_name, email)
  VALUES (v_admin_id, 'Super Admin', v_email)
  ON CONFLICT (id) DO NOTHING;

  SELECT id INTO v_role_id FROM public.roles WHERE name = 'super_admin';

  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (v_admin_id, v_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.prevent_super_admin_role_removal()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role_name TEXT;
BEGIN
  IF OLD.user_id = 'a0000000-0000-0000-0000-000000000001'::UUID THEN
    SELECT name INTO v_role_name FROM public.roles WHERE id = OLD.role_id;
    IF v_role_name = 'super_admin' THEN
      RAISE EXCEPTION 'সুপার অ্যাডমিনের রোল সরানো যাবে না। (Cannot remove super_admin role from protected user.)';
    END IF;
  END IF;
  RETURN OLD;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
  v_sa_role_id UUID;
  v_mem_role_id UUID;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email)
  ON CONFLICT (id) DO NOTHING;

  IF NEW.id = 'a0000000-0000-0000-0000-000000000001'::UUID THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO user_count FROM auth.users WHERE id != 'a0000000-0000-0000-0000-000000000001'::UUID;
  
  SELECT id INTO v_sa_role_id FROM public.roles WHERE name = 'super_admin';
  SELECT id INTO v_mem_role_id FROM public.roles WHERE name = 'member';

  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role_id) VALUES (NEW.id, v_sa_role_id) ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role_id) VALUES (NEW.id, v_mem_role_id) ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END $$;

-- 5. Seed Permissions Matrix
DO $$
DECLARE
  m TEXT;
  a TEXT;
  mods TEXT[] := ARRAY['Dashboard','Members','Monthly Chanda','Donations & Zakat','Income & Expense','Cash Management','Bank & Mobile Banking','Expense Categories','Meetings','Notice Board','Prayer Schedule','Gallery','Reports','User Management','Role & Permission','Settings','Backup & Restore'];
  acts TEXT[] := ARRAY['View','Create','Edit','Delete','Export','Settings'];
  v_sa_role_id UUID;
BEGIN
  FOREACH m IN ARRAY mods
  LOOP
    FOREACH a IN ARRAY acts
    LOOP
      INSERT INTO public.permissions (module, action, description)
      VALUES (m, a, 'Can ' || lower(a) || ' ' || m)
      ON CONFLICT (module, action) DO NOTHING;
    END LOOP;
  END LOOP;

  SELECT id INTO v_sa_role_id FROM public.roles WHERE name = 'super_admin';
  
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT v_sa_role_id, id FROM public.permissions
  ON CONFLICT DO NOTHING;
END $$;
