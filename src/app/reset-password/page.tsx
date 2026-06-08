"use client";

import { useState } from "react";
import {
  Button,
  Typography,
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/actions/auth";
import AuthPage from "@/components/auth/AuthPage";
import AuthTextField from "@/components/auth/AuthTextField";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await updatePassword(password);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/login?reset=success");
  };

  return (
    <AuthPage subtitle="Set New Password">
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ mb: 3 }}
      >
        Enter your new password below.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <AuthTextField
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <AuthTextField
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          sx={{ mb: 3 }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </AuthPage>
  );
}
