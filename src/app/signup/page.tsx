"use client";

import { useState } from "react";
import {
  Button,
  Typography,
  Alert,
  Link as MuiLink,
  Stack,
} from "@mui/material";
import Link from "next/link";
import { signUp } from "@/actions/auth";
import AuthPage from "@/components/auth/AuthPage";
import AuthTextField from "@/components/auth/AuthTextField";

export default function SignUpPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await signUp({
      email: form.email,
      password: form.password,
      full_name: form.full_name,
    });

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(result.message);
      setForm({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    }
    setLoading(false);
  };

  return (
    <AuthPage subtitle="Create Account">
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
          label="Full Name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
          autoComplete="name"
        />
        <AuthTextField
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          autoComplete="email"
        />
        <AuthTextField
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          autoComplete="new-password"
        />
        <AuthTextField
          label="Confirm Password"
          type="password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
          required
          autoComplete="new-password"
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading || !!success}
          sx={{ mb: 2 }}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <Stack direction="row" justifyContent="center" spacing={0.5}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?
        </Typography>
        <MuiLink
          component={Link}
          href="/login"
          variant="body2"
          underline="hover"
        >
          Sign in
        </MuiLink>
      </Stack>
    </AuthPage>
  );
}
