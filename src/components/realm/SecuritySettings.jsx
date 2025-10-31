import { Box, Typography } from '@mui/material';

function SecuritySettings({ realmName }) {
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Security Settings for {realmName}
      </Typography>
      <Typography color="text.secondary">
        Advanced security configurations will be implemented here.
      </Typography>
    </Box>
  );
}

export default SecuritySettings;