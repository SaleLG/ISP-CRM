"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth";
import { teamFromRole } from "@/lib/constants";
import type { Role } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");

  if (error) throw new Error(error.message);
  return data;
}

export async function updateUser(
  id: string,
  updates: {
    full_name?: string;
    role?: string;
    is_active?: boolean;
  }
) {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const payload: Record<string, unknown> = { ...updates };

  if (updates.role) {
    payload.team = teamFromRole(updates.role as Role);
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/users");
  return data;
}

export async function createUser(params: {
  email: string;
  password: string;
  full_name: string;
  role: string;
}) {
  await requireRole(["admin"]);
  const admin = createAdminClient();
  const team = teamFromRole(params.role as Role);

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: true,
    user_metadata: {
      full_name: params.full_name,
      role: params.role,
      approved: true,
    },
  });

  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error("Failed to create user");

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .update({ is_active: true, team })
    .eq("auth_user_id", authData.user.id)
    .select()
    .single();

  if (profileError) throw new Error(profileError.message);

  revalidatePath("/users");
  return profile;
}

export async function approveUser(id: string) {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      is_active: true,
      ...(existing?.role ? { team: teamFromRole(existing.role as Role) } : {}),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/users");
  return data;
}
