// src/components/PublicRoute.jsx

import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");

  if (token && userRaw) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default PublicRoute;
