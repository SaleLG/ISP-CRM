import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/types";
import type { Role } from "@/lib/constants";

export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  return data as Profile | null;
}

export async function requireAuth(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!profile.is_active) redirect("/login");
  return profile;
}

export async function requireRole(roles: Role[]): Promise<Profile> {
  const profile = await requireAuth();
  if (!roles.includes(profile.role)) redirect("/dashboard");
  return profile;
}

export function canAccessTeam(profile: Profile, team: string): boolean {
  if (profile.role === "admin" || profile.role === "manager") return true;
  if (profile.role === "junior_sales" && team === "Junior Sales Team") return true;
  if (profile.role === "senior_sales" && team === "Senior Sales Team") return true;
  return false;
}
