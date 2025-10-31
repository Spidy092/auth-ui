// admin-ui/src/components/Layout.jsx
import { Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { auth } from '@spidy092/auth-client';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  ListItemIcon,
  Collapse,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as UsersIcon,
  Apps as ClientsIcon,
  Domain as RealmsIcon,
  History as AuditIcon,
  Security as RolesIcon,
  Assignment as RequestsIcon,
  Business as OrganizationIcon,
  VpnKey as PermissionIcon,
  GroupWork as MembershipIcon,
  Person as AccountIcon,
  ExpandLess,
  ExpandMore,
  Storage as DatabaseIcon
} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';

const drawerWidth = 280;

export default function Layout() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [keycloakMenuOpen, setKeycloakMenuOpen] = useState(false);
  const [databaseMenuOpen, setDatabaseMenuOpen] = useState(false);

  const { data: user, isLoading, error: queryError } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await auth.api.get('/auth/me');
      return response.data;
    },
    onError: (err) => {
      console.error('Error fetching user:', err.message);
      if (err.response?.status === 401) {
        handleAuthError();
      } else {
        setError(`Failed to load user data: ${err.message}`);
      }
    },
    retry: (failureCount, error) => failureCount < 3 && error.response?.status !== 401,
    enabled: !!auth.getToken(),
  });

  const handleAuthError = () => {
    console.log('Authentication error, redirecting to login');
    auth.clearToken();
    navigate('/login');
  };

  const handleLogout = () => {
    console.log('Admin logout initiated');
    auth.logout();
  };

  useEffect(() => {
    const token = auth.getToken();
    if (!token || auth.isTokenExpired(token)) {
      handleAuthError();
    }
  }, []);

  const handleDismissError = () => setError(null);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
    },
    {
      text: 'Users',
      icon: <UsersIcon />,
      path: '/users',
    },
    {
      text: 'Account',
      icon: <AccountIcon />,
      path: '/account',
    }
  ];

  const keycloakItems = [
    {
      text: 'Realms',
      icon: <RealmsIcon />,
      path: '/realms',
    },
    {
      text: 'Clients',
      icon: <ClientsIcon />,
      path: '/clients',
    },
    {
      text: 'Client Requests',
      icon: <RequestsIcon />,
      path: '/client-requests',
    },
    {
      text: 'Audit Logs',
      icon: <AuditIcon />,
      path: '/audit-logs',
    }
  ];

  const databaseItems = [
    {
      text: 'Organizations',
      icon: <OrganizationIcon />,
      path: '/organizations',
    },
    {
      text: 'Database Roles',
      icon: <RolesIcon />,
      path: '/database-roles',
    },
    {
      text: 'Permissions',
      icon: <PermissionIcon />,
      path: '/permissions',
    },
    {
      text: 'Memberships',
      icon: <MembershipIcon />,
      path: '/memberships',
    },
    {
      text: 'Onboarding',
      icon: <MembershipIcon />,
      path: '/onboarding',
    }
  ];

  return (
    <div style={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          
          {user && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              Welcome, {user.email || user.username}
            </Typography>
          )}
          
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        
        {error && (
          <Alert 
            severity="error" 
            onClose={handleDismissError}
            sx={{ m: 1 }}
          >
            {error}
          </Alert>
        )}
        
        <List>
          {/* Main Menu Items */}
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}

          <Divider sx={{ my: 1 }} />

          {/* Keycloak Management Section */}
          <ListItem 
            button 
            onClick={() => setKeycloakMenuOpen(!keycloakMenuOpen)}
          >
            <ListItemIcon>
              <RealmsIcon />
            </ListItemIcon>
            <ListItemText primary="Keycloak Management" />
            {keycloakMenuOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          
          <Collapse in={keycloakMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {keycloakItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  sx={{ 
                    pl: 4,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Collapse>

          <Divider sx={{ my: 1 }} />

          {/* Database Management Section */}
          <ListItem 
            button 
            onClick={() => setDatabaseMenuOpen(!databaseMenuOpen)}
          >
            <ListItemIcon>
              <DatabaseIcon />
            </ListItemIcon>
            <ListItemText primary="Database Management" />
            {databaseMenuOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          
          <Collapse in={databaseMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {databaseItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  sx={{ 
                    pl: 4,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>
      </Drawer>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: 0 }}>
        <Toolbar />
        <Outlet />
      </main>
    </div>
  );
}