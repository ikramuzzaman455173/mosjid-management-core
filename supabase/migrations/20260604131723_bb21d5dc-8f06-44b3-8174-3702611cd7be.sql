
-- ============= ENUMS =============
CREATE TYPE meeting_kind AS ENUM ('general','emergency','annual','committee');
CREATE TYPE meeting_status AS ENUM ('scheduled','completed','cancelled');
CREATE TYPE attendance_status AS ENUM ('present','absent','late');
CREATE TYPE committee_position AS ENUM ('president','vice_president','secretary','joint_secretary','treasurer','member');
CREATE TYPE committee_status AS ENUM ('active','expired','dissolved');
CREATE TYPE resolution_status AS ENUM ('proposed','passed','rejected');
CREATE TYPE vote_choice AS ENUM ('yes','no','abstain');
CREATE TYPE asset_condition AS ENUM ('good','fair','poor');
CREATE TYPE stock_kind AS ENUM ('in','out');
CREATE TYPE audit_action AS ENUM ('insert','update','delete');

-- ============= MEETINGS =============
CREATE TABLE public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  meeting_date timestamptz NOT NULL,
  location text,
  kind meeting_kind NOT NULL DEFAULT 'general',
  status meeting_status NOT NULL DEFAULT 'scheduled',
  agenda text,
  minutes text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meetings TO authenticated;
