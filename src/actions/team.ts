"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export async function getTeamMembers(team?: string) {
  await requireAuth();
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("is_active", true)
    .order("full_name");

  if (team === "Senior Sales Team") {
    query = query.eq("role", "senior_sales");
  } else if (team === "Junior Sales Team") {
    query = query.eq("role", "junior_sales");
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}
