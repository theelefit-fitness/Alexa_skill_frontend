import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    console.log('PrivateRoute: Loading authentication state...');
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    console.log('PrivateRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Render the protected component
  console.log('PrivateRoute: User authenticated, rendering protected route');
  return children;
};

export default PrivateRoute; 