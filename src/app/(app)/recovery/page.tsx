import { Suspense } from "react";
import { Typography, Box, Skeleton, Alert } from "@mui/material";
import CustomerTable from "@/components/customers/CustomerTable";
import { getCustomers } from "@/actions/customers";
import { getISPsWithCounts } from "@/actions/isps";
import { getTeamMembers } from "@/actions/team";
import { requireAuth } from "@/lib/auth";

function TableSkeleton() {
  return (
    <Box>
      <Skeleton variant="rectangular" height={48} sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={560} sx={{ borderRadius: 1 }} />
    </Box>
  );
}

export default async function RecoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ isp?: string }>;
}) {
  const profile = await requireAuth();
  const { isp } = await searchParams;

  const filters: { assigned_team: string; assigned_user_id?: string } = {
    assigned_team: "Recovery Team",
  };

  if (profile.role === "recovery") {
    filters.assigned_user_id = profile.id;
  }

  const [customers, isps, recoveryTeamMembers] = await Promise.all([
    getCustomers(filters),
    getISPsWithCounts(),
    getTeamMembers("Recovery Team"),
  ]);

  const isManager = profile.role === "admin" || profile.role === "manager";

  const selectedIspId =
    isp && isps.some((item) => item.id === isp) ? isp : isps[0]?.id ?? "";
  const selectedIsp = isps.find((item) => item.id === selectedIspId);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Recovery Team
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {profile.role === "recovery"
          ? "Your assigned leads — primary goal is to reschedule install appointments. Select an ISP tab to view that ISP's customers."
          : "Manage recovery leads and assign agents. Select an ISP tab to view that ISP's customers."}
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
            defaultTeam="Recovery Team"
            showAssigneeFilter={isManager}
            showAssigneeColumn
            allowAssign={isManager}
            teamMembers={recoveryTeamMembers}
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
