import { Card, CardContent, Button, Typography } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { auth } from '../services/auth.js';

function Login() {
  const isAuthenticated = !!auth.getToken();

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Card sx={{ width: 400 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Admin Login
          </Typography>
          <Button variant="contained" fullWidth onClick={auth.login}>
            Login with Keycloak
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;