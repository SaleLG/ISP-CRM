import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

interface Activity {
  id: string;
  activity_type: string | null;
  description: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

export default function ActivityTimeline({
  activities,
}: {
  activities: Activity[];
}) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Activity Timeline
        </Typography>
        {activities.length === 0 ? (
          <Typography color="text.secondary">No activity yet.</Typography>
        ) : (
          <List disablePadding>
            {activities.map((a, i) => (
              <div key={a.id}>
                {i > 0 && <Divider />}
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary={a.description || a.activity_type}
                    secondary={`${a.profiles?.full_name || "System"} — ${new Date(a.created_at).toLocaleString()}${a.old_value ? ` (${a.old_value} → ${a.new_value})` : ""}`}
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
