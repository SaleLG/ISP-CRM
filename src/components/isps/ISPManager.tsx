"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { createISP, updateISP, deleteISP } from "@/actions/isps";

interface ISP {
  id: string;
  name: string;
  status: string;
}

export default function ISPManager({ isps: initial }: { isps: ISP[] }) {
  const [isps, setIsps] = useState(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ISP | null>(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active");
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setStatus("Active");
    setDialogOpen(true);
  };

  const openEdit = (isp: ISP) => {
    setEditing(isp);
    setName(isp.name);
    setStatus(isp.status);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (editing) {
        const updated = await updateISP(editing.id, { name, status });
        setIsps((prev) =>
          prev.map((i) => (i.id === editing.id ? { ...i, ...updated } : i))
        );
      } else {
        const created = await createISP(name);
        setIsps((prev) => [...prev, created]);
      }
      setDialogOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ISP?")) return;
    try {
      await deleteISP(id);
      setIsps((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={openCreate}
        sx={{ mb: 2 }}
      >
        Add ISP
      </Button>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isps.map((isp) => (
              <TableRow key={isp.id}>
                <TableCell>{isp.name}</TableCell>
                <TableCell>{isp.status}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(isp)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(isp.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{editing ? "Edit ISP" : "Add ISP"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            sx={{ mt: 1, mb: 2 }}
          />
          {editing && (
            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
