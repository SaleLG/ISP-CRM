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
import { CALL_RESULTS } from "@/lib/constants";
import { logCall } from "@/actions/customers";

interface Props {
  open: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  currentAttempts: number;
  emphasizeReschedule?: boolean;
  defaultCallResult?: string;
}

export default function CallLogDialog({
  open,
  onClose,
  customerId,
  customerName,
  currentAttempts,
  emphasizeReschedule = false,
  defaultCallResult = "",
}: Props) {
  const router = useRouter();
  const [callResult, setCallResult] = useState(defaultCallResult);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setCallResult(defaultCallResult);
      setNotes("");
      setError("");
    }
  }, [open, defaultCallResult]);

  const handleSubmit = async () => {
    if (!callResult) {
      setError("Please select a call result");
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
        router.refresh();
      }
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
          {emphasizeReschedule && (
            <Alert severity="info" sx={{ py: 0.5 }}>
              Primary goal: confirm reschedule or complete the callback.
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
            {CALL_RESULTS.map((r) => (
              <MenuItem key={r} value={r}>
                {r === "Rescheduled" && emphasizeReschedule
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
              emphasizeReschedule
                ? "e.g. New install date/time, customer availability..."
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
          {loading ? "Saving..." : "Log Call"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
