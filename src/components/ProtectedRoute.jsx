import { Navigate, Outlet } from "react-router-dom";
import {auth} from '@spidy092/auth-client';

export default function ProtectedRoute() {
  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}