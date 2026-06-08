-- 3-way call logging + lead assignment support
-- Run in Supabase SQL Editor

ALTER TABLE call_logs
  ADD COLUMN IF NOT EXISTS is_three_way BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS senior_assisted_user_id UUID REFERENCES profiles(id);

CREATE INDEX IF NOT EXISTS idx_customers_assigned_user_id ON customers(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_senior_assisted ON call_logs(senior_assisted_user_id);
