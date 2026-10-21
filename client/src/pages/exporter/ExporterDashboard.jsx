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

  const dashboardCards = [
    {
      title: "Available Containers",
      description: "Browse containers with available cargo space.",
      button: "Browse Containers",
      path: "/exporter/containers",
    },
    {
      title: "My Bookings",
      description: "View and manage your shipment bookings.",
      button: "View Bookings",
      path: "/exporter/bookings",
    },
    {
      title: "Track Shipment",
      description: "Track the location of your active shipments.",
      button: "Track Shipment",
      path: "/exporter/tracking",
    },
    {
      title: "AI Cargo Detection",
      description:
        "Upload cargo images and detect objects with bounding boxes and confidence scores.",
      button: "Open AI Detection",
      path: "/exporter/image-detection",
    },
    {
      title: "Create Pickup Job",
      description:
        "Arrange first-mile transportation from your location to a consolidation depot.",
      button: "Create Pickup Job",
      path: "/pickup-jobs/create",
    },
    {
      title: "My Pickup Jobs",
      description:
        "View your pickup jobs, assigned travellers, and delivery status.",
      button: "View Pickup Jobs",
      path: "/pickup-jobs/mine",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-teal-700 px-6 py-4 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <h1
            className="cursor-pointer text-2xl font-bold"
            onClick={() => navigate("/")}
          >
            CargoShare
          </h1>

          <div className="flex flex-wrap items-center gap-4">
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

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h2 className="text-3xl font-bold text-gray-800">Exporter Dashboard</h2>

        <p className="mt-2 text-gray-600">
          Manage shipments, bookings, cargo detection, and first-mile pickup.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardCards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {card.title}
              </h3>

              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">
                {card.description}
              </p>

              <button
                onClick={() => navigate(card.path)}
                className="mt-5 self-start rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700"
              >
                {card.button}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ExporterDashboard;
