import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getMyBookings,
  clearBookingError,
} from "../../features/bookings/bookingSlice.js";

const MyBookings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { bookings, loading, error } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(getMyBookings());

    return () => {
      dispatch(clearBookingError());
    };
  }, [dispatch]);

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

        {loading && (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-100 text-red-700 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
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

        {!loading && bookings.length > 0 && (
          <div className="space-y-5">
            {bookings.map((booking) => (
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
                      {booking.container?.origin || "N/A"} →{" "}
                      {booking.container?.destination || "N/A"}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div>
                    <p className="text-sm text-gray-500">Requested Weight</p>
                    <p className="font-semibold text-gray-800">
                      {booking.requestedWeight} kg
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Requested Volume</p>
                    <p className="font-semibold text-gray-800">
                      {booking.requestedVolume}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Departure</p>
                    <p className="font-semibold text-gray-800">
                      {booking.container?.departureDate
                        ? new Date(
                            booking.container.departureDate,
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Booking Date</p>
                    <p className="font-semibold text-gray-800">
                      {booking.createdAt
                        ? new Date(booking.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookings;
