import type { Customer } from "./types";
import { RECYCLE_HOLD_DAYS, JUNIOR_TEXT_RESULTS, CALL_RESULTS } from "./constants";
import type { Role } from "./constants";

/** Escalate to Senior Sales (manager assigns a senior rep). */
const SENIOR_ESCALATION_RESULTS = [
  "Callback Requested",
  "Call Requested",
  "Reschedule by Phone",
  "Rescheduled",
  "New Account Created",
  "ISP Complaint",
  "Price Approval Needed",
] as const;

const NO_REPLY_RESULTS = ["No Answer", "Left Voicemail", "No Text Reply"] as const;

export function usesJuniorTextOnly(
  assignedTeam: string,
  role: Role | string | null | undefined
): boolean {
  return assignedTeam === "Junior Sales Team";
}

export function getInteractionResults(
  assignedTeam: string,
  role: Role | string | null | undefined
): readonly string[] {
  if (usesJuniorTextOnly(assignedTeam, role)) {
    return JUNIOR_TEXT_RESULTS;
  }
  return CALL_RESULTS;
}

export function getInteractionLabel(
  assignedTeam: string,
  role: Role | string | null | undefined
): "text" | "call" {
  return usesJuniorTextOnly(assignedTeam, role) ? "text" : "call";
}

export function getNextAttemptStage(currentAttempts: number): string {
  const next = currentAttempts + 1;
  if (next === 1) return "Attempt 1";
  if (next === 2) return "Attempt 2";
  if (next === 3) return "Attempt 3";
  return "No Reply - Hold";
}

export function shouldEscalateToSenior(callResult: string): boolean {
  if (callResult === "Simple Reschedule") return false;
  return (SENIOR_ESCALATION_RESULTS as readonly string[]).includes(callResult);
}

export function isNoReplyResult(callResult: string): boolean {
  return (NO_REPLY_RESULTS as readonly string[]).includes(callResult);
}

export function shouldMoveToRecycleHold(
  callAttemptNumber: number,
  callResult: string
): boolean {
  if (shouldEscalateToSenior(callResult)) return false;
  if (getWorkflowStageFromCallResult(callResult)) return false;
  return callAttemptNumber >= 3 && isNoReplyResult(callResult);
}

export function getRecycleFollowUpDate(fromDate = new Date()): string {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + RECYCLE_HOLD_DAYS);
  return d.toISOString().split("T")[0];
}

export function isRecycleReady(followUpDate: string | null | undefined): boolean {
  if (!followUpDate) return false;
  const today = new Date().toISOString().split("T")[0];
  return followUpDate <= today;
}

export function getOutcomeFromCallResult(callResult: string): string | null {
  switch (callResult) {
    case "Simple Reschedule":
    case "Rescheduled":
      return "Rescheduled";
    case "New Account Created":
      return "New Account Created";
    case "Not Interested":
      return "Not Interested";
    case "Wrong Number":
      return "Wrong Number";
    case "Do Not Call":
      return "Do Not Call";
    default:
      return null;
  }
}

export function getWorkflowStageFromCallResult(callResult: string): string | null {
  switch (callResult) {
    case "Callback Requested":
    case "Call Requested":
      return "Callback Requested";
    case "Reschedule by Phone":
      return "Callback Requested";
    case "Simple Reschedule":
    case "Rescheduled":
      return "Rescheduled";
    case "New Account Created":
      return "New Account Created";
    case "Not Interested":
    case "Wrong Number":
    case "Do Not Call":
      return "Closed";
    default:
      return null;
  }
}

export function getAlertFromCallResult(callResult: string): {
  alert_type: string;
  alert_status: string;
  price_approval_status?: string;
} | null {
  if (callResult === "ISP Complaint") {
    return {
      alert_type: "ISP Complaint Needs Fix",
      alert_status: "Needs Email",
    };
  }
  if (callResult === "Price Approval Needed") {
    return {
      alert_type: "Price Approval Needed",
      alert_status: "Needs Email",
      price_approval_status: "Pending",
    };
  }
  return null;
}

export function canRecycleToJunior(customer: Customer): boolean {
  return customer.assigned_team === "Recycle Hold";
}

export function getJuniorTextResultDescription(result: string): string | undefined {
  switch (result) {
    case "No Text Reply":
      return "No response to text — counts as outreach attempt";
    case "Simple Reschedule":
      return "Customer confirmed a new date by text — stays with Junior Sales";
    case "Call Requested":
      return "Customer wants a phone call — escalates to Senior Sales";
    case "Reschedule by Phone":
      return "Customer needs a call to reschedule — escalates to Senior Sales";
    case "ISP Complaint":
      return "Escalates to an assigned Senior Sales rep";
    case "Price Approval Needed":
      return "Escalates to an assigned Senior Sales rep";
    default:
      return undefined;
  }
}
