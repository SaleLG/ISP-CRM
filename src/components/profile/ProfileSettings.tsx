"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  Grid,
  Alert,
  Divider,
  CircularProgress,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { createClient } from "@/lib/supabase/client";
import { updateAvatarUrl, changePassword } from "@/actions/profile";
import type { Profile } from "@/lib/types";

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfileSettings({
  profile: initial,
}: {
  profile: Profile;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState(initial);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image must be under 2MB");
      return;
    }

    setAvatarLoading(true);
    setAvatarError("");
    setAvatarSuccess("");

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${profile.auth_user_id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw new Error(uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const url = `${publicUrl}?t=${Date.now()}`;
      const updated = await updateAvatarUrl(url);
      setProfile({ ...profile, ...updated, avatar_url: url });
      setAvatarSuccess("Avatar updated");
      router.refresh();
    } catch (err) {
      setAvatarError(
        err instanceof Error ? err.message : "Failed to upload avatar"
      );
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirm) {
      setPasswordError("New passwords do not match");
      return;
    }

    setPasswordLoading(true);
    const result = await changePassword(
      passwordForm.current,
      passwordForm.newPassword
    );

    if (result?.error) {
      setPasswordError(result.error);
    } else {
      setPasswordSuccess(result.message || "Password updated");
      setPasswordForm({ current: "", newPassword: "", confirm: "" });
    }
    setPasswordLoading(false);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profile Photo
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                mb: 2,
              }}
            >
              <Avatar
                src={profile.avatar_url || undefined}
                sx={{ width: 96, height: 96, bgcolor: "primary.main", fontSize: 32 }}
              >
                {getInitials(profile.full_name)}
              </Avatar>
              <Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarUpload}
                />
                <Button
                  variant="outlined"
                  startIcon={
                    avatarLoading ? (
                      <CircularProgress size={18} />
                    ) : (
                      <PhotoCameraIcon />
                    )
                  }
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarLoading}
                >
                  {avatarLoading ? "Uploading..." : "Upload Avatar"}
                </Button>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mt: 1 }}
                >
                  JPG, PNG or GIF. Max 2MB.
                </Typography>
              </Box>
            </Box>
            {avatarError && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {avatarError}
              </Alert>
            )}
            {avatarSuccess && (
              <Alert severity="success" sx={{ mb: 1 }}>
                {avatarSuccess}
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Account Info
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Full Name
                </Typography>
                <Typography>{profile.full_name || "—"}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography>{profile.email || "—"}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Role
                </Typography>
                <Typography sx={{ textTransform: "capitalize" }}>
                  {profile.role.replace("_", " ")}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Team
                </Typography>
                <Typography>{profile.team || "—"}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Update your password. You will stay signed in.
            </Typography>

            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}
            {passwordSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {passwordSuccess}
              </Alert>
            )}

            <form onSubmit={handlePasswordChange}>
              <TextField
                label="Current Password"
                type="password"
                value={passwordForm.current}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, current: e.target.value })
                }
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirm}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirm: e.target.value })
                }
                fullWidth
                required
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
