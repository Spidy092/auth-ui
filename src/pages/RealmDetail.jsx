
// admin-ui/src/pages/RealmDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Breadcrumbs, 
  Link, 
  Typography, 
  Tabs, 
  Tab, 
  Paper,
  CircularProgress,
  Alert,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  People as UsersIcon,
  Apps as ClientsIcon,
  Security as RolesIcon,
  Lock as AuthIcon,
  Email as EmailIcon,
  Key as KeysIcon,
  Event as EventsIcon,
  AccessTime as TokensIcon,
  Shield as SecurityIcon,
  Language as LocalizationIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

// Import tab components
import GeneralSettings from '../components/realm/GeneralSettings';
import RealmUsers from '../components/realm/RealmUsers';
import RealmClients from '../components/realm/RealmClients';
import RealmRoles from '../components/realm/RealmRoles';
import AuthenticationSettings from '../components/realm/AuthenticationSettings';
import EmailSettings from '../components/realm/EmailSettings';
import SecuritySettings from '../components/realm/SecuritySettings';
import TokenSettings from '../components/realm/TokenSettings';

const drawerWidth = 280;

const sidebarItems = [
  { id: 'general', label: 'General', icon: SettingsIcon, component: GeneralSettings },
  { id: 'users', label: 'Users', icon: UsersIcon, component: RealmUsers },
  { id: 'clients', label: 'Clients', icon: ClientsIcon, component: RealmClients },
  { id: 'roles', label: 'Roles', icon: RolesIcon, component: RealmRoles },
  { id: 'authentication', label: 'Authentication', icon: AuthIcon, component: AuthenticationSettings },
  { id: 'email', label: 'Email', icon: EmailIcon, component: EmailSettings },
  { id: 'security', label: 'Security', icon: SecurityIcon, component: SecuritySettings },
  { id: 'tokens', label: 'Tokens', icon: TokensIcon, component: TokenSettings },
];

function RealmDetail() {
  const { realmName } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('general');

  // Fetch realm details
  const { data: realm, isLoading, error } = useQuery({
    queryKey: ['realm', realmName],
    queryFn: () => api.get(`/realms/${realmName}`).then(res => res.data),
    enabled: !!realmName,
  });

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };

  const handleBackToRealms = () => {
    navigate('/realms');
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load realm details: {error.message}
        </Alert>
      </Box>
    );
  }

  const ActiveComponent = sidebarItems.find(item => item.id === activeSection)?.component || GeneralSettings;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToRealms}
            sx={{ mb: 2 }}
          >
            Back to Realms
          </Button>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            {realm?.displayName || realmName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Realm Management
          </Typography>
        </Box>
        <Divider />
        <List>
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <ListItemButton
                key={item.id}
                selected={activeSection === item.id}
                onClick={() => handleSectionChange(item.id)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <IconComponent />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5' }}>
        {/* Breadcrumb */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link 
            color="inherit" 
            href="/realms" 
            onClick={(e) => { e.preventDefault(); navigate('/realms'); }}
            sx={{ cursor: 'pointer' }}
          >
            Realms
          </Link>
          <Typography color="text.primary">{realm?.displayName || realmName}</Typography>
          <Typography color="text.primary">
            {sidebarItems.find(item => item.id === activeSection)?.label}
          </Typography>
        </Breadcrumbs>

        {/* Content */}
        <Paper sx={{ p: 3, backgroundColor: 'white' }}>
          <ActiveComponent realm={realm} realmName={realmName} />
        </Paper>
      </Box>
    </Box>
  );
}

export default RealmDetail;
