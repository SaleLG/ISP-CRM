"use client";

import { useState } from "react";
import {
  Button,
  Typography,
  Alert,
  Link as MuiLink,
} from "@mui/material";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/auth";
import AuthPage from "@/components/auth/AuthPage";
import AuthTextField from "@/components/auth/AuthTextField";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const result = await requestPasswordReset(email);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(result.message);
    }
    setLoading(false);
  };

  return (
    <AuthPage subtitle="Reset Password">
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ mb: 3 }}
      >
        Enter your email and we&apos;ll send you a link to reset your password.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <AuthTextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          sx={{ mb: 3 }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      <Typography variant="body2" align="center">
        <MuiLink component={Link} href="/login" underline="hover">
          Back to Sign In
        </MuiLink>
      </Typography>
    </AuthPage>
  );
}
