// admin-ui/src/components/realm/EmailSettings.jsx
import { Box, Typography } from '@mui/material';

function EmailSettings({ realmName }) {
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Email Settings for {realmName}
      </Typography>
      <Typography color="text.secondary">
        Email templates and themes configuration will be implemented here.
      </Typography>
    </Box>
  );
}

export default EmailSettings;