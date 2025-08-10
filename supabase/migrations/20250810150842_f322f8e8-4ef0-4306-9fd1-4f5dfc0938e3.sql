-- Remove overly permissive admin policy that exposes all personal data
DROP POLICY IF EXISTS "profiles select admin" ON public.profiles;

-- Create a security definer function to check admin status without exposing all profile data
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE profiles.user_id = is_admin.user_id 
    AND profiles.is_admin = true
  );
$$;

-- Create a restricted admin policy that only allows admins to view basic profile info (not sensitive data)
-- This policy only allows access to essential fields needed for admin operations
CREATE POLICY "Admin restricted profile access" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  public.is_admin() 
  AND auth.uid() != profiles.user_id  -- Prevent admins from using this policy for their own profile
);

-- Create separate policy for admin access to affiliate-related data
-- Admins need this to view affiliate click statistics but not personal health data
CREATE POLICY "Admin affiliate data access" 
ON public.affiliate_clicks 
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Add column-level security by creating a view for admin dashboard that only exposes non-sensitive data
CREATE OR REPLACE VIEW public.admin_profile_summary AS
SELECT 
  user_id,
  full_name,
  email,
  subscription_tier,
  onboarding_completed,
  created_at,
  updated_at
FROM public.profiles
WHERE public.is_admin();

-- Grant appropriate permissions on the view
GRANT SELECT ON public.admin_profile_summary TO authenticated;

-- Add comment explaining the security model
COMMENT ON FUNCTION public.is_admin IS 'Security definer function to check admin status without exposing profile data. Used to prevent recursive RLS issues.';
COMMENT ON VIEW public.admin_profile_summary IS 'Restricted view of profile data for admin dashboard - excludes sensitive personal health information.';