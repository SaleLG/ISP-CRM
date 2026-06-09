-- Only senior_sales and recovery users have a team on their profile.
-- Admin and manager roles have team = NULL.

CREATE OR REPLACE FUNCTION public.team_from_role(p_role TEXT)
RETURNS TEXT AS $$
BEGIN
  IF p_role = 'recovery' THEN
    RETURN 'Recovery Team';
  ELSIF p_role = 'senior_sales' THEN
    RETURN 'Senior Sales Team';
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'senior_sales');

  INSERT INTO public.profiles (auth_user_id, email, full_name, role, team, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    v_role,
    team_from_role(v_role),
    CASE
      WHEN NEW.raw_user_meta_data->>'approved' = 'true' THEN true
      ELSE false
    END
  );
  RETURN NEW;
END;
$$;

UPDATE profiles SET team = 'Recovery Team' WHERE role = 'recovery' AND team IS DISTINCT FROM 'Recovery Team';
UPDATE profiles SET team = 'Senior Sales Team' WHERE role = 'senior_sales' AND team IS DISTINCT FROM 'Senior Sales Team';
UPDATE profiles SET team = NULL WHERE role IN ('admin', 'manager') AND team IS NOT NULL;
