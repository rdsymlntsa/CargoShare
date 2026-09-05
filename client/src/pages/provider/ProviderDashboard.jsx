import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { logoutUser } from "../../features/auth/authSlice.js";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-teal-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">CargoShare</h1>

        <div className="flex gap-6 items-center">
          <button
            onClick={() => navigate("/provider/dashboard")}
            className="hover:text-teal-200"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/provider/containers")}
            className="hover:text-teal-200"
          >
            My Containers
          </button>

          <button
            onClick={() => navigate("/provider/bookings")}
            className="hover:text-teal-200"
          >
            Booking Requests
          </button>

          <button
            onClick={handleLogout}
            className="bg-white text-teal-700 px-4 py-2 rounded hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Dashboard */}
      <main className="p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Provider Dashboard
        </h2>

        <p className="text-gray-600 mb-8">
          Manage your containers, bookings, and shipments.
        </p>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Container */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Create Container</h3>

            <p className="text-gray-600 mb-5">
              Add a new container and make available cargo space for exporters.
            </p>

            <button
              onClick={() => navigate("/provider/containers/create")}
              className="bg-teal-600 text-white px-5 py-2 rounded hover:bg-teal-700"
            >
              Create Container
            </button>
          </div>

          {/* My Containers */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">My Containers</h3>

            <p className="text-gray-600 mb-5">
              View and manage the containers you have created.
            </p>

            <button
              onClick={() => navigate("/provider/containers")}
              className="bg-teal-600 text-white px-5 py-2 rounded hover:bg-teal-700"
            >
              View Containers
            </button>
          </div>

          {/* Booking Requests */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Booking Requests</h3>

            <p className="text-gray-600 mb-5">
              Review booking requests from exporters and approve or reject them.
            </p>

            <button
              onClick={() => navigate("/provider/bookings")}
              className="bg-teal-600 text-white px-5 py-2 rounded hover:bg-teal-700"
            >
              View Requests
            </button>
          </div>

          {/* Track Shipments */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Track Shipments</h3>

            <p className="text-gray-600 mb-5">
              Monitor the current location and status of your shipments.
            </p>

            <button
              onClick={() => navigate("/provider/tracking")}
              className="bg-teal-600 text-white px-5 py-2 rounded hover:bg-teal-700"
            >
              Track Shipments
            </button>
          </div>

          {/* Profile */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Profile</h3>

            <p className="text-gray-600 mb-5">
              View and manage your provider profile.
            </p>

            <button
              onClick={() => navigate("/provider/profile")}
              className="bg-teal-600 text-white px-5 py-2 rounded hover:bg-teal-700"
            >
              View Profile
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderDashboard;
