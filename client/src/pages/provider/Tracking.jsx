import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getMyContainers,
  clearContainerError,
} from "../../features/containers/containerSlice.js";

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCheckpoints = (container) => [
  {
    name: container.origin,
    type: "Origin",
  },
  ...(container.intermediateStops || []).map((stop) => ({
    name: typeof stop === "string" ? stop : stop.name,
    type: "Intermediate Stop",
    expectedArrival: typeof stop === "string" ? null : stop.expectedArrival,
    expectedDeparture: typeof stop === "string" ? null : stop.expectedDeparture,
  })),
  {
    name: container.destination,
    type: "Destination",
  },
];

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
            Monitor your containers, route checkpoints, and available capacity
            on each segment.
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
          <div className="space-y-6">
            {activeContainers.map((container) => {
              const checkpoints = getCheckpoints(container);
              const segments = container.segments || [];

              return (
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

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Departure</p>

                      <p className="mt-1 font-semibold text-gray-800">
                        {formatDate(container.departureDate)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Expected Arrival</p>

                      <p className="mt-1 font-semibold text-gray-800">
                        {formatDate(container.arrivalDate)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Current Location</p>

                      <p className="mt-1 break-words font-semibold text-gray-800">
                        {container.currentLocation?.locationName ||
                          (container.currentLocation?.latitude != null &&
                          container.currentLocation?.longitude != null
                            ? `${container.currentLocation.latitude}, ${container.currentLocation.longitude}`
                            : "Not recorded")}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Last Updated</p>

                      <p className="mt-1 font-semibold text-gray-800">
                        {formatDateTime(container.currentLocation?.updatedAt)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Price per kg</p>

                      <p className="mt-1 font-semibold text-gray-800">
                        ₹{container.pricePerKg ?? "N/A"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">
                        Intermediate Stops
                      </p>

                      <p className="mt-1 font-semibold text-gray-800">
                        {(container.intermediateStops || []).length}
                      </p>
                    </div>
                  </div>

                  <section className="mt-8">
                    <h4 className="mb-4 text-lg font-semibold text-gray-800">
                      Route and Checkpoint Schedule
                    </h4>

                    <div className="space-y-1">
                      {checkpoints.map((checkpoint, index) => (
                        <div
                          key={`${checkpoint.name}-${index}`}
                          className="flex gap-3"
                        >
                          <div className="flex flex-col items-center">
                            <div
                              className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                                index === 0
                                  ? "bg-green-500"
                                  : index === checkpoints.length - 1
                                    ? "bg-red-500"
                                    : "bg-teal-500"
                              }`}
                            />

                            {index < checkpoints.length - 1 && (
                              <div className="mt-1 min-h-8 w-0.5 flex-1 bg-gray-300" />
                            )}
                          </div>

                          <div className="pb-4">
                            <p className="font-medium text-gray-800">
                              {checkpoint.name || "Unnamed checkpoint"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {checkpoint.type}
                            </p>

                            {checkpoint.expectedArrival && (
                              <p className="mt-1 text-sm text-gray-600">
                                Expected arrival:{" "}
                                {formatDateTime(checkpoint.expectedArrival)}
                              </p>
                            )}

                            {checkpoint.expectedDeparture && (
                              <p className="text-sm text-gray-600">
                                Expected departure:{" "}
                                {formatDateTime(checkpoint.expectedDeparture)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="mt-4">
                    <h4 className="mb-4 text-lg font-semibold text-gray-800">
                      Segment Capacities
                    </h4>

                    {segments.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {segments.map((segment, index) => {
                          const weightTotal = Number(
                            segment.totalWeightCapacity,
                          );
                          const weightAvailable = Number(
                            segment.availableWeightCapacity,
                          );
                          const volumeTotal = Number(
                            segment.totalVolumeCapacity,
                          );
                          const volumeAvailable = Number(
                            segment.availableVolumeCapacity,
                          );

                          const weightPercentage =
                            weightTotal > 0
                              ? Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    (weightAvailable / weightTotal) * 100,
                                  ),
                                )
                              : 0;

                          const volumePercentage =
                            volumeTotal > 0
                              ? Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    (volumeAvailable / volumeTotal) * 100,
                                  ),
                                )
                              : 0;

                          return (
                            <div
                              key={
                                segment._id ||
                                `${segment.from}-${segment.to}-${index}`
                              }
                              className="rounded-lg border border-gray-200 p-4"
                            >
                              <h5 className="font-semibold text-gray-800">
                                {segment.from} → {segment.to}
                              </h5>

                              <div className="mt-4">
                                <div className="mb-1 flex justify-between gap-2 text-sm text-gray-600">
                                  <span>Available weight</span>
                                  <span>
                                    {segment.availableWeightCapacity} /{" "}
                                    {segment.totalWeightCapacity} kg
                                  </span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                  <div
                                    className="h-full rounded-full bg-teal-500"
                                    style={{
                                      width: `${weightPercentage}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="mt-4">
                                <div className="mb-1 flex justify-between gap-2 text-sm text-gray-600">
                                  <span>Available volume</span>
                                  <span>
                                    {segment.availableVolumeCapacity} /{" "}
                                    {segment.totalVolumeCapacity} m³
                                  </span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                  <div
                                    className="h-full rounded-full bg-blue-500"
                                    style={{
                                      width: `${volumePercentage}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                        No segment capacity information is available.
                      </p>
                    )}
                  </section>

                  <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row">
                    <button
                      onClick={() =>
                        navigate(
                          `/provider/containers/${container._id}/location`,
                        )
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
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Tracking;
