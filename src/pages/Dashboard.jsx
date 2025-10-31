
// admin-ui/src/pages/Dashboard.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Grid, Card, CardContent, Typography, Button, Avatar,
  Chip, LinearProgress, List, ListItem, ListItemText, ListItemAvatar,
  IconButton, Divider, Paper, Alert, Skeleton
} from '@mui/material';
import {
  People as PeopleIcon,
  Apps as AppsIcon,
  Domain as DomainIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all realms
  const { data: realms = [], isLoading: realmsLoading, refetch: refetchRealms } = useQuery({
    queryKey: ['dashboard-realms'],
    queryFn: () => api.get('/realms').then(res => res.data),
  });

  // Fetch aggregated data across all realms
  const { data: dashboardStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const stats = {
        totalUsers: 0,
        totalClients: 0,
        totalRoles: 0,
        enabledRealms: 0,
        recentUsers: [],
        recentClients: [],
        systemHealth: []
      };

      // Get stats for each realm
      for (const realm of realms) {
        try {
          // Users in this realm
          const users = await api.get(`/users?realm=${realm.realm_name}`).then(res => res.data);
          stats.totalUsers += users.length;

          // Add recent users (created in last 7 days)
          const recentUsers = users.filter(user => {
            if (!user.createdTimestamp) return false;
            const created = new Date(user.createdTimestamp);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return created > weekAgo;
          }).slice(0, 3);

          stats.recentUsers.push(...recentUsers.map(user => ({
            ...user,
            realmName: realm.realm_name
          })));

          // Clients in this realm
          const clients = await api.get(`/clients?realm=${realm.realm_name}`).then(res => res.data);
          stats.totalClients += clients.length;

          // Add recent clients
          stats.recentClients.push(...clients.slice(0, 2).map(client => ({
            ...client,
            realmName: realm.realm_name
          })));

          // Realm roles
          const realmRoles = await api.get(`/roles/realm?realm=${realm.realm_name}`).then(res => res.data);
          stats.totalRoles += realmRoles.length;

          // Count enabled realms
          if (realm.enabled) stats.enabledRealms++;

          // System health check
          stats.systemHealth.push({
            realm: realm.realm_name,
            status: realm.enabled ? 'healthy' : 'disabled',
            users: users.length,
            clients: clients.length
          });

        } catch (error) {
          console.error(`Error fetching data for realm ${realm.realm_name}:`, error);
          stats.systemHealth.push({
            realm: realm.realm_name,
            status: 'error',
            error: error.message
          });
        }
      }

      // Sort recent users by creation date
      stats.recentUsers = stats.recentUsers
        .sort((a, b) => new Date(b.createdTimestamp) - new Date(a.createdTimestamp))
        .slice(0, 5);

      return stats;
    },
    enabled: realms && realms.length > 0,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchRealms(), refetchStats()]);
    setRefreshing(false);
  };

  const isLoading = realmsLoading || statsLoading;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Overview of your Keycloak system across all realms
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Total Users
                  </Typography>
                  {isLoading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" component="div">
                      {dashboardStats?.totalUsers || 0}
                    </Typography>
                  )}
                  <Typography variant="body2" color="success.main">
                    Across {realms.length} realms
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Active Realms
                  </Typography>
                  {isLoading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" component="div">
                      {dashboardStats?.enabledRealms || 0}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    of {realms.length} total
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <DomainIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Total Clients
                  </Typography>
                  {isLoading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" component="div">
                      {dashboardStats?.totalClients || 0}
                    </Typography>
                  )}
                  <Typography variant="body2" color="info.main">
                    Registered applications
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <AppsIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Total Roles
                  </Typography>
                  {isLoading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" component="div">
                      {dashboardStats?.totalRoles || 0}
                    </Typography>
                  )}
                  <Typography variant="body2" color="warning.main">
                    Security permissions
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <SecurityIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* System Health */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="div">
                  System Health
                </Typography>
                <Chip 
                  label={`${dashboardStats?.enabledRealms || 0}/${realms.length} Active`}
                  color={dashboardStats?.enabledRealms === realms.length ? 'success' : 'warning'}
                  size="small"
                />
              </Box>

              {isLoading ? (
                <Box>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} mb={2}>
                      <Skeleton variant="text" height={20} />
                      <Skeleton variant="rectangular" height={4} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box>
                  {dashboardStats?.systemHealth?.map((health, index) => (
                    <Box key={index} mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle2">
                          {health.realm}
                        </Typography>
                        <Chip 
                          label={health.status}
                          color={
                            health.status === 'healthy' ? 'success' : 
                            health.status === 'disabled' ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </Box>
                      {health.status === 'healthy' && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {health.users} users, {health.clients} clients
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min((health.users / 10) * 100, 100)} 
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      )}
                      {health.error && (
                        <Typography variant="caption" color="error">
                          Error: {health.error}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="div" mb={2}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DomainIcon />}
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/realms')}
                  >
                    Manage Realms
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/users')}
                  >
                    User Management
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AppsIcon />}
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/clients')}
                  >
                    Client Management
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SecurityIcon />}
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/roles')}
                  >
                    Role Management
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="div" mb={2}>
                Recent Users
              </Typography>
              {isLoading ? (
                <Box>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} display="flex" alignItems="center" mb={2}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box ml={2} flex={1}>
                        <Skeleton variant="text" height={20} />
                        <Skeleton variant="text" height={16} width="60%" />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : dashboardStats?.recentUsers?.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {dashboardStats.recentUsers.map((user, index) => (
                    <Box key={user.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {user.username?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.username}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {user.email}
                              </Typography>
                              <Box display="flex" alignItems="center" mt={0.5}>
                                <Chip 
                                  label={user.realmName} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ mr: 1, height: 20 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {user.createdTimestamp && 
                                    formatDistanceToNow(new Date(user.createdTimestamp), { addSuffix: true })
                                  }
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < dashboardStats.recentUsers.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography color="text.secondary">
                    No recent users found
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Clients */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="div" mb={2}>
                Recent Clients
              </Typography>
              {isLoading ? (
                <Box>
                  {[1, 2].map((i) => (
                    <Box key={i} display="flex" alignItems="center" mb={2}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box ml={2} flex={1}>
                        <Skeleton variant="text" height={20} />
                        <Skeleton variant="text" height={16} width="60%" />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : dashboardStats?.recentClients?.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {dashboardStats.recentClients.map((client, index) => (
                    <Box key={client.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'info.main' }}>
                            <AppsIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={client.clientId}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {client.name || client.description || 'No description'}
                              </Typography>
                              <Box display="flex" alignItems="center" mt={0.5}>
                                <Chip 
                                  label={client.realmName} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ mr: 1, height: 20 }}
                                />
                                <Chip 
                                  label={client.enabled ? 'Enabled' : 'Disabled'}
                                  size="small"
                                  color={client.enabled ? 'success' : 'default'}
                                  sx={{ height: 20 }}
                                />
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < dashboardStats.recentClients.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography color="text.secondary">
                    No recent clients found
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
