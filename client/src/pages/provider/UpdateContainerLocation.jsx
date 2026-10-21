
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getMyContainerById,
  updateContainerLocation,
  clearContainerError,
  clearCurrentContainer,
} from "../../features/containers/containerSlice.js";

const formatDateTime = (date) => {
  if (!date) return "Not scheduled";

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
    expectedArrival:
      typeof stop === "string" ? null : stop.expectedArrival,
    expectedDeparture:
      typeof stop === "string" ? null : stop.expectedDeparture,
  })),
  {
    name: container.destination,
    type: "Destination",
  },
];

const UpdateContainerLocation = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentContainer, loading, error } = useSelector(
    (state) => state.containers,
  );

  const [tracking, setTracking] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  const watchIdRef = useRef(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    dispatch(getMyContainerById(id));

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      dispatch(clearCurrentContainer());
      dispatch(clearContainerError());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (!tracking) return;

    const intervalId = setInterval(() => {
      dispatch(getMyContainerById(id));
    }, 15000);

    return () => clearInterval(intervalId);
  }, [dispatch, id, tracking]);

  useEffect(() => {
    if (
      currentContainer &&
      currentContainer.status !== "in-transit" &&
      watchIdRef.current !== null
    ) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setTracking(false);
      setTrackingError(
        "Tracking stopped because this container is no longer in transit.",
      );
    }
  }, [currentContainer?.status]);

  const sendLocationUpdate = (position) => {
    const now = Date.now();

    if (now - lastUpdateRef.current < 15000) return;

    lastUpdateRef.current = now;

    const { latitude, longitude } = position.coords;

    dispatch(
      updateContainerLocation({
        id,
        locationData: {
          latitude,
          longitude,
        },
      }),
    );
  };

  const startTracking = () => {
    setTrackingError("");
    dispatch(clearContainerError());

    if (!navigator.geolocation) {
      setTrackingError("GPS is not supported by this browser.");
      return;
    }

    if (currentContainer?.status !== "in-transit") {
      setTrackingError(
        "You can only start GPS tracking while the container is in transit.",
      );
      return;
    }

    if (watchIdRef.current !== null) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        sendLocationUpdate(position);
        setTracking(true);
      },
      (geoError) => {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }

        setTracking(false);

        if (geoError.code === geoError.PERMISSION_DENIED) {
          setTrackingError(
            "Location permission was denied. Please allow location access.",
          );
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          setTrackingError("Your current location could not be determined.");
        } else if (geoError.code === geoError.TIMEOUT) {
          setTrackingError(
            "Getting your location timed out. Please try again.",
          );
        } else {
          setTrackingError("Unable to access your current location.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    watchIdRef.current = watchId;
    setTracking(true);
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setTracking(false);
    setTrackingError("");
  };

  if (loading && !currentContainer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading container...</p>
      </div>
    );
  }

  if (!currentContainer || currentContainer._id !== id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="rounded-xl bg-white p-6 text-center shadow-md">
          <h2 className="text-xl font-bold text-gray-800">
            Container Not Found
          </h2>

          <p className="mt-2 text-gray-600">
            {error || "The container could not be loaded."}
          </p>

          <button
            onClick={() => navigate("/provider/containers")}
            className="mt-5 rounded-lg bg-teal-600 px-5 py-3 font-medium text-white hover:bg-teal-700"
          >
            Back to My Containers
          </button>
        </div>
      </div>
    );
  }

  const container = currentContainer;
  const checkpoints = getCheckpoints(container);
  const segments = container.segments || [];

  if (container.status !== "in-transit") {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-teal-600 px-6 py-4 text-white">
          <h1 className="text-xl font-bold">CargoShare</h1>
        </nav>

        <main className="mx-auto max-w-2xl px-6 py-8">
          <div className="rounded-xl bg-white p-6 text-center shadow-md">
            <h2 className="text-xl font-bold text-gray-800">
              Tracking Unavailable
            </h2>

            <p className="mt-2 text-gray-600">
              Live GPS tracking is available only after the container has
              departed.
            </p>

            <button
              onClick={() => navigate(`/provider/containers/${id}`)}
              className="mt-6 rounded-lg bg-teal-600 px-5 py-3 font-medium text-white hover:bg-teal-700"
            >
              Back to Container
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="flex items-center justify-between bg-teal-600 px-6 py-4 text-white">
        <h1 className="text-xl font-bold">CargoShare</h1>

        <button
          onClick={() => navigate("/provider/dashboard")}
          className="rounded-lg bg-white px-4 py-2 font-medium text-teal-600 hover:bg-gray-100"
        >
          Dashboard
        </button>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <button
          onClick={() => navigate(`/provider/containers/${id}`)}
          className="mb-5 font-medium text-teal-600 hover:underline"
        >
          ← Back to Container
        </button>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Live GPS Tracking
              </h2>

              <p className="mt-1 text-gray-600">
                Container {container.containerNumber || "N/A"}
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              In Transit
            </span>
          </div>

          <section className="mt-6 rounded-lg bg-gray-50 p-5">
            <h3 className="font-semibold text-gray-800">Shipment Details</h3>

            <p className="mt-3 text-sm text-gray-500">Complete Route</p>

            <p className="mt-1 font-medium text-gray-800">
              {container.origin} → {container.destination}
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Departure</p>
                <p className="mt-1 font-medium text-gray-800">
                  {formatDateTime(container.departureDate)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Expected Arrival</p>
                <p className="mt-1 font-medium text-gray-800">
                  {formatDateTime(container.arrivalDate)}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Route Checkpoints and Schedule
            </h3>

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

          <section className="mt-4">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Segment Capacities
            </h3>

            {segments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {segments.map((segment, index) => {
                  const weightTotal = Number(segment.totalWeightCapacity) || 0;
                  const weightAvailable =
                    Number(segment.availableWeightCapacity) || 0;
                  const volumeTotal = Number(segment.totalVolumeCapacity) || 0;
                  const volumeAvailable =
                    Number(segment.availableVolumeCapacity) || 0;

                  const weightPercentage =
                    weightTotal > 0
                      ? Math.min(
                          100,
                          Math.max(0, (weightAvailable / weightTotal) * 100),
                        )
                      : 0;

                  const volumePercentage =
                    volumeTotal > 0
                      ? Math.min(
                          100,
                          Math.max(0, (volumeAvailable / volumeTotal) * 100),
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
                      <h4 className="font-semibold text-gray-800">
                        {segment.from} → {segment.to}
                      </h4>

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
                            style={{ width: `${weightPercentage}%` }}
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
                            style={{ width: `${volumePercentage}%` }}
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

          <section className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800">
              GPS Status
            </h3>

            {tracking && (
              <div className="mt-4 rounded-lg bg-green-100 px-4 py-3 text-green-700">
                Live tracking is active. Location updates are sent
                automatically, at most once every 15 seconds.
              </div>
            )}

            {(trackingError || error) && (
              <div className="mt-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
                {trackingError || error}
              </div>
            )}

            {container.currentLocation && (
              <div className="mt-4 rounded-lg border border-gray-200 p-5">
                <h4 className="mb-3 font-semibold text-gray-800">
                  Last Recorded Location
                </h4>

                <p className="break-words text-sm text-gray-600">
                  Latitude: {container.currentLocation.latitude ?? "N/A"}
                </p>

                <p className="break-words text-sm text-gray-600">
                  Longitude: {container.currentLocation.longitude ?? "N/A"}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Last updated:{" "}
                  {formatDateTime(container.currentLocation.updatedAt)}
                </p>
              </div>
            )}

            <div className="mt-6">
              {!tracking ? (
                <button
                  onClick={startTracking}
                  disabled={loading}
                  className="w-full rounded-lg bg-teal-600 py-3 font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Start Live Tracking"}
                </button>
              ) : (
                <button
                  onClick={stopTracking}
                  className="w-full rounded-lg bg-red-600 py-3 font-medium text-white hover:bg-red-700"
                >
                  Stop Live Tracking
                </button>
              )}
            </div>

            <p className="mt-4 text-center text-sm text-gray-500">
              Keep this page open while transporting the container so
              CargoShare can receive your GPS updates. Location access may
              require HTTPS or localhost.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default UpdateContainerLocation;
