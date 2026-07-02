import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children, roles = [] }) {
  const { user, loading, userRole } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <svg className="animate-spin h-10 w-10 text-green-600" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );

  if (!user) return <Navigate to="/connexion" state={{ from: location }} replace />;

  if (roles.length > 0 && !roles.includes(userRole)) return <Navigate to="/" replace />;

  return children;
}
