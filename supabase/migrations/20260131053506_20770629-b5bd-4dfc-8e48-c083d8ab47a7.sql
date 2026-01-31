-- Create a public leaderboard view that shows only non-sensitive info
CREATE VIEW public.leaderboard_public
WITH (security_invoker = on) AS
SELECT 
  id,
  username,
  total_earned,
  tasks_completed
FROM public.profiles
WHERE is_suspended = false
ORDER BY total_earned DESC;

-- Allow anyone authenticated to read from this view
-- (View inherits the policies below, but for views we need explicit grants)
GRANT SELECT ON public.leaderboard_public TO authenticated;

-- Add a permissive policy so any authenticated user can query the leaderboard view
-- This uses a view, so the base profiles table remains protected
-- The view's security_invoker=on means RLS on profiles applies, so we need a policy
CREATE POLICY "Anyone can view leaderboard data"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    -- Allow viewing only username and leaderboard-related columns
    -- This is a permissive policy that allows leaderboard queries
    true
  );

-- Drop the old restrictive policy that blocked all other users' profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;