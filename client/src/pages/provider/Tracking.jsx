import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getMyContainers,
  clearContainerError,
} from "../../features/containers/containerSlice.js";

const Tracking = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { containers, loading, error } = useSelector(
    (state) => state.containers,
  );

  useEffect(() => {
    dispatch(getMyContainers());

    return () => {
      dispatch(clearContainerError());
    };
  }, [dispatch]);

  const activeContainers = containers.filter(
    (container) => container.status === "in-transit",
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-teal-700 px-6 py-4 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1
            className="cursor-pointer text-2xl font-bold"
            onClick={() => navigate("/provider/dashboard")}
          >
            CargoShare
          </h1>

          <button
            onClick={() => navigate("/provider/dashboard")}
            className="rounded-lg bg-white px-4 py-2 font-medium text-teal-700 hover:bg-gray-100"
          >
            Dashboard
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Track Shipments</h2>

          <p className="mt-1 text-gray-600">
            View and manage your containers that are currently in transit.
          </p>
        </div>

        {loading && (
          <div className="rounded-xl bg-white p-6 text-center shadow-md">
            <p className="text-gray-600">Loading shipments...</p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && activeContainers.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow-md">
            <h3 className="text-lg font-semibold text-gray-800">
              No active shipments
            </h3>

            <p className="mt-2 text-gray-600">
              You currently have no containers that are in transit.
            </p>

            <button
              onClick={() => navigate("/provider/containers")}
              className="mt-5 rounded-lg bg-teal-600 px-5 py-3 font-medium text-white hover:bg-teal-700"
            >
              View My Containers
            </button>
          </div>
        )}

        {!loading && activeContainers.length > 0 && (
          <div className="space-y-5">
            {activeContainers.map((container) => (
              <div
                key={container._id}
                className="rounded-xl bg-white p-6 shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Container {container.containerNumber || "N/A"}
                    </h3>

                    <p className="mt-1 text-gray-600">
                      {container.origin || "N/A"} →{" "}
                      {container.destination || "N/A"}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    In Transit
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-500">Departure</p>

                    <p className="mt-1 font-semibold text-gray-800">
                      {container.departureDate
                        ? new Date(container.departureDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Current Location</p>

                    <p className="mt-1 font-semibold text-gray-800">
                      {container.currentLocation?.locationName ||
                        (container.currentLocation
                          ? `${container.currentLocation.latitude}, ${container.currentLocation.longitude}`
                          : "Not recorded")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>

                    <p className="mt-1 font-semibold text-gray-800">
                      {container.currentLocation?.updatedAt
                        ? new Date(
                            container.currentLocation.updatedAt,
                          ).toLocaleString()
                        : "Not recorded"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() =>
                      navigate(`/provider/containers/${container._id}/location`)
                    }
                    className="flex-1 rounded-lg bg-teal-600 px-5 py-3 font-medium text-white hover:bg-teal-700"
                  >
                    Update Location
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/provider/containers/${container._id}`)
                    }
                    className="flex-1 rounded-lg border border-teal-600 px-5 py-3 font-medium text-teal-600 hover:bg-teal-50"
                  >
                    View Container
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Tracking;
