import type { Customer } from "./types";

const RETURNED_CALL_RESULTS = [
  "Customer Answered",
  "Callback Requested",
  "Rescheduled",
  "New Account Created",
];

export function getNextAttemptStage(currentAttempts: number): string {
  const next = currentAttempts + 1;
  if (next === 1) return "Attempt 1";
  if (next === 2) return "Attempt 2";
  if (next === 3) return "Attempt 3";
  return "Recovery Needed";
}

export function shouldMoveToRecovery(
  callAttemptNumber: number,
  callResult: string
): boolean {
  if (RETURNED_CALL_RESULTS.includes(callResult)) return false;
  return callAttemptNumber >= 3;
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

export function canMoveToRecovery(customer: Customer): boolean {
  return (
    customer.assigned_team === "Senior Sales Team" &&
    customer.call_attempt_number >= 3 &&
    !["Callback Requested", "Rescheduled", "New Account Created", "Closed"].includes(
      customer.workflow_stage
    )
  );
}
