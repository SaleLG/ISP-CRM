import DashboardContent from "@/components/dashboard/DashboardContent";
import { getDashboardStats } from "@/actions/dashboard";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  return <DashboardContent stats={stats} />;
}
