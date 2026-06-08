"use client";

import { Card, CardContent, Typography, Box } from "@mui/material";

interface Props {
  title: string;
  value: number;
  color?: string;
  icon?: React.ReactNode;
}

export default function StatCard({ title, value, color = "#1976d2", icon }: Props) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          {icon && <Box sx={{ color }}>{icon}</Box>}
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ color, fontWeight: 700 }}>
          {value.toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
}
