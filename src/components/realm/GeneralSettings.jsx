
// admin-ui/src/components/realm/GeneralSettings.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Tab,
  Tabs,
  Paper
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import PasswordPolicyManager from '../PasswordPolicyManager';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function GeneralSettings({ realm, realmName }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    displayName: '',
    enabled: true,
    registrationAllowed: false,
    registrationEmailAsUsername: false,
    rememberMe: false,
    verifyEmail: false,
    loginWithEmailAllowed: true,
    duplicateEmailsAllowed: false,
    resetPasswordAllowed: true,
    editUsernameAllowed: false,
    bruteForceProtected: false,
    permanentLockout: false,
    maxFailureWaitSeconds: 900,
    minimumQuickLoginWaitSeconds: 60,
    waitIncrementSeconds: 60,
    quickLoginCheckMilliSeconds: 1000,
    maxDeltaTimeSeconds: 43200,
    failureFactor: 30,
    defaultSignatureAlgorithm: 'RS256',
    passwordPolicy: '',
    smtpServer: {
      host: '',
      port: 587,
      from: '',
      ssl: false,
      starttls: true,
      auth: false,
      username: '',
      password: ''
    }
  });

  useEffect(() => {
    if (realm) {
      setSettings({
        displayName: realm.displayName || '',
        enabled: realm.enabled || false,
        registrationAllowed: realm.registrationAllowed || false,
        registrationEmailAsUsername: realm.registrationEmailAsUsername || false,
        rememberMe: realm.rememberMe || false,
        verifyEmail: realm.verifyEmail || false,
        loginWithEmailAllowed: realm.loginWithEmailAllowed !== false,
        duplicateEmailsAllowed: realm.duplicateEmailsAllowed || false,
        resetPasswordAllowed: realm.resetPasswordAllowed !== false,
        editUsernameAllowed: realm.editUsernameAllowed || false,
        bruteForceProtected: realm.bruteForceProtected || false,
        permanentLockout: realm.permanentLockout || false,
        maxFailureWaitSeconds: realm.maxFailureWaitSeconds || 900,
        minimumQuickLoginWaitSeconds: realm.minimumQuickLoginWaitSeconds || 60,
        waitIncrementSeconds: realm.waitIncrementSeconds || 60,
        quickLoginCheckMilliSeconds: realm.quickLoginCheckMilliSeconds || 1000,
        maxDeltaTimeSeconds: realm.maxDeltaTimeSeconds || 43200,
        failureFactor: realm.failureFactor || 30,
        defaultSignatureAlgorithm: realm.defaultSignatureAlgorithm || 'RS256',
        passwordPolicy: realm.passwordPolicy || '',
        smtpServer: realm.smtpServer || {
          host: '',
          port: 587,
          from: '',
          ssl: false,
          starttls: true,
          auth: false,
          username: '',
          password: ''
        }
      });
    }
  }, [realm]);

  const updateMutation = useMutation({
    mutationFn: (updates) => api.patch(`/realms/${realmName}/settings`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['realm', realmName]);
      alert('Settings updated successfully');
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message;
      alert(`Failed to update settings: ${msg}`);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        General Settings
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tab label="Basic Settings" />
        <Tab label="Login Settings" />
        <Tab label="Password Policy" />
        <Tab label="SMTP Configuration" />
        <Tab label="Security Settings" />
      </Tabs>

      {/* Basic Settings Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Realm Information</Typography>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={settings.displayName}
                  onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enabled}
                      onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                    />
                  }
                  label="Realm Enabled"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Registration Settings</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.registrationAllowed}
                      onChange={(e) => setSettings({ ...settings, registrationAllowed: e.target.checked })}
                    />
                  }
                  label="User Registration"
                  sx={{ mb: 1, display: 'block' }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.registrationEmailAsUsername}
                      onChange={(e) => setSettings({ ...settings, registrationEmailAsUsername: e.target.checked })}
                    />
                  }
                  label="Email as Username"
                  sx={{ mb: 1, display: 'block' }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.verifyEmail}
                      onChange={(e) => setSettings({ ...settings, verifyEmail: e.target.checked })}
                    />
                  }
                  label="Verify Email"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Login Settings Tab */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Authentication Settings</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.rememberMe}
                          onChange={(e) => setSettings({ ...settings, rememberMe: e.target.checked })}
                        />
                      }
                      label="Remember Me"
                      sx={{ mb: 2, display: 'block' }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.loginWithEmailAllowed}
                          onChange={(e) => setSettings({ ...settings, loginWithEmailAllowed: e.target.checked })}
                        />
                      }
                      label="Login with Email"
                      sx={{ mb: 2, display: 'block' }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.duplicateEmailsAllowed}
                          onChange={(e) => setSettings({ ...settings, duplicateEmailsAllowed: e.target.checked })}
                        />
                      }
                      label="Duplicate Emails Allowed"
                      sx={{ mb: 2, display: 'block' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.resetPasswordAllowed}
                          onChange={(e) => setSettings({ ...settings, resetPasswordAllowed: e.target.checked })}
                        />
                      }
                      label="Forgot Password"
                      sx={{ mb: 2, display: 'block' }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.editUsernameAllowed}
                          onChange={(e) => setSettings({ ...settings, editUsernameAllowed: e.target.checked })}
                        />
                      }
                      label="Edit Username"
                      sx={{ mb: 2, display: 'block' }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Password Policy Tab */}
      <TabPanel value={activeTab} index={2}>
        <Card>
          <CardContent>
            <PasswordPolicyManager
              value={settings.passwordPolicy}
              onChange={(policy) => setSettings({ ...settings, passwordPolicy: policy })}
            />
          </CardContent>
        </Card>
      </TabPanel>

      {/* SMTP Configuration Tab */}
      <TabPanel value={activeTab} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Email Settings</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Host"
                  value={settings.smtpServer.host}
                  onChange={(e) => setSettings({
                    ...settings,
                    smtpServer: { ...settings.smtpServer, host: e.target.value }
                  })}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Port"
                  type="number"
                  value={settings.smtpServer.port}
                  onChange={(e) => setSettings({
                    ...settings,
                    smtpServer: { ...settings.smtpServer, port: parseInt(e.target.value) || 587 }
                  })}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="From Email"
                  value={settings.smtpServer.from}
                  onChange={(e) => setSettings({
                    ...settings,
                    smtpServer: { ...settings.smtpServer, from: e.target.value }
                  })}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={settings.smtpServer.username}
                  onChange={(e) => setSettings({
                    ...settings,
                    smtpServer: { ...settings.smtpServer, username: e.target.value }
                  })}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={settings.smtpServer.password}
                  onChange={(e) => setSettings({
                    ...settings,
                    smtpServer: { ...settings.smtpServer, password: e.target.value }
                  })}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.smtpServer.ssl}
                      onChange={(e) => setSettings({
                        ...settings,
                        smtpServer: { ...settings.smtpServer, ssl: e.target.checked }
                      })}
                    />
                  }
                  label="Use SSL"
                  sx={{ mr: 3 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.smtpServer.starttls}
                      onChange={(e) => setSettings({
                        ...settings,
                        smtpServer: { ...settings.smtpServer, starttls: e.target.checked }
                      })}
                    />
                  }
                  label="Use STARTTLS"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Security Settings Tab */}
      <TabPanel value={activeTab} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Brute Force Detection</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.bruteForceProtected}
                      onChange={(e) => setSettings({ ...settings, bruteForceProtected: e.target.checked })}
                    />
                  }
                  label="Brute Force Protection"
                  sx={{ mb: 2, display: 'block' }}
                />

                {settings.bruteForceProtected && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Max Login Failures"
                        type="number"
                        value={settings.failureFactor}
                        onChange={(e) => setSettings({ ...settings, failureFactor: parseInt(e.target.value) || 30 })}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Wait Increment (seconds)"
                        type="number"
                        value={settings.waitIncrementSeconds}
                        onChange={(e) => setSettings({ ...settings, waitIncrementSeconds: parseInt(e.target.value) || 60 })}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Quick Login Check (ms)"
                        type="number"
                        value={settings.quickLoginCheckMilliSeconds}
                        onChange={(e) => setSettings({ ...settings, quickLoginCheckMilliSeconds: parseInt(e.target.value) || 1000 })}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Min Quick Login Wait (seconds)"
                        type="number"
                        value={settings.minimumQuickLoginWaitSeconds}
                        onChange={(e) => setSettings({ ...settings, minimumQuickLoginWaitSeconds: parseInt(e.target.value) || 60 })}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.permanentLockout}
                            onChange={(e) => setSettings({ ...settings, permanentLockout: e.target.checked })}
                          />
                        }
                        label="Permanent Lockout"
                      />
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Save Button */}
      <Box sx={{ mt: 3 }}>
  {/* Raw JSON preview */}
  <Typography variant="subtitle2" sx={{ mb: 1 }}>
    Raw Payload
  </Typography>
  <Paper
    variant="outlined"
    sx={{
      p: 2,
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap',
      maxHeight: 200,
      overflow: 'auto',
      mb: 2
    }}
  >
    {JSON.stringify(settings, null, 2)}
  </Paper>

  {/* Save button */}
  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
    <Button
      variant="contained"
      startIcon={<SaveIcon />}
      onClick={handleSave}
      disabled={updateMutation.isLoading}
    >
      {updateMutation.isLoading ? 'Saving...' : 'Save Settings'}
    </Button>
  </Box>
    </Box>
    </Box>
  );
}

export default GeneralSettings;
