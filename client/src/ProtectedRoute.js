import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from './UserContext';

function ProtectedRoute({ redirectPath, children }) {
  const { username } = useContext(UserContext);

  if (!username) {
    return <Navigate to={redirectPath} replace />;
  }
  return children ? children : <Outlet />;
}

export default ProtectedRoute;
