import { Typography } from "@mui/material";
import CustomerTable from "@/components/customers/CustomerTable";
import { getCustomers } from "@/actions/customers";
import { getISPs } from "@/actions/isps";
import { getTeamMembers } from "@/actions/team";
import { requireAuth } from "@/lib/auth";

export default async function RecoveryPage() {
  const profile = await requireAuth();

  const filters: { assigned_team: string; assigned_user_id?: string } = {
    assigned_team: "Recovery Team",
  };

  if (profile.role === "recovery") {
    filters.assigned_user_id = profile.id;
  }

  const [customers, isps, recoveryTeamMembers] = await Promise.all([
    getCustomers(filters),
    getISPs(),
    getTeamMembers("Recovery Team"),
  ]);

  const isManager = profile.role === "admin" || profile.role === "manager";

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Recovery Team
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {profile.role === "recovery"
          ? "Your assigned leads — primary goal is to reschedule install appointments for customers who could not complete their initial install."
          : "Manage recovery leads and assign agents. Primary outcome: reschedule install appointments."}
      </Typography>
      <CustomerTable
        customers={customers}
        isps={isps}
        showTeamFilter={false}
        defaultTeam="Recovery Team"
        showAssigneeFilter={isManager}
        showAssigneeColumn
        allowAssign={isManager}
        teamMembers={recoveryTeamMembers}
        currentUserId={profile.id}
      />
    </>
  );
}
