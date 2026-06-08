import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

interface Note {
  id: string;
  note: string;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

export default function NotesSection({
  notes,
}: {
  customerId: string;
  notes: Note[];
}) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Notes
        </Typography>
        {notes.length === 0 ? (
          <Typography color="text.secondary">No notes yet.</Typography>
        ) : (
          <List disablePadding>
            {notes.map((n, i) => (
              <div key={n.id}>
                {i > 0 && <Divider />}
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary={n.note}
                    secondary={`${n.profiles?.full_name || "Unknown"} — ${new Date(n.created_at).toLocaleString()}`}
                  />
                </ListItem>
              </div>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
