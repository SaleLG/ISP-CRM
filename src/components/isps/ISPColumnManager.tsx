"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  FormControlLabel,
  Checkbox,
  Typography,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {
  createISPColumn,
  updateISPColumn,
  deleteISPColumn,
  reorderISPColumns,
  getISPColumns,
} from "@/actions/ispColumns";
import type { ISPColumn } from "@/lib/types";

function sortColumns(cols: ISPColumn[]) {
  return [...cols].sort((a, b) => a.sort_order - b.sort_order);
}

interface Props {
  ispId: string;
  ispName: string;
  columns: ISPColumn[];
  onChange: (columns: ISPColumn[]) => void;
}

export default function ISPColumnManager({
  ispId,
  ispName,
  columns: initialColumns,
  onChange,
}: Props) {
  const [columns, setColumns] = useState(() => sortColumns(initialColumns));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ISPColumn | null>(null);
  const [label, setLabel] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [usedForMatching, setUsedForMatching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setColumns(sortColumns(initialColumns));
  }, [initialColumns]);

  const refreshColumns = async () => {
    const refreshed = sortColumns(await getISPColumns(ispId));
    setColumns(refreshed);
    onChange(refreshed);
    return refreshed;
  };

  useEffect(() => {
    if (!dialogOpen) return;
    const timer = window.setTimeout(() => labelInputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [dialogOpen]);

  const resetCreateForm = (columnCount: number) => {
    setEditing(null);
    setLabel("");
    setIsPrimary(columnCount === 0);
    setUsedForMatching(false);
    window.setTimeout(() => labelInputRef.current?.focus(), 50);
  };

  const openCreate = () => {
    setEditing(null);
    setLabel("");
    setIsPrimary(columns.length === 0);
    setUsedForMatching(false);
    setDialogOpen(true);
  };

  const openEdit = (column: ISPColumn) => {
    setEditing(column);
    setLabel(column.label);
    setIsPrimary(column.is_primary);
    setUsedForMatching(column.used_for_matching);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!label.trim()) return;
    setLoading(true);
    try {
      if (editing) {
        await updateISPColumn(editing.id, {
          label,
          is_primary: isPrimary,
          used_for_matching: usedForMatching,
        });
        await refreshColumns();
        setDialogOpen(false);
      } else {
        await createISPColumn({
          ispId,
          label,
          is_primary: isPrimary,
          used_for_matching: usedForMatching,
        });
        const refreshed = await refreshColumns();
        resetCreateForm(refreshed.length);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save column");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Remove this column from the CRM table? Existing customer data for this field is kept in records."
      )
    )
      return;
    try {
      const result = await deleteISPColumn(id);
      const refreshed = sortColumns(result.columns ?? (await getISPColumns(ispId)));
      setColumns(refreshed);
      onChange(refreshed);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete column");
    }
  };

  const moveColumn = async (columnId: string, direction: -1 | 1) => {
    const sorted = sortColumns(columns);
    const index = sorted.findIndex((c) => c.id === columnId);
    if (index < 0) return;

    const column = sorted[index];
    if (column.is_primary) return;

    const target = index + direction;
    if (target <= 0 || target >= sorted.length) return;

    const reordered = [...sorted];
    const [item] = reordered.splice(index, 1);
    reordered.splice(target, 0, item);

    setMovingId(column.id);
    try {
      const normalized = await reorderISPColumns(
        ispId,
        reordered.map((c) => c.id)
      );
      const refreshed = sortColumns(normalized);
      setColumns(refreshed);
      onChange(refreshed);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reorder columns");
      await refreshColumns();
    } finally {
      setMovingId(null);
    }
  };

  const sortedColumns = sortColumns(columns);

  const firstMatchIndex = sortedColumns.findIndex(
    (c) => c.used_for_matching && !c.is_primary
  );
  const lastMatchIndex =
    firstMatchIndex === -1
      ? -1
      : sortedColumns.reduce(
          (last, c, i) =>
            c.used_for_matching && !c.is_primary ? i : last,
          firstMatchIndex
        );

  const canMoveUp = (column: ISPColumn, index: number) => {
    if (movingId !== null || column.is_primary || index === 0) return false;
    if (column.used_for_matching && !column.is_primary) {
      return index > firstMatchIndex;
    }
    if (firstMatchIndex >= 0 && index <= lastMatchIndex) return false;
    return true;
  };

  const canMoveDown = (column: ISPColumn, index: number) => {
    if (movingId !== null || column.is_primary || index === sortedColumns.length - 1) {
      return false;
    }
    if (column.used_for_matching && !column.is_primary) {
      return index < lastMatchIndex;
    }
    const next = sortedColumns[index + 1];
    if (next?.used_for_matching && !next.is_primary) return false;
    return true;
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Define the columns for <strong>{ispName}</strong>&apos;s CRM table. Add,
        edit, or remove columns to match this ISP&apos;s spreadsheet layout.
      </Typography>

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={openCreate}
        sx={{ mb: 2 }}
      >
        Add Column
      </Button>

      {columns.length === 0 ? (
        <Typography color="text.secondary">
          No columns yet. Add columns before importing customers for this ISP.
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Column Name</TableCell>
              <TableCell>Key</TableCell>
              <TableCell>Flags</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedColumns.map((column, index) => (
              <TableRow key={column.id}>
                <TableCell>{column.label}</TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {column.column_key}
                  </Typography>
                </TableCell>
                <TableCell>
                  {column.is_primary && (
                    <Chip
                      label="Primary"
                      size="small"
                      color="primary"
                      sx={{ mr: 0.5 }}
                    />
                  )}
                  {column.used_for_matching && (
                    <Chip label="Match key" size="small" variant="outlined" />
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    disabled={!canMoveUp(column, index)}
                    onClick={() => moveColumn(column.id, -1)}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={!canMoveDown(column, index)}
                    onClick={() => moveColumn(column.id, 1)}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => openEdit(column)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(column.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editing ? "Edit Column" : "Add Column"}</DialogTitle>
        <DialogContent>
          <TextField
            inputRef={labelInputRef}
            autoFocus
            label="Column Name"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            fullWidth
            sx={{ mt: 1, mb: 2 }}
            placeholder="e.g. ACCT#, Install Date"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
              />
            }
            label="Primary column (customer name in tables)"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={usedForMatching}
                onChange={(e) => setUsedForMatching(e.target.checked)}
              />
            }
            label="Use for duplicate matching on import"
          />
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
