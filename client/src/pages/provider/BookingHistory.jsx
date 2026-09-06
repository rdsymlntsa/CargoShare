import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getProviderBookingHistory,
  clearBookingError,
} from "../../features/bookings/bookingSlice.js";

const BookingHistory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { bookings, loading, error } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(getProviderBookingHistory());

    return () => {
      dispatch(clearBookingError());
    };
  }, [dispatch]);

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
          <h2 className="text-2xl font-bold text-gray-800">Booking History</h2>

          <p className="mt-1 text-gray-600">
            View your approved, rejected, and cancelled booking requests.
          </p>
        </div>

        {loading && (
          <div className="rounded-xl bg-white p-6 text-center shadow-md">
            <p className="text-gray-600">Loading booking history...</p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow-md">
            <h3 className="text-lg font-semibold text-gray-800">
              No booking history
            </h3>

            <p className="mt-2 text-gray-600">
              You do not have any completed booking requests yet.
            </p>

            <button
              onClick={() => navigate("/provider/bookings")}
              className="mt-5 rounded-lg bg-teal-600 px-5 py-3 font-medium text-white hover:bg-teal-700"
            >
              View Booking Requests
            </button>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-5">
            {bookings.map((booking) => {
              const statusStyles = {
                approved: "bg-green-100 text-green-700",
                rejected: "bg-red-100 text-red-700",
                cancelled: "bg-gray-100 text-gray-700",
              };

              return (
                <div
                  key={booking._id}
                  className="rounded-xl bg-white p-6 shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Container {booking.container?.containerNumber || "N/A"}
                      </h3>

                      <p className="mt-1 text-gray-600">
                        {booking.container?.origin || "N/A"} →{" "}
                        {booking.container?.destination || "N/A"}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${
                        statusStyles[booking.status] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm text-gray-500">Exporter</p>

                      <p className="mt-1 font-semibold text-gray-800">
                        {booking.exporter?.name || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Email</p>

                      <p className="mt-1 font-semibold text-gray-800 break-all">
                        {booking.exporter?.email || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Requested Weight</p>

                      <p className="mt-1 font-semibold text-gray-800">
                        {booking.requestedWeight} kg
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Requested Volume</p>

                      <p className="mt-1 font-semibold text-gray-800">
                        {booking.requestedVolume}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t pt-4">
                    <p className="text-sm text-gray-500">Requested On</p>

                    <p className="mt-1 font-medium text-gray-800">
                      {booking.createdAt
                        ? new Date(booking.createdAt).toLocaleString()
                        : "N/A"}
                    </p>
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

export default BookingHistory;
