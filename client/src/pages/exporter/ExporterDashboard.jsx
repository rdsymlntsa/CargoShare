import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logoutUser } from "../../features/auth/authSlice.js";

const ExporterDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-teal-700 px-6 py-4 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1
            className="cursor-pointer text-2xl font-bold"
            onClick={() => navigate("/exporter/dashboard")}
          >
            CargoShare
          </h1>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/exporter/dashboard")}
              className="hover:text-teal-200"
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate("/exporter/bookings")}
              className="hover:text-teal-200"
            >
              My Bookings
            </button>

            <button
              onClick={() => navigate("/exporter/profile")}
              className="hover:text-teal-200"
            >
              Profile
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-white px-4 py-2 font-medium text-teal-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <h2 className="text-3xl font-bold text-gray-800">
          Exporter Dashboard
        </h2>

        <p className="mt-2 text-gray-600">
          Manage your shipments and bookings from here.
        </p>

        {/* Dashboard cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-800">
              Available Containers
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Browse containers with available space.
            </p>

            <button
              onClick={() => navigate("/exporter/containers")}
              className="mt-5 rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700"
            >
              Browse Containers
            </button>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-800">
              My Bookings
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              View and manage your shipment bookings.
            </p>

            <button
              onClick={() => navigate("/exporter/bookings")}
              className="mt-5 rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700"
            >
              View Bookings
            </button>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-800">
              Track Shipment
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Track the location of your active shipments.
            </p>

            <button
              onClick={() => navigate("/exporter/tracking")}
              className="mt-5 rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700"
            >
              Track Shipment
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExporterDashboard;