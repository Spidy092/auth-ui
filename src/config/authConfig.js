// admin-ui/src/config/authConfig.js
import { auth } from '@spidy092/auth-client';

const config = {
  clientKey: 'admin-ui',
  authBaseUrl: 'http://auth.local.test:4000', 
  accountUiUrl: 'http://account.local.test:5174',      // ✅ Routes through centralized login
  redirectUri: 'http://admin.local.test:5173/callback'
};

auth.setConfig(config);

console.log('🔑 Admin UI auth config loaded:', config);

export default config;
