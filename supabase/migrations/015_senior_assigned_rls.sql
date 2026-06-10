-- Senior sales reps only see escalations assigned to them

DROP POLICY IF EXISTS "Senior sales see senior sales customers" ON customers;
CREATE POLICY "Senior sales see senior sales customers"
  ON customers FOR SELECT
  USING (
    get_my_role() = 'senior_sales'
    AND assigned_team = 'Senior Sales Team'
    AND assigned_user_id = (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1
    )
  );

DROP POLICY IF EXISTS "Senior sales can update senior sales customers" ON customers;
CREATE POLICY "Senior sales can update senior sales customers"
  ON customers FOR UPDATE
  USING (
    get_my_role() = 'senior_sales'
    AND assigned_team = 'Senior Sales Team'
    AND assigned_user_id = (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1
    )
  )
  WITH CHECK (
    get_my_role() = 'senior_sales'
    AND assigned_team = 'Senior Sales Team'
    AND assigned_user_id = (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1
    )
  );
