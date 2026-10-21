import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getMyBookings,
  cancelBooking,
  clearBookingError,
} from "../../features/bookings/bookingSlice.js";

const MyBookings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { bookings, loading, error } = useSelector((state) => state.bookings);

  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  useEffect(() => {
    dispatch(getMyBookings());

    return () => {
      dispatch(clearBookingError());
    };
  }, [dispatch]);

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setCancellingBookingId(bookingId);

    try {
      await dispatch(cancelBooking(bookingId)).unwrap();
    } catch {
      // The Redux slice stores the error for display on this page.
    } finally {
      setCancellingBookingId(null);
    }
  };

  const getStatusClass = (status) => {
    if (status === "approved") {
      return "bg-green-100 text-green-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    if (status === "cancelled") {
      return "bg-gray-100 text-gray-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-teal-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">CargoShare</h1>

        <button
          onClick={() => navigate("/exporter/dashboard")}
          className="bg-white text-teal-600 px-4 py-2 rounded-lg font-medium"
        >
          Dashboard
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Bookings</h2>

          <p className="text-gray-600 mt-1">
            View and manage your container booking requests.
          </p>
        </div>

        {loading && bookings.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No bookings found
            </h3>

            <p className="text-gray-600 mb-5">
              You have not made any container booking requests yet.
            </p>

            <button
              onClick={() => navigate("/exporter/containers")}
              className="bg-teal-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-teal-700"
            >
              Browse Containers
            </button>
          </div>
        )}

        {bookings.length > 0 && (
          <div className="space-y-5">
            {bookings.map((booking) => {
              const isCancelling = cancellingBookingId === booking._id;

              const canCancel =
                booking.status === "pending" || booking.status === "approved";

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-xl shadow-md p-6"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Container {booking.container?.containerNumber || "N/A"}
                      </h3>

                      <p className="text-gray-600 mt-1">
                        {booking.pickup || booking.container?.origin || "N/A"} →{" "}
                        {booking.dropoff ||
                          booking.container?.destination ||
                          "N/A"}
                      </p>

                      <p className="text-sm text-gray-500 mt-2">
                        Weight: {booking.requestedWeight} kg
                        {" · "}
                        Volume: {booking.requestedVolume} m³
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${getStatusClass(
                        booking.status,
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        navigate(`/exporter/bookings/${booking._id}`)
                      }
                      className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700"
                    >
                      View Details
                    </button>

                    {booking.container?._id && (
                      <button
                        onClick={() =>
                          navigate(
                            `/exporter/containers/${booking.container._id}`,
                          )
                        }
                        className="border border-teal-600 text-teal-600 px-4 py-2 rounded-lg font-medium hover:bg-teal-50"
                      >
                        View Container
                      </button>
                    )}

                    {booking.status === "approved" &&
                      booking.container?.status === "in-transit" &&
                      booking.container?._id && (
                        <button
                          onClick={() =>
                            navigate(
                              `/exporter/containers/${booking.container._id}/tracking`,
                            )
                          }
                          className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700"
                        >
                          Track Shipment
                        </button>
                      )}

                    {canCancel && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={isCancelling}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isCancelling ? "Cancelling..." : "Cancel Booking"}
                      </button>
                    )}
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

export default MyBookings;
