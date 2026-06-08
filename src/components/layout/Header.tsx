"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { signOut } from "@/actions/auth";
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

export default function Header({
  profile,
  onNavigate,
}: {
  profile: Profile;
  onNavigate: (href: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        minHeight: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        px: 3,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        position: "sticky",
        top: 0,
        zIndex: 1100,
        flexShrink: 0,
      }}
    >
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          cursor: "pointer",
          borderRadius: 2,
          px: 1.5,
          py: 0.75,
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
          <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
            {profile.full_name || "User"}
          </Typography>
          <Typography variant="caption" color="text.secondary" lineHeight={1.3}>
            {profile.role.replace("_", " ")}
            {profile.team ? ` · ${profile.team}` : ""}
          </Typography>
        </Box>
        <Avatar
          src={profile.avatar_url || undefined}
          sx={{ width: 40, height: 40, bgcolor: "primary.main" }}
        >
          {getInitials(profile.full_name)}
        </Avatar>
        <KeyboardArrowDownIcon fontSize="small" color="action" />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: { sx: { minWidth: 220, mt: 1 } },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {profile.full_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {profile.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onNavigate("/profile");
          }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => signOut()}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </Box>
  );
}
