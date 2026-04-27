// src/components/ProtectedRoute.jsx

import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");

  const redirectPath = `${location.pathname}${location.search}`;

  const goToLogin = (
    <Navigate
      to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
      replace
    />
  );

  if (!token || !userRaw) {
    return goToLogin;
  }

  let user;

  try {
    user = JSON.parse(userRaw);
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return goToLogin;
  }

  if (!user?.role) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return goToLogin;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
