// admin-ui/src/config/authConfig.js
import { auth } from '@spidy092/auth-client';

const config = {
  clientKey: 'admin-ui',
  authBaseUrl: 'http://localhost:4000', 
  accountUiUrl: 'http://localhost:5174',      // ✅ Routes through centralized login
  redirectUri: 'http://localhost:5173/callback'
};

auth.setConfig(config);

console.log('🔑 Admin UI auth config loaded:', config);

export default config;
