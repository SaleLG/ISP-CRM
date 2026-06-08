"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getMyProfile() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profile.id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateAvatarUrl(avatarUrl: string) {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", profile.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  const profile = await requireAuth();
  const supabase = await createClient();

  if (newPassword.length < 6) {
    return { error: "New password must be at least 6 characters" };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated" };

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    return { error: "Current password is incorrect" };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) return { error: error.message };

  return { success: true, message: "Password updated successfully" };
}
