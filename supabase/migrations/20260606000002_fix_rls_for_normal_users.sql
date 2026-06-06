-- Allow all authenticated users to read roles and permissions
-- This is required so the frontend can check the logged in user's permissions

CREATE POLICY "allow read roles" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow read permissions" ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow read role_permissions" ON public.role_permissions FOR SELECT TO authenticated USING (true);
