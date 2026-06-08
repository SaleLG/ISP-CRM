-- Allow Senior Sales to move customers to Recovery Team
-- Run in Supabase SQL Editor (optional if app uses service role for this action)

DROP POLICY IF EXISTS "Senior sales can update senior sales customers" ON customers;

CREATE POLICY "Senior sales can update senior sales customers"
  ON customers FOR UPDATE
  USING (
    get_my_role() = 'senior_sales'
    AND assigned_team = 'Senior Sales Team'
  )
  WITH CHECK (
    get_my_role() = 'senior_sales'
    AND assigned_team IN ('Senior Sales Team', 'Recovery Team')
  );

-- Database function alternative (callable via RPC if needed)
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
  IF v_role NOT IN ('admin', 'manager', 'senior_sales') THEN
    RAISE EXCEPTION 'Not authorized to move customers to Recovery';
  END IF;

  SELECT id INTO v_profile_id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;

  SELECT * INTO v_customer FROM customers WHERE id = p_customer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer not found';
  END IF;
  IF v_customer.assigned_team <> 'Senior Sales Team' THEN
    RAISE EXCEPTION 'Customer is not on Senior Sales Team';
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
    'Senior Sales Team',
    'Recovery Team',
    'Moved to Recovery Team after 3 attempts with no returned call'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION move_customer_to_recovery(UUID) TO authenticated;
