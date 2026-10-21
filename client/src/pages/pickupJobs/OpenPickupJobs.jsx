import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getOpenPickupJobs,
  clearPickupJobError,
} from "../../features/pickupJobs/pickupJobSlice.js";

const OpenPickupJobs = () => {
  const dispatch = useDispatch();

  const { pickupJobs, loading, error } = useSelector(
    (state) => state.pickupJobs,
  );

  useEffect(() => {
    dispatch(getOpenPickupJobs());

    return () => {
      dispatch(clearPickupJobError());
    };
  }, [dispatch]);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString() : "Not specified";

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Open Pickup Jobs</h1>

        <p className="mb-8 mt-2 text-gray-400">
          Find goods that need pickup along your route.
        </p>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {loading && (
          <p className="mb-4 text-gray-400">Loading pickup jobs...</p>
        )}

        {!loading && pickupJobs.length === 0 && !error && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
            <h2 className="text-xl font-semibold">No open pickup jobs</h2>
            <p className="mt-2 text-gray-400">
              Check again later for available jobs.
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {pickupJobs
            .filter((job) => job.status === "open")
            .map((job) => (
              <div
                key={job._id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-6"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold">
                    {job.pickupLocation?.name} → {job.dropLocation?.name}
                  </h2>

                  <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-300">
                    Open
                  </span>
                </div>

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
                      <p className="text-gray-500">Linked booking</p>
                      <p>{job.containerBooking ? "Yes" : "Independent"}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-500">Pickup window</p>
                    <p>{formatDate(job.pickupWindowStart)}</p>
                    <p>to {formatDate(job.pickupWindowEnd)}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default OpenPickupJobs;
