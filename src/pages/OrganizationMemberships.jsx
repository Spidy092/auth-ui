// admin-ui/src/pages/OrganizationMemberships.jsx
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
  Alert,
  Tooltip,
  Badge,
  Card,
  CardContent,
  Grid,
  Avatar,
  ListItemAvatar,
  ListItemText,
  List,
  ListItem,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  PersonAdd as PersonAddIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  GroupAdd as BulkAssignIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Removed unused import: formatDistanceToNow
import api from '../services/api';

function OrganizationMemberships() {
  const queryClient = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const [openBulkAssign, setOpenBulkAssign] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    org_id: '',
    role_id: ''
  });
  const [bulkFormData, setBulkFormData] = useState({
    user_ids: [],
    org_id: '',
    role_id: ''
  });
  const [filters, setFilters] = useState({
    user_id: '',
    org_id: '',
    role_id: ''
  });

  // Build query params from filters
  const queryParams = new URLSearchParams();
  if (filters.user_id) queryParams.append('user_id', filters.user_id);
  if (filters.org_id) queryParams.append('org_id', filters.org_id);
  if (filters.role_id) queryParams.append('role_id', filters.role_id);

  // Fetch organization memberships with filters
  const { data: memberships = [], isLoading } = useQuery({
    queryKey: ['organization-memberships', filters],
    queryFn: () => api.get(`/organization-memberships?${queryParams.toString()}`).then(res => res.data)
  });

  // Fetch users for dropdowns
  const { data: users = [] } = useQuery({
    queryKey: ['users-for-memberships'],
    queryFn: () => api.get('/users').then(res => res.data)
  });

  // Fetch organizations for dropdowns
  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations-for-memberships'],
    queryFn: () => api.get('/organizations').then(res => res.data)
  });

  // Fetch database roles for dropdowns
  const { data: roles = [] } = useQuery({
    queryKey: ['db-roles-for-memberships'],
    queryFn: () => api.get('/db-roles').then(res => res.data)
  });

  // Fetch membership statistics
  const { data: stats = {} } = useQuery({
    queryKey: ['membership-stats'],
    queryFn: () => api.get('/organization-memberships/stats/overview').then(res => res.data)
  });

  // Create membership mutation
  const createMutation = useMutation({
    mutationFn: (membershipData) => api.post('/organization-memberships', membershipData),
    onSuccess: () => {
      queryClient.invalidateQueries(['organization-memberships']);
      queryClient.invalidateQueries(['membership-stats']);
      setOpenCreate(false);
      setFormData({ user_id: '', org_id: '', role_id: '' });
    },
    onError: (error) => {
      alert(`Failed to create membership: ${error.response?.data?.message || error.message}`);
    }
  });

  // Bulk assign mutation
  const bulkAssignMutation = useMutation({
    mutationFn: (bulkData) => api.post('/organization-memberships/bulk-assign', bulkData),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['organization-memberships']);
      queryClient.invalidateQueries(['membership-stats']);
      setOpenBulkAssign(false);
      setBulkFormData({ user_ids: [], org_id: '', role_id: '' });
      alert(`Assigned ${response.data.created} memberships. ${response.data.errors} errors.`);
    },
    onError: (error) => {
      alert(`Failed to bulk assign: ${error.response?.data?.message || error.message}`);
    }
  });

  // Update membership mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/organization-memberships/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['organization-memberships']);
      setAnchorEl(null);
      setSelectedMembership(null);
    },
    onError: (error) => {
      alert(`Failed to update membership: ${error.response?.data?.message || error.message}`);
    }
  });

  // Delete membership mutation
  const deleteMutation = useMutation({
    mutationFn: (membershipId) => api.delete(`/organization-memberships/${membershipId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['organization-memberships']);
      queryClient.invalidateQueries(['membership-stats']);
      setAnchorEl(null);
      setSelectedMembership(null);
    },
    onError: (error) => {
      alert(`Failed to delete membership: ${error.response?.data?.message || error.message}`);
    }
  });

  const handleCreateMembership = () => {
    if (!formData.user_id || !formData.org_id || !formData.role_id) {
      alert('User, organization, and role are required');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleBulkAssign = () => {
    if (!bulkFormData.user_ids.length || !bulkFormData.org_id || !bulkFormData.role_id) {
      alert('Users, organization, and role are required');
      return;
    }
    bulkAssignMutation.mutate(bulkFormData);
  };

  const handleMenuClick = (event, membership) => {
    setAnchorEl(event.currentTarget);
    setSelectedMembership(membership);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMembership(null);
  };

  const handleDeleteClick = () => {
    if (confirm('Are you sure you want to delete this membership?')) {
      deleteMutation.mutate(selectedMembership.id);
    }
  };

  // Removed unused handleChangeRole function

  const clearFilters = () => {
    setFilters({ user_id: '', org_id: '', role_id: '' });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Organization Memberships
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<BulkAssignIcon />}
            onClick={() => setOpenBulkAssign(true)}
            sx={{ mr: 2 }}
          >
            Bulk Assign
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenCreate(true)}
          >
            Add Membership
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4">{stats.total_memberships || 0}</Typography>
                  <Typography color="text.secondary">Total Memberships</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography variant="h4">{users.length}</Typography>
                  <Typography color="text.secondary">Total Users</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <BusinessIcon sx={{ mr: 2, color: 'info.main' }} />
                <Box>
                  <Typography variant="h4">{organizations.length}</Typography>
                  <Typography color="text.secondary">Organizations</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SecurityIcon sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h4">{roles.length}</Typography>
                  <Typography color="text.secondary">Roles</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>User</InputLabel>
                <Select
                  value={filters.user_id}
                  label="User"
                  onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
                >
                  <MenuItem value="">All Users</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Organization</InputLabel>
                <Select
                  value={filters.org_id}
                  label="Organization"
                  onChange={(e) => setFilters({ ...filters, org_id: e.target.value })}
                >
                  <MenuItem value="">All Organizations</MenuItem>
                  {organizations.map((org) => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  value={filters.role_id}
                  label="Role"
                  onChange={(e) => setFilters({ ...filters, role_id: e.target.value })}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              <Button 
                variant="outlined" 
                onClick={clearFilters}
                fullWidth
                size="small"
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Memberships Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>User Details</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {memberships.map((membership) => (
              <TableRow key={membership.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {membership.user?.email?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {membership.user.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {membership.user.keycloak_id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {membership.organization.name}
                      </Typography>
                      {membership.organization.tenant_id && (
                        <Typography variant="body2" color="text.secondary">
                          Tenant: {membership.organization.tenant_id}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={<SecurityIcon />}
                    label={membership.role.name}
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    {membership.user.designation && (
                      <Typography variant="body2">
                        <strong>Position:</strong> {membership.user.designation}
                      </Typography>
                    )}
                    {membership.user.department && (
                      <Typography variant="body2">
                        <strong>Department:</strong> {membership.user.department}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip 
                    title={membership.role.permissions?.map(p => p.name).join(', ') || 'No permissions'}
                  >
                    <Badge badgeContent={membership.role.permissions?.length || 0} color="info">
                      <SecurityIcon />
                    </Badge>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleMenuClick(e, membership)}>
                    <MoreIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {memberships.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" color="text.secondary" py={4}>
                    No memberships found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1 }} />
          Change Role
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Remove Membership
        </MenuItem>
      </Menu>

      {/* Create Membership Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Organization Membership</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>User</InputLabel>
            <Select
              value={formData.user_id}
              label="User"
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  <Box display="flex" alignItems="center" width="100%">
                    <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                      {user?.email?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{user.email}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.firstName} {user.lastName}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Organization</InputLabel>
            <Select
              value={formData.org_id}
              label="Organization"
              onChange={(e) => setFormData({ ...formData, org_id: e.target.value })}
            >
              {organizations.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                  {org.tenant_id && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({org.tenant_id})
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role_id}
              label="Role"
              onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  <Box>
                    <Typography variant="body2">{role.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {role.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={handleCreateMembership} variant="contained" disabled={createMutation.isLoading}>
            {createMutation.isLoading ? 'Creating...' : 'Add Membership'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Assign Dialog */}
      <Dialog open={openBulkAssign} onClose={() => setOpenBulkAssign(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Assign Users to Organization</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Users</InputLabel>
            <Select
              multiple
              value={bulkFormData.user_ids}
              label="Users"
              onChange={(e) => setBulkFormData({ ...bulkFormData, user_ids: e.target.value })}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const user = users.find(u => u.id === value);
                    return (
                      <Chip
                        key={value}
                        label={user?.email || value}
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  <Box display="flex" alignItems="center" width="100%">
                    <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                      {user?.email?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{user.email}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.firstName} {user.lastName}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Organization</InputLabel>
            <Select
              value={bulkFormData.org_id}
              label="Organization"
              onChange={(e) => setBulkFormData({ ...bulkFormData, org_id: e.target.value })}
            >
              {organizations.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={bulkFormData.role_id}
              label="Role"
              onChange={(e) => setBulkFormData({ ...bulkFormData, role_id: e.target.value })}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkAssign(false)}>Cancel</Button>
          <Button onClick={handleBulkAssign} variant="contained" disabled={bulkAssignMutation.isLoading}>
            {bulkAssignMutation.isLoading ? 'Assigning...' : 'Bulk Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default OrganizationMemberships;