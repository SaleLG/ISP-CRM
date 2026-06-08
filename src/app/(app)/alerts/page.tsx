import { Typography } from "@mui/material";
import AlertsTable from "@/components/alerts/AlertsTable";
import { getAlerts } from "@/actions/customers";
import { requireRole } from "@/lib/auth";

export default async function AlertsPage() {
  await requireRole(["admin", "manager"]);
  const alerts = await getAlerts();

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Alerts & Management Review
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Review ISP complaints, price approval requests, and email alerts.
      </Typography>
      <AlertsTable alerts={alerts} />
    </>
  );
}
