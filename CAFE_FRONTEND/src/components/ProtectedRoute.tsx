import { Navigate, Outlet } from 'react-router-dom';
import { getStoredUser } from '../services/auth';

export const ProtectedRoute = () => {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
