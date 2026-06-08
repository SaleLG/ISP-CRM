-- FIX: "Database error saving new user" on signup
-- Run this entire file in Supabase SQL Editor

-- 1. Fix the trigger function (search_path + safer boolean handling)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, email, full_name, role, team, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'senior_sales'),
    COALESCE(NEW.raw_user_meta_data->>'team', 'Senior Sales Team'),
    CASE
      WHEN NEW.raw_user_meta_data->>'approved' = 'true' THEN true
      ELSE false
    END
  );
  RETURN NEW;
END;
$$;

-- 2. Let Supabase Auth insert into profiles (required for signup trigger)
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON TABLE public.profiles TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;

-- 3. Allow profile row to be created during signup
DROP POLICY IF EXISTS "Allow signup profile insert" ON profiles;
CREATE POLICY "Allow signup profile insert"
  ON profiles FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());
