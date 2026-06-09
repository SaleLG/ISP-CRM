-- No Reply recycle basket: manager-only hold for 30 days, then back to Junior Sales

ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_assigned_team_check;
ALTER TABLE customers ADD CONSTRAINT customers_assigned_team_check
  CHECK (assigned_team IN (
    'Junior Sales Team', 'Senior Sales Team', 'Recovery Team', 'Recycle Hold'
  ));

ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_workflow_stage_check;
ALTER TABLE customers ADD CONSTRAINT customers_workflow_stage_check
  CHECK (workflow_stage IN (
    'New', 'Attempt 1', 'Attempt 2', 'Attempt 3', 'Recovery Needed',
    'In Recovery', 'No Reply - Hold', 'Callback Requested', 'Rescheduled',
    'New Account Created', 'Closed'
  ));

ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_transfer_status_check;
ALTER TABLE customers ADD CONSTRAINT customers_transfer_status_check
  CHECK (transfer_status IN (
    'None', 'Senior Review', 'Move to Recovery Needed', 'Moved to Recovery',
    'Management Review', 'Recycle in 30 Days', 'Recycled to Junior'
  ));

-- Junior sales may move customers to Recycle Hold after 3 no-response attempts
DROP POLICY IF EXISTS "Junior sales can update junior sales customers" ON customers;
CREATE POLICY "Junior sales can update junior sales customers"
  ON customers FOR UPDATE
  USING (
    get_my_role() = 'junior_sales'
    AND assigned_team = 'Junior Sales Team'
  )
  WITH CHECK (
    get_my_role() = 'junior_sales'
    AND assigned_team IN (
      'Junior Sales Team', 'Senior Sales Team', 'Recovery Team', 'Recycle Hold'
    )
  );

-- Migrate existing Junior "Recovery Needed" no-reply flags into Recycle Hold
UPDATE customers
SET
  assigned_team = 'Recycle Hold',
  workflow_stage = 'No Reply - Hold',
  transfer_status = 'Recycle in 30 Days',
  follow_up_date = COALESCE(
    follow_up_date,
    (CURRENT_DATE + INTERVAL '30 days')::date
  )
WHERE assigned_team = 'Junior Sales Team'
  AND workflow_stage = 'Recovery Needed'
  AND transfer_status = 'Move to Recovery Needed';
