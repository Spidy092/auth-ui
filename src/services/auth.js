
import api from './api.js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // Ensure uuid is installed
import { jwtDecode } from 'jwt-decode';


export const auth = {
  getClientConfig: async (providedClientKey = null) => {
    const hostname = window.location.hostname;
    const port = window.location.port;

    let clientKey = providedClientKey || 'pms'; // Default fallback
    let realm = 'my-projects';
    let tenantId = null;
    let redirectUri = `http://${hostname}:${port}/callback`;

    // 1. Use provided clientKey if available (e.g., from query params)
    if (providedClientKey) {
      clientKey = providedClientKey;
      console.log('Using provided clientKey:', { providedClientKey });
    }

    // 2. Localhost-based client detection (non-tenant) as fallback
    if (hostname === 'localhost' && !providedClientKey) {
      if (port === '5173') clientKey = 'admin-ui';
      else if (port === '5174') clientKey = 'starter';
      console.log('Localhost client detection:', { port, clientKey });
    }

    // 3. Subdomain-based tenant (optional, only if not localhost and no provided clientKey)
    if (hostname.includes('.pms.com') && hostname !== 'localhost' && !providedClientKey) {
      tenantId = hostname.split('.')[0];
      try {
        const response = await axios.get('http://localhost:4000/auth/clients', {
          params: { tenant_id: tenantId },
        });
        const client = response.data.rows.find((c) => c.tenant_id === tenantId);
        if (client) {
          clientKey = client.client_key || clientKey;
          realm = client.Realm?.realm_name || realm;
          redirectUri = client.callback_url || redirectUri;
        }
      } catch (err) {
        console.error('Tenant client lookup failed, using existing clientKey:', err.message, { clientKey });
      }
    }

    console.log('Final client config:', { clientKey, realm, tenantId, redirectUri });
    return { clientKey, realm, tenantId, redirectUri };
  },

  login: async (clientKey, redirectUri, state) => {
    const { clientKey: configClientKey, redirectUri: configRedirectUri } = await auth.getClientConfig(clientKey);
    const finalClientKey = clientKey || configClientKey;
    const finalRedirectUri = redirectUri || configRedirectUri;
    const newState = state || uuidv4();
    localStorage.setItem('authState', newState);
    console.log('Initiating login:', { finalClientKey, finalRedirectUri, state: newState });
    window.location.href = `http://localhost:4000/auth/login/${finalClientKey}?redirect_uri=${encodeURIComponent(finalRedirectUri)}&state=${newState}`;
  },

  logout: async () => {
    const { clientKey } = await auth.getClientConfig();
    const token = localStorage.getItem('authToken');
    console.log('Logging out, token:', token ? 'present' : 'missing');
    try {
      await api.post(`/logout/${clientKey}`, {}, { withCredentials: true });
      console.log('Logout successful');
    } catch (err) {
      console.error('Logout failed:', err.message);
    }
    localStorage.removeItem('authToken');
    api.defaults.headers.common.Authorization = undefined;
    window.location.href = `/login?client=${clientKey}`;
  },

  getToken: () => localStorage.getItem('authToken'),

  setToken: (accessToken) => {
    if (!accessToken) {
      console.error('No access token provided');
      return;
    }
    console.log('Storing access token');
    localStorage.setItem('authToken', accessToken);
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  },

  refreshToken: async () => {
    const { clientKey } = await auth.getClientConfig();
    console.log('Refreshing token for client:', clientKey);
    try {
      const response = await axios.post(
        `http://localhost:4000/auth/refresh/${clientKey}`,
        {},
        { withCredentials: true }
      );
      const { access_token } = response.data;
      console.log('Token refresh successful:', { access_token });
      auth.setToken(access_token);
      return access_token;
    } catch (err) {
      console.error('Token refresh failed:', err.message, 'Status:', err.response?.status);
      throw err;
    }
  },
};

setInterval(async () => {
  const token = auth.getToken();
  if (!token) return;
  const decoded = jwtDecode(token);
  const expiresIn = (decoded.exp * 1000 - Date.now()) / 1000;
  if (expiresIn < 900) {
    try {
      await auth.refreshToken();
      console.log('Token refreshed');
    } catch (err) {
      console.warn('Refresh failed');
    }
  }
}, 60 * 1000);