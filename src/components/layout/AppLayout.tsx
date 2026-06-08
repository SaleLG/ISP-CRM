import AppShell from "./AppShell";
import type { Profile } from "@/lib/types";

export default function AppLayout({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  return (
    <AppShell profile={profile}>{children}</AppShell>
  );
}
