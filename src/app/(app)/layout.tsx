import { requireAuth } from "@/lib/auth";
import AppLayout from "@/components/layout/AppLayout";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAuth();
  return <AppLayout profile={profile}>{children}</AppLayout>;
}
