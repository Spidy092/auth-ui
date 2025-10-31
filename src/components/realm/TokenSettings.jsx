import { Box, Typography } from '@mui/material';

function TokenSettings({ realmName }) {
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Token Settings for {realmName}
      </Typography>
      <Typography color="text.secondary">
        Token configuration and lifespans will be implemented here.
      </Typography>
    </Box>
  );
}

export default TokenSettings;
