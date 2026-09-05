import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getProviderBookings,
  approveBooking,
  rejectBooking,
  clearBookingError,
} from "../../features/bookings/bookingSlice.js";

const BookingRequests = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { bookings, loading, error } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(getProviderBookings());

    return () => {
      dispatch(clearBookingError());
    };
  }, [dispatch]);

  const handleApprove = async (bookingId) => {
    await dispatch(approveBooking(bookingId));
  };

  const handleReject = async (bookingId) => {
    await dispatch(rejectBooking(bookingId));
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading booking requests...</p>
      </div>
    );
  }

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

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-800">Booking Requests</h2>

        <p className="mt-1 text-gray-600">
          Review booking requests from exporters.
        </p>

        {error && (
          <div className="mt-5 rounded-lg bg-red-100 px-4 py-3 text-red-600">
            {error}
          </div>
        )}

        {bookings.length === 0 && !error && (
          <div className="mt-6 rounded-xl bg-white p-8 text-center shadow">
            <p className="text-gray-500">No pending booking requests.</p>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="rounded-xl bg-white p-5 shadow">
              {/* Header */}
              <div className="flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs text-gray-500">Container Number</p>

                  <h3 className="mt-1 text-xl font-bold text-gray-800">
                    {booking.container?.containerNumber || "Container"}
                  </h3>
                </div>

                <span className="w-fit rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium capitalize text-yellow-700">
                  {booking.status}
                </span>
              </div>

              {/* Exporter */}
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">Exporter</p>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>

                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {booking.exporter?.name || "Unknown"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Email</p>

                    <p className="mt-1 break-all text-sm font-medium text-gray-800">
                      {booking.exporter?.email || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Phone</p>

                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {booking.exporter?.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="mt-3 rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">
                  Booking Details
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-gray-500">Origin</p>

                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {booking.container?.origin || "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Destination</p>

                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {booking.container?.destination || "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Requested Weight</p>

                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {booking.requestedWeight} kg
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Requested Volume</p>

                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {booking.requestedVolume} m³
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => handleApprove(booking._id)}
                  disabled={loading}
                  className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {loading ? "Processing..." : "Approve"}
                </button>

                <button
                  onClick={() => handleReject(booking._id)}
                  disabled={loading}
                  className="rounded-lg bg-red-600 px-5 py-2 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {loading ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BookingRequests;
