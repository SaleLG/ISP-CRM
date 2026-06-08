"use client";

import { useState } from "react";
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
  canEditRecoveryAssignment,
  canEditWorkflowFields,
  canLogCall,
  canUseRecoveryActions,
} from "@/lib/customerPermissions";
import {
  updateCustomer,
  addNote,
  quickRescheduleInstall,
} from "@/actions/customers";
import CallLogDialog from "./CallLogDialog";
import MoveToRecoveryButton from "./MoveToRecoveryButton";
import { canMoveToRecovery } from "@/lib/workflow";
import type { Customer, Profile } from "@/lib/types";

interface Props {
  customer: Customer;
  profile: Profile;
  recoveryTeamMembers?: Pick<Profile, "id" | "full_name">[];
  seniorAssistUsers?: Pick<Profile, "id" | "full_name">[];
}

export default function CustomerDetailActions({
  customer,
  profile,
  recoveryTeamMembers = [],
  seniorAssistUsers = [],
}: Props) {
  const [note, setNote] = useState("");
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [followUpDate, setFollowUpDate] = useState(
    customer.follow_up_date || ""
  );
  const [quickLoading, setQuickLoading] = useState(false);

  const showWorkflowFields = canEditWorkflowFields(profile);
  const showRecoveryAssign =
    canEditRecoveryAssignment(customer, profile) &&
    recoveryTeamMembers.length > 0;
  const showLogCall = canLogCall(customer, profile);
  const showRecoveryActions = canUseRecoveryActions(customer, profile);
  const showMoveToRecovery = canMoveToRecovery(customer) && showLogCall;

  const showActionButtons =
    showLogCall || showRecoveryActions || showMoveToRecovery;
  const showManagementFields = showRecoveryAssign || showWorkflowFields;

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
      await quickRescheduleInstall(
        customer.id,
        "Install appointment rescheduled",
        followUpDate || undefined
      );
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
          {showRecoveryActions && (
            <Alert severity="info" sx={{ py: 0.5 }}>
              Focus: get the customer to reschedule their install appointment.
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

          {showRecoveryActions && (
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

          {showMoveToRecovery && (
            <MoveToRecoveryButton
              customerId={customer.id}
              customerName={customer.full_name || "Customer"}
            />
          )}

          {showActionButtons && showManagementFields && <Divider />}

          {showRecoveryAssign && (
            <TextField
              select
              label="Assigned Recovery Agent"
              value={customer.assigned_user_id || ""}
              onChange={(e) => handleUpdate("assigned_user_id", e.target.value)}
              size="small"
              fullWidth
              helperText="Assign the Recovery agent working this lead"
            >
              <MenuItem value="">Unassigned</MenuItem>
              {recoveryTeamMembers.map((u) => (
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
            isRecovery={showRecoveryActions}
            seniorAssistUsers={seniorAssistUsers}
          />
          <CallLogDialog
            open={rescheduleDialogOpen}
            onClose={() => setRescheduleDialogOpen(false)}
            customerId={customer.id}
            customerName={customer.full_name || "Customer"}
            currentAttempts={customer.call_attempt_number}
            isRecovery
            seniorAssistUsers={seniorAssistUsers}
            defaultCallResult="Rescheduled"
          />
        </>
      )}
    </Card>
  );
}
