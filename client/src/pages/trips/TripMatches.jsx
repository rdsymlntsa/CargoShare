import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyTrips } from "../../features/trips/tripSlice.js";
import {
  getMatchedPickupJobs,
  clearMatchedJobs,
  clearPickupJobError,
} from "../../features/pickupJobs/pickupJobSlice.js";

const TripMatches = () => {
  const dispatch = useDispatch();
  const [selectedTripId, setSelectedTripId] = useState("");

  const { myTrips = [] } = useSelector((state) => state.trips ?? {});

  const {
    matchedJobs = [],
    loading = false,
    error = null,
  } = useSelector((state) => state.pickupJobs ?? {});

  useEffect(() => {
    dispatch(getMyTrips());

    return () => {
      dispatch(clearMatchedJobs());
      dispatch(clearPickupJobError());
    };
  }, [dispatch]);

  const eligibleTrips = myTrips.filter((trip) => trip.status === "open");

  const handleFindMatches = () => {
    if (!selectedTripId) return;

    dispatch(getMatchedPickupJobs(selectedTripId));
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Pickup Job Matches</h1>

        <p className="mb-8 mt-2 text-gray-400">
          Find pickup jobs compatible with your trip route and spare capacity.
        </p>

        <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
          <label
            htmlFor="trip"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Select an open trip
          </label>

          <select
            id="trip"
            value={selectedTripId}
            onChange={(event) => {
              setSelectedTripId(event.target.value);
              dispatch(clearMatchedJobs());
              dispatch(clearPickupJobError());
            }}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
          >
            <option value="">Choose your trip</option>

            {eligibleTrips.map((trip) => (
              <option key={trip._id} value={trip._id}>
                {trip.origin?.name} → {trip.destination?.name} (
                {new Date(trip.departureTime).toLocaleString()})
              </option>
            ))}
          </select>

          {eligibleTrips.length === 0 && (
            <p className="mt-3 text-sm text-yellow-300">
              You need an open trip before searching for matches.
            </p>
          )}

          <button
            type="button"
            onClick={handleFindMatches}
            disabled={!selectedTripId || loading}
            className="mt-4 rounded-lg bg-teal-600 px-5 py-3 font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Searching..." : "Find Matching Jobs"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {selectedTripId && !loading && matchedJobs.length === 0 && !error && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
            <h2 className="text-xl font-semibold">No matching jobs found</h2>
            <p className="mt-2 text-gray-400">
              Try another trip or check again later.
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {matchedJobs.map((job) => (
            <div
              key={job._id}
              className="rounded-xl border border-gray-800 bg-gray-900 p-6"
            >
              <h2 className="mb-4 text-xl font-semibold">
                {job.pickupLocation?.name} → {job.dropLocation?.name}
              </h2>

              <div className="space-y-3 text-sm text-gray-300">
                <div>
                  <p className="text-gray-500">Pickup address</p>
                  <p>{job.pickupLocation?.address || "Not provided"}</p>
                </div>

                <div>
                  <p className="text-gray-500">Delivery address</p>
                  <p>{job.dropLocation?.address || "Not provided"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500">Weight</p>
                    <p>{job.weightKg} kg</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Offered price</p>
                    <p>₹{job.price}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Dimensions</p>
                    <p>
                      {job.lengthCm} × {job.widthCm} × {job.heightCm} cm
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Pickup window</p>
                    <p>{new Date(job.pickupWindowStart).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripMatches;
