-- ISP CRM Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'senior_sales', 'recovery')),
  team TEXT CHECK (team IN ('Senior Sales Team', 'Recovery Team')),
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE isps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  isp_id UUID REFERENCES isps(id),
  account_number TEXT,
  isp_status TEXT,
  full_name TEXT,
  phone TEXT,
  normalized_phone TEXT,
  address TEXT,
  product TEXT,
  term TEXT,
  order_date DATE,
  install_date DATE,
  install_complete TEXT,
  sales_rep_id TEXT,
  isp_notes TEXT,
  assigned_team TEXT DEFAULT 'Senior Sales Team' CHECK (assigned_team IN ('Senior Sales Team', 'Recovery Team')),
  assigned_user_id UUID REFERENCES profiles(id),
  call_attempt_number INT DEFAULT 0,
  workflow_stage TEXT DEFAULT 'New' CHECK (workflow_stage IN (
    'New', 'Attempt 1', 'Attempt 2', 'Attempt 3', 'Recovery Needed',
    'In Recovery', 'Callback Requested', 'Rescheduled', 'New Account Created', 'Closed'
  )),
  transfer_status TEXT DEFAULT 'None' CHECK (transfer_status IN (
    'None', 'Move to Recovery Needed', 'Moved to Recovery', 'Management Review'
  )),
  recovery_status TEXT DEFAULT 'Not Started',
  outcome TEXT DEFAULT 'Pending' CHECK (outcome IN (
    'Pending', 'Recovered', 'Rescheduled', 'New Account Created',
    'Not Interested', 'Wrong Number', 'Do Not Call', 'Closed'
  )),
  alert_type TEXT DEFAULT 'None' CHECK (alert_type IN (
    'None', 'ISP Complaint Needs Fix', 'Price Approval Needed'
  )),
  alert_status TEXT DEFAULT 'None' CHECK (alert_status IN (
    'None', 'Needs Email', 'Email Sent', 'In Review', 'Resolved'
  )),
  price_approval_status TEXT DEFAULT 'Not Requested' CHECK (price_approval_status IN (
    'Not Requested', 'Pending', 'Approved', 'Denied'
  )),
  last_contact_date DATE,
  follow_up_date DATE,
  source_import_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  team TEXT,
  attempt_number INT,
  call_result TEXT CHECK (call_result IN (
    'No Answer', 'Left Voicemail', 'Customer Answered', 'Callback Requested',
    'Rescheduled', 'New Account Created', 'Not Interested', 'Wrong Number',
    'Do Not Call', 'ISP Complaint', 'Price Approval Needed'
  )),
  notes TEXT,
  is_three_way BOOLEAN DEFAULT false,
  senior_assisted_user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  isp_id UUID REFERENCES isps(id),
  file_name TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  default_assigned_team TEXT DEFAULT 'Senior Sales Team',
  total_rows INT DEFAULT 0,
  new_customers INT DEFAULT 0,
  updated_customers INT DEFAULT 0,
  skipped_rows INT DEFAULT 0,
  error_rows INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE import_rows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  import_id UUID NOT NULL REFERENCES imports(id) ON DELETE CASCADE,
  row_number INT,
  raw_data JSONB,
  status TEXT,
  error_message TEXT,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE customer_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  activity_type TEXT,
  old_value TEXT,
  new_value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK for source_import_id after imports table exists
ALTER TABLE customers
  ADD CONSTRAINT customers_source_import_id_fkey
  FOREIGN KEY (source_import_id) REFERENCES imports(id);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_customers_isp_id ON customers(isp_id);
CREATE INDEX idx_customers_account_number ON customers(account_number);
CREATE INDEX idx_customers_normalized_phone ON customers(normalized_phone);
CREATE INDEX idx_customers_assigned_team ON customers(assigned_team);
CREATE INDEX idx_customers_assigned_user_id ON customers(assigned_user_id);
CREATE INDEX idx_call_logs_senior_assisted ON call_logs(senior_assisted_user_id);
CREATE INDEX idx_customers_workflow_stage ON customers(workflow_stage);
CREATE INDEX idx_customers_alert_status ON customers(alert_status);
CREATE INDEX idx_customers_alert_type ON customers(alert_type);
CREATE INDEX idx_call_logs_customer_id ON call_logs(customer_id);
CREATE INDEX idx_activities_customer_id ON activities(customer_id);
CREATE INDEX idx_profiles_auth_user_id ON profiles(auth_user_id);

-- ============================================================
-- HELPER: get current user's profile
-- ============================================================

CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS profiles AS $$
  SELECT * FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_my_team()
RETURNS TEXT AS $$
  SELECT team FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Required: allow Supabase Auth to insert profiles on signup
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON TABLE public.profiles TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER isps_updated_at BEFORE UPDATE ON isps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE isps ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "Admin/manager can read all profiles"
  ON profiles FOR SELECT
  USING (get_my_role() IN ('admin', 'manager'));

CREATE POLICY "Admin can manage profiles"
  ON profiles FOR ALL
  USING (get_my_role() = 'admin');

CREATE POLICY "Allow signup profile insert"
  ON profiles FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- ISPs policies
CREATE POLICY "Authenticated users can read ISPs"
  ON isps FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin/manager can manage ISPs"
  ON isps FOR ALL
  USING (get_my_role() IN ('admin', 'manager'));

-- Customers policies
CREATE POLICY "Admin/manager see all customers"
  ON customers FOR SELECT
  USING (get_my_role() IN ('admin', 'manager'));

CREATE POLICY "Senior sales see senior sales customers"
  ON customers FOR SELECT
  USING (
    get_my_role() = 'senior_sales'
    AND assigned_team = 'Senior Sales Team'
  );

CREATE POLICY "Recovery see recovery customers"
  ON customers FOR SELECT
  USING (
    get_my_role() = 'recovery'
    AND assigned_team = 'Recovery Team'
  );

CREATE POLICY "Admin/manager can update all customers"
  ON customers FOR UPDATE
  USING (get_my_role() IN ('admin', 'manager'));

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

CREATE POLICY "Recovery can update recovery customers"
  ON customers FOR UPDATE
  USING (
    get_my_role() = 'recovery'
    AND assigned_team = 'Recovery Team'
  );

CREATE POLICY "Admin/manager can insert customers"
  ON customers FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'manager'));

-- Call logs policies
CREATE POLICY "Users can read call logs for visible customers"
  ON call_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = call_logs.customer_id
    )
  );

CREATE POLICY "Authenticated users can insert call logs"
  ON call_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Imports policies
CREATE POLICY "Admin/manager can manage imports"
  ON imports FOR ALL
  USING (get_my_role() IN ('admin', 'manager'));

CREATE POLICY "Admin/manager can manage import rows"
  ON import_rows FOR ALL
  USING (get_my_role() IN ('admin', 'manager'));

-- Customer notes policies
CREATE POLICY "Users can read notes for visible customers"
  ON customer_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customers c WHERE c.id = customer_notes.customer_id
    )
  );

CREATE POLICY "Authenticated users can insert notes"
  ON customer_notes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Activities policies
CREATE POLICY "Users can read activities for visible customers"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customers c WHERE c.id = activities.customer_id
    )
  );

CREATE POLICY "Authenticated users can insert activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
