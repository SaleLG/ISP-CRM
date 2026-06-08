-- Run this if you already deployed schema.sql with is_active default true

ALTER TABLE profiles ALTER COLUMN is_active SET DEFAULT false;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (auth_user_id, email, full_name, role, team, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'senior_sales'),
    COALESCE(NEW.raw_user_meta_data->>'team', 'Senior Sales Team'),
    COALESCE((NEW.raw_user_meta_data->>'approved')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
