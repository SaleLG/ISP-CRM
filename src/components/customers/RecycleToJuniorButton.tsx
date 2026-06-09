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
import ReplayIcon from "@mui/icons-material/Replay";
import { recycleToJunior } from "@/actions/customers";

interface Props {
  customerId: string;
  customerName: string;
}

export default function RecycleToJuniorButton({
  customerId,
  customerName,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await recycleToJunior(customerId);
      setOpen(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to recycle lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<ReplayIcon />}
        onClick={() => setOpen(true)}
      >
        Send back to Junior Sales
      </Button>
      <Dialog open={open} onClose={() => !loading && setOpen(false)}>
        <DialogTitle>Recycle to Junior Sales</DialogTitle>
        <DialogContent>
          <Typography>
            Send <strong>{customerName}</strong> back to the Junior Sales Team
            for a new outreach round? Attempt count will reset to 0 and the lead
            will appear as a recycled lead (not mixed with in-progress work on
            other juniors until assigned).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Sending..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
