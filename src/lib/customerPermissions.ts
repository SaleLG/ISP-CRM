import type { Customer, Profile } from "@/lib/types";

export function isManager(profile: Profile) {
  return profile.role === "admin" || profile.role === "manager";
}

export function canEditWorkflowFields(profile: Profile) {
  return isManager(profile);
}

export function canAssignRecoveryAgent(profile: Profile) {
  return isManager(profile);
}

export function canEditRecoveryAssignment(customer: Customer, profile: Profile) {
  return (
    canAssignRecoveryAgent(profile) &&
    customer.assigned_team === "Recovery Team"
  );
}

export function canLogCall(customer: Customer, profile: Profile) {
  if (isManager(profile)) return true;
  if (
    profile.role === "senior_sales" &&
    customer.assigned_team === "Senior Sales Team"
  ) {
    return true;
  }
  if (
    profile.role === "recovery" &&
    customer.assigned_team === "Recovery Team"
  ) {
    return true;
  }
  return false;
}

export function canUseRecoveryActions(customer: Customer, profile: Profile) {
  if (customer.assigned_team !== "Recovery Team") return false;
  return isManager(profile) || profile.role === "recovery";
}