GRANT ALL ON public.meetings TO service_role;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view meetings" ON public.meetings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage meetings" ON public.meetings FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE TRIGGER touch_meetings BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.meeting_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  uploaded_by uuid,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meeting_documents TO authenticated;
GRANT ALL ON public.meeting_documents TO service_role;
ALTER TABLE public.meeting_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view meeting_docs" ON public.meeting_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage meeting_docs" ON public.meeting_documents FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE TABLE public.meeting_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  status attendance_status NOT NULL DEFAULT 'present',
  remarks text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (meeting_id, member_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meeting_attendance TO authenticated;
GRANT ALL ON public.meeting_attendance TO service_role;
ALTER TABLE public.meeting_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view attendance" ON public.meeting_attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage attendance" ON public.meeting_attendance FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- ============= COMMITTEES =============
CREATE TABLE public.committees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tenure_start date NOT NULL,
  tenure_end date,
  status committee_status NOT NULL DEFAULT 'active',
  description text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.committees TO authenticated;
GRANT ALL ON public.committees TO service_role;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view committees" ON public.committees FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage committees" ON public.committees FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE TRIGGER touch_committees BEFORE UPDATE ON public.committees FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.committee_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id uuid NOT NULL REFERENCES public.committees(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  position committee_position NOT NULL DEFAULT 'member',
  joined_at date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (committee_id, member_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.committee_members TO authenticated;
GRANT ALL ON public.committee_members TO service_role;
ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view committee_members" ON public.committee_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage committee_members" ON public.committee_members FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE TABLE public.resolutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id uuid REFERENCES public.committees(id) ON DELETE CASCADE,
  meeting_id uuid REFERENCES public.meetings(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text,
  resolution_date date DEFAULT CURRENT_DATE,
  status resolution_status NOT NULL DEFAULT 'proposed',
  created_by uuid,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resolutions TO authenticated;
GRANT ALL ON public.resolutions TO service_role;
ALTER TABLE public.resolutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view resolutions" ON public.resolutions FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage resolutions" ON public.resolutions FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE TABLE public.resolution_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id uuid NOT NULL REFERENCES public.resolutions(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  vote vote_choice NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (resolution_id, member_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resolution_votes TO authenticated;
GRANT ALL ON public.resolution_votes TO service_role;
ALTER TABLE public.resolution_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view votes" ON public.resolution_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage votes" ON public.resolution_votes FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- ============= ASSETS =============
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  purchase_date date,
  purchase_price numeric DEFAULT 0,
  current_value numeric DEFAULT 0,
  condition asset_condition NOT NULL DEFAULT 'good',
  location text,
  photo_url text,
  notes text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view assets_tbl" ON public.assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage assets_tbl" ON public.assets FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE TRIGGER touch_assets BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============= INVENTORY =============
CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  unit text NOT NULL DEFAULT 'pcs',
  current_stock numeric NOT NULL DEFAULT 0,
  min_stock numeric NOT NULL DEFAULT 0,
  unit_price numeric DEFAULT 0,
  notes text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_items TO authenticated;
GRANT ALL ON public.inventory_items TO service_role;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view inventory" ON public.inventory_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage inventory" ON public.inventory_items FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE TRIGGER touch_inventory BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.stock_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  kind stock_kind NOT NULL,
  quantity numeric NOT NULL,
  reason text,
  txn_date date DEFAULT CURRENT_DATE,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_transactions TO authenticated;
GRANT ALL ON public.stock_transactions TO service_role;
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view stock_txn" ON public.stock_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage stock_txn" ON public.stock_transactions FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Auto-update inventory stock when transactions are inserted
CREATE OR REPLACE FUNCTION public.apply_stock_txn()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.kind = 'in' THEN
    UPDATE public.inventory_items SET current_stock = current_stock + NEW.quantity WHERE id = NEW.item_id;
  ELSE
    UPDATE public.inventory_items SET current_stock = current_stock - NEW.quantity WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER apply_stock_txn_trg AFTER INSERT ON public.stock_transactions FOR EACH ROW EXECUTE FUNCTION public.apply_stock_txn();

-- ============= AUDIT LOGS =============
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid,
  actor_email text,
  action audit_action NOT NULL,
  entity text NOT NULL,
  entity_id text,
  changes jsonb,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin view audit" ON public.audit_logs FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE INDEX idx_audit_created ON public.audit_logs (created_at DESC);
CREATE INDEX idx_audit_entity ON public.audit_logs (entity);
CREATE INDEX idx_audit_actor ON public.audit_logs (actor_user_id);

CREATE OR REPLACE FUNCTION public.write_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  email text;
  act audit_action;
  ent_id text;
  ch jsonb;
BEGIN
  SELECT u.email INTO email FROM auth.users u WHERE u.id = uid;
  IF TG_OP = 'INSERT' THEN
    act := 'insert'; ent_id := NEW.id::text; ch := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    act := 'update'; ent_id := NEW.id::text;
    ch := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  ELSE
    act := 'delete'; ent_id := OLD.id::text; ch := to_jsonb(OLD);
  END IF;
  INSERT INTO public.audit_logs (actor_user_id, actor_email, action, entity, entity_id, changes)
  VALUES (uid, email, act, TG_TABLE_NAME, ent_id, ch);
  RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER audit_members AFTER INSERT OR UPDATE OR DELETE ON public.members FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
CREATE TRIGGER audit_donations AFTER INSERT OR UPDATE OR DELETE ON public.donations FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
CREATE TRIGGER audit_expenses AFTER INSERT OR UPDATE OR DELETE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
CREATE TRIGGER audit_income AFTER INSERT OR UPDATE OR DELETE ON public.income FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
CREATE TRIGGER audit_subscriptions AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
CREATE TRIGGER audit_meetings AFTER INSERT OR UPDATE OR DELETE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
CREATE TRIGGER audit_committees AFTER INSERT OR UPDATE OR DELETE ON public.committees FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
CREATE TRIGGER audit_assets AFTER INSERT OR UPDATE OR DELETE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
CREATE TRIGGER audit_inventory AFTER INSERT OR UPDATE OR DELETE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

-- ============= STORAGE POLICIES (bucket created via separate tool) =============
CREATE POLICY "auth read mosque-files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'mosque-files');
CREATE POLICY "admin upload mosque-files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'mosque-files' AND is_admin(auth.uid()));
CREATE POLICY "admin update mosque-files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'mosque-files' AND is_admin(auth.uid()));
CREATE POLICY "admin delete mosque-files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'mosque-files' AND is_admin(auth.uid()));
