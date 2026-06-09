export const TEAMS = ["Senior Sales Team", "Recovery Team"] as const;
export type Team = (typeof TEAMS)[number];

export const ROLES = ["admin", "manager", "senior_sales", "recovery"] as const;
export type Role = (typeof ROLES)[number];

/** User team is only set for senior_sales and recovery; admin/manager have no team. */
export function teamFromRole(role: Role | string): Team | null {
  if (role === "recovery") return "Recovery Team";
  if (role === "senior_sales") return "Senior Sales Team";
  return null;
}

export const WORKFLOW_STAGES = [
  "New",
  "Attempt 1",
  "Attempt 2",
  "Attempt 3",
  "Recovery Needed",
  "In Recovery",
  "Callback Requested",
  "Rescheduled",
  "New Account Created",
  "Closed",
] as const;

export const TRANSFER_STATUSES = [
  "None",
  "Move to Recovery Needed",
  "Moved to Recovery",
  "Management Review",
] as const;

export const ISP_STATUS_LABELS: Record<string, string> = {
  A: "A (Active)",
  NS: "NS (No Show)",
  D: "D (Disconnected)",
  V: "V (Void)",
  CX: "CX (Cancelled)",
  P: "P (Pending)",
};

export function formatIspStatus(code: string | null | undefined): string {
  if (!code) return "—";
  const normalized = code.trim().toUpperCase();
  return ISP_STATUS_LABELS[normalized] ?? code;
}

export const CALL_RESULTS = [
  "No Answer",
  "Left Voicemail",
  "Customer Answered",
  "Callback Requested",
  "Rescheduled",
  "New Account Created",
  "Not Interested",
  "Wrong Number",
  "Do Not Call",
  "ISP Complaint",
  "Price Approval Needed",
] as const;

/** Recovery team: reschedule install is the primary success outcome */
export const RECOVERY_CALL_RESULTS = [
  "Rescheduled",
  "Customer Answered",
  "Callback Requested",
  "New Account Created",
  "No Answer",
  "Left Voicemail",
  "Not Interested",
  "Wrong Number",
  "Do Not Call",
  "ISP Complaint",
  "Price Approval Needed",
] as const;

export const ALERT_TYPES = [
  "None",
  "ISP Complaint Needs Fix",
  "Price Approval Needed",
] as const;

export const ALERT_STATUSES = [
  "None",
  "Needs Email",
  "Email Sent",
  "In Review",
  "Resolved",
] as const;

export const OUTCOMES = [
  "Pending",
  "Recovered",
  "Rescheduled",
  "New Account Created",
  "Not Interested",
  "Wrong Number",
  "Do Not Call",
  "Closed",
] as const;

export const PRICE_APPROVAL_STATUSES = [
  "Not Requested",
  "Pending",
  "Approved",
  "Denied",
] as const;

export const ISP_COLUMN_MAP: Record<string, string> = {
  Status: "isp_status",
  Name: "full_name",
  Number: "phone",
  "ACCT#": "account_number",
  "order date": "order_date",
  "install date": "install_date",
  "install complete": "install_complete",
  "sales rep ID": "sales_rep_id",
  address: "address",
  product: "product",
  Term: "term",
  "Call Ahead-Comets Notes": "isp_notes",
};

export const CRM_FIELDS = [
  { key: "isp_status", label: "ISP Status" },
  { key: "full_name", label: "Full Name" },
  { key: "phone", label: "Phone" },
  { key: "account_number", label: "Account Number" },
  { key: "order_date", label: "Order Date" },
  { key: "install_date", label: "Install Date" },
  { key: "install_complete", label: "Install Complete" },
  { key: "sales_rep_id", label: "Sales Rep ID" },
  { key: "address", label: "Address" },
  { key: "product", label: "Product" },
  { key: "term", label: "Term" },
  { key: "isp_notes", label: "ISP Notes" },
] as const;

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", roles: ["admin", "manager", "senior_sales", "recovery"] },
  { label: "Import Customers", href: "/import", roles: ["admin", "manager"] },
  { label: "Master CRM", href: "/customers", roles: ["admin", "manager"] },
  { label: "Senior Sales Team", href: "/senior-sales", roles: ["admin", "manager", "senior_sales"] },
  { label: "Recovery Team", href: "/recovery", roles: ["admin", "manager", "recovery"] },
  { label: "Alerts", href: "/alerts", roles: ["admin", "manager"] },
  { label: "ISPs", href: "/isps", roles: ["admin", "manager"] },
  { label: "Users", href: "/users", roles: ["admin"] },
] as const;
