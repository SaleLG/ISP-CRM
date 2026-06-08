"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getISPs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("isps")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function createISP(name: string) {
  await requireRole(["admin", "manager"]);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("isps")
    .insert({ name })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/isps");
  revalidatePath("/import");
  return data;
}

export async function updateISP(id: string, updates: { name?: string; status?: string }) {
  await requireRole(["admin", "manager"]);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("isps")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/isps");
  return data;
}

export async function deleteISP(id: string) {
  await requireRole(["admin", "manager"]);
  const supabase = await createClient();

  const { error } = await supabase.from("isps").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/isps");
  return { success: true };
}
