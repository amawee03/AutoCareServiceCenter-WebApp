import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is specified, check if user has the required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const roleToPath = {
      admin: '/admin',
      finance_manager: '/financialmanager',
      inventory_manager: '/inventory/dashboard',
      receptionist: '/receptionist',
      service_advisor: '/serviceadvisor',
      customer: '/customerDashboard'
    };
    return <Navigate to={roleToPath[user.role] || '/customerDashboard'} replace />;
  }

  // If children are provided, render them; otherwise render nested routes via Outlet
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
