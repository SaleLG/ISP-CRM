import type { Customer } from "./types";
import { RECYCLE_HOLD_DAYS } from "./constants";

const ESCALATION_CALL_RESULTS = ["Callback Requested", "Rescheduled"];

export function getNextAttemptStage(currentAttempts: number): string {
  const next = currentAttempts + 1;
  if (next === 1) return "Attempt 1";
  if (next === 2) return "Attempt 2";
  if (next === 3) return "Attempt 3";
  return "No Reply - Hold";
}

export function shouldEscalateToSenior(callResult: string): boolean {
  return ESCALATION_CALL_RESULTS.includes(callResult);
}

export function shouldMoveToRecycleHold(
  callAttemptNumber: number,
  callResult: string
): boolean {
  if (getWorkflowStageFromCallResult(callResult)) return false;
  return callAttemptNumber >= 3;
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
      return "Callback Requested";
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
