import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getBookingById,
  clearBookingError,
  clearCurrentBooking,
} from "../features/bookings/bookingSlice.js";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentBooking, loading, error } = useSelector(
    (state) => state.bookings,
  );

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getBookingById(id));

    return () => {
      dispatch(clearBookingError());
      dispatch(clearCurrentBooking());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading booking...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 text-center">
          <p className="text-red-600">{error}</p>

          <button
            onClick={() => navigate(-1)}
            className="mt-3 bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!currentBooking) {
    return null;
  }

  const { container, exporter } = currentBooking;

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-teal-700 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1
            className="text-2xl font-bold cursor-pointer"
            onClick={() =>
              navigate(
                user?.role === "provider"
                  ? "/provider/dashboard"
                  : "/exporter/dashboard",
              )
            }
          >
            CargoShare
          </h1>

          <button
            onClick={() => navigate(-1)}
            className="bg-white text-teal-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
          >
            Go Back
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-3">
        <div className="bg-white rounded-xl shadow-md p-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Booking Details
              </h2>

              <p className="text-gray-500 text-sm mt-0.5">
                Booking ID: {currentBooking._id}
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1.5 text-sm font-medium ${
                statusStyles[currentBooking.status] ||
                "bg-gray-100 text-gray-700"
              }`}
            >
              {currentBooking.status.charAt(0).toUpperCase() +
                currentBooking.status.slice(1)}
            </span>
          </div>

          {/* Container Details */}
          <div className="mt-1">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-1">
              Container Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div>
                <p className="text-sm text-gray-500">Container Number</p>
                <p className="font-semibold text-gray-800">
                  {container?.containerNumber || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Container Status</p>
                <p className="font-semibold text-gray-800">
                  {container?.status
                    ? container.status.charAt(0).toUpperCase() +
                      container.status.slice(1)
                    : "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Origin</p>
                <p className="font-semibold text-gray-800">
                  {container?.origin || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Destination</p>
                <p className="font-semibold text-gray-800">
                  {container?.destination || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Departure Date</p>
                <p className="font-semibold text-gray-800">
                  {container?.departureDate
                    ? new Date(container.departureDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Arrival Date</p>
                <p className="font-semibold text-gray-800">
                  {container?.arrivalDate
                    ? new Date(container.arrivalDate).toLocaleDateString()
                    : "Not specified"}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="mt-1">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-1">
              Requested Capacity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div>
                <p className="text-sm text-gray-500">Requested Weight</p>
                <p className="font-semibold text-gray-800">
                  {currentBooking.requestedWeight} kg
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Requested Volume</p>
                <p className="font-semibold text-gray-800">
                  {currentBooking.requestedVolume}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Booking Date</p>
                <p className="font-semibold text-gray-800">
                  {currentBooking.createdAt
                    ? new Date(currentBooking.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Exporter Details */}
          {user?.role === "provider" && exporter && (
            <div className="mt-1">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-1">
                Exporter Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-semibold text-gray-800">
                    {exporter.name || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-800 break-all">
                    {exporter.email || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-800">
                    {exporter.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 space-y-2">
            <button
              onClick={() => navigate(`/bookings/${currentBooking._id}/chat`)}
              className="w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700"
            >
              Chat
            </button>

            {user?.role === "exporter" &&
              currentBooking.status === "approved" &&
              container?.status === "in-transit" && (
                <button
                  onClick={() =>
                    navigate(`/exporter/containers/${container._id}/tracking`)
                  }
                  className="w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700"
                >
                  Track Shipment
                </button>
              )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingDetails;
