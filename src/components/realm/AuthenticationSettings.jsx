import { Box, Typography } from '@mui/material';

function AuthenticationSettings({ realmName }) {
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Authentication Settings for {realmName}
      </Typography>
      <Typography color="text.secondary">
        Authentication flows and configurations will be implemented here.
      </Typography>
    </Box>
  );
}

export default AuthenticationSettings;