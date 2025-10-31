
// admin-ui/src/pages/DatabaseRoles.jsx
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  ListItemText,
  Checkbox,
  Alert,
  Tooltip,
  Badge,
  Switch,
  FormControlLabel,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  VpnKey as PermissionIcon,
  Assignment as AssignIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function DatabaseRoles() {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });
  const [assignData, setAssignData] = useState({
    user_id: '',
    org_id: ''
  });

  // Fetch database roles
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['database-roles'],
    queryFn: () => api.get('/db-roles').then(res => res.data)
  });

  // Fetch permissions for role creation/editing
  const { data: permissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => api.get('/permissions').then(res => res.data)
  });

  // Fetch users for role assignment
  const { data: users = [] } = useQuery({
    queryKey: ['users-for-assignment'],
    queryFn: () => api.get('/users').then(res => res.data),
    enabled: openAssign
  });

  // Fetch organizations for role assignment
  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations-for-assignment'],
    queryFn: () => api.get('/organizations').then(res => res.data),
    enabled: openAssign
  });

  // Create role mutation
  const createMutation = useMutation({
    mutationFn: (roleData) => api.post('/db-roles', roleData),
    onSuccess: () => {
      queryClient.invalidateQueries(['database-roles']);
      setOpenCreate(false);
      setFormData({ name: '', description: '', permissions: [] });
    },
    onError: (error) => {
      alert(`Failed to create role: ${error.response?.data?.message || error.message}`);
    }
  });

  // Update role mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/db-roles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['database-roles']);
      setOpenEdit(false);
      setSelectedRole(null);
    },
    onError: (error) => {
      alert(`Failed to update role: ${error.response?.data?.message || error.message}`);
    }
  });

  // Delete role mutation
  const deleteMutation = useMutation({
    mutationFn: (roleId) => api.delete(`/db-roles/${roleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['database-roles']);
      setAnchorEl(null);
      setSelectedRole(null);
    },
    onError: (error) => {
      alert(`Failed to delete role: ${error.response?.data?.message || error.message}`);
    }
  });

  // Assign role mutation
  const assignMutation = useMutation({
    mutationFn: ({ roleId, ...data }) => api.post(`/db-roles/${roleId}/assign`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['database-roles']);
      setOpenAssign(false);
      setAssignData({ user_id: '', org_id: '' });
    },
    onError: (error) => {
      alert(`Failed to assign role: ${error.response?.data?.message || error.message}`);
    }
  });

  const handleCreateRole = () => {
    if (!formData.name) {
      alert('Role name is required');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEditRole = () => {
    if (!formData.name) {
      alert('Role name is required');
      return;
    }
    updateMutation.mutate({ id: selectedRole.id, ...formData });
  };

  const handleAssignRole = () => {
    if (!assignData.user_id || !assignData.org_id) {
      alert('User and organization are required');
      return;
    }
    assignMutation.mutate({ roleId: selectedRole.id, ...assignData });
  };

  const handleMenuClick = (event, role) => {
    setAnchorEl(event.currentTarget);
    setSelectedRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRole(null);
  };

  const handleEditClick = () => {
    setFormData({
      name: selectedRole.name,
      description: selectedRole.description || '',
      permissions: selectedRole.permissions?.map(p => p.id) || []
    });
    setOpenEdit(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (confirm(`Are you sure you want to delete "${selectedRole.name}"?`)) {
      deleteMutation.mutate(selectedRole.id);
    }
  };

  const handleAssignClick = () => {
    setOpenAssign(true);
    handleMenuClose();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Database Roles
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreate(true)}
        >
          Create Role
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="All Roles" />
        <Tab label="System Roles" />
        <Tab label="Custom Roles" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <RolesTable 
          roles={roles} 
          onMenuClick={handleMenuClick}
          isLoading={isLoading}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <RolesTable 
          roles={roles.filter(role => role.is_system)} 
          onMenuClick={handleMenuClick}
          isLoading={isLoading}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <RolesTable 
          roles={roles.filter(role => !role.is_system)} 
          onMenuClick={handleMenuClick}
          isLoading={isLoading}
        />
      </TabPanel>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Role
        </MenuItem>
        <MenuItem onClick={handleAssignClick}>
          <AssignIcon sx={{ mr: 1 }} />
          Assign to User
        </MenuItem>
        {!selectedRole?.is_system && (
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete Role
          </MenuItem>
        )}
      </Menu>

      {/* Create Role Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Database Role</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Permissions</InputLabel>
            <Select
              multiple
              value={formData.permissions}
              onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
              input={<OutlinedInput label="Permissions" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const permission = permissions.find(p => p.id === value);
                    return (
                      <Chip
                        key={value}
                        label={permission?.name || value}
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
            >
              {permissions.map((permission) => (
                <MenuItem key={permission.id} value={permission.id}>
                  <Checkbox checked={formData.permissions.indexOf(permission.id) > -1} />
                  <ListItemText 
                    primary={permission.name}
                    secondary={permission.description}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={handleCreateRole} variant="contained" disabled={createMutation.isLoading}>
            {createMutation.isLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Database Role</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
            disabled={selectedRole?.is_system}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Permissions</InputLabel>
            <Select
              multiple
              value={formData.permissions}
              onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
              input={<OutlinedInput label="Permissions" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const permission = permissions.find(p => p.id === value);
                    return (
                      <Chip
                        key={value}
                        label={permission?.name || value}
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
            >
              {permissions.map((permission) => (
                <MenuItem key={permission.id} value={permission.id}>
                  <Checkbox checked={formData.permissions.indexOf(permission.id) > -1} />
                  <ListItemText 
                    primary={permission.name}
                    secondary={permission.description}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleEditRole} variant="contained" disabled={updateMutation.isLoading}>
            {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={openAssign} onClose={() => setOpenAssign(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Role to User</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>User</InputLabel>
            <Select
              value={assignData.user_id}
              onChange={(e) => setAssignData({ ...assignData, user_id: e.target.value })}
              label="User"
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.email} ({user.username})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Organization</InputLabel>
            <Select
              value={assignData.org_id}
              onChange={(e) => setAssignData({ ...assignData, org_id: e.target.value })}
              label="Organization"
            >
              {organizations.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssign(false)}>Cancel</Button>
          <Button onClick={handleAssignRole} variant="contained" disabled={assignMutation.isLoading}>
            {assignMutation.isLoading ? 'Assigning...' : 'Assign Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function RolesTable({ roles, onMenuClick, isLoading }) {
  if (isLoading) {
    return <Typography>Loading roles...</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Permissions</TableCell>
            <TableCell>Users</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1" fontWeight="medium">
                    {role.name}
                  </Typography>
                  {role.is_system && (
                    <Chip label="System" size="small" color="secondary" sx={{ ml: 1 }} />
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {role.description || 'No description'}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={role.is_system ? 'System' : 'Custom'} 
                  size="small" 
                  color={role.is_system ? 'secondary' : 'primary'} 
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Badge badgeContent={role.permission_count || 0} color="info">
                  <PermissionIcon />
                </Badge>
              </TableCell>
              <TableCell>
                <Badge badgeContent={role.user_count || 0} color="success">
                  <PeopleIcon />
                </Badge>
              </TableCell>
              <TableCell>
                {role.created_at && formatDistanceToNow(new Date(role.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <IconButton onClick={(e) => onMenuClick(e, role)}>
                  <MoreIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {roles.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography variant="body1" color="text.secondary" py={4}>
                  No roles found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DatabaseRoles;
