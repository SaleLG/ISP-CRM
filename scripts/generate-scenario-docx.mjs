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
const outputPath = path.join(
  __dirname,
  "..",
  "docs",
  "ISP_CRM_Example_Scenario.docx"
);

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
        heading("ISP Recovery CRM — Example Business Scenario"),
        para(
          "This document walks through two customer journeys: (A) a callback escalation from Junior Sales to Senior Sales, and (B) a no-response lead moved to the manager's No Reply recycle basket and sent back to Junior Sales after 30 days."
        ),
        para("Document: ISP Recovery CRM Example Scenario"),
        para(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`),
        para("Application: ISP Recovery CRM"),

        heading("Overview — Workflow Pipeline", HeadingLevel.HEADING_2),
        bullet("Junior Sales Team — first 3 outreach attempts on imported leads"),
        bullet("Senior Sales Team — callback and reschedule escalations (manager assigns reps)"),
        bullet("No Reply — Recycle — manager-only 30-day hold after 3 no-reply attempts"),
        para(
          "Imported leads start on Junior Sales. Positive responses escalate to Senior Sales. No-reply leads auto-move to the recycle basket."
        ),

        heading("Scenario A — Callback Escalation (Jane Doe)", HeadingLevel.HEADING_2),
        para(
          "Jane Doe is a Comcast customer who answers on the second Junior Sales call and asks for a callback tomorrow at 2pm."
        ),

        heading("A1 — Import", HeadingLevel.HEADING_3),
        para("Who: Admin or Manager"),
        numbered('Comcast ISP and columns are already set up on the ISPs page'),
        numbered("Import the Comcast Excel file"),
        para("Jane Doe is created with:"),
        bullet('assigned_team = "Junior Sales Team"'),
        bullet('workflow_stage = "New"'),
        bullet("call_attempt_number = 0"),
        para("Jane appears on the Junior Sales Team page under the Comcast tab."),

        heading("A2 — Junior Sales: Attempt 1", HeadingLevel.HEADING_3),
        para("Who: Junior Sales agent (Maria)"),
        para("Where: Junior Sales Team → Jane Doe"),
        numbered('Log Call → "No Answer"'),
        para("System updates: call_attempt_number = 1, workflow_stage = Attempt 1"),

        heading("A3 — Junior Sales: Attempt 2 (Customer Responds)", HeadingLevel.HEADING_3),
        para("Maria calls again. Jane answers:"),
        para('"I\'m busy — call me back tomorrow at 2pm."'),
        numbered('Log Call → "Callback Requested"'),
        numbered('Notes: "Customer wants callback tomorrow 2pm"'),
        para("System automatically escalates:"),
        bullet('assigned_team = "Senior Sales Team"'),
        bullet('workflow_stage = "Callback Requested"'),
        bullet('transfer_status = "Senior Review"'),
        bullet("assigned_user_id cleared (unassigned)"),
        bullet("Activity logged: Escalated to Senior Sales"),
        para(
          "Jane disappears from Maria's Junior Sales view and appears on the Senior Sales Team page — unassigned."
        ),

        heading("A4 — Manager Assigns a Senior Rep", HeadingLevel.HEADING_3),
        para("Who: Manager (Eddie)"),
        para("Where: Senior Sales Team page or Jane's Customer Detail"),
        numbered("Eddie sees Jane in the unassigned Senior Sales queue"),
        numbered("James is available — Eddie assigns Jane to James using Assigned To"),
        para("Jane now appears only in James's Senior Sales view."),

        heading("A5 — Senior Sales Closes the Callback", HeadingLevel.HEADING_3),
        para("Who: Senior Sales agent (James)"),
        para("Where: Senior Sales Team → Jane Doe"),
        numbered("James calls Jane at 2pm the next day"),
        numbered('Log Call → "Rescheduled"'),
        numbered("Notes: new install date confirmed"),
        para("Jane's workflow_stage = Rescheduled. Dashboard counts +1 Rescheduled."),

        heading("Scenario B — No Response → Recycle Hold (John Smith)", HeadingLevel.HEADING_2),
        para(
          "John Smith is another Comcast row in the same import file. Junior Sales cannot reach him after 3 attempts, so he automatically moves to the No Reply recycle basket."
        ),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Field", bold: true })] })],
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Value", bold: true })] })],
                }),
              ],
            }),
            ...[
              ["Name", "John Smith"],
              ["Phone", "555-123-4567"],
              ["ACCT#", "CM-88421"],
              ["Address", "123 Oak St, Dallas TX"],
              ["Product", "Internet 500Mbps"],
              ["Status", "Cancelled"],
            ].map(
              ([field, value]) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(field)] }),
                    new TableCell({ children: [new Paragraph(value)] }),
                  ],
                })
            ),
          ],
        }),

        new Paragraph({ spacing: { after: 200 } }),
        para("Goal: Call John, win him back (reschedule install or new account)."),

        heading("B0 — Set Up Comcast in the CRM", HeadingLevel.HEADING_3),
        para("Who: Admin or Manager"),
        para("Where: ISPs page"),
        numbered('Click "Add ISP" → name = "Comcast" → Save'),
        numbered('Click "Columns" on the Comcast row'),
        numbered("Add columns matching the spreadsheet: Name (Primary), ACCT# (match key), Phone, Address, Product, Status"),
        para(
          "Import is blocked until at least one column exists. Column order: Primary first, match key second, then the rest."
        ),

        heading("B1 — Admin Imports the File", HeadingLevel.HEADING_3),
        para("Who: Admin or Manager"),
        para("Where: Import Customers page"),
        numbered('Select ISP = "Comcast"'),
        numbered("Upload the Excel file"),
        numbered("Map columns, preview, confirm import"),
        para("System automatically:"),
        bullet("Creates John Smith as a new customer under Comcast"),
        bullet("Stores spreadsheet values in Comcast's custom fields"),
        bullet('Sets assigned_team = "Junior Sales Team"'),
        bullet('Sets workflow_stage = "New"'),
        bullet("Sets call_attempt_number = 0"),
        para(
          "John appears in Junior Sales Team view and on Master CRM under the Comcast tab."
        ),

        heading("B2 — Junior Sales: Attempt 1", HeadingLevel.HEADING_3),
        para("Who: Junior Sales agent (Maria)"),
        numbered('Log Call → "Left Voicemail"'),
        para("call_attempt_number = 1, workflow_stage = Attempt 1"),

        heading("B3 — Junior Sales: Attempt 2", HeadingLevel.HEADING_3),
        numbered('Log Call → "No Answer"'),
        para("call_attempt_number = 2, workflow_stage = Attempt 2"),

        heading("B4 — Junior Sales: Attempt 3 (Auto Recycle)", HeadingLevel.HEADING_3),
        numbered('Log Call → "Left Voicemail"'),
        para("System automatically moves John to the recycle basket:"),
        bullet("call_attempt_number = 3"),
        bullet('assigned_team = "Recycle Hold"'),
        bullet('workflow_stage = "No Reply - Hold"'),
        bullet('transfer_status = "Recycle in 30 Days"'),
        bullet("follow_up_date = today + 30 days"),
        para(
          "John disappears from Junior Sales view. Only the manager sees him on No Reply — Recycle."
        ),

        heading("B5 — Manager Recycles After 30 Days", HeadingLevel.HEADING_3),
        para("Who: Manager (Eddie)"),
        para("Where: No Reply — Recycle page"),
        numbered("30 days later, Eddie filters Ready (30+ days) and opens John Smith"),
        numbered('Clicks "Send back to Junior Sales"'),
        para("System updates:"),
        bullet('assigned_team = "Junior Sales Team"'),
        bullet('workflow_stage = "New"'),
        bullet("call_attempt_number = 0"),
        bullet('transfer_status = "Recycled to Junior"'),
        para("John reappears on Junior Sales for a new outreach round."),

        heading("Alternative Endings", HeadingLevel.HEADING_2),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Call Result", bold: true })] })],
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "What Happens", bold: true })] })],
                }),
              ],
            }),
            ...[
              ["New Account Created", "Customer signs up again — counted on dashboard"],
              ["Not Interested", 'workflow_stage = "Closed"'],
              ["ISP Complaint", "Alert created → management fixes ISP issue"],
              [
                "Callback Requested (Junior Sales)",
                "Escalates to Senior Sales Team — manager assigns a senior rep",
              ],
              [
                "Rescheduled (Junior Sales)",
                "Escalates to Senior Sales Team — manager assigns a senior rep",
              ],
            ].map(
              ([result, outcome]) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(result)] }),
                    new TableCell({ children: [new Paragraph(outcome)] }),
                  ],
                })
            ),
          ],
        }),

        new Paragraph({ spacing: { after: 200 } }),
        heading("Visual Flow", HeadingLevel.HEADING_2),

        para("Path A — Jane Doe (callback escalation):", { spacing: { after: 80 } }),
        para("Import → Junior Sales (Attempt 1) → Attempt 2: Callback Requested"),
        para("        ↓"),
        para("Senior Sales (Senior Review) → Manager assigns James"),
        para("        ↓"),
        para("James calls back → Rescheduled ✓"),

        new Paragraph({ spacing: { after: 120 } }),
        para("Path B — John Smith (no response → recycle):", { spacing: { after: 80 } }),
        para("Import → Junior Sales — Attempt 1, 2, 3 (no callback)"),
        para("        ↓"),
        para("Auto → No Reply Recycle Hold (30 days)"),
        para("        ↓"),
        para("Manager sends back to Junior Sales ✓"),

        heading("Key Business Rules", HeadingLevel.HEADING_2),
        bullet(
          "One customer record per person per ISP — teams only filter the same data, nothing is duplicated."
        ),
        bullet(
          "Each ISP has its own column layout — set up columns on the ISPs page before importing."
        ),
        bullet(
          "New imports land on Junior Sales Team with stage New and 0 call attempts."
        ),
        bullet(
          "Callback Requested or Rescheduled from Junior Sales escalates to Senior Sales automatically."
        ),
        bullet(
          "Managers assign Senior Sales reps to escalated leads (manual for now; scheduling may come later)."
        ),
        bullet("Junior Sales gets 3 tries with no returned call — then auto-move to Recycle Hold for 30 days."),
        bullet("Manager sends recycled leads back to Junior Sales when ready."),
        bullet(
          "Alerts = things needing management attention (ISP complaints, price approvals)."
        ),
        bullet(
          "Every call is logged — attempt count and stage update automatically."
        ),

        heading("Who Uses What in the CRM", HeadingLevel.HEADING_2),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Role", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Main Pages", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "In This Scenario", bold: true })] })] }),
              ],
            }),
            ...[
              [
                "Admin / Manager",
                "ISPs, Import, Master CRM, Junior/Senior Sales, No Reply — Recycle, Alerts, Dashboard",
                "Sets up Comcast, imports file, assigns Jane to James, recycles John after 30 days",
              ],
              [
                "Junior Sales",
                "Junior Sales Team",
                "Maria makes Attempts 1–3; Jane escalates on callback; John auto-moves to recycle hold",
              ],
              [
                "Senior Sales",
                "Senior Sales Team",
                "James handles Jane's callback and closes with Rescheduled",
              ],
            ].map(
              ([role, pages, scenario]) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(role)] }),
                    new TableCell({ children: [new Paragraph(pages)] }),
                    new TableCell({ children: [new Paragraph(scenario)] }),
                  ],
                })
            ),
          ],
        }),
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
