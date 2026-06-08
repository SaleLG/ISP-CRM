import {
  getCustomer,
  getCallLogs,
  getCustomerNotes,
  getActivities,
} from "@/actions/customers";
import { getTeamMembers, getSeniorAssistUsers } from "@/actions/team";
import { requireAuth } from "@/lib/auth";
import CustomerDetailContent from "@/components/customers/CustomerDetailContent";
import { notFound } from "next/navigation";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireAuth();
  const customer = await getCustomer(id);

  if (!customer) {
    notFound();
  }

  const [callLogs, notes, activities, recoveryTeamMembers, seniorAssistUsers] =
    await Promise.all([
      getCallLogs(id),
      getCustomerNotes(id),
      getActivities(id),
      getTeamMembers("Recovery Team"),
      getSeniorAssistUsers(),
    ]);

  return (
    <CustomerDetailContent
      customer={customer}
      callLogs={callLogs}
      notes={notes}
      activities={activities}
      profile={profile}
      recoveryTeamMembers={recoveryTeamMembers}
      seniorAssistUsers={seniorAssistUsers}
    />
  );
}
