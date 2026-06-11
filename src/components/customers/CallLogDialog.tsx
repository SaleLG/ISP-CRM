"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Alert,
  Typography,
} from "@mui/material";
import { logCall } from "@/actions/customers";
import { getJuniorTextResultDescription } from "@/lib/workflow";

interface Props {
  open: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  currentAttempts: number;
  interactionMode?: "text" | "call";
  resultOptions: readonly string[];
  emphasizeReschedule?: boolean;
  defaultCallResult?: string;
}

export default function CallLogDialog({
  open,
  onClose,
  customerId,
  customerName,
  currentAttempts,
  interactionMode = "call",
  resultOptions,
  emphasizeReschedule = false,
  defaultCallResult = "",
}: Props) {
  const router = useRouter();
  const [callResult, setCallResult] = useState(defaultCallResult);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isTextMode = interactionMode === "text";

  useEffect(() => {
    if (open) {
      setCallResult(defaultCallResult);
      setNotes("");
      setError("");
    }
  }, [open, defaultCallResult]);

  const handleSubmit = async () => {
    if (!callResult) {
      setError(`Please select a ${isTextMode ? "text" : "call"} result`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await logCall(customerId, callResult, notes);
      if (result && "error" in result && result.error) {
        setError(result.error);
        return;
      }
      onClose();
      if (result && "redirectTo" in result && result.redirectTo) {
        router.push(result.redirectTo);
      }
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to log ${isTextMode ? "text" : "call"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const resultLabel = (result: string) => {
    if (result === "Simple Reschedule") {
      return "Simple Reschedule — confirmed by text";
    }
    if (result === "Rescheduled" && emphasizeReschedule) {
      return "Rescheduled — Install appointment set";
    }
    return result;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Log {isTextMode ? "Text" : "Call"} — {customerName} (Attempt #
        {currentAttempts + 1})
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {isTextMode && (
            <Alert severity="info" sx={{ py: 0.5 }}>
              Junior Sales is text-only. Call requests, phone reschedules,
              complaints, and price approvals escalate to Senior Sales for a
              manager to assign a rep.
            </Alert>
          )}
          {emphasizeReschedule && !isTextMode && (
            <Alert severity="info" sx={{ py: 0.5 }}>
              Primary goal: confirm reschedule or complete the callback.
            </Alert>
          )}
          <TextField
            select
            label={isTextMode ? "Text Result" : "Call Result"}
            value={callResult}
            onChange={(e) => setCallResult(e.target.value)}
            fullWidth
            required
          >
            {resultOptions.map((r) => (
              <MenuItem key={r} value={r}>
                {resultLabel(r)}
              </MenuItem>
            ))}
          </TextField>
          {isTextMode && callResult && getJuniorTextResultDescription(callResult) && (
            <Typography variant="caption" color="text.secondary">
              {getJuniorTextResultDescription(callResult)}
            </Typography>
          )}
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={3}
            fullWidth
            placeholder={
              emphasizeReschedule
                ? "e.g. New install date/time, customer availability..."
                : isTextMode
                  ? "e.g. Text sent, customer reply, new install date..."
                  : undefined
            }
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : isTextMode ? "Log Text" : "Log Call"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
