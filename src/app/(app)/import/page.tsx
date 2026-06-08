import { Typography } from "@mui/material";
import ImportWizard from "@/components/import/ImportWizard";
import { getISPs } from "@/actions/isps";
import { requireRole } from "@/lib/auth";

export default async function ImportPage() {
  await requireRole(["admin", "manager"]);
  const isps = await getISPs();

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Import Customers
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Upload an ISP Excel/CSV file to import or update customer records.
      </Typography>
      <ImportWizard isps={isps} />
    </>
  );
}
