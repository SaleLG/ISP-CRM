import { Typography } from "@mui/material";
import ISPManager from "@/components/isps/ISPManager";
import { getISPs } from "@/actions/isps";
import { requireRole } from "@/lib/auth";

export default async function ISPsPage() {
  await requireRole(["admin", "manager"]);
  const isps = await getISPs();

  return (
    <>
      <Typography variant="h4" gutterBottom>
        ISPs
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage Internet Service Provider records.
      </Typography>
      <ISPManager isps={isps} />
    </>
  );
}
