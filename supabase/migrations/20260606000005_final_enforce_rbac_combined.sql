-- 20260606000005_final_enforce_rbac_combined.sql
-- Enforce granular RBAC for CRUD operations across the database

-- Helper macro: we already have public.has_permission(_user_id, _module, _action)
-- It automatically returns true if the user is super_admin.

-- 1. Members Table
DROP POLICY IF EXISTS "admin manage members" ON public.members;
CREATE POLICY "rbac insert members" ON public.members FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Members', 'Create'));
CREATE POLICY "rbac update members" ON public.members FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Members', 'Edit'));
CREATE POLICY "rbac delete members" ON public.members FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Members', 'Delete'));

-- 2. Committee Members
DROP POLICY IF EXISTS "admin manage committee_members" ON public.committee_members;
DROP POLICY IF EXISTS "rbac insert committee_members" ON public.committee_members;
DROP POLICY IF EXISTS "rbac update committee_members" ON public.committee_members;
DROP POLICY IF EXISTS "rbac delete committee_members" ON public.committee_members;
CREATE POLICY "rbac insert committee_members" ON public.committee_members FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Committee', 'Create'));
CREATE POLICY "rbac update committee_members" ON public.committee_members FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Committee', 'Edit'));
CREATE POLICY "rbac delete committee_members" ON public.committee_members FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Committee', 'Delete'));

-- 3. Committees
DROP POLICY IF EXISTS "admin manage committees" ON public.committees;
DROP POLICY IF EXISTS "rbac insert committees" ON public.committees;
DROP POLICY IF EXISTS "rbac update committees" ON public.committees;
DROP POLICY IF EXISTS "rbac delete committees" ON public.committees;
CREATE POLICY "rbac insert committees" ON public.committees FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Committee', 'Create'));
CREATE POLICY "rbac update committees" ON public.committees FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Committee', 'Edit'));
CREATE POLICY "rbac delete committees" ON public.committees FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Committee', 'Delete'));

-- 4. Subscriptions (Monthly Chanda)
DROP POLICY IF EXISTS "admin manage subscriptions" ON public.subscriptions;
CREATE POLICY "rbac insert subscriptions" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Monthly Chanda', 'Create'));
CREATE POLICY "rbac update subscriptions" ON public.subscriptions FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Monthly Chanda', 'Edit'));
CREATE POLICY "rbac delete subscriptions" ON public.subscriptions FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Monthly Chanda', 'Delete'));

-- 5. Donations
DROP POLICY IF EXISTS "admin manage donations" ON public.donations;
CREATE POLICY "rbac insert donations" ON public.donations FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Donations & Zakat', 'Create'));
CREATE POLICY "rbac update donations" ON public.donations FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Donations & Zakat', 'Edit'));
CREATE POLICY "rbac delete donations" ON public.donations FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Donations & Zakat', 'Delete'));

-- 6. Income
DROP POLICY IF EXISTS "admin manage income" ON public.income;
CREATE POLICY "rbac insert income" ON public.income FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Income & Expense', 'Create'));
CREATE POLICY "rbac update income" ON public.income FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Income & Expense', 'Edit'));
CREATE POLICY "rbac delete income" ON public.income FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Income & Expense', 'Delete'));

-- 7. Expenses
DROP POLICY IF EXISTS "admin manage expenses" ON public.expenses;
CREATE POLICY "rbac insert expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Income & Expense', 'Create'));
CREATE POLICY "rbac update expenses" ON public.expenses FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Income & Expense', 'Edit'));
CREATE POLICY "rbac delete expenses" ON public.expenses FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Income & Expense', 'Delete'));

-- 8. Accounts (Bank & Mobile Banking)
DROP POLICY IF EXISTS "admin manage accounts" ON public.accounts;
CREATE POLICY "rbac insert accounts" ON public.accounts FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Bank & Mobile Banking', 'Create'));
CREATE POLICY "rbac update accounts" ON public.accounts FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Bank & Mobile Banking', 'Edit'));
CREATE POLICY "rbac delete accounts" ON public.accounts FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Bank & Mobile Banking', 'Delete'));

-- 9. Inventory Items
DROP POLICY IF EXISTS "admin manage inventory" ON public.inventory_items;
CREATE POLICY "rbac insert inventory_items" ON public.inventory_items FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Inventory', 'Create'));
CREATE POLICY "rbac update inventory_items" ON public.inventory_items FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Inventory', 'Edit'));
CREATE POLICY "rbac delete inventory_items" ON public.inventory_items FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Inventory', 'Delete'));

-- 10. Assets
DROP POLICY IF EXISTS "admin manage assets_tbl" ON public.assets;
CREATE POLICY "rbac insert assets" ON public.assets FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Assets', 'Create'));
CREATE POLICY "rbac update assets" ON public.assets FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Assets', 'Edit'));
CREATE POLICY "rbac delete assets" ON public.assets FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Assets', 'Delete'));

-- 11. Meetings
DROP POLICY IF EXISTS "admin manage meetings" ON public.meetings;
CREATE POLICY "rbac insert meetings" ON public.meetings FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Meetings', 'Create'));
CREATE POLICY "rbac update meetings" ON public.meetings FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Meetings', 'Edit'));
CREATE POLICY "rbac delete meetings" ON public.meetings FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Meetings', 'Delete'));

