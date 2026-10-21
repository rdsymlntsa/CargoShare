import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyContainerById,
  departContainer,
  deliverContainer,
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

const ProviderContainerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentContainer, loading, error } = useSelector(
    (state) => state.containers,
  );

  useEffect(() => {
    dispatch(clearContainerError());
    dispatch(getMyContainerById(id));

    return () => {
      dispatch(clearContainerError());
    };
  }, [dispatch, id]);

  const handleDepart = async () => {
    const result = await dispatch(departContainer(id));

    if (departContainer.fulfilled.match(result)) {
      await dispatch(getMyContainerById(id));
    }
  };

  const handleDeliver = async () => {
    const result = await dispatch(deliverContainer(id));

    if (deliverContainer.fulfilled.match(result)) {
      await dispatch(getMyContainerById(id));
    }
  };

  if (loading && !currentContainer) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading container details...
      </div>
    );
  }

  if (error && !currentContainer) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  if (!currentContainer || currentContainer._id !== id) {
    return (
      <div className="p-6 text-center">
        {loading ? (
          <p className="text-gray-600">Loading container details...</p>
        ) : (
          <>
            <p className="text-gray-600">Container not found.</p>

            {error && <p className="mt-2 text-red-600">{error}</p>}

            <button
              onClick={() => navigate("/provider/containers")}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Back to My Containers
            </button>
          </>
        )}
      </div>
    );
  }

  const container = currentContainer;
  const checkpoints = getCheckpoints(container);
  const segments = container.segments || [];
  const expectedSegmentCount = Math.max(checkpoints.length - 1, 0);

  const renderCapacityBar = (available, total, colorClass) => {
    const percentage =
      Number(total) > 0
        ? Math.min(100, Math.max(0, (Number(available) / Number(total)) * 100))
        : 0;

    return (
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate("/provider/containers")}
          className="mb-5 text-blue-600 hover:underline"
        >
          ← Back to My Containers
        </button>

        <div className="rounded-xl bg-white p-6 shadow">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Container {container.containerNumber}
              </h1>

              <p className="mt-2 text-gray-600">
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

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-600">
              {error}
            </p>
          )}

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Departure Date</p>
              <p className="mt-1 font-medium text-gray-800">
                {formatDate(container.departureDate)}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Arrival Date</p>
              <p className="mt-1 font-medium text-gray-800">
                {formatDate(container.arrivalDate)}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Price per kg</p>
              <p className="mt-1 font-medium text-gray-800">
                ₹{container.pricePerKg}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Available Weight</p>
              <p className="mt-1 font-medium text-gray-800">
                {container.availableWeightCapacity} /{" "}
                {container.totalWeightCapacity} kg
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Available Volume</p>
              <p className="mt-1 font-medium text-gray-800">
                {container.availableVolumeCapacity} /{" "}
                {container.totalVolumeCapacity} m³
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Intermediate Stops</p>
              <p className="mt-1 font-medium text-gray-800">
                {(container.intermediateStops || []).length}
              </p>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Complete Route and Schedule
            </h2>

            <div className="space-y-3">
              {checkpoints.map((checkpoint, index) => (
                <div key={`${checkpoint.name}-${index}`} className="flex gap-3">
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

                    <p className="text-xs text-gray-500">{checkpoint.type}</p>

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

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Segment Capacities
            </h2>

            {segments.length === expectedSegmentCount && segments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {segments.map((segment, index) => (
                  <div
                    key={
                      segment._id || `${segment.from}-${segment.to}-${index}`
                    }
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <h3 className="font-semibold text-gray-800">
                      {segment.from} → {segment.to}
                    </h3>

                    <div className="mt-3 space-y-3 text-sm text-gray-600">
                      <div>
                        <div className="mb-1 flex justify-between gap-2">
                          <span>Available weight</span>
                          <span>
                            {segment.availableWeightCapacity} /{" "}
                            {segment.totalWeightCapacity} kg
                          </span>
                        </div>

                        {renderCapacityBar(
                          segment.availableWeightCapacity,
                          segment.totalWeightCapacity,
                          "bg-blue-500",
                        )}
                      </div>

                      <div>
                        <div className="mb-1 flex justify-between gap-2">
                          <span>Available volume</span>
                          <span>
                            {segment.availableVolumeCapacity} /{" "}
                            {segment.totalVolumeCapacity} m³
                          </span>
                        </div>

                        {renderCapacityBar(
                          segment.availableVolumeCapacity,
                          segment.totalVolumeCapacity,
                          "bg-teal-500",
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Segment capacities are unavailable or do not match the route.
              </p>
            )}
          </section>

          <section className="flex flex-wrap gap-3 border-t border-gray-200 pt-6">
            {container.status === "available" && (
              <button
                onClick={handleDepart}
                disabled={loading}
                className="rounded-lg bg-green-600 px-5 py-2 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Processing..." : "Depart Container"}
              </button>
            )}

            {container.status === "in-transit" && (
              <>
                <button
                  onClick={() =>
                    navigate(`/provider/containers/${container._id}/location`)
                  }
                  className="rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
                >
                  Start Live Tracking
                </button>

                <button
                  onClick={handleDeliver}
                  disabled={loading}
                  className="rounded-lg bg-purple-600 px-5 py-2 text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Mark as Delivered"}
                </button>
              </>
            )}

            {container.status === "full" && (
              <>
                <p className="w-full text-sm text-yellow-700">
                  This container is full. It can still depart according to the
                  backend's current status rules.
                </p>

                <button
                  onClick={handleDepart}
                  disabled={loading}
                  className="rounded-lg bg-green-600 px-5 py-2 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Depart Container"}
                </button>
              </>
            )}

            {container.status === "delivered" && (
              <p className="text-sm text-green-700">
                This container has been delivered.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProviderContainerDetails;
