
// admin-ui/src/pages/AccountManagement.jsx
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Avatar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  VpnKey as PermissionIcon,
  History as HistoryIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Visibility as ViewIcon,
  VisibilityOff as VisibilityOffIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon
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

function AccountManagement() {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => api.get('/account/profile').then(res => res.data)
  });

  // Fetch user organizations
  const { data: organizations = [] } = useQuery({
    queryKey: ['user-organizations'],
    queryFn: () => api.get('/account/organizations').then(res => res.data)
  });

  // Fetch user permissions
  const { data: permissions = {} } = useQuery({
    queryKey: ['user-permissions'],
    queryFn: () => api.get('/account/permissions').then(res => res.data)
  });

  // Fetch user sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: () => api.get('/account/sessions').then(res => res.data)
  });

  // Fetch security events
  const { data: securityEvents = [] } = useQuery({
    queryKey: ['security-events'],
    queryFn: () => api.get('/account/security-events').then(res => res.data)
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData) => api.put('/account/profile', profileData),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
      setOpenEdit(false);
      alert('Profile updated successfully');
    },
    onError: (error) => {
      alert(`Failed to update profile: ${error.response?.data?.message || error.message}`);
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (passwordData) => api.post('/account/change-password', passwordData),
    onSuccess: () => {
      setOpenChangePassword(false);
      setPasswordData({ newPassword: '', confirmNewPassword: '' });
      alert('Password changed successfully');
    },
    onError: (error) => {
      alert(`Failed to change password: ${error.response?.data?.message || error.message}`);
    }
  });

  const handleEditProfile = () => {
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      designation: profile?.metadata?.designation || '',
      department: profile?.metadata?.department || '',
      mobile: profile?.metadata?.mobile || '',
      gender: profile?.metadata?.gender || ''
    });
    setOpenEdit(true);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      alert('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    changePasswordMutation.mutate(passwordData);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading account information...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Account Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<LockIcon />}
            onClick={() => setOpenChangePassword(true)}
            sx={{ mr: 2 }}
          >
            Change Password
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEditProfile}
          >
            Edit Profile
          </Button>
        </Box>
      </Box>

      {/* Profile Summary Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{ 
                  width: 80, 
                  height: 80, 
                  fontSize: '2rem',
                  bgcolor: 'primary.main'
                }}
              >
                {profile?.firstName?.charAt(0) || profile?.email?.charAt(0) || 'U'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" gutterBottom>
                {profile?.firstName} {profile?.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {profile?.email}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {profile?.enabled ? (
                  <Chip label="Active" color="success" size="small" />
                ) : (
                  <Chip label="Inactive" color="error" size="small" />
                )}
                {profile?.emailVerified && (
                  <Chip label="Email Verified" color="info" size="small" />
                )}
                {profile?.metadata?.designation && (
                  <Chip label={profile.metadata.designation} variant="outlined" size="small" />
                )}
              </Box>
            </Grid>
            <Grid item>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {organizations?.memberships?.length || 0} Organizations
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <PermissionIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {permissions?.total || 0} Permissions
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="Profile Details" />
        <Tab label="Organizations" />
        <Tab label="Permissions" />
        <Tab label="Sessions" />
        <Tab label="Security Events" />
      </Tabs>

      {/* Profile Details Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Full Name"
                      secondary={`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Not set'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email"
                      secondary={profile?.email || 'Not set'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Mobile"
                      secondary={profile?.metadata?.mobile || 'Not set'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Work Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <WorkIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Designation"
                      secondary={profile?.metadata?.designation || 'Not set'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <BusinessIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Department"
                      secondary={profile?.metadata?.department || 'Not set'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <BusinessIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Primary Organization"
                      secondary={profile?.metadata?.primary_organization?.name || 'Not set'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Organizations Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Organizations
            </Typography>
            {organizations?.primary_organization && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Primary Organization</Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <BusinessIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="h6">{organizations.primary_organization.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Primary Organization
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}
            
            <Typography variant="subtitle1" gutterBottom>Memberships</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Organization</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Permissions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {organizations?.memberships?.map((membership, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="body1">{membership.organization.name}</Typography>
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
                          label={membership.role.name} 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge badgeContent={membership.role.permissions?.length || 0} color="info">
                          <PermissionIcon />
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Permissions Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Permissions ({permissions?.total || 0})
            </Typography>
            <Grid container spacing={3}>
              {Object.entries(permissions?.by_organization || {}).map(([orgId, orgData]) => (
                <Grid item xs={12} key={orgId}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {orgData.organization.name} - {orgData.role}
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {orgData.permissions.map((permission, idx) => (
                          <Chip 
                            key={idx}
                            label={permission.name}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Sessions Tab */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Sessions
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Application</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Started</TableCell>
                    <TableCell>Last Access</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((session, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body1">
                          {session.applicationName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {session.clientId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {session.location} ({session.ipAddress})
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {session.started && formatDistanceToNow(new Date(session.started), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {session.lastAccess && formatDistanceToNow(new Date(session.lastAccess), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={session.current ? 'Current' : 'Active'}
                          color={session.current ? 'success' : 'info'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Security Events Tab */}
      <TabPanel value={tabValue} index={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Security Events
            </Typography>
            <List>
              {securityEvents.map((event, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <HistoryIcon color={event.success ? 'success' : 'error'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={event.description}
                      secondary={
                        <Box>
                          <Typography variant="body2" component="span">
                            {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                          </Typography>
                          <Typography variant="body2" component="span" sx={{ ml: 2 }}>
                            IP: {event.ipAddress}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip 
                      label={event.success ? 'Success' : 'Failed'}
                      color={event.success ? 'success' : 'error'}
                      size="small"
                    />
                  </ListItem>
                  {index < securityEvents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Edit Profile Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="First Name"
                fullWidth
                variant="outlined"
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Last Name"
                fullWidth
                variant="outlined"
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Email"
                fullWidth
                variant="outlined"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Designation"
                fullWidth
                variant="outlined"
                value={formData.designation || ''}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Department"
                fullWidth
                variant="outlined"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Mobile"
                fullWidth
                variant="outlined"
                value={formData.mobile || ''}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained" disabled={updateProfileMutation.isLoading}>
            {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={openChangePassword} onClose={() => setOpenChangePassword(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="New Password"
            type={showPasswords.new ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  edge="end"
                >
                  {showPasswords.new ? <VisibilityOffIcon /> : <ViewIcon />}
                </IconButton>
              )
            }}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type={showPasswords.confirm ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={passwordData.confirmNewPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  edge="end"
                >
                  {showPasswords.confirm ? <VisibilityOffIcon /> : <ViewIcon />}
                </IconButton>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenChangePassword(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained" disabled={changePasswordMutation.isLoading}>
            {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AccountManagement;
