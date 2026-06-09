import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { normalizeTeamLabel } from "@/lib/constants";
import type { CallLog } from "@/lib/types";

export default function CallHistoryTable({ callLogs }: { callLogs: CallLog[] }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Call Log History
        </Typography>
        {callLogs.length === 0 ? (
          <Typography color="text.secondary">No calls logged yet.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Attempt</TableCell>
                <TableCell>Result</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Agent</TableCell>
                <TableCell>3-Way</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {callLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>#{log.attempt_number}</TableCell>
                  <TableCell>{log.call_result}</TableCell>
                  <TableCell>{normalizeTeamLabel(log.team)}</TableCell>
                  <TableCell>{log.profiles?.full_name || "—"}</TableCell>
                  <TableCell>
                    {log.is_three_way ? (
                      <Chip
                        label={log.senior_assisted?.full_name || "Senior"}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{log.notes || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
