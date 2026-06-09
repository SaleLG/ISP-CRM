"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { normalizeStageLabel, normalizeTeamLabel } from "@/lib/constants";
import type { DashboardStats } from "@/lib/types";

function countByLabel(
  counts: Record<string, number>,
  raw: string | null | undefined,
  normalize: (value: string | null | undefined) => string
) {
  const label = normalize(raw);
  counts[label] = (counts[label] || 0) + 1;
}

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
    countByLabel(stageCounts, c.workflow_stage, normalizeStageLabel);
  }

  const teamCounts: Record<string, number> = {};
  for (const c of all) {
    countByLabel(teamCounts, c.assigned_team, normalizeTeamLabel);
  }

  const callTeamCounts: Record<string, number> = {};
  for (const log of callLogs || []) {
    countByLabel(callTeamCounts, log.team, normalizeTeamLabel);
  }

  return {
    totalCustomers: all.length,
    juniorSalesLeads: countBy("assigned_team", "Junior Sales Team"),
    seniorSalesLeads: countBy("assigned_team", "Senior Sales Team"),
    recycleHold: countBy("assigned_team", "Recycle Hold"),
    recycleReady: all.filter(
      (c) =>
        c.assigned_team === "Recycle Hold" &&
        c.follow_up_date &&
        c.follow_up_date <= new Date().toISOString().split("T")[0]
    ).length,
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
