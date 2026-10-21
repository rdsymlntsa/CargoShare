import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getContainerById,
  clearContainerError,
  clearCurrentContainer,
} from "../../features/containers/containerSlice.js";

const ContainerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentContainer, loading, error } = useSelector(
    (state) => state.containers,
  );

  useEffect(() => {
    dispatch(getContainerById(id));

    return () => {
      dispatch(clearContainerError());
      dispatch(clearCurrentContainer());
    };
  }, [dispatch, id]);

  const formatDate = (value, includeTime = false) => {
    if (!value) return "Not scheduled";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not scheduled";
    }

    return date.toLocaleString([], {
      dateStyle: "medium",
      ...(includeTime ? { timeStyle: "short" } : {}),
    });
  };

  if (loading && !currentContainer) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading container...</p>
      </div>
    );
  }

  if (error && !currentContainer) {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-teal-700 px-6 py-4 text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <h1
              className="cursor-pointer text-2xl font-bold"
              onClick={() => navigate("/exporter/dashboard")}
            >
              CargoShare
            </h1>

            <button
              onClick={() => navigate("/exporter/containers")}
              className="rounded-lg bg-white px-4 py-2 font-medium text-teal-700 hover:bg-gray-100"
            >
              Back
            </button>
          </div>
        </nav>

        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="rounded-xl bg-red-100 p-6 text-red-600">{error}</div>
        </main>
      </div>
    );
  }

  if (!currentContainer) {
    return null;
  }

  const container = currentContainer;

  const intermediateStops = Array.isArray(container.intermediateStops)
    ? container.intermediateStops
    : [];

  const checkpoints = [
    {
      name: container.origin,
      type: "Origin",
      arrival: null,
      departure: container.departureDate,
    },
    ...intermediateStops.map((stop) => {
      if (typeof stop === "string") {
        return {
          name: stop,
          type: "Intermediate checkpoint",
          arrival: null,
          departure: null,
        };
      }

      return {
        name: stop.name || "Unnamed checkpoint",
        type: "Intermediate checkpoint",
        arrival: stop.expectedArrival,
        departure: stop.expectedDeparture,
      };
    }),
    {
      name: container.destination,
      type: "Destination",
      arrival: container.arrivalDate,
      departure: null,
    },
  ];

  const segments = Array.isArray(container.segments) ? container.segments : [];

  const hasValidSegments =
    segments.length === checkpoints.length - 1 &&
    segments.every(
      (segment) =>
        segment.from &&
        segment.to &&
        Number.isFinite(Number(segment.availableWeightCapacity)) &&
        Number.isFinite(Number(segment.availableVolumeCapacity)),
    );

  const getStatusClass = (status) => {
    if (status === "available") {
      return "bg-green-100 text-green-700";
    }

    if (status === "full") {
      return "bg-orange-100 text-orange-700";
    }

    if (status === "in-transit") {
      return "bg-blue-100 text-blue-700";
    }

    if (status === "delivered") {
      return "bg-purple-100 text-purple-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-teal-700 px-6 py-4 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1
            className="cursor-pointer text-2xl font-bold"
            onClick={() => navigate("/exporter/dashboard")}
          >
            CargoShare
          </h1>

          <button
            onClick={() => navigate("/exporter/containers")}
            className="rounded-lg bg-white px-4 py-2 font-medium text-teal-700 hover:bg-gray-100"
          >
            Back
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        {/* Container Header */}
        <section className="rounded-xl bg-white p-6 shadow">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-gray-500">Container</p>

              <h2 className="mt-1 text-2xl font-bold text-gray-800">
                {container.containerNumber || "N/A"}
              </h2>

              <p className="mt-1 text-gray-600">
                {container.origin} → {container.destination}
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1 text-sm font-medium capitalize ${getStatusClass(
                container.status,
              )}`}
            >
              {container.status}
            </span>
          </div>

          {/* Overall Container Information */}
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Departure</p>
              <p className="mt-1 font-medium text-gray-800">
                {formatDate(container.departureDate)}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Arrival</p>
              <p className="mt-1 font-medium text-gray-800">
                {formatDate(container.arrivalDate)}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Overall Weight Available</p>
              <p className="mt-1 font-medium text-gray-800">
                {container.availableWeightCapacity} kg
              </p>
              <p className="text-xs text-gray-500">
                of {container.totalWeightCapacity} kg
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Overall Volume Available</p>
              <p className="mt-1 font-medium text-gray-800">
                {container.availableVolumeCapacity} m³
              </p>
              <p className="text-xs text-gray-500">
                of {container.totalVolumeCapacity} m³
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Price per kg</p>
            <p className="mt-1 font-semibold text-gray-800">
              ₹{container.pricePerKg}
            </p>
          </div>
        </section>

        {/* Route and Checkpoints */}
        <section className="rounded-xl bg-white p-6 shadow">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Route & Checkpoints
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Follow the planned route from origin to destination.
            </p>
          </div>

          <div className="mt-6">
            {checkpoints.map((checkpoint, index) => {
              const isFirst = index === 0;
              const isLast = index === checkpoints.length - 1;

              return (
                <div key={`${checkpoint.name}-${index}`} className="flex gap-4">
                  <div className="flex w-8 shrink-0 flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        isFirst || isLast
                          ? "bg-teal-600 text-white"
                          : "border-2 border-teal-600 bg-white text-teal-700"
                      }`}
                    >
                      {index + 1}
                    </div>

                    {!isLast && (
                      <div className="my-1 min-h-12 w-0.5 flex-1 bg-teal-200" />
                    )}
                  </div>

                  <div className={`${isLast ? "pb-0" : "pb-6"} min-w-0 flex-1`}>
                    <p className="text-xs font-medium uppercase tracking-wide text-teal-700">
                      {checkpoint.type}
                    </p>

                    <h4 className="mt-1 font-semibold text-gray-800">
                      {checkpoint.name || "Unnamed location"}
                    </h4>

                    {isFirst && (
                      <p className="mt-2 text-sm text-gray-600">
                        Departure: {formatDate(checkpoint.departure, true)}
                      </p>
                    )}

                    {!isFirst && !isLast && (
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>
                          Expected arrival:{" "}
                          {formatDate(checkpoint.arrival, true)}
                        </p>
                        <p>
                          Expected departure:{" "}
                          {formatDate(checkpoint.departure, true)}
                        </p>
                      </div>
                    )}

                    {isLast && (
                      <p className="mt-2 text-sm text-gray-600">
                        Expected arrival: {formatDate(checkpoint.arrival, true)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Segment Capacity */}
        <section className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-xl font-bold text-gray-800">
            Segment Availability
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            Each adjacent pair of checkpoints forms a separate booking segment.
            A booking uses capacity only on the segments it covers.
          </p>

          {hasValidSegments ? (
            <div className="mt-5 space-y-4">
              {segments.map((segment, index) => {
                const weightAvailable = Number(segment.availableWeightCapacity);
                const volumeAvailable = Number(segment.availableVolumeCapacity);

                const weightTotal = Number(segment.totalWeightCapacity);
                const volumeTotal = Number(segment.totalVolumeCapacity);

                const weightPercent =
                  Number.isFinite(weightTotal) && weightTotal > 0
                    ? Math.min(
                        100,
                        Math.max(0, (weightAvailable / weightTotal) * 100),
                      )
                    : null;

                const volumePercent =
                  Number.isFinite(volumeTotal) && volumeTotal > 0
                    ? Math.min(
                        100,
                        Math.max(0, (volumeAvailable / volumeTotal) * 100),
                      )
                    : null;

                return (
                  <div
                    key={`${segment.from}-${segment.to}-${index}`}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-xs text-gray-500">
                          Segment {index + 1}
                        </p>
                        <h4 className="mt-1 font-semibold text-gray-800">
                          {segment.from} → {segment.to}
                        </h4>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                          weightAvailable > 0 && volumeAvailable > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {weightAvailable > 0 && volumeAvailable > 0
                          ? "Capacity available"
                          : "Limited / full"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <div className="flex justify-between gap-2 text-sm">
                          <span className="text-gray-600">
                            Weight available
                          </span>
                          <span className="font-medium text-gray-800">
                            {weightAvailable} kg
                          </span>
                        </div>

                        {weightPercent !== null && (
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-teal-600"
                              style={{ width: `${weightPercent}%` }}
                            />
                          </div>
                        )}

                        {Number.isFinite(weightTotal) && (
                          <p className="mt-1 text-xs text-gray-500">
                            Total: {weightTotal} kg
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between gap-2 text-sm">
                          <span className="text-gray-600">
                            Volume available
                          </span>
                          <span className="font-medium text-gray-800">
                            {volumeAvailable} m³
                          </span>
                        </div>

                        {volumePercent !== null && (
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${volumePercent}%` }}
                            />
                          </div>
                        )}

                        {Number.isFinite(volumeTotal) && (
                          <p className="mt-1 text-xs text-gray-500">
                            Total: {volumeTotal} m³
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="font-medium text-yellow-800">
                Segment capacity details are unavailable.
              </p>
              <p className="mt-1 text-sm text-yellow-700">
                This container may use an older route format, or its segment
                data may not be included in the API response. Overall capacity
                is shown above, but it cannot tell you how much capacity is
                available on each individual segment.
              </p>
            </div>
          )}
        </section>

        {/* Provider Information */}
        {container.provider && (
          <section className="rounded-xl bg-white p-6 shadow">
            <h3 className="text-xl font-bold text-gray-800">
              Provider Information
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {container.provider.name || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="mt-1 break-all text-sm font-medium text-gray-800">
                  {container.provider.email || "N/A"}
                </p>
              </div>

              {container.provider.phone && (
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {container.provider.phone}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Booking Information */}
        <section className="rounded-xl bg-teal-50 p-5">
          <h3 className="font-semibold text-teal-900">
            How segment-based booking works
          </h3>

          <p className="mt-2 text-sm leading-6 text-teal-800">
            Choose a pickup checkpoint and a later drop-off checkpoint when
            booking. For example, a booking from the origin to the second
            checkpoint uses the first two route segments, but does not use
            capacity on segments beyond that drop-off point.
          </p>

          <button
            onClick={() =>
              navigate(`/exporter/containers/${container._id}/book`)
            }
            disabled={container.status !== "available"}
            className="mt-5 w-full rounded-lg bg-teal-600 px-6 py-3 font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {container.status === "available"
              ? "Choose Pickup & Drop-off"
              : "Container Not Available"}
          </button>
        </section>
      </main>
    </div>
  );
};

export default ContainerDetails;
