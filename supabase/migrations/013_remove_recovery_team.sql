-- Remove Recovery Team role and team; workflow is Junior → Senior → Recycle Hold

-- Migrate existing Recovery customers into the No Reply recycle basket
UPDATE customers
SET
  assigned_team = 'Recycle Hold',
  workflow_stage = 'No Reply - Hold',
  transfer_status = 'Recycle in 30 Days',
  follow_up_date = COALESCE(
    follow_up_date,
    (CURRENT_DATE + INTERVAL '30 days')::date
  ),
  assigned_user_id = NULL
WHERE assigned_team = 'Recovery Team';

-- Convert recovery users to junior_sales (admin can reassign roles in Users page)
UPDATE profiles
SET role = 'junior_sales', team = 'Junior Sales Team'
WHERE role = 'recovery';

-- Drop recovery-specific DB function
DROP FUNCTION IF EXISTS move_customer_to_recovery(UUID);

-- Tighten constraints (no Recovery Team / recovery role)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'manager', 'junior_sales', 'senior_sales'));

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_team_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_team_check
  CHECK (team IN ('Junior Sales Team', 'Senior Sales Team'));

ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_assigned_team_check;
ALTER TABLE customers ADD CONSTRAINT customers_assigned_team_check
  CHECK (assigned_team IN (
    'Junior Sales Team', 'Senior Sales Team', 'Recycle Hold'
  ));

-- Junior sales: no Recovery Team in allowed transfers
DROP POLICY IF EXISTS "Junior sales can update junior sales customers" ON customers;
CREATE POLICY "Junior sales can update junior sales customers"
  ON customers FOR UPDATE
  USING (
    get_my_role() = 'junior_sales'
    AND assigned_team = 'Junior Sales Team'
  )
  WITH CHECK (
    get_my_role() = 'junior_sales'
    AND assigned_team IN ('Junior Sales Team', 'Senior Sales Team', 'Recycle Hold')
  );

DROP POLICY IF EXISTS "Recovery see recovery customers" ON customers;
DROP POLICY IF EXISTS "Recovery can update recovery customers" ON customers;
