"use client";

import { useState } from "react";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import {
  Box,
  Button,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import ClientNavLink from "@/components/common/ClientNavLink";
import { updateAlert } from "@/actions/customers";

interface AlertRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  alert_type: string;
  alert_status: string;
  price_approval_status: string;
  assigned_team: string;
  workflow_stage: string;
  isps?: { name: string } | null;
}

export default function AlertsTable({ alerts }: { alerts: AlertRow[] }) {
  const [approveDialog, setApproveDialog] = useState<{
    id: string;
    name: string;
    action: "approve" | "deny";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAlertStatus = async (id: string, status: string) => {
    setLoading(true);
    try {
      await updateAlert(id, status);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceApproval = async (
    id: string,
    action: "approve" | "deny"
  ) => {
    setLoading(true);
    try {
      await updateAlert(
        id,
        action === "approve" ? "Resolved" : "Resolved",
        action === "approve" ? "Approved" : "Denied"
      );
      setApproveDialog(null);
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "full_name",
      headerName: "Customer",
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <ClientNavLink href={`/customers/${params.row.id}`}>
          {params.value || "—"}
        </ClientNavLink>
      ),
    },
    { field: "phone", headerName: "Phone", width: 130 },
    {
      field: "isp",
      headerName: "ISP",
      width: 120,
      valueGetter: (_v, row) => row.isps?.name || "—",
    },
    {
      field: "alert_type",
      headerName: "Alert Type",
      width: 200,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color="error" />
      ),
    },
    {
      field: "alert_status",
      headerName: "Alert Status",
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === "Needs Email" ? "warning" : "default"}
        />
      ),
    },
    {
      field: "price_approval_status",
      headerName: "Price Approval",
      width: 140,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 400,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          {params.row.alert_status === "Needs Email" && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleAlertStatus(params.row.id, "Email Sent")}
              disabled={loading}
            >
              Email Sent
            </Button>
          )}
          {params.row.alert_status !== "In Review" &&
            params.row.alert_status !== "Resolved" && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleAlertStatus(params.row.id, "In Review")}
                disabled={loading}
              >
                In Review
              </Button>
            )}
          {params.row.alert_status !== "Resolved" && (
            <Button
              size="small"
              variant="outlined"
              color="success"
              onClick={() => handleAlertStatus(params.row.id, "Resolved")}
              disabled={loading}
            >
              Resolved
            </Button>
          )}
          {params.row.alert_type === "Price Approval Needed" &&
            params.row.price_approval_status === "Pending" && (
              <>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() =>
                    setApproveDialog({
                      id: params.row.id,
                      name: params.row.full_name || "Customer",
                      action: "approve",
                    })
                  }
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() =>
                    setApproveDialog({
                      id: params.row.id,
                      name: params.row.full_name || "Customer",
                      action: "deny",
                    })
                  }
                >
                  Deny
                </Button>
              </>
            )}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <DataGrid
        rows={alerts}
        columns={columns}
        pageSizeOptions={[25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        disableRowSelectionOnClick
        autoHeight
        sx={{ bgcolor: "background.paper", border: "none" }}
      />

      <Dialog
        open={!!approveDialog}
        onClose={() => setApproveDialog(null)}
      >
        <DialogTitle>
          {approveDialog?.action === "approve" ? "Approve" : "Deny"} Price
          Request
        </DialogTitle>
        <DialogContent>
          <Typography>
            {approveDialog?.action === "approve" ? "Approve" : "Deny"} the
            better-price request for{" "}
            <strong>{approveDialog?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={approveDialog?.action === "approve" ? "success" : "error"}
            onClick={() =>
              approveDialog &&
              handlePriceApproval(approveDialog.id, approveDialog.action)
            }
            disabled={loading}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
