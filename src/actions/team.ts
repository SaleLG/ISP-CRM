"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export async function getTeamMembers(team?: string) {
  await requireAuth();
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, role, team")
    .eq("is_active", true)
    .order("full_name");

  if (team) {
    query = query.eq("team", team);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

/** Senior Sales members who can assist on 3-way Recovery calls */
export async function getSeniorAssistUsers() {
  await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, team")
    .eq("is_active", true)
    .in("role", ["senior_sales", "manager", "admin"])
    .order("full_name");

  if (error) throw new Error(error.message);
  return data;
}
