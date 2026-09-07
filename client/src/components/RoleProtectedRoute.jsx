import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, authChecked } = useSelector(
    (state) => state.auth,
  );

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  console.log("AUTH DEBUG:", {
    user,
    role: user?.role,
    isAuthenticated,
    authChecked,
    allowedRoles,
  });

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
