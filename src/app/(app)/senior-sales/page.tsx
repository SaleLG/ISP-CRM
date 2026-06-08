import { Typography } from "@mui/material";
import CustomerTable from "@/components/customers/CustomerTable";
import { getCustomers } from "@/actions/customers";
import { getISPs } from "@/actions/isps";
import { requireAuth } from "@/lib/auth";

export default async function SeniorSalesPage() {
  await requireAuth();
  const [customers, isps] = await Promise.all([
    getCustomers({ assigned_team: "Senior Sales Team" }),
    getISPs(),
  ]);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Senior Sales Team
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Work new leads through Attempt 1, 2, and 3. Move to Recovery after 3
        attempts with no returned call.
      </Typography>
      <CustomerTable
        customers={customers}
        isps={isps}
        showTeamFilter={false}
        defaultTeam="Senior Sales Team"
      />
    </>
  );
}
