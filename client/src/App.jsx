import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { getCurrentUser } from "./features/auth/authSlice.js";
import ContainerList from "./pages/exporter/ContainerList.jsx";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

import ExporterDashboard from "./pages//exporter/ExporterDashboard.jsx";
import ProviderDashboard from "./pages/provider/ProviderDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ContainerDetails from "./pages/exporter/ContainerDetails.jsx";
import BookingForm from "./pages/exporter/BookingForm.jsx";
import MyBookings from "./pages/exporter/MyBookings.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleProtectedRoute from "./components/RoleProtectedRoute.jsx";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Exporter */}
        <Route
          path="/exporter/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["exporter"]}>
              <ExporterDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/exporter/containers"
          element={
            <RoleProtectedRoute allowedRoles={["exporter"]}>
              <ContainerList />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/exporter/containers/:id"
          element={
            <RoleProtectedRoute allowedRoles={["exporter"]}>
              <ContainerDetails />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/exporter/containers/:id/book"
          element={
            <RoleProtectedRoute allowedRoles={["exporter"]}>
              <BookingForm />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/exporter/bookings"
          element={
            <RoleProtectedRoute allowedRoles={["exporter"]}>
              <MyBookings />
            </RoleProtectedRoute>
          }
        />

        {/* Provider */}
        <Route
          path="/provider/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["provider"]}>
              <ProviderDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Unknown route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
