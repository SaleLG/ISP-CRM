import { Box, Skeleton } from "@mui/material";

export default function Loading() {
  return (
    <Box>
      <Skeleton variant="text" width={240} height={48} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={360} height={28} sx={{ mb: 3 }} />
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 3 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={100} />
        ))}
      </Box>
      <Skeleton variant="rounded" height={320} />
    </Box>
  );
}
