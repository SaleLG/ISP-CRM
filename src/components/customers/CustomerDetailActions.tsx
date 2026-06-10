"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Stack,
  Divider,
  Alert,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import {
  WORKFLOW_STAGES,
  TRANSFER_STATUSES,
  ALERT_TYPES,
  ALERT_STATUSES,
  OUTCOMES,
  TEAMS,
} from "@/lib/constants";
import {
  canEditSeniorAssignment,
  canEditWorkflowFields,
  canLogCall,
  canUseSeniorSalesActions,
  canUseRecycleHoldActions,
} from "@/lib/customerPermissions";
import {
  updateCustomer,
  addNote,
  quickRescheduleInstall,
} from "@/actions/customers";
import CallLogDialog from "./CallLogDialog";
import RecycleToJuniorButton from "./RecycleToJuniorButton";
import { canRecycleToJunior } from "@/lib/workflow";
import type { Customer, Profile } from "@/lib/types";

interface Props {
  customer: Customer;
  profile: Profile;
  seniorTeamMembers?: Pick<Profile, "id" | "full_name">[];
}

export default function CustomerDetailActions({
  customer,
  profile,
  seniorTeamMembers = [],
}: Props) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [followUpDate, setFollowUpDate] = useState(
    customer.follow_up_date || ""
  );
  const [quickLoading, setQuickLoading] = useState(false);

  const showWorkflowFields = canEditWorkflowFields(profile);
  const showSeniorAssign =
    canEditSeniorAssignment(customer, profile) &&
    seniorTeamMembers.length > 0;
  const showLogCall = canLogCall(customer, profile);
  const showSeniorActions = canUseSeniorSalesActions(customer, profile);
  const showRecycleHoldActions = canUseRecycleHoldActions(customer, profile);
  const showRecycleToJunior =
    showRecycleHoldActions && canRecycleToJunior(customer);

  const showActionButtons =
    showLogCall || showSeniorActions || showRecycleToJunior;
  const showManagementFields = showSeniorAssign || showWorkflowFields;

  const handleUpdate = async (field: string, value: string) => {
    await updateCustomer(customer.id, { [field]: value || null });
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    await addNote(customer.id, note);
    setNote("");
  };

  const handleQuickReschedule = async () => {
    setQuickLoading(true);
    try {
      const result = await quickRescheduleInstall(
        customer.id,
        "Install appointment rescheduled",
        followUpDate || undefined
      );
      if (result && "redirectTo" in result && result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      }
    } finally {
      setQuickLoading(false);
    }
  };

  const workflowSelectProps = {
    size: "small" as const,
    fullWidth: true,
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Actions
        </Typography>

        <Stack spacing={2}>
          {showSeniorActions && (
            <Alert severity="info" sx={{ py: 0.5 }}>
              Follow up on callback or reschedule request and close the lead
              when resolved.
            </Alert>
          )}

          {showLogCall && (
            <Button
              variant="contained"
              startIcon={<PhoneIcon />}
              onClick={() => setCallDialogOpen(true)}
              fullWidth
            >
              Log Call
            </Button>
          )}

          {showSeniorActions && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<EventRepeatIcon />}
                onClick={() => setRescheduleDialogOpen(true)}
                fullWidth
              >
                Reschedule Install
              </Button>
              <Button
                variant="outlined"
                onClick={handleQuickReschedule}
                disabled={quickLoading}
                fullWidth
              >
                {quickLoading ? "Saving..." : "Quick log: Rescheduled"}
              </Button>
            </>
          )}

          {showRecycleToJunior && (
            <RecycleToJuniorButton
              customerId={customer.id}
              customerName={customer.full_name || "Customer"}
            />
          )}

          {showRecycleHoldActions && (
            <Alert severity="info" sx={{ py: 0.5 }}>
              No Reply basket — follow-up date:{" "}
              {customer.follow_up_date || "not set"}. Send back to Junior Sales
              when ready to recycle.
            </Alert>
          )}

          {showActionButtons && showManagementFields && <Divider />}

          {showSeniorAssign && (
            <TextField
              select
              label="Assigned Senior Sales Rep"
              value={customer.assigned_user_id || ""}
              onChange={(e) => handleUpdate("assigned_user_id", e.target.value)}
              size="small"
              fullWidth
              helperText="Assign the senior rep handling this callback or reschedule"
            >
              <MenuItem value="">Unassigned</MenuItem>
              {seniorTeamMembers.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.full_name || "Unknown"}
                </MenuItem>
              ))}
            </TextField>
          )}

          {showWorkflowFields && (
            <>
              <TextField
                select
                label="Assigned Team"
                value={customer.assigned_team}
                onChange={(e) => handleUpdate("assigned_team", e.target.value)}
                {...workflowSelectProps}
              >
                {TEAMS.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Workflow Stage"
                value={customer.workflow_stage}
                onChange={(e) =>
                  handleUpdate("workflow_stage", e.target.value)
                }
                {...workflowSelectProps}
              >
                {WORKFLOW_STAGES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Transfer Status"
                value={customer.transfer_status}
                onChange={(e) =>
                  handleUpdate("transfer_status", e.target.value)
                }
                {...workflowSelectProps}
              >
                {TRANSFER_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Alert Type"
                value={customer.alert_type}
                onChange={(e) => handleUpdate("alert_type", e.target.value)}
                {...workflowSelectProps}
              >
                {ALERT_TYPES.map((a) => (
                  <MenuItem key={a} value={a}>
                    {a}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Alert Status"
                value={customer.alert_status}
                onChange={(e) => handleUpdate("alert_status", e.target.value)}
                {...workflowSelectProps}
              >
                {ALERT_STATUSES.map((a) => (
                  <MenuItem key={a} value={a}>
                    {a}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Outcome"
                value={customer.outcome}
                onChange={(e) => handleUpdate("outcome", e.target.value)}
                {...workflowSelectProps}
              >
                {OUTCOMES.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}

          {showLogCall && (showActionButtons || showManagementFields) && (
            <Divider />
          )}

          {showLogCall && (
            <>
              <TextField
                label="Follow-up Date"
                type="date"
                value={followUpDate}
                onChange={(e) => {
                  setFollowUpDate(e.target.value);
                  handleUpdate("follow_up_date", e.target.value);
                }}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Add Note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                multiline
                rows={3}
                size="small"
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={handleAddNote}
                disabled={!note.trim()}
              >
                Save Note
              </Button>
            </>
          )}
        </Stack>
      </CardContent>

      {showLogCall && (
        <>
          <CallLogDialog
            open={callDialogOpen}
            onClose={() => setCallDialogOpen(false)}
            customerId={customer.id}
            customerName={customer.full_name || "Customer"}
            currentAttempts={customer.call_attempt_number}
            emphasizeReschedule={showSeniorActions}
          />
          <CallLogDialog
            open={rescheduleDialogOpen}
            onClose={() => setRescheduleDialogOpen(false)}
            customerId={customer.id}
            customerName={customer.full_name || "Customer"}
            currentAttempts={customer.call_attempt_number}
            emphasizeReschedule
            defaultCallResult="Rescheduled"
          />
        </>
      )}
    </Card>
  );
}
