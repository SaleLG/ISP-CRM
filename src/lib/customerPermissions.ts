import type { Customer, Profile } from "@/lib/types";

export function isManager(profile: Profile) {
  return profile.role === "admin" || profile.role === "manager";
}

export function canEditWorkflowFields(profile: Profile) {
  return isManager(profile);
}

export function canAssignSeniorAgent(profile: Profile) {
  return isManager(profile);
}

export function canEditSeniorAssignment(customer: Customer, profile: Profile) {
  return (
    canAssignSeniorAgent(profile) &&
    customer.assigned_team === "Senior Sales Team"
  );
}

export function canLogCall(customer: Customer, profile: Profile) {
  if (isManager(profile)) return true;
  if (
    profile.role === "junior_sales" &&
    customer.assigned_team === "Junior Sales Team"
  ) {
    return true;
  }
  if (
    profile.role === "senior_sales" &&
    customer.assigned_team === "Senior Sales Team"
  ) {
    return true;
  }
  return false;
}

export function canUseSeniorSalesActions(customer: Customer, profile: Profile) {
  if (customer.assigned_team !== "Senior Sales Team") return false;
  return isManager(profile) || profile.role === "senior_sales";
}

export function canUseRecycleHoldActions(customer: Customer, profile: Profile) {
  if (customer.assigned_team !== "Recycle Hold") return false;
  return isManager(profile);
}
