
-- Fix proposals: drop RESTRICTIVE policy and create PERMISSIVE admin policies
DROP POLICY IF EXISTS "Admins can manage proposals" ON public.proposals;

CREATE POLICY "Admins can view proposals"
ON public.proposals FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert proposals"
ON public.proposals FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update proposals"
ON public.proposals FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete proposals"
ON public.proposals FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix user_roles: add PERMISSIVE SELECT for users to read own roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
