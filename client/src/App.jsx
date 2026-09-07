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
import BookingRequests from "./pages/provider/BookingRequests.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleProtectedRoute from "./components/RoleProtectedRoute.jsx";
import CreateContainer from "./pages/provider/CreateContainer.jsx";
import MyContainers from "./pages/provider/MyContainers.jsx";
import ProviderContainerDetails from "./pages/provider/ProviderContainerDetails.jsx";
import UpdateContainerLocation from "./pages/provider/UpdateContainerLocation.jsx";
import ShipmentTracking from "./pages/exporter/ShipmentTracking.jsx";
import Tracking from "./pages/exporter/Tracking.jsx";
import ProviderTracking from "./pages/provider/Tracking.jsx";
import BookingHistory from "./pages/provider/BookingHistory.jsx";
import BookingDetails from "./pages/BookingDetails.jsx";
import Home from "./pages/Home.jsx";

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

        <Route
          path="/exporter/bookings/:id"
          element={
            <RoleProtectedRoute allowedRoles={["exporter"]}>
              <BookingDetails />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/exporter/tracking"
          element={
            <RoleProtectedRoute allowedRoles={["exporter"]}>
              <Tracking />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/exporter/containers/:id/tracking"
          element={
            <RoleProtectedRoute allowedRoles={["exporter"]}>
              <ShipmentTracking />
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

        <Route
          path="/provider/bookings"
          element={
            <RoleProtectedRoute allowedRoles={["provider"]}>
              <BookingRequests />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/provider/bookings/history"
          element={
            <RoleProtectedRoute allowedRoles={["provider"]}>
              <BookingHistory />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/provider/bookings/:id"
          element={
            <RoleProtectedRoute allowedRoles={["provider"]}>
              <BookingDetails />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/provider/tracking"
          element={
            <RoleProtectedRoute allowedRoles={["provider"]}>
              <ProviderTracking />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/provider/containers/create"
          element={
            <RoleProtectedRoute allowedRoles={["provider"]}>
              <CreateContainer />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/provider/containers"
          element={
            <RoleProtectedRoute allowedRoles={["provider"]}>
              <MyContainers />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/provider/containers/:id"
          element={
            <RoleProtectedRoute allowedRoles={["provider"]}>
              <ProviderContainerDetails />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/provider/containers/:id/location"
          element={
            <RoleProtectedRoute allowedRoles={["provider"]}>
              <UpdateContainerLocation />
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
        <Route path="/" element={<Home />} />

        {/* Unknown route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
