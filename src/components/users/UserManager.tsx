"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Paper,
  Chip,
  Switch,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { updateUser, createUser, approveUser } from "@/actions/users";
import { ROLES, teamFromRole } from "@/lib/constants";

interface User {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  team: string | null;
  is_active: boolean;
  created_at: string;
}

export default function UserManager({ users: initial }: { users: User[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initial);
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "junior_sales",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUsers(initial);
  }, [initial]);

  const pendingUsers = users.filter((u) => !u.is_active);
  const activeUsers = users.filter((u) => u.is_active);
  const displayedUsers = tab === 0 ? pendingUsers : activeUsers;

  const handleApprove = async (user: User) => {
    setLoading(true);
    try {
      const updated = await approveUser(user.id);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ...updated } : u))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve user");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    const updated = await updateUser(user.id, { is_active: !user.is_active });
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, ...updated } : u))
    );
  };

  const handleRoleChange = async (user: User, role: string) => {
    const updated = await updateUser(user.id, { role });
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, ...updated } : u))
    );
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const created = await createUser(form);
      setUsers((prev) =>
        [...prev, created].sort((a, b) =>
          (a.full_name ?? "").localeCompare(b.full_name ?? "")
        )
      );
      setTab(1);
      setDialogOpen(false);
      setForm({
        email: "",
        password: "",
        full_name: "",
        role: "junior_sales",
      });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                Pending Approval
                {pendingUsers.length > 0 && (
                  <Chip
                    label={pendingUsers.length}
                    size="small"
                    color="warning"
                  />
                )}
              </Box>
            }
          />
          <Tab label={`Active Users (${activeUsers.length})`} />
        </Tabs>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add User
        </Button>
      </Box>

      {tab === 0 && pendingUsers.length === 0 && (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">
            No users waiting for approval.
          </Typography>
        </Paper>
      )}

      {(tab === 1 || pendingUsers.length > 0) && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedUsers.map((user) => (
                <TableRow
                  key={user.id}
                  sx={{
                    bgcolor: !user.is_active ? "warning.50" : undefined,
                  }}
                >
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      sx={{ minWidth: 140 }}
                    >
                      {ROLES.map((r) => (
                        <MenuItem key={r} value={r}>
                          {r.replace("_", " ")}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.team ?? teamFromRole(user.role) ?? "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_active ? "Active" : "Pending"}
                      size="small"
                      color={user.is_active ? "success" : "warning"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {!user.is_active ? (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleApprove(user)}
                        disabled={loading}
                      >
                        Approve
                      </Button>
                    ) : (
                      <Box sx={{ display: "inline-flex", alignItems: "center" }}>
                        <Switch
                          checked={user.is_active}
                          onChange={() => handleToggleActive(user)}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          Deactivate
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Admin-created users are approved immediately.
          </Typography>
          <TextField
            label="Full Name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            fullWidth
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            fullWidth
            helperText={
              teamFromRole(form.role)
                ? `Team: ${teamFromRole(form.role)} (set automatically from role)`
                : "No team for this role"
            }
          >
            {ROLES.map((r) => (
              <MenuItem key={r} value={r}>
                {r.replace("_", " ")}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={loading}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
