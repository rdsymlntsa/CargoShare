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
    const result = await dispatch(approveBooking(bookingId));

    if (approveBooking.fulfilled.match(result)) {
      dispatch(getProviderBookings());
    }
  };

  const handleReject = async (bookingId) => {
    const result = await dispatch(rejectBooking(bookingId));

    if (rejectBooking.fulfilled.match(result)) {
      dispatch(getProviderBookings());
    }
  };

  const formatDate = (value) => {
    if (!value) return "Not scheduled";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "Not scheduled"
      : date.toLocaleString();
  };

  const getCheckpoints = (container) => {
    if (!container) return [];

    const intermediateStops = (container.intermediateStops || [])
      .map((stop) => (typeof stop === "string" ? { name: stop } : stop))
      .filter((stop) => stop?.name);

    return [
      { name: container.origin, type: "Origin" },
      ...intermediateStops.map((stop) => ({
        ...stop,
        type: "Intermediate stop",
      })),
      { name: container.destination, type: "Destination" },
    ].filter((stop) => stop.name);
  };

  const getCoveredSegments = (booking, checkpoints) => {
    const container = booking.container;

    if (!container || !Array.isArray(container.segments)) {
      return [];
    }

    const normalize = (value) =>
      String(value ?? "")
        .trim()
        .toLowerCase();

    const pickupIndex = checkpoints.findIndex(
      (stop) => normalize(stop.name) === normalize(booking.pickup),
    );

    const dropoffIndex = checkpoints.findIndex(
      (stop) => normalize(stop.name) === normalize(booking.dropoff),
    );

    if (pickupIndex < 0 || dropoffIndex <= pickupIndex) {
      return [];
    }

    return container.segments
      .slice(pickupIndex, dropoffIndex)
      .map((segment) => ({
        ...segment,
      }));
  };

  const getStatusClass = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      cancelled: "bg-gray-100 text-gray-700",
    };

    return styles[status] || "bg-gray-100 text-gray-700";
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
          Review exporters' requested checkpoints, cargo requirements, and
          booking details.
        </p>

        {error && (
          <div className="mt-5 rounded-lg bg-red-100 px-4 py-3 text-red-600">
            {error}
          </div>
        )}

        {!loading && bookings.length === 0 && !error && (
          <div className="mt-6 rounded-xl bg-white p-8 text-center shadow">
            <p className="text-gray-500">No booking requests to display.</p>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {bookings.map((booking) => {
            const container = booking.container;
            const checkpoints = getCheckpoints(container);
            const coveredSegments = getCoveredSegments(booking, checkpoints);

            return (
              <div key={booking._id} className="rounded-xl bg-white p-5 shadow">
                <div className="flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs text-gray-500">Container Number</p>

                    <h3 className="mt-1 text-xl font-bold text-gray-800">
                      {container?.containerNumber || "Container"}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Full route: {container?.origin || "N/A"} →{" "}
                      {container?.destination || "N/A"}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-sm font-medium capitalize ${getStatusClass(
                      booking.status,
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>

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

                <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50 p-4">
                  <p className="text-xs font-medium text-teal-700">
                    Requested Booking Route
                  </p>

                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-500">Pickup Checkpoint</p>

                      <p className="mt-1 text-lg font-semibold text-gray-800">
                        {booking.pickup || container?.origin || "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Drop-off Checkpoint
                      </p>

                      <p className="mt-1 text-lg font-semibold text-gray-800">
                        {booking.dropoff ||
                          container?.destination ||
                          "Not available"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Complete Container Route
                  </p>

                  {checkpoints.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {checkpoints.map((checkpoint, index) => (
                        <div
                          key={`${checkpoint.name}-${index}`}
                          className="flex items-start gap-3"
                        >
                          <div className="flex flex-col items-center">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
                              {index + 1}
                            </div>

                            {index < checkpoints.length - 1 && (
                              <div className="h-5 w-0.5 bg-teal-200" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1 pb-1">
                            <p className="font-medium text-gray-800">
                              {checkpoint.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              {checkpoint.type}
                            </p>

                            {checkpoint.expectedArrival && (
                              <p className="mt-1 text-xs text-gray-600">
                                Expected arrival:{" "}
                                {formatDate(checkpoint.expectedArrival)}
                              </p>
                            )}

                            {checkpoint.expectedDeparture && (
                              <p className="text-xs text-gray-600">
                                Expected departure:{" "}
                                {formatDate(checkpoint.expectedDeparture)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">
                      Route checkpoints are unavailable.
                    </p>
                  )}
                </div>

                <div className="mt-3 rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Requested Cargo
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-gray-500">Requested Weight</p>
                      <p className="mt-1 font-semibold text-gray-800">
                        {booking.requestedWeight} kg
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Requested Volume</p>
                      <p className="mt-1 font-semibold text-gray-800">
                        {booking.requestedVolume} m³
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Price per kg</p>
                      <p className="mt-1 font-semibold text-gray-800">
                        ₹{container?.pricePerKg ?? "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Segments Covered by This Booking
                  </p>

                  {coveredSegments.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {coveredSegments.map((segment, index) => (
                        <div
                          key={`${segment.from}-${segment.to}-${index}`}
                          className="rounded-lg border border-gray-200 bg-white p-3"
                        >
                          <p className="font-medium text-gray-800">
                            {segment.from} → {segment.to}
                          </p>

                          <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-gray-500">
                                Available Weight
                              </p>
                              <p className="font-medium text-gray-800">
                                {segment.availableWeightCapacity} kg
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">
                                Available Volume
                              </p>
                              <p className="font-medium text-gray-800">
                                {segment.availableVolumeCapacity} m³
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">
                      Covered segment details are unavailable. Check that the
                      booking has valid pickup/drop-off checkpoints and the
                      container's segments are included in the API response.
                    </p>
                  )}
                </div>

                {booking.status === "pending" && (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => handleApprove(booking._id)}
                      disabled={loading}
                      className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleReject(booking._id)}
                      disabled={loading}
                      className="rounded-lg bg-red-600 px-5 py-2 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default BookingRequests;
