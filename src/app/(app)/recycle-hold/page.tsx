import { Suspense } from "react";
import { Typography, Box, Skeleton, Alert } from "@mui/material";
import CustomerTable from "@/components/customers/CustomerTable";
import { getCustomers } from "@/actions/customers";
import { getISPsWithCounts } from "@/actions/isps";
import { requireRole } from "@/lib/auth";

function TableSkeleton() {
  return (
    <Box>
      <Skeleton variant="rectangular" height={48} sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={560} sx={{ borderRadius: 1 }} />
    </Box>
  );
}

export default async function RecycleHoldPage({
  searchParams,
}: {
  searchParams: Promise<{ isp?: string }>;
}) {
  await requireRole(["admin", "manager"]);
  const { isp } = await searchParams;

  const [customers, isps] = await Promise.all([
    getCustomers({ assigned_team: "Recycle Hold" }),
    getISPsWithCounts(),
  ]);

  const selectedIspId =
    isp && isps.some((item) => item.id === isp) ? isp : isps[0]?.id ?? "";
  const selectedIsp = isps.find((item) => item.id === selectedIspId);

  const readyCount = customers.filter((c) => {
    if (!c.follow_up_date) return false;
    const today = new Date().toISOString().split("T")[0];
    return c.follow_up_date <= today;
  }).length;

  return (
    <>
      <Typography variant="h4" gutterBottom>
        No Reply — Recycle
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Leads with no reply after 3 Junior Sales attempts are held here for 30
        days — separate from active Junior and Senior work. When the
        recycle date is reached, send them back to Junior Sales for another
        outreach round.
      </Typography>

      {customers.length > 0 && (
        <Alert severity={readyCount > 0 ? "success" : "info"} sx={{ mb: 3 }}>
          {readyCount > 0
            ? `${readyCount} lead${readyCount === 1 ? "" : "s"} ready to recycle back to Junior Sales.`
            : "No leads are past their 30-day follow-up date yet."}
        </Alert>
      )}

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
            defaultTeam="Recycle Hold"
            showFollowUpColumn
            showReadyFilter
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
