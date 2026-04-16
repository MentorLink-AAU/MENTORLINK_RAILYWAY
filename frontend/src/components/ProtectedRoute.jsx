/** Wraps routes that require auth and optionally specific roles. */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles?.length) {
    const role = user.role?.replace('ROLE_', '') || user.role;
    const allowed = roles.some((r) => r === role || r === `ROLE_${role}`);
    if (!allowed) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
