
// admin-ui/src/pages/Realms.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  Apps as AppsIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api.js';

function Realms() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const [formData, setFormData] = useState({ realm_name: '', display_name: '' });
  const [togglingRealm, setTogglingRealm] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  // Fetch realms
  const { data: realms = [], isLoading } = useQuery({
    queryKey: ['realms'],
    queryFn: () => api.get('/realms').then((res) => res.data),
  });

  // Create realm mutation
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/realms', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['realms']);
      setFormData({ realm_name: '', display_name: '' });
      setOpenCreate(false);
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message;
      alert(`Failed to create realm: ${msg}`);
    },
  });

  // Toggle realm enabled/disabled
  const toggleEnabledMutation = useMutation({
    mutationFn: async ({ realm_name, currentEnabled }) => {
      setTogglingRealm(realm_name);
      await api.patch(`/realms/${realm_name}/enabled`, { enabled: !currentEnabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['realms']);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err.message;
      alert(`Failed to toggle realm: ${msg}`);
    },
    onSettled: () => {
      setTogglingRealm(null);
    },
  });

  const handleCreateRealm = () => {
    if (!formData.realm_name || !formData.display_name) {
      alert('Please fill in all fields');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleNavigateToRealm = (realmName) => {
    navigate(`/realms/${realmName}`);
  };

  const renderRealmCard = (realm) => (
    <Grid item xs={12} sm={6} md={4} key={realm.realm_name}>
      <Card 
        sx={{ 
          height: '100%', 
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3,
          }
        }}
        onClick={() => handleNavigateToRealm(realm.realm_name)}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" component="h2" noWrap>
              {realm.display_name}
            </Typography>
            <Chip 
              label={realm.enabled ? 'Active' : 'Disabled'} 
              color={realm.enabled ? 'success' : 'default'}
              size="small"
            />
          </Box>

          <Typography color="text.secondary" gutterBottom>
            {realm.realm_name}
          </Typography>

          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <PeopleIcon fontSize="small" color="action" />
              <Typography variant="caption">Users</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <AppsIcon fontSize="small" color="action" />
              <Typography variant="caption">Clients</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <SecurityIcon fontSize="small" color="action" />
              <Typography variant="caption">Roles</Typography>
            </Box>
          </Box>
        </CardContent>

        <CardActions>
          <Button 
            size="small" 
            startIcon={<SettingsIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleNavigateToRealm(realm.realm_name);
            }}
          >
            Manage
          </Button>
          <FormControlLabel
            control={
              <Switch
                checked={realm.enabled}
                disabled={togglingRealm === realm.realm_name}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleEnabledMutation.mutate({
                    realm_name: realm.realm_name,
                    currentEnabled: realm.enabled,
                  });
                }}
                size="small"
              />
            }
            label="Enabled"
            onClick={(e) => e.stopPropagation()}
          />
        </CardActions>
      </Card>
    </Grid>
  );

  const renderRealmTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Display Name</TableCell>
            <TableCell>Realm Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {realms.map((realm) => (
            <TableRow 
              key={realm.realm_name}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavigateToRealm(realm.realm_name)}
            >
              <TableCell>
                <Typography variant="subtitle2">
                  {realm.display_name}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {realm.realm_name}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={realm.enabled ? 'Active' : 'Disabled'} 
                  color={realm.enabled ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box display="flex" gap={1}>
                  <Tooltip title="Manage Realm">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToRealm(realm.realm_name);
                      }}
                    >
                      <SettingsIcon />
                    </IconButton>
                  </Tooltip>
                  <Switch
                    checked={realm.enabled}
                    disabled={togglingRealm === realm.realm_name}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleEnabledMutation.mutate({
                        realm_name: realm.realm_name,
                        currentEnabled: realm.enabled,
                      });
                    }}
                    size="small"
                  />
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Realm Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreate(true)}
        >
          Create Realm
        </Button>
      </Box>

      {/* View Toggle */}
      <Box mb={3}>
        <Button
          variant={viewMode === 'table' ? 'contained' : 'outlined'}
          onClick={() => setViewMode('table')}
          sx={{ mr: 1 }}
        >
          Table View
        </Button>
        <Button
          variant={viewMode === 'cards' ? 'contained' : 'outlined'}
          onClick={() => setViewMode('cards')}
        >
          Card View
        </Button>
      </Box>

      {/* Content */}
      {viewMode === 'cards' ? (
        <Grid container spacing={3}>
          {realms.map(renderRealmCard)}
        </Grid>
      ) : (
        renderRealmTable()
      )}

      {/* Create Realm Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Realm</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Realm Name"
            fullWidth
            variant="outlined"
            value={formData.realm_name}
            onChange={(e) => setFormData({ ...formData, realm_name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Display Name"
            fullWidth
            variant="outlined"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateRealm} 
            variant="contained"
            disabled={createMutation.isLoading}
          >
            {createMutation.isLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Realms;
