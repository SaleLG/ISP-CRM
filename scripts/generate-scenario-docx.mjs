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
  BorderStyle,
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

function para(text, options = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    ...options,
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
        heading("ISP CRM — Example Business Scenario"),
        para(
          "This document walks through one complete customer journey from ISP file import through Senior Sales call attempts, Recovery Team follow-up, management alert handling, and final outcome."
        ),
        para("Document: ISP CRM Example Scenario"),
        para("Application: ISP CRM (Miller Bros Sales Loss Recovery Division)"),

        heading("The Situation", HeadingLevel.HEADING_2),
        para(
          'Comcast sends Miller Bros an Excel file with customers who had installs go wrong or cancelled. One row in the file is:'
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

        heading("Step 1 — Admin Imports the File", HeadingLevel.HEADING_2),
        para("Who: Admin or Manager"),
        para("Where: Import Customers page"),
        numbered('Select ISP = "Comcast"'),
        numbered("Upload the Excel file"),
        numbered("Map columns (auto-mapped)"),
        numbered("Confirm import"),
        para("System automatically:"),
        bullet("Creates John Smith as a new customer"),
        bullet('Sets assigned_team = "Senior Sales Team"'),
        bullet('Sets workflow_stage = "New"'),
        bullet("Sets call_attempt_number = 0"),
        para("John now appears in Senior Sales Team view and Master CRM."),

        heading("Step 2 — Senior Sales: Attempt 1", HeadingLevel.HEADING_2),
        para("Who: Senior Sales agent (e.g. Sarah)"),
        para("Where: Senior Sales Team → click John Smith"),
        para("Sarah calls. No answer, leaves voicemail."),
        numbered("Click Log Call"),
        numbered('Select result: "Left Voicemail"'),
        numbered('Add notes: "Called 2pm, left VM about reschedule"'),
        para("System automatically updates:"),
        bullet("call_attempt_number = 1"),
        bullet('workflow_stage = "Attempt 1"'),
        bullet("Call saved in Call Log history"),

        heading("Step 3 — Senior Sales: Attempt 2", HeadingLevel.HEADING_2),
        para("Two days later, Sarah calls again. No answer."),
        numbered('Log Call → "No Answer"'),
        para("System updates:"),
        bullet("call_attempt_number = 2"),
        bullet('workflow_stage = "Attempt 2"'),

        heading("Step 4 — Senior Sales: Attempt 3", HeadingLevel.HEADING_2),
        para("Third call. Still no callback from John."),
        numbered('Log Call → "Left Voicemail"'),
        para("System updates:"),
        bullet("call_attempt_number = 3"),
        bullet('workflow_stage = "Attempt 3"'),
        bullet('transfer_status = "Move to Recovery Needed"'),
        para(
          'Sarah sees the "Move to Recovery Team" button on John\'s profile and clicks it.'
        ),
        para("System updates:"),
        bullet('assigned_team = "Recovery Team"'),
        bullet('transfer_status = "Moved to Recovery"'),
        bullet('workflow_stage = "In Recovery"'),
        para(
          "John disappears from Senior Sales view and appears in Recovery Team view. Same record — not copied."
        ),

        heading("Step 5 — Recovery Team Takes Over", HeadingLevel.HEADING_2),
        para("Who: Recovery agent (e.g. Mike)"),
        para("Where: Recovery Team → John Smith"),
        para(
          'Mike calls. John answers and says: "Comcast charged me wrong. I want a better price."'
        ),
        numbered('Log Call → "Price Approval Needed"'),
        numbered('Notes: "Customer wants $10 off monthly"'),
        para("System automatically creates an alert:"),
        bullet('alert_type = "Price Approval Needed"'),
        bullet('alert_status = "Needs Email"'),
        bullet('price_approval_status = "Pending"'),
        bullet('transfer_status = "Management Review"'),
        para("John now shows up on the Alerts page."),

        heading("Step 6 — Management Reviews the Alert", HeadingLevel.HEADING_2),
        para("Who: Eddie / Manager"),
        para("Where: Alerts page"),
        numbered("Sends email to ISP about pricing"),
        numbered('Clicks "Email Sent"'),
        numbered('Reviews the request → "Approve" or "Deny"'),
        numbered('When done → "Resolved"'),
        para("If approved, Mike calls John back and closes the deal."),

        heading("Step 7 — Happy Ending", HeadingLevel.HEADING_2),
        para("Mike calls John again. John agrees to reschedule."),
        numbered('Log Call → "Rescheduled"'),
        numbered("Updates outcome = Rescheduled"),
        numbered('workflow_stage = "Rescheduled"'),
        para("Dashboard counts +1 Rescheduled."),

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
              ["Callback Requested", 'Stage = "Callback Requested" — team calls back later'],
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
        heading("Visual Flow (John Smith)", HeadingLevel.HEADING_2),
        para("Excel Import (John Smith)"),
        para("        ↓"),
        para("Senior Sales Team — Attempt 1, 2, 3 (no callback)"),
        para("        ↓"),
        para("Move to Recovery Team"),
        para("        ↓"),
        para("Recovery calls → Price Approval Needed"),
        para("        ↓"),
        para("Management approves on Alerts page"),
        para("        ↓"),
        para("Recovery closes → Rescheduled ✓"),

        heading("Key Business Rules", HeadingLevel.HEADING_2),
        bullet(
          "One customer record — teams only filter the same data, nothing is duplicated."
        ),
        bullet("Senior Sales gets 3 tries — then hand off to Recovery."),
        bullet(
          "Recovery does not send leads back automatically — only management can change team manually."
        ),
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
              ["Admin / Manager", "Import, Master CRM, Alerts, Dashboard", "Imports file, approves price request"],
              ["Senior Sales", "Senior Sales Team", "Makes Attempts 1, 2, 3, moves to Recovery"],
              ["Recovery", "Recovery Team", "Follows up, logs price request, closes deal"],
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
fs.writeFileSync(outputPath, buffer);
console.log(`Created: ${outputPath}`);
