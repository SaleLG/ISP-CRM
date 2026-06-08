-- Allow customer deletion: import history rows keep audit trail but unlink customer
ALTER TABLE import_rows
  DROP CONSTRAINT IF EXISTS import_rows_customer_id_fkey;

ALTER TABLE import_rows
  ADD CONSTRAINT import_rows_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
