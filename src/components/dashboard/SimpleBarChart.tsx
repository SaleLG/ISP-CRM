"use client";

import { Box, Typography, Paper } from "@mui/material";

interface Props {
  title: string;
  data: { label: string; count: number }[];
  color?: string;
}

export default function SimpleBarChart({ title, data, color = "#1976d2" }: Props) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <Paper sx={{ p: 2, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {data.length === 0 ? (
        <Typography color="text.secondary">No data</Typography>
      ) : (
        data.map((item) => (
          <Box key={item.label} sx={{ mb: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="body2">{item.label}</Typography>
              <Typography variant="body2" fontWeight={600}>
                {item.count}
              </Typography>
            </Box>
            <Box
              sx={{
                height: 8,
                bgcolor: "#e0e0e0",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${(item.count / max) * 100}%`,
                  bgcolor: color,
                  borderRadius: 1,
                  transition: "width 0.3s",
                }}
              />
            </Box>
          </Box>
        ))
      )}
    </Paper>
  );
}
