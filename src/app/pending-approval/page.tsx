"use client";

import {
  Typography,
  Button,
  Alert,
} from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { signOut } from "@/actions/auth";
import AuthPage from "@/components/auth/AuthPage";

export default function PendingApprovalPage() {
  return (
    <AuthPage subtitle="Account Pending Approval">
      <HourglassEmptyIcon
        sx={{ fontSize: 64, color: "warning.main", mb: 2, display: "block", mx: "auto" }}
      />
      <Alert severity="info" sx={{ mb: 3 }}>
        Your account has been created but is not yet active. An administrator
        must approve your account before you can access the CRM.
      </Alert>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
        Please contact your manager or check back later. You can sign out and
        try again once you&apos;ve been approved.
      </Typography>
      <Button variant="outlined" onClick={() => signOut()} fullWidth>
        Sign Out
      </Button>
    </AuthPage>
  );
}
