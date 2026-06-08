import { Typography } from "@mui/material";
import CustomerTable from "@/components/customers/CustomerTable";
import { getCustomers } from "@/actions/customers";
import { getISPs } from "@/actions/isps";
import { requireRole } from "@/lib/auth";

export default async function CustomersPage() {
  await requireRole(["admin", "manager"]);
  const [customers, isps] = await Promise.all([getCustomers(), getISPs()]);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Master CRM
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Single source of truth for all customer records.
      </Typography>
      <CustomerTable customers={customers} isps={isps} editable allowBulkDelete />
    </>
  );
}
