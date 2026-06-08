import { Typography } from "@mui/material";
import ProfileSettings from "@/components/profile/ProfileSettings";
import { getMyProfile } from "@/actions/profile";

export default async function ProfilePage() {
  const profile = await getMyProfile();

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your avatar and password.
      </Typography>
      <ProfileSettings profile={profile} />
    </>
  );
}
