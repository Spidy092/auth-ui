
// admin-ui/src/pages/Organizations.jsx
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
  Card,
  CardContent,
  Grid,
  Alert,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';

function Organizations() {
  const queryClient = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    tenant_id: ''
  });

  // Fetch organizations
  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => api.get('/organizations').then(res => res.data)
  });

  // Create organization mutation
  const createMutation = useMutation({
    mutationFn: (orgData) => api.post('/organizations', orgData),
    onSuccess: () => {
      queryClient.invalidateQueries(['organizations']);
      setOpenCreate(false);
      setFormData({ name: '', tenant_id: '' });
    },
    onError: (error) => {
      alert(`Failed to create organization: ${error.response?.data?.message || error.message}`);
    }
  });

  // Update organization mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/organizations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['organizations']);
      setOpenEdit(false);
      setSelectedOrg(null);
    },
    onError: (error) => {
      alert(`Failed to update organization: ${error.response?.data?.message || error.message}`);
    }
  });

  // Delete organization mutation
  const deleteMutation = useMutation({
    mutationFn: (orgId) => api.delete(`/organizations/${orgId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['organizations']);
      setAnchorEl(null);
      setSelectedOrg(null);
    },
    onError: (error) => {
      alert(`Failed to delete organization: ${error.response?.data?.message || error.message}`);
    }
  });

  const handleCreateOrg = () => {
    if (!formData.name) {
      alert('Organization name is required');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEditOrg = () => {
    if (!formData.name) {
      alert('Organization name is required');
      return;
    }
    updateMutation.mutate({ id: selectedOrg.id, ...formData });
  };

  const handleMenuClick = (event, org) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrg(org);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrg(null);
  };

  const handleEditClick = () => {
    setFormData({
      name: selectedOrg.name,
      tenant_id: selectedOrg.tenant_id || ''
    });
    setOpenEdit(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (confirm(`Are you sure you want to delete "${selectedOrg.name}"?`)) {
      deleteMutation.mutate(selectedOrg.id);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Organizations
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreate(true)}
        >
          Create Organization
        </Button>
      </Box>

      {/* Organizations Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Tenant ID</TableCell>
              <TableCell>Members</TableCell>
              <TableCell>Primary Users</TableCell>
              <TableCell>Total Users</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1" fontWeight="medium">
                      {org.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {org.tenant_id ? (
                    <Chip label={org.tenant_id} size="small" variant="outlined" />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No tenant
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Badge badgeContent={org.member_count || 0} color="primary">
                    <PeopleIcon />
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge badgeContent={org.primary_user_count || 0} color="secondary">
                    <PeopleIcon />
                  </Badge>
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">
                    {org.total_users || 0}
                  </Typography>
                </TableCell>
                <TableCell>
                  {org.created_at && formatDistanceToNow(new Date(org.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleMenuClick(e, org)}>
                    <MoreIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {organizations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" color="text.secondary" py={4}>
                    No organizations found
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
        <MenuItem onClick={handleEditClick}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Organization
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Organization
        </MenuItem>
      </Menu>

      {/* Create Organization Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Organization</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Organization Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Tenant ID (Optional)"
            fullWidth
            variant="outlined"
            value={formData.tenant_id}
            onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
            helperText="Optional tenant identifier for multi-tenancy"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={handleCreateOrg} variant="contained" disabled={createMutation.isLoading}>
            {createMutation.isLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Organization Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Organization</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Organization Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Tenant ID (Optional)"
            fullWidth
            variant="outlined"
            value={formData.tenant_id}
            onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
            helperText="Optional tenant identifier for multi-tenancy"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleEditOrg} variant="contained" disabled={updateMutation.isLoading}>
            {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Organizations;
