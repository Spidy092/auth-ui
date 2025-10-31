// admin-ui/src/App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@spidy092/auth-client';
import './config/authConfig';
import ProtectedRoute from './components/ProtectedRoute';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

import Clients from './pages/Clients';
import Realms from './pages/Realms';
import AuditLogs from './pages/AuditLogs';

import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import ClientRequests from './pages/ClientRequests'; 
import RealmDetail from './pages/RealmDetail';

import Organizations from './pages/Organizations';
import DatabaseRoles from './pages/DatabaseRoles';
import Permissions from './pages/Permissions';
import OrganizationMemberships from './pages/OrganizationMemberships';
import AccountManagement from './pages/AccountManagement';
import OnboardMangement from  './components/onboarding/OrganizationOnboarding';

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = auth.getToken();
    if (token && !auth.isTokenExpired(token)) {
      navigate('/');
      return;
    }

    setLoading(true);
    auth.login('admin-ui', 'http://localhost:5173/callback');
  }, [navigate]);

  if (loading) return <LoadingSpinner message="Redirecting to login..." />;
  return null;
}

function Callback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return;
    setProcessed(true);

    try {
      console.log('🔄 Admin-UI Callback: Processing authentication');
      const token = auth.handleCallback();
      
      if (token) {
        console.log('✅ Admin UI authentication successful');
        // ✅ Small delay to ensure listeners fire before navigation
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      }
    } catch (e) {
      console.error('❌ Admin UI callback error:', e);
      setError(e.message);
    }
  }, [navigate, location.search, processed]);

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Authentication Failed</h3>
        <p>{error}</p>
        <button onClick={() => {
          setError(null);
          setProcessed(false);
          navigate('/login');
        }}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <div>Finalizing authentication...</div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    console.log('🏗️ Admin-UI App: Initializing with token listeners');
    
    // ✅ Initial auth check
    const checkAuth = () => {
      const token = auth.getToken();
      const authenticated = token && !auth.isTokenExpired(token);
      console.log('🔍 App: Initial authentication check:', { 
        hasToken: !!token,
        authenticated,
        listenerCount: auth.getListenerCount()
      });
      setIsAuthenticated(authenticated);
      setLoading(false);
    };

    checkAuth();

    // ✅ Listen for token changes
    const cleanup = auth.addTokenListener((newToken, oldToken) => {
      console.log('🔔 App: Token listener triggered:', { 
        hadToken: !!oldToken, 
        hasToken: !!newToken,
        currentPath: location.pathname
      });
      
      const authenticated = newToken && !auth.isTokenExpired(newToken);
      setIsAuthenticated(authenticated);
      setLoading(false);
      
      // ✅ Log the state change
      if (authenticated && !oldToken) {
        console.log('🎉 App: User authenticated via token listener!');
      } else if (!authenticated && oldToken) {
        console.log('👋 App: User logged out via token listener');
      }
    });

    // ✅ Cleanup listener on unmount
    return cleanup;
  }, []); // ✅ Remove location dependency since we handle it in the listener

  console.log('🏗️ App render:', { 
    isAuthenticated, 
    loading, 
    path: location.pathname,
    listenerCount: auth.getListenerCount()
  });

  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
     <Route path="/callback" element={<Callback />} />

      
      <Route path="/" element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Main Dashboard */}
          <Route index element={<Dashboard />} />
          
          {/* Keycloak Management */}
          <Route path="realms" element={<Realms />} />
          <Route path="realms/:realmName" element={<RealmDetail />} />
          <Route path="clients" element={<Clients />} />
          <Route path="client-requests" element={<ClientRequests />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          
          {/* User Management (Combined Keycloak + Database) */}
          {/* <Route path="users" element={<Users />} /> */}
          
          {/* Database Management */}
          <Route path="organizations" element={<Organizations />} />
          <Route path="database-roles" element={<DatabaseRoles />} />
          <Route path="permissions" element={<Permissions />} />
          <Route path="memberships" element={<OrganizationMemberships />} />
          <Route path="onboarding" element={<OnboardMangement />} />
           <Route path="/join" element={<OnboardMangement />} />
          
          {/* Account Management */}
          <Route path="account" element={<AccountManagement />} />
          
          {/* 404 Route */}
          <Route path="*" element={
            <div>
              <h2>Page Not Found</h2>
              <p>The page you are looking for does not exist.</p>
            </div>
          } />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
