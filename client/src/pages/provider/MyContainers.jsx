import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyContainers,
  clearContainerError,
} from "../../features/containers/containerSlice";

const formatDate = (date) => {
  if (!date) return "Not specified";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "Not specified";

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCheckpoints = (container) => [
  { name: container.origin, type: "Origin" },
  ...(container.intermediateStops || []).map((stop) => ({
    name: typeof stop === "string" ? stop : stop.name,
    type: "Intermediate Stop",
    expectedArrival: typeof stop === "string" ? null : stop.expectedArrival,
    expectedDeparture: typeof stop === "string" ? null : stop.expectedDeparture,
  })),
  { name: container.destination, type: "Destination" },
];

const MyContainers = () => {
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

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading your containers...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  if (!containers || containers.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600">
        You have not created any containers yet.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">My Containers</h1>

        <div className="space-y-6">
          {containers.map((container) => {
            const checkpoints = getCheckpoints(container);
            const segments = container.segments || [];
            const expectedSegmentCount = Math.max(checkpoints.length - 1, 0);

            return (
              <div
                key={container._id}
                className="rounded-xl bg-white p-6 shadow"
              >
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Container {container.containerNumber}
                    </h2>

                    <p className="mt-1 text-gray-600">
                      {container.origin} → {container.destination}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      container.status === "available"
                        ? "bg-green-100 text-green-700"
                        : container.status === "in-transit"
                          ? "bg-blue-100 text-blue-700"
                          : container.status === "full"
                            ? "bg-yellow-100 text-yellow-700"
                            : container.status === "delivered"
                              ? "bg-gray-200 text-gray-700"
                              : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {container.status}
                  </span>
                </div>

                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Departure</p>
                    <p className="mt-1 font-medium text-gray-800">
                      {formatDate(container.departureDate)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Arrival</p>
                    <p className="mt-1 font-medium text-gray-800">
                      {formatDate(container.arrivalDate)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Overall Available Weight
                    </p>
                    <p className="mt-1 font-medium text-gray-800">
                      {container.availableWeightCapacity} /{" "}
                      {container.totalWeightCapacity} kg
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Overall Available Volume
                    </p>
                    <p className="mt-1 font-medium text-gray-800">
                      {container.availableVolumeCapacity} /{" "}
                      {container.totalVolumeCapacity} m³
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="mb-3 font-semibold text-gray-700">
                    Route Checkpoints
                  </h3>

                  <div className="space-y-3">
                    {checkpoints.map((checkpoint, index) => (
                      <div
                        key={`${checkpoint.name}-${index}`}
                        className="flex gap-3"
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={`mt-1 h-3 w-3 rounded-full ${
                              index === 0
                                ? "bg-green-500"
                                : index === checkpoints.length - 1
                                  ? "bg-red-500"
                                  : "bg-blue-500"
                            }`}
                          />

                          {index < checkpoints.length - 1 && (
                            <div className="mt-1 min-h-6 w-0.5 flex-1 bg-gray-300" />
                          )}
                        </div>

                        <div className="pb-3">
                          <p className="font-medium text-gray-800">
                            {checkpoint.name || "Unnamed checkpoint"}
                          </p>

                          <p className="text-xs text-gray-500">
                            {checkpoint.type}
                          </p>

                          {checkpoint.expectedArrival && (
                            <p className="text-sm text-gray-500">
                              Expected arrival:{" "}
                              {formatDateTime(checkpoint.expectedArrival)}
                            </p>
                          )}

                          {checkpoint.expectedDeparture && (
                            <p className="text-sm text-gray-500">
                              Expected departure:{" "}
                              {formatDateTime(checkpoint.expectedDeparture)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="mb-3 font-semibold text-gray-700">
                    Segment Capacities
                  </h3>

                  {segments.length === expectedSegmentCount &&
                  segments.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {segments.map((segment, index) => (
                        <div
                          key={
                            segment._id ||
                            `${segment.from}-${segment.to}-${index}`
                          }
                          className="rounded-lg border border-gray-200 p-4"
                        >
                          <p className="font-semibold text-gray-800">
                            {segment.from} → {segment.to}
                          </p>

                          <div className="mt-3 space-y-2 text-sm text-gray-600">
                            <p>
                              Weight: {segment.availableWeightCapacity} /{" "}
                              {segment.totalWeightCapacity} kg available
                            </p>

                            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{
                                  width: `${
                                    segment.totalWeightCapacity > 0
                                      ? Math.min(
                                          100,
                                          Math.max(
                                            0,
                                            (segment.availableWeightCapacity /
                                              segment.totalWeightCapacity) *
                                              100,
                                          ),
                                        )
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>

                            <p>
                              Volume: {segment.availableVolumeCapacity} /{" "}
                              {segment.totalVolumeCapacity} m³ available
                            </p>

                            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                              <div
                                className="h-full rounded-full bg-teal-500"
                                style={{
                                  width: `${
                                    segment.totalVolumeCapacity > 0
                                      ? Math.min(
                                          100,
                                          Math.max(
                                            0,
                                            (segment.availableVolumeCapacity /
                                              segment.totalVolumeCapacity) *
                                              100,
                                          ),
                                        )
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Segment capacities are unavailable or do not match the
                      current route checkpoints.
                    </p>
                  )}
                </div>

                <div className="mb-5">
                  <p className="text-gray-600">
                    Price per kg: ₹{container.pricePerKg}
                  </p>
                </div>

                <button
                  onClick={() =>
                    (window.location.href = `/provider/containers/${container._id}`)
                  }
                  className="rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
                >
                  View Container Details
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyContainers;
