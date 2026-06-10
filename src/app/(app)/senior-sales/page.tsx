import { Suspense } from "react";
import { Typography, Box, Skeleton, Alert } from "@mui/material";
import CustomerTable from "@/components/customers/CustomerTable";
import { getCustomers } from "@/actions/customers";
import { getISPsWithCounts } from "@/actions/isps";
import { getTeamMembers } from "@/actions/team";
import { requireRole } from "@/lib/auth";
import { normalizeRole } from "@/lib/constants";

function TableSkeleton() {
  return (
    <Box>
      <Skeleton variant="rectangular" height={48} sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={560} sx={{ borderRadius: 1 }} />
    </Box>
  );
}

export default async function SeniorSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ isp?: string }>;
}) {
  const profile = await requireRole(["admin", "manager", "senior_sales"]);
  const role = normalizeRole(profile.role);
  const { isp } = await searchParams;

  const filters: { assigned_team: string; assigned_user_id?: string } = {
    assigned_team: "Senior Sales Team",
  };

  if (role === "senior_sales") {
    filters.assigned_user_id = profile.id;
  }

  const [customers, isps, seniorTeamMembers] = await Promise.all([
    getCustomers(filters),
    getISPsWithCounts(),
    getTeamMembers("Senior Sales Team"),
  ]);

  const isManager = role === "admin" || role === "manager";

  const selectedIspId =
    isp && isps.some((item) => item.id === isp) ? isp : isps[0]?.id ?? "";
  const selectedIsp = isps.find((item) => item.id === selectedIspId);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Senior Sales Team
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {role === "senior_sales"
          ? "Your assigned callback and reschedule leads. Follow up to close or reschedule installs. Select an ISP tab to view that ISP's customers."
          : "Escalated callback and reschedule leads from Junior Sales. Assign available senior reps to each lead. Select an ISP tab to view that ISP's customers."}
      </Typography>

      {isps.length === 0 ? (
        <Alert severity="info">
          No ISPs configured yet. Contact an admin to set up ISPs and columns.
        </Alert>
      ) : (
        <Suspense fallback={<TableSkeleton />}>
          <CustomerTable
            customers={customers}
            isps={isps}
            ispColumns={selectedIsp?.columns ?? []}
            showTeamFilter={false}
            defaultTeam="Senior Sales Team"
            showAssigneeFilter={isManager}
            showAssigneeColumn
            allowAssign={isManager}
            teamMembers={seniorTeamMembers}
            currentUserId={profile.id}
            defaultIspId={selectedIspId}
            ispSelectorVariant="tabs"
            syncUrlOnIspChange
            hideAllIspTab
            requireIspSelection
          />
        </Suspense>
      )}
    </>
  );
}
