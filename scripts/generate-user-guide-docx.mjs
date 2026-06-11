import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
} from "docx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(__dirname, "..", "docs", "ISP_CRM_User_Guide.docx");

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ text, heading: level, spacing: { after: 200 } });
}

function para(text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun(text)],
  });
}

function bullet(text) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 80 },
  });
}

function numbered(text) {
  return new Paragraph({
    text,
    numbering: { reference: "numbered-list", level: 0 },
    spacing: { after: 80 },
  });
}

function table(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: headers.map(
          (h) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: h, bold: true })],
                }),
              ],
            })
        ),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [new Paragraph(cell)],
                })
            ),
          })
      ),
    ],
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "numbered-list",
        levels: [
          {
            level: 0,
            format: "decimal",
            text: "%1.",
            alignment: AlignmentType.START,
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {},
      children: [
        heading("ISP Recovery CRM — User Guide"),
        para(
          "This guide explains how to use ISP Recovery CRM. It covers daily workflows for admins, managers, Junior Sales agents, and Senior Sales agents."
        ),
        para("Application: ISP Recovery CRM"),
        para(`Version: 1.2  |  Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`),

        heading("1. What This App Does", HeadingLevel.HEADING_2),
        para(
          "ISP Recovery CRM is a web-based customer recovery system. It helps your team:"
        ),
        bullet("Set up a separate CRM table for each ISP with custom columns"),
        bullet("Import customer lists from ISP Excel/CSV files into the correct ISP table"),
        bullet("Run first text outreach attempts on the Junior Sales Team"),
        bullet("Escalate callback and reschedule requests to Senior Sales for manager assignment"),
        bullet("Auto-move no-reply leads to a manager-only 30-day recycle basket after 3 attempts"),
        bullet("Assign Senior Sales escalations to specific agents"),
        bullet("Log calls, notes, and outcomes on each customer"),
        bullet("Flag ISP complaints and price approvals for management review"),
        bullet("View dashboards and reports on outreach and outcomes"),
        para(
          "All teams work from one master customer database. Each ISP has its own column layout, but records are never duplicated — team pages are filtered views of the same data."
        ),

        heading("2. Getting Started", HeadingLevel.HEADING_2),
        heading("2.1 Logging In", HeadingLevel.HEADING_3),
        numbered("Open the CRM in your browser (your Netlify URL or http://localhost:3000 for local use)"),
        numbered("Enter your email and password on the Login page"),
        numbered('Optional: check "Remember me" to stay signed in'),
        numbered("Click Sign In"),
        para(
          "If you forgot your password, click Forgot Password, enter your email, and follow the reset link sent to your inbox. The link opens a page where you set a new password."
        ),

        heading("2.2 Signing Up (New Users)", HeadingLevel.HEADING_3),
        numbered("Click Sign Up on the login page"),
        numbered("Enter your full name, email, and password"),
        numbered("Submit the form"),
        para(
          "New accounts are created as Junior Sales users and remain inactive until an admin approves them on the Users page. You will see a Pending Approval screen until activated. The admin sets your final role (Admin, Manager, Junior Sales, or Senior Sales) when approving you."
        ),

        heading("2.3 User Roles", HeadingLevel.HEADING_3),
        table(
          ["Role", "What You Can Access"],
          [
            [
              "Admin",
              "Everything — Dashboard, Import, Master CRM, Junior Sales, Senior Sales, No Reply — Recycle, Alerts, ISPs, Users, Profile",
            ],
            [
              "Manager",
              "Dashboard, Import, Master CRM, Junior Sales, Senior Sales, No Reply — Recycle, Alerts, ISPs, Profile (no Users page)",
            ],
            [
              "Junior Sales",
              "Dashboard and Junior Sales Team view only",
            ],
            [
              "Senior Sales",
              "Dashboard and Senior Sales Team view only (your assigned escalations)",
            ],
          ]
        ),
        new Paragraph({ spacing: { after: 200 } }),

        heading("3. Navigation", HeadingLevel.HEADING_2),
        para(
          "After login, the blue sidebar on the left shows your available pages. Click any item to navigate. The top header shows your name and avatar — click it for Profile or Sign Out."
        ),
        table(
          ["Page", "Who Uses It", "Purpose"],
          [
            ["Dashboard", "Everyone", "Overview stats and charts"],
            ["Import Customers", "Admin, Manager", "Upload ISP Excel/CSV files"],
            ["Master CRM", "Admin, Manager", "Per-ISP customer tables with custom columns"],
            ["Junior Sales Team", "Admin, Manager, Junior Sales", "First 3 outreach attempts on new leads"],
            ["Senior Sales Team", "Admin, Manager, Senior Sales", "Callback/reschedule escalations — manager assigns reps"],
            ["No Reply — Recycle", "Admin, Manager", "30-day hold for no-reply leads; send back to Junior Sales"],
            ["Alerts", "Admin, Manager", "ISP complaints and price approvals"],
            ["ISPs", "Admin, Manager", "Create ISPs, define CRM columns, open each ISP's table"],
            ["Users", "Admin only", "Approve and manage user accounts"],
            ["Profile (header menu)", "Everyone", "Update name, avatar, password — click your avatar top-right"],
          ]
        ),
        new Paragraph({ spacing: { after: 200 } }),

        heading("4. Dashboard", HeadingLevel.HEADING_2),
        para(
          "The Dashboard is role-specific — each user sees stats for the customers they are allowed to access."
        ),
        heading("4.1 Admin / Manager Dashboard", HeadingLevel.HEADING_3),
        bullet("Total customers and breakdown by team (Junior Sales, Senior Sales, Recycle Hold)"),
        bullet("Unassigned Senior Sales escalations awaiting manager assignment"),
        bullet("No Reply — Recycle Hold, Ready to Recycle, and alerts needing attention"),
        bullet("Charts by ISP, workflow stage, assigned team, and call attempts"),
        heading("4.2 Junior Sales Dashboard", HeadingLevel.HEADING_3),
        bullet("My leads on Junior Sales Team — New, Attempt 1, Attempt 2, Attempt 3"),
        bullet("Calls logged and outcomes (Rescheduled, Closed) on your leads"),
        bullet("Charts: leads by ISP, outreach progress, and your calls by result"),
        heading("4.3 Senior Sales Dashboard", HeadingLevel.HEADING_3),
        bullet("My assigned escalations only (manager must assign leads to you)"),
        bullet("Callback Requested, Rescheduled, New Accounts Created, Closed"),
        bullet("Charts: your leads by ISP, stage, and calls by result"),
        para(
          "Senior Sales users do not see Junior Sales or company-wide totals. If the dashboard shows zero, ask a manager to assign escalated leads on the Senior Sales Team page."
        ),

        heading("5. Setting Up an ISP (Required Before Import)", HeadingLevel.HEADING_2),
        para(
          "Before you can import customers or use Master CRM for an ISP, you must create the ISP and define its columns. Each ISP can have a different spreadsheet layout."
        ),
        para("Who: Admin or Manager"),
        para("Where: ISPs page"),

        heading("5.1 Create the ISP", HeadingLevel.HEADING_3),
        numbered('Click "Add ISP"'),
        numbered('Enter the ISP name (e.g. Comcast, Spectrum)'),
        numbered("Save"),

        heading("5.2 Define CRM Columns", HeadingLevel.HEADING_3),
        numbered('Click "Columns" on the ISP row'),
        numbered('Use "Add Column" to add one or more rows — enter each field name, mark Primary and/or match key, then click Add'),
        numbered("Enter column names exactly as they appear in the spreadsheet (e.g. Name, ACCT#, Install Date)"),
        numbered('When finished, click "Save Columns"'),
        para("Column options:"),
        bullet("Primary column — the main customer identifier shown in tables (usually Name). Always appears first."),
        bullet("Use for duplicate matching on import — the field used to detect existing records (usually ACCT# or Phone). Always appears second."),
        bullet("Other columns — any additional fields (Address, Product, Status, etc.)"),
        para(
          "Column order is automatic: Primary first, match-key second, then all other columns. You can reorder non-primary, non-match-key columns with the up/down arrows."
        ),
        para(
          "Tip: You can also open an ISP's CRM table directly with the View CRM button on the ISPs page."
        ),

        heading("6. Importing Customers", HeadingLevel.HEADING_2),
        para("Who: Admin or Manager"),
        para("Where: Import Customers page"),
        para(
          "Import is blocked until the selected ISP has at least one column defined on the ISPs page."
        ),
        numbered('Select the ISP (e.g. Comcast, Spectrum) from the dropdown'),
        numbered("Upload an Excel (.xlsx) or CSV file from the ISP"),
        numbered(
          "Review column mapping — spreadsheet headers are auto-mapped to that ISP's CRM columns by name"
        ),
        numbered("Adjust any incorrect mappings manually"),
        numbered("Click Preview to see the first 20 rows mapped to your ISP columns"),
        numbered("Click Confirm Import to process the file"),
        para("After import, you see a summary:"),
        bullet("New records created"),
        bullet("Existing records updated (matched by ISP + match-key column)"),
        bullet("Re-initialized — finished leads (Closed or New Account Created) matched again start a fresh Junior Sales round"),
        bullet("Errors (if any)"),
        para("Duplicate detection:"),
        bullet("When importing, the system checks columns marked Use for duplicate matching on import"),
        bullet("If a row matches an existing customer for the same ISP on any match-key field, spreadsheet fields are updated instead of creating a duplicate"),
        bullet("If the matched lead had finished the pipeline (Closed or New Account Created), it is re-initialized: Junior Sales Team, stage New, 0 attempts, outcome Pending"),
        bullet("Active pipeline leads (in progress, Recycle Hold, Senior Sales) are updated in place — workflow is not reset"),
        bullet("Typical setup: mark ACCT# or Phone as the match key"),
        para(
          "Brand-new customers are assigned to Junior Sales Team with workflow stage New and 0 outreach attempts."
        ),

        heading("7. Master CRM", HeadingLevel.HEADING_2),
        para("Who: Admin and Manager"),
        para("Where: Master CRM page"),
        para(
          "Master CRM shows one ISP at a time. Each ISP tab displays that ISP's custom columns plus standard workflow fields (team, stage, calls, etc.)."
        ),
        numbered("Select an ISP tab at the top of the table"),
        numbered("If the ISP has no columns defined yet, the table is hidden — go to ISPs → Columns first"),
        para("Use Master CRM to:"),
        bullet("Search across that ISP's customer data"),
        bullet("Filter by team, workflow stage, or transfer status"),
        bullet("Click the primary column value to open the customer detail page"),
        bullet("Assign senior reps on Senior Sales leads (managers)"),
        bullet("Bulk delete selected customers (select-all applies to the current page only)"),
        para(
          "There is no combined All ISPs view — switch tabs to work with a different ISP's customers."
        ),

        heading("8. Junior Sales Team Workflow", HeadingLevel.HEADING_2),
        para("Who: Junior Sales agents (and managers overseeing them)"),
        para("Where: Junior Sales Team page"),
        para(
          "This view shows customers assigned to Junior Sales Team. Junior outreach is text-only — log each text attempt (up to 3). When a customer needs a phone call or complex reschedule, the lead escalates to Senior Sales."
        ),

        heading("8.1 Finding a Lead", HeadingLevel.HEADING_3),
        numbered("Open Junior Sales Team from the sidebar"),
        numbered("Select the ISP tab for the ISP you are working"),
        numbered("Use search or filters to find your lead"),
        numbered("Click the customer name to open Customer Detail"),

        heading("8.2 Logging a Text", HeadingLevel.HEADING_3),
        numbered('Click "Log Text" in the Actions panel'),
        numbered("Select the text result (No Text Reply, Simple Reschedule, Call Requested, etc.)"),
        numbered("Add notes about what happened"),
        numbered('Click "Log Text" to save'),
        para("The system automatically:"),
        bullet("Increments the attempt number"),
        bullet("Updates workflow stage (Attempt 1, Attempt 2, Attempt 3) for outreach texts"),
        bullet("Saves the interaction in Call Log History"),
        bullet(
          'After 3 attempts with No Text Reply, automatically moves the lead to No Reply — Recycle Hold for 30 days'
        ),

        heading("8.3 Escalating to Senior Sales", HeadingLevel.HEADING_3),
        para(
          "Log text with one of these results to escalate from Junior Sales:"
        ),
        bullet("Call Requested — customer wants a phone call"),
        bullet("Reschedule by Phone — customer needs a call to reschedule"),
        bullet("ISP Complaint — creates a management alert and escalates"),
        bullet("Price Approval Needed — creates a management alert and escalates"),
        para("Simple Reschedule (customer confirmed a new date by text) stays on Junior Sales — it does not escalate."),
        para("The system automatically:"),
        bullet('Moves assigned_team to "Senior Sales Team"'),
        bullet('Sets transfer_status to "Senior Review"'),
        bullet("Clears any assignee so a manager can assign an available senior rep"),
        bullet("Logs the escalation in the Activity Timeline"),
        para(
          "The lead disappears from Junior Sales view and appears on the Senior Sales Team page for manager assignment."
        ),

        heading("8.4 No Reply — Automatic Recycle Hold", HeadingLevel.HEADING_3),
        para(
          "After 3 text attempts logged as No Text Reply, the system automatically moves the customer to the recycle basket. No manual button is required."
        ),
        para("The customer:"),
        bullet('Moves to assigned_team = Recycle Hold'),
        bullet('Gets workflow_stage = No Reply - Hold'),
        bullet('Gets transfer_status = Recycle in 30 Days'),
        bullet("follow_up_date is set to 30 days from today"),
        bullet("Disappears from Junior Sales view — only managers see them on No Reply — Recycle"),
        bullet("Stays as the same record — not copied"),

        heading("9. Senior Sales Team Workflow", HeadingLevel.HEADING_2),
        para("Who: Senior Sales agents and managers"),
        para("Where: Senior Sales Team page"),
        para(
          "Senior Sales handles escalated callback and reschedule leads from Junior Sales. Managers assign leads to available senior reps; seniors work only their assigned leads."
        ),

        heading("9.1 Viewing Escalated Leads", HeadingLevel.HEADING_3),
        bullet(
          "Senior Sales agents only see leads assigned to them by a manager"
        ),
        bullet(
          "Managers and admins see all Senior Sales leads and can filter by assignee"
        ),
        bullet(
          'Use the "Assigned To" filter: All agents, Unassigned, or a specific senior rep'
        ),
        bullet(
          'Unassigned leads have transfer_status = "Senior Review" and need manager assignment'
        ),

        heading("9.2 Assigning Leads (Managers)", HeadingLevel.HEADING_3),
        para("Managers assign Senior Sales reps in two ways:"),
        numbered(
          "On the Senior Sales Team table — use the Assigned To dropdown in each row"
        ),
        numbered(
          "On Customer Detail — use the Assigned Senior Sales Rep dropdown in Actions"
        ),
        para(
          "Assign escalated leads to whoever is available. A scheduling rotation may be added in a future version."
        ),

        heading("9.3 Logging Senior Sales Calls", HeadingLevel.HEADING_3),
        numbered("Open the assigned customer from Senior Sales Team"),
        numbered('Click "Log Call"'),
        numbered(
          "Select a result — Callback Requested, Rescheduled, New Account Created, Not Interested, etc."
        ),
        numbered("Add notes (callback time, new install date, outcome, etc.)"),
        numbered("Save the call"),
        para(
          "Senior reps complete the follow-up call or reschedule and close the lead when appropriate."
        ),

        heading("10. No Reply — Recycle Workflow", HeadingLevel.HEADING_2),
        para("Who: Admin and Manager only"),
        para("Where: No Reply — Recycle page"),
        para(
          "When Junior Sales cannot reach a customer after 3 attempts, the lead is automatically placed in a 30-day recycle basket. This keeps no-reply leads separate from fresh and in-progress work."
        ),

        heading("10.1 Viewing Recycle Holds", HeadingLevel.HEADING_3),
        bullet("Only admins and managers can access this page"),
        bullet("Each row shows the recycle date (follow-up date)"),
        bullet('Filter by Ready (30+ days elapsed) or Waiting (still in hold)'),
        bullet("Dashboard shows total in Recycle Hold and how many are Ready to Recycle"),

        heading("10.2 Sending Back to Junior Sales", HeadingLevel.HEADING_3),
        numbered("Open the customer from No Reply — Recycle (or Customer Detail)"),
        numbered('When the 30-day hold has passed, click "Send back to Junior Sales"'),
        numbered("Confirm the action"),
        para("The system:"),
        bullet('Moves assigned_team back to Junior Sales Team'),
        bullet('Resets workflow_stage to New and call_attempt_number to 0'),
        bullet('Sets transfer_status to Recycled to Junior'),
        bullet("Lead reappears on Junior Sales for a new outreach round"),

        heading("11. Customer Detail Page", HeadingLevel.HEADING_2),
        para(
          "Every customer has a detail page with full information and actions. Open it by clicking a customer name from any table."
        ),
        para("Left side — information panels:"),
        bullet("Customer Information (ISP custom fields from import, e.g. name, phone, account, address)"),
        bullet("Workflow Status (team, assigned agent, stage, alerts, outcome — team and stage are read-only chips set by the workflow)"),
        bullet("Call Log History (all past calls with agent, result, 3-way info)"),
        bullet("Notes (free-text notes from any team member)"),
        bullet("Activity Timeline (automatic log of changes, calls, and team transfers)"),
        para("Right side — Actions panel:"),
        bullet("Log Text (Junior Sales leads) or Log Call (Senior Sales leads) — managers can log on any lead"),
        bullet("Reschedule Install / Quick log (Senior Sales customers)"),
        bullet("Send back to Junior Sales (managers, on Recycle Hold leads when ready)"),
        bullet("Assigned Senior Sales Rep dropdown (managers, on Senior Sales leads only)"),
        bullet("Follow-up date and notes"),
        para(
          "To finish a lead, log a terminal result: New Account Created (solved), or Not Interested / Wrong Number / Do Not Call (closed). There is no separate Finish button."
        ),

        heading("12. Alerts Page", HeadingLevel.HEADING_2),
        para("Who: Admin and Manager"),
        para("Where: Alerts page"),
        para("Alerts appear when a call is logged with:"),
        bullet("ISP Complaint"),
        bullet("Price Approval Needed"),
        para("Management workflow:"),
        numbered("Review the alert on the Alerts page"),
        numbered("Send required email to the ISP (outside the CRM)"),
        numbered('Update alert status: Needs Email → Email Sent → In Review → Resolved'),
        numbered("For price requests: Approve or Deny, then mark Resolved"),
        para(
          "Resolving an alert only closes the management task (complaint handled, price approved/denied). It does not finish the sales lead."
        ),
        para(
          "After the alert is resolved, the manager or assigned senior rep must open the customer and Log Call with a terminal result (New Account Created, Not Interested, etc.) to finish the lead."
        ),

        heading("13. ISPs Page", HeadingLevel.HEADING_2),
        para("Who: Admin and Manager"),
        para(
          "The ISPs page is where you set up each ISP's CRM table before importing or viewing customers."
        ),
        numbered("Add new ISP names"),
        numbered('Click Columns to define that ISP\'s spreadsheet fields'),
        numbered('Click View CRM to open that ISP\'s tab on Master CRM'),
        numbered("Edit name or deactivate ISPs as needed"),
        para(
          "Each import and each Master CRM tab is linked to one ISP record. Different ISPs can have completely different column layouts."
        ),

        heading("14. Users Page (Admin Only)", HeadingLevel.HEADING_2),
        para("Who: Admin"),
        para("Manage who can access the CRM:"),
        numbered("View all registered users"),
        numbered("Approve new signups (activate the account)"),
        numbered("Change roles: admin, manager, junior_sales, or senior_sales"),
        numbered(
          "Team is set automatically from role — Junior Sales → Junior Sales Team; Senior Sales → Senior Sales Team"
        ),
        numbered("Deactivate users who should no longer access the system"),

        heading("15. Profile Page", HeadingLevel.HEADING_2),
        para("Everyone can update their own profile:"),
        bullet("Full name"),
        bullet("Profile photo (avatar)"),
        bullet("Password change"),
        para("Click your avatar in the top-right header → Profile."),

        heading("16. Junior Text Results (Junior Sales Team)", HeadingLevel.HEADING_2),
        table(
          ["Text Result", "When to Use"],
          [
            ["No Text Reply", "No response to text — counts as attempt; 3x triggers Recycle Hold"],
            ["Simple Reschedule", "Customer confirmed new date by text — stays on Junior Sales"],
            ["Call Requested", "Customer wants a phone call — escalates to Senior Sales"],
            ["Reschedule by Phone", "Customer needs a call to reschedule — escalates to Senior Sales"],
            ["ISP Complaint", "Customer has ISP issue — alert + escalates to Senior Sales"],
            ["Price Approval Needed", "Customer wants better price — alert + escalates to Senior Sales"],
            ["Not Interested", "Customer declined — closes the lead"],
            ["Wrong Number", "Phone number is incorrect — closes the lead"],
            ["Do Not Call", "Customer requested no contact — closes the lead"],
          ]
        ),
        new Paragraph({ spacing: { after: 200 } }),

        heading("17. Senior Call Results (Senior Sales Team)", HeadingLevel.HEADING_2),
        table(
          ["Call Result", "When to Use"],
          [
            ["No Answer", "Phone rang, nobody picked up"],
            ["Left Voicemail", "You left a voicemail message"],
            ["Customer Answered", "Spoke with the customer (general)"],
            ["Callback Requested", "Customer asked to be called back later"],
            ["Rescheduled", "Install appointment rescheduled"],
            ["New Account Created", "Customer signed up — lead solved"],
            ["Not Interested", "Customer declined — closes the lead"],
            ["Wrong Number", "Phone number is incorrect — closes the lead"],
            ["Do Not Call", "Customer requested no further contact — closes the lead"],
            ["ISP Complaint", "Customer has an issue with the ISP — creates alert"],
            ["Price Approval Needed", "Customer wants a discount — creates management alert"],
          ]
        ),
        new Paragraph({ spacing: { after: 200 } }),

        heading("18. Workflow Stages Reference", HeadingLevel.HEADING_2),
        table(
          ["Stage", "Meaning"],
          [
            ["New", "Just imported, no calls yet"],
            ["Attempt 1 / 2 / 3", "Junior Sales outreach attempts"],
            ["No Reply - Hold", "In 30-day recycle basket after 3 no-response attempts"],
            ["Callback Requested", "Customer wants a return call"],
            ["Rescheduled", "Install appointment set"],
            ["New Account Created", "Customer re-signed"],
            ["Closed", "Lead finished (not interested, DNC, etc.)"],
          ]
        ),
        new Paragraph({ spacing: { after: 200 } }),

        heading("19. Transfer Status Reference", HeadingLevel.HEADING_2),
        table(
          ["Transfer Status", "Meaning"],
          [
            ["None", "No pending transfer"],
            ["Senior Review", "Escalated to Senior Sales — awaiting manager assignment"],
            ["Recycle in 30 Days", "Junior Sales finished 3 attempts — auto-moved to recycle hold"],
            ["Recycled to Junior", "Manager sent lead back to Junior Sales for a new round"],
            ["Management Review", "ISP complaint or price approval alert active"],
          ]
        ),
        new Paragraph({ spacing: { after: 200 } }),

        heading("20. Key Business Rules", HeadingLevel.HEADING_2),
        bullet("One master database — no duplicate records between teams"),
        bullet("Each ISP has its own CRM column layout — set up columns before importing"),
        bullet("Primary column first, match-key column second — used for display and duplicate detection"),
        bullet("Junior Sales uses text-only outreach — 3 attempts before automatic recycle hold"),
        bullet("Call Requested, Reschedule by Phone, ISP Complaint, and Price Approval Needed escalate to Senior Sales"),
        bullet("Simple Reschedule by text stays on Junior Sales"),
        bullet("Managers assign Senior Sales reps to escalated leads"),
        bullet("No-reply leads auto-move to Recycle Hold for 30 days — manager-only view"),
        bullet("Managers send recycled leads back to Junior Sales when the hold period ends"),
        bullet("Re-importing a finished lead (Closed or New Account Created) re-initializes it for a new outreach round"),
        bullet("ISP complaints and price requests go to Alerts — resolving the alert does not finish the lead"),
        bullet("Team and stage are set by the workflow — not edited manually (except admin override)"),
        bullet("Every interaction, note, and field change is tracked in the activity log"),

        heading("21. Quick Daily Checklist", HeadingLevel.HEADING_2),
        heading("Junior Sales Agent", HeadingLevel.HEADING_3),
        numbered("Check Dashboard for new imports"),
        numbered("Open Junior Sales Team — work your leads by ISP tab"),
        numbered("Log every text with result and notes"),
        numbered("If customer needs a call or phone reschedule — log Call Requested or Reschedule by Phone; lead escalates to Senior Sales"),
        numbered("After 3 No Text Reply attempts, the lead auto-moves to Recycle Hold — no action needed"),

        heading("Senior Sales Agent", HeadingLevel.HEADING_3),
        numbered("Open Senior Sales Team — review your assigned escalations"),
        numbered("Return callbacks and complete reschedules"),
        numbered("Log every call with result and notes"),
        numbered("Close leads when resolved (Rescheduled, New Account Created, Closed, etc.)"),

        heading("Manager / Admin", HeadingLevel.HEADING_3),
        numbered("Set up new ISPs and define their columns before first import"),
        numbered("Import new ISP files as they arrive"),
        numbered("Assign Senior Sales escalations to available reps"),
        numbered("Review No Reply — Recycle and send ready leads back to Junior Sales"),
        numbered("Review and resolve Alerts (complaint/price admin tasks)"),
        numbered("Finish leads via Log Text or Log Call on customer detail when appropriate"),
        numbered("Monitor Dashboard for team performance"),
        numbered("Approve new user signups (admin)"),

        heading("22. Need Help?", HeadingLevel.HEADING_2),
        para(
          "For a step-by-step walkthrough of one customer from ISP setup through import to close, see the companion document: ISP_CRM_Example_Scenario.docx"
        ),
        para(
          "Regenerate these guides anytime: npm run docs:finalize  (or docs:user-guide and docs:scenario separately)"
        ),
      ],
    },
  ],
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
const buffer = await Packer.toBuffer(doc);
try {
  fs.writeFileSync(outputPath, buffer);
  console.log(`Created: ${outputPath}`);
} catch (err) {
  if (err?.code === "EBUSY") {
    const fallback = outputPath.replace(/\.docx$/, "_updated.docx");
    fs.writeFileSync(fallback, buffer);
    console.log(`Target locked — wrote: ${fallback}`);
    console.log("Close the open document and re-run to overwrite the main file.");
  } else {
    throw err;
  }
}
