import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import PublicRoute from "./components/PublicRoute";
import Footer from "./components/Footer";

import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

import ProtectedRoute from "./components/ProtectedRoute";

import AdminDashboard from "./pages/AdminDashboard";
import AdminProject from "./pages/AdminProject";
import StokMaterial from "./pages/StokMaterial";
import Calendar from "./pages/Calendar";
import ClientManagement from "./pages/ClientManagement";
import AdminLayout from "./components/AdminLayout";
import FieldFileUpload from "./pages/FieldFileUpload";
import Laporan from "./pages/Laporan";
import UserManagement from "./pages/UserManagement";
import ProfileSettings from "./pages/ProfileSettings";
import Notifications from "./components/Notifications";

function App() {
  const location = useLocation();

  const isAuthRoute =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute
                allowedRoles={["admin", "project_manager", "finance"]}
              >
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProject />} />
            <Route path="materials" element={<StokMaterial />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="clients" element={<ClientManagement />} />
            <Route path="documentation" element={<FieldFileUpload />} />
            <Route path="laporan" element={<Laporan />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<ProfileSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>

      {isAuthRoute && <Footer />}
    </div>
  );
}

export default App;
