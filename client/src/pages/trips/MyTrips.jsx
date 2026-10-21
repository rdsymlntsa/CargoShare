import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  getMyTrips,
  cancelTrip,
  clearTripError,
} from "../../features/trips/tripSlice.js";

const MyTrips = () => {
  const dispatch = useDispatch();

  const {
    myTrips = [],
    loading = false,
    error = null,
  } = useSelector((state) => state.trips ?? {});

  useEffect(() => {
    dispatch(getMyTrips());

    return () => {
      dispatch(clearTripError());
    };
  }, [dispatch]);

  const handleCancel = async (tripId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this trip?",
    );

    if (!confirmed) return;

    dispatch(cancelTrip(tripId));
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString() : "Not specified";

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold sm:text-4xl">My Trips</h1>

        <p className="mb-8 mt-2 text-gray-400">
          Manage your trips and the spare cargo capacity you've offered.
        </p>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {loading && <p className="mb-4 text-gray-400">Loading your trips...</p>}

        {!loading && myTrips.length === 0 && !error && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
            <h2 className="text-xl font-semibold">No trips yet</h2>

            <p className="mt-2 text-gray-400">
              Create a trip to offer your spare cargo capacity.
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {myTrips.map((trip) => (
            <div
              key={trip._id}
              className="rounded-xl border border-gray-800 bg-gray-900 p-6"
            >
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-xl font-semibold">
                  {trip.origin?.name} → {trip.destination?.name}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    trip.status === "open"
                      ? "bg-blue-500/15 text-blue-300"
                      : trip.status === "in-progress"
                        ? "bg-yellow-500/15 text-yellow-300"
                        : trip.status === "completed"
                          ? "bg-green-500/15 text-green-300"
                          : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {trip.status}
                </span>
              </div>

              <div className="space-y-3 text-sm text-gray-300">
                <div>
                  <p className="text-gray-500">Origin address</p>
                  <p>{trip.origin?.address || "Not provided"}</p>
                </div>

                <div>
                  <p className="text-gray-500">Destination address</p>
                  <p>{trip.destination?.address || "Not provided"}</p>
                </div>

                <div>
                  <p className="text-gray-500">Departure</p>
                  <p>{formatDate(trip.departureTime)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500">Spare weight</p>
                    <p>{trip.spareCapacityWeightKg} kg</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Spare volume</p>
                    <p>{trip.spareCapacityVolumeM3} m³</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Maximum detour</p>
                    <p>{trip.maxDetourKm} km</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Maximum extra time</p>
                    <p>{trip.maxDetourMinutes} minutes</p>
                  </div>
                </div>
              </div>

              {trip.status === "open" && (
                <button
                  type="button"
                  onClick={() => handleCancel(trip._id)}
                  disabled={loading}
                  className="mt-6 w-full rounded-lg border border-red-500/50 px-4 py-2 font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel Trip
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyTrips;
