"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { moveToRecovery } from "@/actions/customers";

interface Props {
  customerId: string;
  customerName: string;
}

export default function MoveToRecoveryButton({ customerId, customerName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const result = await moveToRecovery(customerId);
      setOpen(false);
      router.push(result.redirectTo);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to move customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="warning"
        startIcon={<SwapHorizIcon />}
        onClick={() => setOpen(true)}
      >
        Move to Recovery Team
      </Button>
      <Dialog open={open} onClose={() => !loading && setOpen(false)}>
        <DialogTitle>Move to Recovery Team</DialogTitle>
        <DialogContent>
          <Typography>
            Move <strong>{customerName}</strong> to the Recovery Team?
            This will set transfer status to &quot;Moved to Recovery&quot; and
            workflow stage to &quot;In Recovery&quot;.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Moving..." : "Confirm Move"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
