import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getMyBookings,
  clearBookingError,
} from "../../features/bookings/bookingSlice.js";

const Tracking = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { bookings, loading, error } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(getMyBookings());

    return () => {
      dispatch(clearBookingError());
    };
  }, [dispatch]);

  const activeShipments = bookings.filter(
    (booking) =>
      booking.status === "approved" &&
      booking.container?.status === "in-transit",
  );

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

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Track Shipments</h2>

          <p className="text-gray-600 mt-1">
            View and track your shipments that are currently in transit.
          </p>
        </div>

        {loading && (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-600">Loading shipments...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-100 text-red-700 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && activeShipments.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              No active shipments
            </h3>

            <p className="text-gray-600 mt-2">
              You currently have no approved shipments that are in transit.
            </p>

            <button
              onClick={() => navigate("/exporter/bookings")}
              className="mt-5 bg-teal-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-teal-700"
            >
              View My Bookings
            </button>
          </div>
        )}

        {!loading && activeShipments.length > 0 && (
          <div className="space-y-5">
            {activeShipments.map((booking) => {
              const container = booking.container;

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-xl shadow-md p-6"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Container {container?.containerNumber || "N/A"}
                      </h3>

                      <p className="text-gray-600 mt-1">
                        {container?.origin || "N/A"} →{" "}
                        {container?.destination || "N/A"}
                      </p>
                    </div>

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium w-fit">
                      In Transit
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <div>
                      <p className="text-sm text-gray-500">Booked Weight</p>

                      <p className="font-semibold text-gray-800">
                        {booking.requestedWeight} kg
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Booked Volume</p>

                      <p className="font-semibold text-gray-800">
                        {booking.requestedVolume}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Departure</p>

                      <p className="font-semibold text-gray-800">
                        {container?.departureDate
                          ? new Date(
                              container.departureDate,
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/exporter/containers/${container._id}/tracking`)
                    }
                    className="w-full mt-6 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700"
                  >
                    Track Shipment
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Tracking;
