-- Sync profile.team from role (team is derived from role, not edited separately)
UPDATE profiles SET team = 'Recovery Team' WHERE role = 'recovery';
UPDATE profiles SET team = 'Senior Sales Team' WHERE role IN ('admin', 'manager', 'senior_sales');
