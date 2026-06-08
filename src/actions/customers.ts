"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, requireRole } from "@/lib/auth";
import {
  getNextAttemptStage,
  getOutcomeFromCallResult,
  getWorkflowStageFromCallResult,
  getAlertFromCallResult,
} from "@/lib/workflow";
import type { CustomerFilters, LogCallOptions } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getCustomers(filters: CustomerFilters = {}) {
  await requireAuth();
  const supabase = await createClient();

  let query = supabase
    .from("customers")
    .select("*, isps(id, name), profiles:assigned_user_id(id, full_name)")
    .order("updated_at", { ascending: false });

  if (filters.isp_id) query = query.eq("isp_id", filters.isp_id);
  if (filters.assigned_team) query = query.eq("assigned_team", filters.assigned_team);
  if (filters.assigned_user_id) query = query.eq("assigned_user_id", filters.assigned_user_id);
  if (filters.workflow_stage) query = query.eq("workflow_stage", filters.workflow_stage);
  if (filters.transfer_status) query = query.eq("transfer_status", filters.transfer_status);
  if (filters.alert_type) query = query.eq("alert_type", filters.alert_type);
  if (filters.alert_status) query = query.eq("alert_status", filters.alert_status);

  if (filters.search) {
    const term = `%${filters.search}%`;
    query = query.or(
      `full_name.ilike.${term},phone.ilike.${term},account_number.ilike.${term},address.ilike.${term}`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getCustomer(id: string) {
  await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .select("*, isps(id, name), profiles:assigned_user_id(id, full_name, email)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateCustomer(
  id: string,
  updates: Record<string, unknown>
) {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (!existing) throw new Error("Customer not found");

  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const trackFields = [
    "assigned_team",
    "assigned_user_id",
    "workflow_stage",
    "transfer_status",
    "alert_type",
    "alert_status",
    "outcome",
    "recovery_status",
  ];

  for (const field of trackFields) {
    if (updates[field] !== undefined && updates[field] !== existing[field]) {
      let oldVal = String(existing[field] ?? "");
      let newVal = String(updates[field] ?? "");
      let description = `Updated ${field}`;

      if (field === "assigned_user_id") {
        const ids = [existing[field], updates[field]].filter(Boolean) as string[];
        if (ids.length > 0) {
          const { data: names } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", ids);
          const label = (uid: string | null) =>
            names?.find((p) => p.id === uid)?.full_name || "Unassigned";
          oldVal = label(existing[field]);
          newVal = label(updates[field] as string | null);
        } else {
          oldVal = "Unassigned";
          newVal = "Unassigned";
        }
        description = `Assigned lead to ${newVal}`;
      }

      await supabase.from("activities").insert({
        customer_id: id,
        user_id: profile.id,
        activity_type: "field_update",
        old_value: oldVal,
        new_value: newVal,
        description,
      });
    }
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  revalidatePath("/senior-sales");
  revalidatePath("/recovery");
  revalidatePath("/dashboard");
  revalidatePath("/alerts");

  return data;
}

export async function logCall(
  customerId: string,
  callResult: string,
  notes: string,
  options: LogCallOptions = {}
) {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .single();

  if (!customer) throw new Error("Customer not found");

  if (options.isThreeWay && !options.seniorAssistedUserId) {
    return { error: "Please select the senior who assisted on the 3-way call" };
  }

  const newAttemptNumber = customer.call_attempt_number + 1;
  const team = customer.assigned_team;

  await supabase.from("call_logs").insert({
    customer_id: customerId,
    user_id: profile.id,
    team,
    attempt_number: newAttemptNumber,
    call_result: callResult,
    notes,
    is_three_way: options.isThreeWay ?? false,
    senior_assisted_user_id: options.isThreeWay
      ? options.seniorAssistedUserId
      : null,
  });

  const updates: Record<string, unknown> = {
    call_attempt_number: newAttemptNumber,
    last_contact_date: new Date().toISOString().split("T")[0],
  };

  const stageFromResult = getWorkflowStageFromCallResult(callResult);
  if (stageFromResult) {
    updates.workflow_stage = stageFromResult;
  } else if (team === "Senior Sales Team" && newAttemptNumber <= 3) {
    updates.workflow_stage = getNextAttemptStage(customer.call_attempt_number);
  }

  const outcome = getOutcomeFromCallResult(callResult);
  if (outcome) updates.outcome = outcome;

  const alert = getAlertFromCallResult(callResult);
  if (alert) {
    updates.alert_type = alert.alert_type;
    updates.alert_status = alert.alert_status;
    if (alert.price_approval_status) {
      updates.price_approval_status = alert.price_approval_status;
    }
    updates.transfer_status = "Management Review";
  }

  if (
    team === "Senior Sales Team" &&
    newAttemptNumber >= 3 &&
    !stageFromResult
  ) {
    updates.transfer_status = "Move to Recovery Needed";
    updates.workflow_stage = "Recovery Needed";
  }

  const { error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", customerId);

  if (error) throw new Error(error.message);

  let activityDesc = `Logged call attempt #${newAttemptNumber}: ${callResult}`;
  if (options.isThreeWay && options.seniorAssistedUserId) {
    const { data: senior } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", options.seniorAssistedUserId)
      .single();
    activityDesc += ` (3-way with ${senior?.full_name || "senior"})`;
  }

  await supabase.from("activities").insert({
    customer_id: customerId,
    user_id: profile.id,
    activity_type: "call_logged",
    new_value: callResult,
    description: activityDesc,
  });

  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/senior-sales");
  revalidatePath("/recovery");
  revalidatePath("/dashboard");
  revalidatePath("/alerts");

  return { success: true, attemptNumber: newAttemptNumber };
}

export async function quickRescheduleInstall(
  customerId: string,
  notes: string,
  followUpDate?: string
) {
  const result = await logCall(
    customerId,
    "Rescheduled",
    notes || "Install appointment rescheduled",
    { isThreeWay: false }
  );
  if ("error" in result && result.error) return result;

  if (followUpDate) {
    await updateCustomer(customerId, { follow_up_date: followUpDate });
  }

  return { success: true };
}

export async function moveToRecovery(customerId: string) {
  const profile = await requireAuth();
  if (!["admin", "manager", "senior_sales"].includes(profile.role)) {
    throw new Error("Not authorized to move customers to Recovery");
  }

  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .single();

  if (!customer) throw new Error("Customer not found");
  if (customer.assigned_team !== "Senior Sales Team") {
    throw new Error("Customer is not on Senior Sales Team");
  }
  if (customer.call_attempt_number < 3) {
    throw new Error("Customer must have at least 3 call attempts");
  }

  const updates = {
    transfer_status: "Moved to Recovery",
    assigned_team: "Recovery Team",
    workflow_stage: "In Recovery",
    recovery_status: "In Progress",
  };

  // Use service role — RLS blocks senior_sales from changing assigned_team
  const admin = createAdminClient();
  const { error } = await admin
    .from("customers")
    .update(updates)
    .eq("id", customerId);

  if (error) throw new Error(error.message);

  await admin.from("activities").insert({
    customer_id: customerId,
    user_id: profile.id,
    activity_type: "team_transfer",
    old_value: "Senior Sales Team",
    new_value: "Recovery Team",
    description: "Moved to Recovery Team after 3 attempts with no returned call",
  });

  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/senior-sales");
  revalidatePath("/recovery");
  revalidatePath("/dashboard");

  return {
    success: true,
    redirectTo:
      profile.role === "senior_sales" ? "/senior-sales" : "/recovery",
  };
}

export async function addNote(customerId: string, note: string) {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase.from("customer_notes").insert({
    customer_id: customerId,
    user_id: profile.id,
    note,
  });

  if (error) throw new Error(error.message);

  await supabase.from("activities").insert({
    customer_id: customerId,
    user_id: profile.id,
    activity_type: "note_added",
    description: "Added a note",
  });

  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}

export async function getCallLogs(customerId: string) {
  await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("call_logs")
    .select(
      "*, profiles:profiles!user_id(id, full_name), senior_assisted:profiles!senior_assisted_user_id(id, full_name)"
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getCustomerNotes(customerId: string) {
  await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customer_notes")
    .select("*, profiles(id, full_name)")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getActivities(customerId: string) {
  await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activities")
    .select("*, profiles(id, full_name)")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getAlerts() {
  await requireRole(["admin", "manager"]);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .select("*, isps(id, name)")
    .or(
      "and(alert_status.eq.Needs Email,alert_type.neq.None),and(alert_type.eq.ISP Complaint Needs Fix,alert_status.neq.Resolved),and(alert_type.eq.Price Approval Needed,alert_status.neq.Resolved)"
    )
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function updateAlert(
  customerId: string,
  alertStatus: string,
  priceApprovalStatus?: string
) {
  await requireRole(["admin", "manager"]);
  const supabase = await createClient();

  const updates: Record<string, unknown> = { alert_status: alertStatus };
  if (priceApprovalStatus) {
    updates.price_approval_status = priceApprovalStatus;
  }

  const { error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", customerId);

  if (error) throw new Error(error.message);

  revalidatePath("/alerts");
  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}

export async function deleteCustomers(ids: string[]) {
  await requireRole(["admin", "manager"]);
  if (ids.length === 0) return { success: true, deleted: 0 };

  const admin = createAdminClient();

  const { error: unlinkError } = await admin
    .from("import_rows")
    .update({ customer_id: null })
    .in("customer_id", ids);

  if (unlinkError) throw new Error(unlinkError.message);

  const { error } = await admin.from("customers").delete().in("id", ids);

  if (error) throw new Error(error.message);

  revalidatePath("/customers");
  revalidatePath("/senior-sales");
  revalidatePath("/recovery");
  revalidatePath("/dashboard");
  revalidatePath("/alerts");

  return { success: true, deleted: ids.length };
}
