import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  getMyPickupJobs,
  cancelPickupJob,
  clearPickupJobError,
} from "../../features/pickupJobs/pickupJobSlice.js";

const MyPickupJobs = () => {
  const dispatch = useDispatch();

  const { pickupJobs, loading, error } = useSelector(
    (state) => state.pickupJobs,
  );

  useEffect(() => {
    dispatch(getMyPickupJobs());

    return () => {
      dispatch(clearPickupJobError());
    };
  }, [dispatch]);

  const handleCancel = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this pickup job?",
    );

    if (!confirmed) return;

    dispatch(cancelPickupJob(jobId));
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleString();
  };

  if (loading && pickupJobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 px-6 py-10 text-white">
        <p className="text-center text-gray-300">Loading your pickup jobs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold sm:text-4xl">My Pickup Jobs</h1>

          <p className="mt-2 text-gray-400">
            Track and manage the first-mile pickup jobs you have created.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {pickupJobs.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
            <h2 className="text-xl font-semibold">No pickup jobs yet</h2>

            <p className="mt-2 text-gray-400">
              Create a pickup job to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {pickupJobs.map((job) => (
              <div
                key={job._id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-lg"
              >
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold">
                    {job.pickupLocation?.name} → {job.dropLocation?.name}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      job.status === "open"
                        ? "bg-blue-500/15 text-blue-300"
                        : job.status === "accepted"
                          ? "bg-yellow-500/15 text-yellow-300"
                          : job.status === "picked-up"
                            ? "bg-purple-500/15 text-purple-300"
                            : job.status === "delivered"
                              ? "bg-green-500/15 text-green-300"
                              : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {job.status}
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
                      <p className="text-gray-500">Price</p>
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
                      <p>
                        {job.containerBooking ? "Yes" : "Independent pickup"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-500">Pickup window</p>
                    <p>{formatDate(job.pickupWindowStart)}</p>
                    <p>to {formatDate(job.pickupWindowEnd)}</p>
                  </div>

                  {job.traveller && (
                    <div className="rounded-lg border border-gray-700 bg-gray-800/60 p-4">
                      <p className="mb-2 font-semibold text-white">
                        Assigned traveller
                      </p>

                      <p>{job.traveller.name || "Name unavailable"}</p>

                      {job.traveller.phone && <p>{job.traveller.phone}</p>}
                    </div>
                  )}

                  {job.pickedUpAt && (
                    <p>
                      <span className="text-gray-500">Picked up:</span>{" "}
                      {formatDate(job.pickedUpAt)}
                    </p>
                  )}

                  {job.deliveredAt && (
                    <p>
                      <span className="text-gray-500">Delivered:</span>{" "}
                      {formatDate(job.deliveredAt)}
                    </p>
                  )}
                </div>

                {job.status === "open" && (
                  <button
                    type="button"
                    onClick={() => handleCancel(job._id)}
                    disabled={loading}
                    className="mt-6 w-full rounded-lg border border-red-500/50 px-4 py-2 font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel Pickup Job
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPickupJobs;
