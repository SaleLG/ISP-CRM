"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import type { DashboardStats } from "@/lib/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAuth();
  const supabase = await createClient();

  const { data: customers } = await supabase.from("customers").select("*");
  const { data: callLogs } = await supabase.from("call_logs").select("team");
  const { data: isps } = await supabase.from("isps").select("id, name");

  const all = customers || [];

  const countBy = (field: string, value: string) =>
    all.filter((c) => c[field] === value).length;

  const ispCounts: Record<string, number> = {};
  for (const c of all) {
    const isp = isps?.find((i) => i.id === c.isp_id);
    const name = isp?.name || "Unknown";
    ispCounts[name] = (ispCounts[name] || 0) + 1;
  }

  const stageCounts: Record<string, number> = {};
  for (const c of all) {
    stageCounts[c.workflow_stage] = (stageCounts[c.workflow_stage] || 0) + 1;
  }

  const teamCounts: Record<string, number> = {};
  for (const c of all) {
    teamCounts[c.assigned_team] = (teamCounts[c.assigned_team] || 0) + 1;
  }

  const callTeamCounts: Record<string, number> = {};
  for (const log of callLogs || []) {
    if (log.team) {
      callTeamCounts[log.team] = (callTeamCounts[log.team] || 0) + 1;
    }
  }

  return {
    totalCustomers: all.length,
    seniorSalesLeads: countBy("assigned_team", "Senior Sales Team"),
    recoveryLeads: countBy("assigned_team", "Recovery Team"),
    recoveryNeeded: countBy("transfer_status", "Move to Recovery Needed"),
    alertsNeedingEmail: all.filter(
      (c) => c.alert_status === "Needs Email"
    ).length,
    priceApprovalRequests: all.filter(
      (c) =>
        c.alert_type === "Price Approval Needed" &&
        c.price_approval_status === "Pending"
    ).length,
    rescheduled: countBy("workflow_stage", "Rescheduled"),
    newAccountsCreated: countBy("workflow_stage", "New Account Created"),
    closed: countBy("workflow_stage", "Closed"),
    customersByIsp: Object.entries(ispCounts).map(([name, count]) => ({
      name,
      count,
    })),
    customersByStage: Object.entries(stageCounts).map(([stage, count]) => ({
      stage,
      count,
    })),
    customersByTeam: Object.entries(teamCounts).map(([team, count]) => ({
      team,
      count,
    })),
    callAttemptsByTeam: Object.entries(callTeamCounts).map(([team, count]) => ({
      team,
      count,
    })),
  };
}
