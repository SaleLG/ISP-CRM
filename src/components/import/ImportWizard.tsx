"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Step,
  StepLabel,
  Stepper,
  TextField,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
  Stack,
  Chip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { CRM_FIELDS } from "@/lib/constants";
import { buildPreview } from "@/lib/import";
import { previewImport, confirmImport } from "@/actions/import";

interface ISP {
  id: string;
  name: string;
}

interface Props {
  isps: ISP[];
}

const STEPS = ["Upload File", "Map Columns", "Preview & Confirm", "Summary"];

export default function ImportWizard({ isps }: Props) {
  const [step, setStep] = useState(0);
  const [ispId, setIspId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [previewRows, setPreviewRows] = useState<
    { rowNumber: number; mapped: Record<string, string | null> }[]
  >([]);
  const [allRows, setAllRows] = useState<Record<string, string | null>[]>([]);
  const [fileName, setFileName] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [summary, setSummary] = useState<{
    total_rows: number;
    new_customers: number;
    updated_customers: number;
    skipped_rows: number;
    error_rows: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mappedFields = CRM_FIELDS.filter((f) =>
    Object.values(columnMapping).includes(f.key)
  );

  const handleFileUpload = async () => {
    if (!file || !ispId) {
      setError("Please select an ISP and upload a file");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await previewImport(formData);
      setHeaders(result.headers);
      setColumnMapping(result.autoMapping);
      setAllRows(result.rows);
      setPreviewRows(result.previewRows);
      setTotalRows(result.totalRows);
      setFileName(result.fileName);
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (header: string, crmField: string) => {
    setColumnMapping((prev) => {
      const next = { ...prev };
      if (crmField) {
        next[header] = crmField;
      } else {
        delete next[header];
      }
      return next;
    });
  };

  const handleGoToPreview = () => {
    setPreviewRows(buildPreview(allRows, columnMapping, 20));
    setStep(2);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await confirmImport({
        ispId,
        fileName,
        columnMapping,
        rows: allRows,
      });
      setSummary(result);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setFile(null);
    setHeaders([]);
    setColumnMapping({});
    setPreviewRows([]);
    setAllRows([]);
    setSummary(null);
    setError("");
  };

  return (
    <Box>
      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {step === 0 && (
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <TextField
                select
                label="Select ISP"
                value={ispId}
                onChange={(e) => setIspId(e.target.value)}
                fullWidth
                required
              >
                {isps.map((isp) => (
                  <MenuItem key={isp.id} value={isp.id}>
                    {isp.name}
                  </MenuItem>
                ))}
              </TextField>

              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                >
                  Choose Excel/CSV File
                  <input
                    type="file"
                    hidden
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </Button>
                {file && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected: {file.name}
                  </Typography>
                )}
              </Box>

              <Button
                variant="contained"
                onClick={handleFileUpload}
                disabled={loading || !file || !ispId}
              >
                {loading ? "Parsing..." : "Upload & Continue"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Column Mapping ({totalRows} rows detected)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Map spreadsheet columns to CRM fields. Known columns are auto-mapped
              (case-insensitive). Adjust any that were missed.
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Spreadsheet Column</TableCell>
                  <TableCell>CRM Field</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {headers.map((header) => (
                  <TableRow key={header}>
                    <TableCell>{header}</TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={columnMapping[header] || ""}
                        onChange={(e) =>
                          handleMappingChange(header, e.target.value)
                        }
                        sx={{ minWidth: 200 }}
                      >
                        <MenuItem value="">— Skip —</MenuItem>
                        {CRM_FIELDS.map((f) => (
                          <MenuItem key={f.key} value={f.key}>
                            {f.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button onClick={() => setStep(0)}>Back</Button>
              <Button variant="contained" onClick={handleGoToPreview}>
                Preview
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Preview (first 20 rows)
            </Typography>
            {mappedFields.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No columns mapped. Go back and map at least one spreadsheet column.
              </Alert>
            )}
            <Box sx={{ overflowX: "auto", mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    {mappedFields.map((f) => (
                      <TableCell key={f.key}>{f.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewRows.map((row) => (
                    <TableRow key={row.rowNumber}>
                      <TableCell>{row.rowNumber}</TableCell>
                      {mappedFields.map((f) => (
                        <TableCell key={f.key}>
                          {row.mapped[f.key] || "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button onClick={() => setStep(1)}>Back</Button>
              <Button
                variant="contained"
                onClick={handleConfirm}
                disabled={loading || mappedFields.length === 0}
              >
                {loading ? "Importing..." : `Confirm Import (${totalRows} rows)`}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {step === 3 && summary && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Import Complete
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
              <Chip label={`Total Rows: ${summary.total_rows}`} />
              <Chip label={`New: ${summary.new_customers}`} color="success" />
              <Chip label={`Updated: ${summary.updated_customers}`} color="info" />
              <Chip label={`Skipped: ${summary.skipped_rows}`} />
              <Chip
                label={`Errors: ${summary.error_rows}`}
                color={summary.error_rows > 0 ? "error" : "default"}
              />
            </Stack>
            <Button variant="contained" onClick={handleReset}>
              Import Another File
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
