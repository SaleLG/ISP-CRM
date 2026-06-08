"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  FormControlLabel,
  Checkbox,
  Alert,
  Typography,
} from "@mui/material";
import { CALL_RESULTS, RECOVERY_CALL_RESULTS } from "@/lib/constants";
import { logCall } from "@/actions/customers";
import type { Profile } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  currentAttempts: number;
  isRecovery?: boolean;
  seniorAssistUsers?: Pick<Profile, "id" | "full_name">[];
  defaultCallResult?: string;
}

export default function CallLogDialog({
  open,
  onClose,
  customerId,
  customerName,
  currentAttempts,
  isRecovery = false,
  seniorAssistUsers = [],
  defaultCallResult = "",
}: Props) {
  const results = isRecovery ? RECOVERY_CALL_RESULTS : CALL_RESULTS;
  const [callResult, setCallResult] = useState(defaultCallResult);
  const [notes, setNotes] = useState("");
  const [isThreeWay, setIsThreeWay] = useState(false);
  const [seniorAssistedUserId, setSeniorAssistedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setCallResult(defaultCallResult);
      setNotes("");
      setIsThreeWay(false);
      setSeniorAssistedUserId("");
      setError("");
    }
  }, [open, defaultCallResult]);

  const handleSubmit = async () => {
    if (!callResult) {
      setError("Please select a call result");
      return;
    }
    if (isThreeWay && !seniorAssistedUserId) {
      setError("Please select the senior who assisted on the 3-way call");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await logCall(customerId, callResult, notes, {
        isThreeWay,
        seniorAssistedUserId: isThreeWay ? seniorAssistedUserId : null,
      });
      if (result && "error" in result && result.error) {
        setError(result.error);
        return;
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log call");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Log Call — {customerName} (Attempt #{currentAttempts + 1})
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {isRecovery && (
            <Alert severity="info" sx={{ py: 0.5 }}>
              Primary goal: reschedule the customer&apos;s install appointment.
            </Alert>
          )}
          <TextField
            select
            label="Call Result"
            value={callResult}
            onChange={(e) => setCallResult(e.target.value)}
            fullWidth
            required
          >
            {results.map((r) => (
              <MenuItem key={r} value={r}>
                {r === "Rescheduled" && isRecovery
                  ? "Rescheduled — Install appointment set"
                  : r}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={3}
            fullWidth
            placeholder={
              isRecovery
                ? "e.g. New install date/time, customer availability..."
                : undefined
            }
          />
          {isRecovery && (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isThreeWay}
                    onChange={(e) => {
                      setIsThreeWay(e.target.checked);
                      if (!e.target.checked) setSeniorAssistedUserId("");
                    }}
                  />
                }
                label="3-way call with Senior Sales (for commission tracking)"
              />
              {isThreeWay && (
                <TextField
                  select
                  label="Senior who assisted"
                  value={seniorAssistedUserId}
                  onChange={(e) => setSeniorAssistedUserId(e.target.value)}
                  fullWidth
                  required
                  helperText="Select the senior added to close the sale"
                >
                  {seniorAssistUsers.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.full_name || "Unknown"}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </>
          )}
          {error && <Typography color="error" variant="body2">{error}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Log Call"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
