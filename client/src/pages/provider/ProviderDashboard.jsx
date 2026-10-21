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

  const dashboardCards = [
    {
      title: "Create Container",
      description:
        "Add a container, define its route and checkpoints, and publish available cargo space.",
      button: "Create Container",
      path: "/provider/containers/create",
    },
    {
      title: "My Containers",
      description:
        "Manage your containers, segment capacities, and route schedules.",
      button: "View Containers",
      path: "/provider/containers",
    },
    {
      title: "Booking Requests",
      description: "Review exporter bookings and approve or reject requests.",
      button: "View Requests",
      path: "/provider/bookings",
      secondaryButton: "Booking History",
      secondaryPath: "/provider/bookings/history",
    },
    {
      title: "Track Shipments",
      description:
        "Monitor in-transit containers and update shipment locations.",
      button: "Track Shipments",
      path: "/provider/tracking",
    },
    {
      title: "Profile",
      description: "View and manage your provider profile.",
      button: "View Profile",
      path: "/provider/profile",
    },
    {
      title: "Create Trip",
      description:
        "Publish your travel route, spare cargo capacity, and acceptable detour limits.",
      button: "Create Trip",
      path: "/trips/create",
    },
    {
      title: "My Trips",
      description: "Review your trips and manage routes you have published.",
      button: "View My Trips",
      path: "/trips/mine",
    },
    {
      title: "Find Pickup Matches",
      description:
        "Find pickup jobs that fit your trip route, spare capacity, and detour limits.",
      button: "Find Matches",
      path: "/trips/matches",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-teal-700 px-6 py-4 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <h1
            onClick={() => navigate("/")}
            className="cursor-pointer text-2xl font-bold"
          >
            CargoShare
          </h1>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
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
              className="rounded-lg bg-white px-4 py-2 text-teal-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-teal-700">
            Provider Workspace
          </p>

          <h2 className="text-3xl font-bold text-gray-800">
            Provider Dashboard
          </h2>

          <p className="mt-2 text-gray-600">
            Manage containers, bookings, shipment tracking, and first-mile
            trips.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-teal-100 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800">
            Manage your cargo routes
          </h3>

          <p className="mt-2 max-w-3xl text-gray-600">
            Publish container capacity, manage bookings, track shipments, or
            offer spare capacity on your own trips to carry goods.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/provider/containers/create")}
              className="rounded-lg bg-teal-600 px-5 py-3 font-medium text-white hover:bg-teal-700"
            >
              Create a Container
            </button>

            <button
              onClick={() => navigate("/provider/tracking")}
              className="rounded-lg border border-teal-600 px-5 py-3 font-medium text-teal-700 hover:bg-teal-50"
            >
              Track Shipments
            </button>

            <button
              onClick={() => navigate("/trips/create")}
              className="rounded-lg bg-gray-800 px-5 py-3 font-medium text-white hover:bg-gray-700"
            >
              Offer Trip Capacity
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dashboardCards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="text-xl font-semibold text-gray-800">
                {card.title}
              </h3>

              <p className="mb-6 mt-3 flex-1 leading-relaxed text-gray-600">
                {card.description}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(card.path)}
                  className="rounded-lg bg-teal-600 px-5 py-2 font-medium text-white hover:bg-teal-700"
                >
                  {card.button}
                </button>

                {card.secondaryButton && (
                  <button
                    onClick={() => navigate(card.secondaryPath)}
                    className="rounded-lg bg-gray-600 px-5 py-2 font-medium text-white hover:bg-gray-700"
                  >
                    {card.secondaryButton}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProviderDashboard;