-- 12. Events
DROP POLICY IF EXISTS "admin manage events" ON public.events;
CREATE POLICY "rbac insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Events', 'Create'));
CREATE POLICY "rbac update events" ON public.events FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Events', 'Edit'));
CREATE POLICY "rbac delete events" ON public.events FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Events', 'Delete'));

-- 13. Notices
DROP POLICY IF EXISTS "admin manage notices" ON public.notices;
CREATE POLICY "rbac insert notices" ON public.notices FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Notice Board', 'Create'));
CREATE POLICY "rbac update notices" ON public.notices FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Notice Board', 'Edit'));
CREATE POLICY "rbac delete notices" ON public.notices FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Notice Board', 'Delete'));

-- 14. Settings
DROP POLICY IF EXISTS "admin manage app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update settings" ON public.app_settings;
CREATE POLICY "rbac insert app_settings" ON public.app_settings FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Settings', 'Create'));
CREATE POLICY "rbac update app_settings" ON public.app_settings FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Settings', 'Edit'));
CREATE POLICY "rbac delete app_settings" ON public.app_settings FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Settings', 'Delete'));

-- 15. Prayer Times
DROP POLICY IF EXISTS "admin manage prayer_times" ON public.prayer_times;
CREATE POLICY "rbac insert prayer_times" ON public.prayer_times FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Prayer Schedule', 'Create'));
CREATE POLICY "rbac update prayer_times" ON public.prayer_times FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Prayer Schedule', 'Edit'));
CREATE POLICY "rbac delete prayer_times" ON public.prayer_times FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Prayer Schedule', 'Delete'));

-- 16. Resolutions (Committee Module)
DROP POLICY IF EXISTS "admin manage resolutions" ON public.resolutions;
CREATE POLICY "rbac insert resolutions" ON public.resolutions FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Committee', 'Create'));
CREATE POLICY "rbac update resolutions" ON public.resolutions FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Committee', 'Edit'));
CREATE POLICY "rbac delete resolutions" ON public.resolutions FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Committee', 'Delete'));

-- 17. Resolution Votes (Committee Module)
DROP POLICY IF EXISTS "admin manage resolution_votes" ON public.resolution_votes;
CREATE POLICY "rbac insert resolution_votes" ON public.resolution_votes FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Committee', 'Edit'));
CREATE POLICY "rbac update resolution_votes" ON public.resolution_votes FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Committee', 'Edit'));
CREATE POLICY "rbac delete resolution_votes" ON public.resolution_votes FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Committee', 'Edit'));

-- 18. Gallery Images (Gallery Module)
DROP POLICY IF EXISTS "admin manage gallery_images" ON public.gallery_images;
CREATE POLICY "rbac insert gallery_images" ON public.gallery_images FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Gallery', 'Create'));
CREATE POLICY "rbac update gallery_images" ON public.gallery_images FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Gallery', 'Edit'));
CREATE POLICY "rbac delete gallery_images" ON public.gallery_images FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Gallery', 'Delete'));

-- 19. Roles (Role & Permission Module)
DROP POLICY IF EXISTS "admin manage roles" ON public.roles;
CREATE POLICY "rbac insert roles" ON public.roles FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Role & Permission', 'Create'));
CREATE POLICY "rbac update roles" ON public.roles FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Role & Permission', 'Edit'));
CREATE POLICY "rbac delete roles" ON public.roles FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Role & Permission', 'Delete'));

-- 20. User Roles (User Management Module)
DROP POLICY IF EXISTS "admin manage user_roles" ON public.user_roles;
CREATE POLICY "rbac insert user_roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'User Management', 'Create'));
CREATE POLICY "rbac update user_roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'User Management', 'Edit'));
CREATE POLICY "rbac delete user_roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'User Management', 'Delete'));

-- 21. Role Permissions (Role & Permission Module)
DROP POLICY IF EXISTS "admin manage role_permissions" ON public.role_permissions;
CREATE POLICY "rbac insert role_permissions" ON public.role_permissions FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), 'Role & Permission', 'Edit'));
CREATE POLICY "rbac update role_permissions" ON public.role_permissions FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), 'Role & Permission', 'Edit'));
CREATE POLICY "rbac delete role_permissions" ON public.role_permissions FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), 'Role & Permission', 'Edit'));

-- Add missing permissions into permissions table if they don't exist
INSERT INTO public.permissions (module, action, description)
VALUES 
  ('Assets', 'View', 'Can view Assets'),
  ('Assets', 'Create', 'Can create Assets'),
  ('Assets', 'Edit', 'Can edit Assets'),
  ('Assets', 'Delete', 'Can delete Assets'),
  ('Inventory', 'View', 'Can view Inventory'),
  ('Inventory', 'Create', 'Can create Inventory'),
  ('Inventory', 'Edit', 'Can edit Inventory'),
  ('Inventory', 'Delete', 'Can delete Inventory'),
  ('Events', 'View', 'Can view Events'),
  ('Events', 'Create', 'Can create Events'),
  ('Events', 'Edit', 'Can edit Events'),
  ('Events', 'Delete', 'Can delete Events')
ON CONFLICT (module, action) DO NOTHING;

-- Map these new permissions to super_admin
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'super_admin' AND p.module IN ('Assets', 'Inventory', 'Events')
ON CONFLICT DO NOTHING;
