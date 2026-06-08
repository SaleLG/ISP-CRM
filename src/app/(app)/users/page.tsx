import { Typography } from "@mui/material";
import UserManager from "@/components/users/UserManager";
import { getUsers } from "@/actions/users";
import { requireRole } from "@/lib/auth";

export default async function UsersPage() {
  await requireRole(["admin"]);
  const users = await getUsers();

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Users
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage user profiles and roles. Team is assigned automatically from role.
      </Typography>
      <UserManager users={users} />
    </>
  );
}
