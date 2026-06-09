-- Junior Sales Team: first outreach (Attempts 1–3)
-- Senior Sales Team: callback/reschedule escalations (manager assigns)
-- Recovery Team: no response after 3 attempts

-- Extend role and team constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'manager', 'junior_sales', 'senior_sales', 'recovery'));

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_team_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_team_check
  CHECK (team IN ('Junior Sales Team', 'Senior Sales Team', 'Recovery Team'));

ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_assigned_team_check;
ALTER TABLE customers ADD CONSTRAINT customers_assigned_team_check
  CHECK (assigned_team IN ('Junior Sales Team', 'Senior Sales Team', 'Recovery Team'));

ALTER TABLE customers ALTER COLUMN assigned_team SET DEFAULT 'Junior Sales Team';

ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_transfer_status_check;
ALTER TABLE customers ADD CONSTRAINT customers_transfer_status_check
  CHECK (transfer_status IN (
    'None', 'Move to Recovery Needed', 'Moved to Recovery', 'Management Review', 'Senior Review'
  ));

ALTER TABLE imports ALTER COLUMN default_assigned_team SET DEFAULT 'Junior Sales Team';

-- team_from_role: junior_sales and senior_sales map to their teams
CREATE OR REPLACE FUNCTION public.team_from_role(p_role TEXT)
RETURNS TEXT AS $$
BEGIN
  IF p_role = 'recovery' THEN
    RETURN 'Recovery Team';
  ELSIF p_role = 'junior_sales' THEN
    RETURN 'Junior Sales Team';
  ELSIF p_role = 'senior_sales' THEN
    RETURN 'Senior Sales Team';
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Signup default: junior_sales (outreach role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'junior_sales');

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

-- Move to Recovery: from Junior Sales after 3 no-response attempts
CREATE OR REPLACE FUNCTION move_customer_to_recovery(p_customer_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_customer customers%ROWTYPE;
  v_profile_id UUID;
BEGIN
  v_role := get_my_role();
  IF v_role NOT IN ('admin', 'manager', 'junior_sales') THEN
    RAISE EXCEPTION 'Not authorized to move customers to Recovery';
  END IF;

  SELECT id INTO v_profile_id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;

  SELECT * INTO v_customer FROM customers WHERE id = p_customer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer not found';
  END IF;
  IF v_customer.assigned_team <> 'Junior Sales Team' THEN
    RAISE EXCEPTION 'Customer is not on Junior Sales Team';
  END IF;
  IF v_customer.call_attempt_number < 3 THEN
    RAISE EXCEPTION 'Customer must have at least 3 call attempts';
  END IF;

  UPDATE customers
  SET
    transfer_status = 'Moved to Recovery',
    assigned_team = 'Recovery Team',
    workflow_stage = 'In Recovery',
    recovery_status = 'In Progress',
    updated_at = now()
  WHERE id = p_customer_id;

  INSERT INTO activities (
    customer_id,
    user_id,
    activity_type,
    old_value,
    new_value,
    description
  ) VALUES (
    p_customer_id,
    v_profile_id,
    'team_transfer',
    'Junior Sales Team',
    'Recovery Team',
    'Moved to Recovery Team after 3 attempts with no returned call'
  );
END;
$$;

-- Data migration: outreach leads → Junior Sales Team
UPDATE customers
SET assigned_team = 'Junior Sales Team'
WHERE assigned_team = 'Senior Sales Team'
  AND workflow_stage IN ('New', 'Attempt 1', 'Attempt 2', 'Attempt 3', 'Recovery Needed');

-- Existing senior_sales users were doing outreach → junior_sales
UPDATE profiles
SET role = 'junior_sales', team = 'Junior Sales Team'
WHERE role = 'senior_sales';

UPDATE profiles SET team = 'Recovery Team'
WHERE role = 'recovery' AND team IS DISTINCT FROM 'Recovery Team';

UPDATE profiles SET team = NULL
WHERE role IN ('admin', 'manager') AND team IS NOT NULL;

-- RLS: Junior sales policies
DROP POLICY IF EXISTS "Junior sales see junior sales customers" ON customers;
CREATE POLICY "Junior sales see junior sales customers"
  ON customers FOR SELECT
  USING (
    get_my_role() = 'junior_sales'
    AND assigned_team = 'Junior Sales Team'
  );

DROP POLICY IF EXISTS "Junior sales can update junior sales customers" ON customers;
CREATE POLICY "Junior sales can update junior sales customers"
  ON customers FOR UPDATE
  USING (
    get_my_role() = 'junior_sales'
    AND assigned_team = 'Junior Sales Team'
  )
  WITH CHECK (
    get_my_role() = 'junior_sales'
    AND assigned_team IN ('Junior Sales Team', 'Senior Sales Team', 'Recovery Team')
  );

-- Senior sales: escalation queue only (no move-to-recovery team change)
DROP POLICY IF EXISTS "Senior sales can update senior sales customers" ON customers;
CREATE POLICY "Senior sales can update senior sales customers"
  ON customers FOR UPDATE
  USING (
    get_my_role() = 'senior_sales'
    AND assigned_team = 'Senior Sales Team'
  )
  WITH CHECK (
    get_my_role() = 'senior_sales'
    AND assigned_team = 'Senior Sales Team'
  );
